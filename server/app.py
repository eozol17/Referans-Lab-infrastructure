from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime, timedelta
import json

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

jwt = JWTManager(app)
CORS(app)

# Database setup
DATABASE = 'database.sqlite'

def init_db():
    """Initialize the database with tables and sample data"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userNumber TEXT UNIQUE,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            email TEXT UNIQUE,
            password TEXT NOT NULL,
            phone TEXT NOT NULL,
            dateOfBirth TEXT NOT NULL,
            gender TEXT NOT NULL,
            address TEXT,
            role TEXT DEFAULT 'patient',
            isActive INTEGER DEFAULT 1,
            createdBy INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (createdBy) REFERENCES users (id)
        )
    ''')
    
    # Test Catalog table - available test types
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS test_catalog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            preparationInstructions TEXT NOT NULL,
            normalRange TEXT NOT NULL,
            price REAL NOT NULL,
            estimatedDuration INTEGER NOT NULL,
            isActive INTEGER DEFAULT 1,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # User Tests table - individual tests for each user
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            testCatalogId INTEGER NOT NULL,
            testResult TEXT,
            testDate TEXT,
            notes TEXT,
            status TEXT DEFAULT 'pending',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users (id),
            FOREIGN KEY (testCatalogId) REFERENCES test_catalog (id)
        )
    ''')
    
    # Create admin user
    admin_password = generate_password_hash('admin123')
    cursor.execute('''
        INSERT OR IGNORE INTO users (userNumber, firstName, lastName, email, password, phone, dateOfBirth, gender, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('ADMIN001', 'Admin', 'User', 'admin@lab.com', admin_password, '555-0001', '1990-01-01', 'other', 'admin'))
    
    # Create sample personnel user
    personnel_password = generate_password_hash('personnel123')
    cursor.execute('''
        INSERT OR IGNORE INTO users (userNumber, firstName, lastName, email, password, phone, dateOfBirth, gender, role, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('PER001', 'John', 'Personnel', 'personnel@lab.com', personnel_password, '555-0002', '1985-01-01', 'male', 'personnel', 1))
    
    # Insert sample test catalog
    sample_tests = [
        ('Complete Blood Count', 'hematology', 'Measures different components of blood', 'Fasting not required', 'Normal ranges vary by age and gender', 25.00, 2),
        ('Vitamin D', 'vitamin', 'Measures vitamin D levels in blood', 'Fasting not required', '30-100 ng/mL', 45.00, 4),
        ('Vitamin B12', 'vitamin', 'Measures vitamin B12 levels', 'Fasting not required', '200-900 pg/mL', 35.00, 3),
        ('Stool Culture', 'microbiology', 'Tests for bacterial infections in stool', 'Fresh sample required', 'No pathogenic bacteria', 60.00, 48),
        ('Urine Culture', 'microbiology', 'Tests for bacterial infections in urine', 'Clean catch midstream', 'No bacterial growth', 40.00, 24),
        ('Blood Glucose', 'biochemistry', 'Measures blood sugar levels', 'Fasting required', '70-100 mg/dL', 15.00, 1),
        ('Lipid Panel', 'biochemistry', 'Measures cholesterol and triglycerides', 'Fasting required', 'Total cholesterol <200 mg/dL', 30.00, 2),
        ('Thyroid Function', 'immunology', 'Measures thyroid hormone levels', 'Fasting not required', 'TSH: 0.4-4.0 mIU/L', 50.00, 4),
        ('Hemoglobin A1C', 'biochemistry', 'Measures average blood sugar over 2-3 months', 'Fasting not required', '<5.7%', 25.00, 1),
        ('Liver Function Test', 'biochemistry', 'Measures liver enzymes and proteins', 'Fasting required', 'ALT: 7-56 U/L', 40.00, 2)
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO test_catalog (name, category, description, preparationInstructions, normalRange, price, estimatedDuration)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', sample_tests)
    
    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def generate_user_number(role):
    """Generate unique user number based on role"""
    conn = get_db_connection()
    
    if role == 'patient':
        # Get the last patient number
        last_patient = conn.execute('SELECT userNumber FROM users WHERE userNumber LIKE "PAT%" ORDER BY userNumber DESC LIMIT 1').fetchone()
        if last_patient:
            last_num = int(last_patient['userNumber'][3:])  # Remove 'PAT' prefix
            new_num = last_num + 1
        else:
            new_num = 1
        user_number = f'PAT{new_num:06d}'  # PAT000001, PAT000002, etc.
    
    elif role == 'personnel':
        # Get the last personnel number
        last_personnel = conn.execute('SELECT userNumber FROM users WHERE userNumber LIKE "PER%" ORDER BY userNumber DESC LIMIT 1').fetchone()
        if last_personnel:
            last_num = int(last_personnel['userNumber'][3:])  # Remove 'PER' prefix
            new_num = last_num + 1
        else:
            new_num = 1
        user_number = f'PER{new_num:06d}'  # PER000001, PER000002, etc.
    
    conn.close()
    return user_number

def require_role(roles):
    """Decorator to require specific roles"""
    def decorator(f):
        def decorated_function(*args, **kwargs):
            conn = get_db_connection()
            user = conn.execute('SELECT role FROM users WHERE id = ?', (get_jwt_identity(),)).fetchone()
            conn.close()
            
            if not user or user['role'] not in roles:
                return jsonify({'message': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator

# Authentication routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        login_type = data.get('type', 'userNumber')  # 'userNumber' or 'email'
        identifier = data.get('identifier')  # userNumber or email
        password = data.get('password')
        
        if not identifier or not password:
            return jsonify({'message': 'Identifier and password are required'}), 400
        
        conn = get_db_connection()
        
        if login_type == 'userNumber':
            user = conn.execute('SELECT * FROM users WHERE userNumber = ? AND isActive = 1', (identifier,)).fetchone()
        else:
            user = conn.execute('SELECT * FROM users WHERE email = ? AND isActive = 1', (identifier,)).fetchone()
        
        conn.close()
        
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'message': 'Invalid credentials'}), 400
        
        # Generate JWT token
        access_token = create_access_token(identity=user['id'])
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': {
                'id': user['id'],
                'userNumber': user['userNumber'],
                'firstName': user['firstName'],
                'lastName': user['lastName'],
                'email': user['email'],
                'phone': user['phone'],
                'role': user['role']
            }
        })
        
    except Exception as e:
        return jsonify({'message': 'Server error during login'}), 500

@app.route('/api/auth/register-personnel', methods=['POST'])
@jwt_required()
@require_role(['admin'])
def register_personnel():
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['firstName', 'lastName', 'email', 'password', 'phone', 'dateOfBirth', 'gender']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        if len(data['password']) < 6:
            return jsonify({'message': 'Password must be at least 6 characters'}), 400
        
        if data['gender'] not in ['male', 'female', 'other']:
            return jsonify({'message': 'Invalid gender'}), 400
        
        conn = get_db_connection()
        
        # Check if email already exists
        existing_user = conn.execute('SELECT id FROM users WHERE email = ?', (data['email'],)).fetchone()
        if existing_user:
            conn.close()
            return jsonify({'message': 'User already exists with this email'}), 400
        
        # Generate user number for personnel
        user_number = generate_user_number('personnel')
        
        # Create new personnel
        password_hash = generate_password_hash(data['password'])
        address = json.dumps(data.get('address', {})) if data.get('address') else None
        
        cursor = conn.execute('''
            INSERT INTO users (userNumber, firstName, lastName, email, password, phone, dateOfBirth, gender, address, role, createdBy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_number, data['firstName'], data['lastName'], data['email'], password_hash,
            data['phone'], data['dateOfBirth'], data['gender'], address, 'personnel', get_jwt_identity()
        ))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Personnel registered successfully',
            'user': {
                'id': user_id,
                'userNumber': user_number,
                'firstName': data['firstName'],
                'lastName': data['lastName'],
                'email': data['email'],
                'role': 'personnel'
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Server error during personnel registration'}), 500

@app.route('/api/auth/register-patient', methods=['POST'])
@jwt_required()
@require_role(['personnel', 'admin'])
def register_patient():
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        if data['gender'] not in ['male', 'female', 'other']:
            return jsonify({'message': 'Invalid gender'}), 400
        
        conn = get_db_connection()
        
        # Check if phone already exists
        existing_user = conn.execute('SELECT id FROM users WHERE phone = ?', (data['phone'],)).fetchone()
        if existing_user:
            conn.close()
            return jsonify({'message': 'User already exists with this phone number'}), 400
        
        # Generate user number for patient
        user_number = generate_user_number('patient')
        
        # Create new patient (email is optional)
        address = json.dumps(data.get('address', {})) if data.get('address') else None
        email = data.get('email') if data.get('email') else None
        
        cursor = conn.execute('''
            INSERT INTO users (userNumber, firstName, lastName, email, password, phone, dateOfBirth, gender, address, role, createdBy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_number, data['firstName'], data['lastName'], email, None, data['phone'],
            data['dateOfBirth'], data['gender'], address, 'patient', get_jwt_identity()
        ))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Patient registered successfully',
            'user': {
                'id': user_id,
                'userNumber': user_number,
                'firstName': data['firstName'],
                'lastName': data['lastName'],
                'email': email,
                'phone': data['phone'],
                'role': 'patient'
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Server error during patient registration'}), 500


@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE id = ?', (get_jwt_identity(),)).fetchone()
        conn.close()
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        user_data = {
            'id': user['id'],
            'userNumber': user['userNumber'],
            'firstName': user['firstName'],
            'lastName': user['lastName'],
            'email': user['email'],
            'phone': user['phone'],
            'dateOfBirth': user['dateOfBirth'],
            'gender': user['gender'],
            'address': json.loads(user['address']) if user['address'] else None,
            'role': user['role']
        }
        
        return jsonify({'user': user_data})
        
    except Exception as e:
        return jsonify({'message': 'Server error'}), 500

# Test Catalog routes
@app.route('/api/test-catalog', methods=['GET'])
@jwt_required()
def get_test_catalog():
    try:
        conn = get_db_connection()
        category = request.args.get('category')
        
        if category:
            tests = conn.execute('SELECT * FROM test_catalog WHERE category = ? AND isActive = 1 ORDER BY name', (category,)).fetchall()
        else:
            tests = conn.execute('SELECT * FROM test_catalog WHERE isActive = 1 ORDER BY category, name').fetchall()
        
        conn.close()
        
        tests_list = [dict(test) for test in tests]
        return jsonify({'tests': tests_list})
        
    except Exception as e:
        return jsonify({'message': 'Server error'}), 500

@app.route('/api/test-catalog', methods=['POST'])
@jwt_required()
@require_role(['admin', 'personnel'])
def create_test_catalog():
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['name', 'category', 'description', 'preparationInstructions', 'normalRange', 'price', 'estimatedDuration']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        if data['category'] not in ['microbiology', 'vitamin', 'biochemistry', 'hematology', 'immunology']:
            return jsonify({'message': 'Invalid category'}), 400
        
        conn = get_db_connection()
        cursor = conn.execute('''
            INSERT INTO test_catalog (name, category, description, preparationInstructions, normalRange, price, estimatedDuration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['name'], data['category'], data['description'],
            data['preparationInstructions'], data['normalRange'],
            data['price'], data['estimatedDuration']
        ))
        
        test_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Test added to catalog successfully',
            'test': {
                'id': test_id,
                'name': data['name'],
                'category': data['category'],
                'description': data['description'],
                'preparationInstructions': data['preparationInstructions'],
                'normalRange': data['normalRange'],
                'price': data['price'],
                'estimatedDuration': data['estimatedDuration']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Server error creating test catalog'}), 500

# User Tests routes
@app.route('/api/user-tests', methods=['GET'])
@jwt_required()
def get_user_tests():
    try:
        conn = get_db_connection()
        user_id = request.args.get('userId')
        
        if not user_id:
            return jsonify({'message': 'userId parameter is required'}), 400
        
        # Check if user can access these tests
        current_user = conn.execute('SELECT role FROM users WHERE id = ?', (get_jwt_identity(),)).fetchone()
        if current_user['role'] == 'patient' and int(user_id) != get_jwt_identity():
            conn.close()
            return jsonify({'message': 'Insufficient permissions'}), 403
        
        tests = conn.execute('''
            SELECT ut.*, tc.name as testName, tc.category, tc.description, tc.normalRange, tc.price
            FROM user_tests ut
            LEFT JOIN test_catalog tc ON ut.testCatalogId = tc.id
            WHERE ut.userId = ? 
            ORDER BY ut.createdAt DESC
        ''', (user_id,)).fetchall()
        
        conn.close()
        
        tests_list = [dict(test) for test in tests]
        return jsonify({'tests': tests_list})
        
    except Exception as e:
        return jsonify({'message': 'Server error'}), 500

@app.route('/api/user-tests', methods=['POST'])
@jwt_required()
@require_role(['personnel', 'admin'])
def create_user_test():
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['userId', 'testCatalogId']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        conn = get_db_connection()
        
        # Verify user exists
        user = conn.execute('SELECT id FROM users WHERE id = ?', (data['userId'],)).fetchone()
        if not user:
            conn.close()
            return jsonify({'message': 'User not found'}), 404
        
        # Verify test catalog exists
        test_catalog = conn.execute('SELECT id FROM test_catalog WHERE id = ? AND isActive = 1', (data['testCatalogId'],)).fetchone()
        if not test_catalog:
            conn.close()
            return jsonify({'message': 'Test not found in catalog'}), 404
        
        cursor = conn.execute('''
            INSERT INTO user_tests (userId, testCatalogId, testResult, testDate, notes, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data['userId'], data['testCatalogId'], data.get('testResult'),
            data.get('testDate'), data.get('notes'), data.get('status', 'pending')
        ))
        
        test_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Test created successfully',
            'test': {
                'id': test_id,
                'userId': data['userId'],
                'testCatalogId': data['testCatalogId'],
                'testResult': data.get('testResult'),
                'testDate': data.get('testDate'),
                'notes': data.get('notes'),
                'status': data.get('status', 'pending')
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Server error creating test'}), 500

@app.route('/api/user-tests/<int:test_id>', methods=['PUT'])
@jwt_required()
@require_role(['personnel', 'admin'])
def update_user_test(test_id):
    try:
        data = request.get_json()
        conn = get_db_connection()
        
        # Check if test exists
        test = conn.execute('SELECT * FROM user_tests WHERE id = ?', (test_id,)).fetchone()
        if not test:
            conn.close()
            return jsonify({'message': 'Test not found'}), 404
        
        # Build dynamic update query
        fields = []
        values = []
        
        allowed_fields = ['testResult', 'testDate', 'notes', 'status']
        for field in allowed_fields:
            if field in data:
                fields.append(f'{field} = ?')
                values.append(data[field])
        
        if not fields:
            conn.close()
            return jsonify({'message': 'No valid fields to update'}), 400
        
        values.append(test_id)
        query = f'UPDATE user_tests SET {", ".join(fields)}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?'
        
        conn.execute(query, values)
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Test updated successfully'})
        
    except Exception as e:
        return jsonify({'message': 'Server error updating test'}), 500

@app.route('/api/user-tests/<int:test_id>', methods=['DELETE'])
@jwt_required()
@require_role(['personnel', 'admin'])
def delete_user_test(test_id):
    try:
        conn = get_db_connection()
        
        cursor = conn.execute('DELETE FROM user_tests WHERE id = ?', (test_id,))
        conn.commit()
        conn.close()
        
        if cursor.rowcount == 0:
            return jsonify({'message': 'Test not found'}), 404
        
        return jsonify({'message': 'Test deleted successfully'})
        
    except Exception as e:
        return jsonify({'message': 'Server error deleting test'}), 500

# Users routes
@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    try:
        conn = get_db_connection()
        
        role = request.args.get('role')
        search = request.args.get('search')
        
        query = 'SELECT id, userNumber, firstName, lastName, email, phone, dateOfBirth, gender, role, isActive, createdAt FROM users WHERE 1=1'
        params = []
        
        if role:
            query += ' AND role = ?'
            params.append(role)
        
        if search:
            query += ' AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)'
            search_term = f'%{search}%'
            params.extend([search_term, search_term, search_term])
        
        query += ' ORDER BY lastName, firstName'
        
        users = conn.execute(query, params).fetchall()
        conn.close()
        
        users_list = [dict(user) for user in users]
        return jsonify({'users': users_list})
        
    except Exception as e:
        return jsonify({'message': 'Server error'}), 500

@app.route('/api/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    try:
        conn = get_db_connection()
        user = conn.execute('SELECT id, userNumber, firstName, lastName, email, phone, dateOfBirth, gender, address, role, isActive, createdAt FROM users WHERE id = ?', (user_id,)).fetchone()
        conn.close()
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        user_data = dict(user)
        if user_data['address']:
            user_data['address'] = json.loads(user_data['address'])
        
        return jsonify({'user': user_data})
        
    except Exception as e:
        return jsonify({'message': 'Server error'}), 500


@app.route('/')
def home():
    return jsonify({'message': 'Lab Management API is running!', 'version': '1.0.0'})

@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    init_db()
    print("Starting Lab Management API server...")
    print("Database initialized successfully!")
    print("Server will be available at: http://localhost:8000")
    app.run(debug=True, port=8000, host='0.0.0.0')