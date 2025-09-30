# Development Guide

## 🛠️ Development Environment Setup

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Python** 3.8+ ([Download](https://python.org/))
- **Git** ([Download](https://git-scm.com/))

### Quick Setup
```bash
# Clone repository
git clone <repository-url>
cd lab-management-desktop

# Auto-setup (recommended)
./setup.sh        # macOS/Linux
# OR
setup.bat         # Windows

# Manual setup
npm install
cd server && pip install -r requirements.txt
```

## 🚀 Running the Application

### Development Mode
```bash
# Terminal 1 - Backend
cd server
python app.py

# Terminal 2 - Frontend
npm start
```

### Production Build
```bash
npm run build
```

## 📁 Project Structure

```
LabProg/
├── 📄 index.html              # Main UI (HTML/CSS/JS)
├── 📄 main.js                 # Electron main process
├── 📄 preload.js              # Electron preload script
├── 📄 package.json            # Node.js dependencies & scripts
├── 📄 setup.sh                # Auto-setup (macOS/Linux)
├── 📄 setup.bat               # Auto-setup (Windows)
├── 📄 QUICKSTART.md           # Quick start guide
├── 📄 README.md               # Main documentation
├── 📄 CONTRIBUTING.md         # Contribution guidelines
├── 📄 LICENSE                 # MIT License
├── 📄 .gitignore              # Git ignore rules
├── 📁 server/                 # Python Flask Backend
│   ├── 📄 app.py              # Main Flask application
│   ├── 📄 requirements.txt    # Python dependencies
│   ├── 📄 database.sqlite     # SQLite database
│   ├── 📁 models/             # Database models (legacy)
│   ├── 📁 routes/             # API routes (legacy)
│   └── 📁 middleware/         # Middleware (legacy)
└── 📁 src/                    # React Frontend (legacy)
    ├── 📄 package.json        # React dependencies
    ├── 📁 components/         # React components
    └── 📁 context/            # React context
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Electron desktop app |
| `npm run dev` | Start both backend and frontend |
| `npm run start-server` | Start Flask backend only |
| `npm run start-electron` | Start Electron frontend only |
| `npm run build` | Build for production |
| `npm run setup` | Install all dependencies |
| `npm run clean` | Clean node_modules and database |
| `npm run reset` | Clean and reinstall everything |

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userNumber TEXT UNIQUE,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT,
    password TEXT,  -- NULL for patients
    phone TEXT NOT NULL,
    dateOfBirth TEXT NOT NULL,
    gender TEXT NOT NULL,
    address TEXT,
    role TEXT DEFAULT 'patient',
    isActive INTEGER DEFAULT 1,
    createdBy INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Test Catalog Table
```sql
CREATE TABLE test_catalog (
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
);
```

### User Tests Table
```sql
CREATE TABLE user_tests (
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
);
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register-patient` - Register patient
- `POST /api/auth/register-personnel` - Register personnel
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Test Catalog
- `GET /api/test-catalog` - Get test catalog
- `POST /api/test-catalog` - Add test to catalog
- `PUT /api/test-catalog/:id` - Update test
- `DELETE /api/test-catalog/:id` - Delete test

### User Tests
- `GET /api/user-tests` - Get user tests
- `POST /api/user-tests` - Assign test to user
- `PUT /api/user-tests/:id` - Update test result
- `DELETE /api/user-tests/:id` - Delete user test

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login as admin/personnel
- [ ] Register new patient
- [ ] Register new personnel
- [ ] Add test to catalog
- [ ] Assign test to user
- [ ] Update test result
- [ ] Filter results
- [ ] User management functions

### Test Data
```json
// Admin User
{
  "email": "admin@lab.com",
  "password": "admin123",
  "role": "admin"
}

// Personnel User
{
  "email": "personnel@lab.com", 
  "password": "personnel123",
  "role": "personnel"
}

// Sample Test Catalog Entry
{
  "name": "Complete Blood Count",
  "category": "Blood",
  "description": "Measures different components of blood",
  "preparationInstructions": "No special preparation required",
  "normalRange": "Within normal limits",
  "price": 25.00,
  "estimatedDuration": 30
}
```

## 🐛 Debugging

### Common Issues

**1. Port 8000 in use:**
```bash
lsof -ti:8000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8000   # Windows
```

**2. Database locked:**
```bash
cd server
rm database.sqlite
python app.py  # Recreates database
```

**3. Node modules issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**4. Python dependencies:**
```bash
cd server
pip install --upgrade pip
pip install -r requirements.txt
```

### Debug Mode
```bash
# Enable Flask debug mode
cd server
export FLASK_DEBUG=1  # macOS/Linux
set FLASK_DEBUG=1     # Windows
python app.py
```

## 📦 Building & Distribution

### Build for Current Platform
```bash
npm run build
```

### Package for Distribution
```bash
npm run dist
```

### Cross-Platform Builds
```bash
# Windows
npm run build -- --win

# macOS  
npm run build -- --mac

# Linux
npm run build -- --linux
```

## 🔒 Security Considerations

- JWT tokens expire after 7 days
- Passwords are hashed using Werkzeug
- CORS is enabled for development
- Input validation on all API endpoints
- SQL injection protection via parameterized queries

## 📝 Code Style

### Python (Backend)
- Follow PEP 8
- Use meaningful variable names
- Add docstrings for functions
- Handle exceptions properly

### JavaScript (Frontend)
- Use modern ES6+ syntax
- Meaningful variable names
- Comment complex logic
- Handle errors gracefully

## 🚀 Deployment

### Production Checklist
- [ ] Update Flask to production WSGI server
- [ ] Set up proper database backup
- [ ] Configure environment variables
- [ ] Set up logging
- [ ] Test all functionality
- [ ] Build and package application

### Environment Variables
```bash
export FLASK_ENV=production
export SECRET_KEY=your-secret-key
export DATABASE_URL=sqlite:///database.sqlite
```

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/lab-management-desktop/issues)
- 💡 **Discussions**: [GitHub Discussions](https://github.com/yourusername/lab-management-desktop/discussions)
- 📖 **Documentation**: [README.md](./README.md)
