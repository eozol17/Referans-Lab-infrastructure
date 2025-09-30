# Lab Management Desktop Application

A comprehensive laboratory management system built as a desktop application using Electron, Python Flask backend, and modern web technologies.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python 3.8+** - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

### Auto Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/yourusername/lab-management-desktop.git
cd lab-management-desktop

# Run auto-setup script
./setup.sh        # macOS/Linux
# OR
setup.bat         # Windows

# Start the application
./run.sh           # macOS/Linux
# OR  
run.bat            # Windows
```

### Manual Setup
```bash
# Install dependencies
npm install
cd server && pip install -r requirements.txt && cd ..

# Start backend (Terminal 1)
cd server && python app.py

# Start frontend (Terminal 2)  
npm start
```

### Available Scripts
| Command | Description |
|---------|-------------|
| `npm start` | Start Electron desktop app |
| `npm run dev` | Start both backend and frontend |
| `npm run setup` | Install all dependencies |
| `npm run clean` | Clean node_modules and database |
| `npm run reset` | Clean and reinstall everything |
| `npm run build` | Build for production |

## Features

### 🔐 Authentication System
- **Personnel/Admin Login**: Email + password authentication
- **Patient Login**: User number only (no password required)
- **Role-based Access Control**: Admin, Personnel, and Patient roles

### 👥 User Management
- **Patient Registration**: Register patients with optional email
- **Personnel Registration**: Admin can register new personnel
- **Unique User Numbers**: Automatic generation (PAT000001, PER000001, etc.)
- **User Status Management**: Activate/deactivate users

### 🧪 Test Management
- **Test Catalog**: Manage available test types (Microbiology, Vitamin, Blood, etc.)
- **Test Assignment**: Assign tests from catalog to specific users
- **Test Results**: Update and track test results with status management
- **Filtering**: Filter results by user, test type, and status

### 🖥️ Desktop Application
- **Cross-Platform**: Works on both macOS and Windows
- **Native Desktop Experience**: Built with Electron
- **Modern UI**: Clean, professional interface
- **Real-time Updates**: Live data synchronization

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Desktop Framework**: Electron
- **Backend**: Python Flask
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Modern CSS with responsive design

## Project Structure

```
LabProg/
├── main.js                 # Electron main process
├── preload.js             # Electron preload script
├── index.html             # Main application UI
├── package.json           # Node.js dependencies and scripts
├── README.md              # This file
├── server/                # Python Flask backend
│   ├── app.py            # Main Flask application
│   ├── requirements.txt  # Python dependencies
│   ├── database.sqlite   # SQLite database
│   └── models/           # Database models
└── src/                  # React frontend (legacy)
    ├── components/       # React components
    └── package.json     # React dependencies
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Python 3.8 or higher
- npm or yarn

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the Flask server:
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup
1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Start the Electron application:
   ```bash
   npm start
   ```

## Usage

### Default Login Credentials
- **Admin**: admin@lab.com / admin123
- **Personnel**: personnel@lab.com / personnel123
- **Patients**: Use generated user numbers (PAT000001, PAT000002, etc.)

### Key Features
1. **Login**: Choose between Personnel or Patient login type
2. **Dashboard**: Overview of system features and status
3. **Patient Management**: Register and manage patients
4. **Test Management**: Manage test catalog and assign tests
5. **Results Management**: Update and track test results

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register-patient` - Register new patient
- `POST /api/auth/register-personnel` - Register new personnel
- `GET /api/auth/me` - Get current user info

### User Management
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Test Management
- `GET /api/test-catalog` - Get test catalog
- `POST /api/test-catalog` - Add new test to catalog
- `GET /api/user-tests` - Get user tests
- `POST /api/user-tests` - Assign test to user
- `PUT /api/user-tests/:id` - Update test result
- `DELETE /api/user-tests/:id` - Delete user test

## Database Schema

### Users Table
- `id` - Primary key
- `userNumber` - Unique user identifier
- `firstName`, `lastName` - User names
- `email` - Optional email address
- `password` - Optional password (NULL for patients)
- `phone` - Phone number
- `dateOfBirth` - Date of birth
- `gender` - Gender (male/female/other)
- `address` - Optional address
- `role` - User role (admin/personnel/patient)
- `isActive` - Account status
- `createdBy` - User who created this account

### Test Catalog Table
- `id` - Primary key
- `name` - Test name
- `category` - Test category
- `description` - Test description
- `preparationInstructions` - Preparation instructions
- `normalRange` - Normal range values
- `price` - Test price
- `estimatedDuration` - Estimated duration in minutes

### User Tests Table
- `id` - Primary key
- `userId` - Reference to users table
- `testCatalogId` - Reference to test_catalog table
- `testResult` - Test result
- `testDate` - Test date
- `notes` - Additional notes
- `status` - Test status (pending/completed/cancelled)

## Development

### Running in Development Mode
1. Start the Flask backend:
   ```bash
   cd server && python app.py
   ```

2. Start Electron in development mode:
   ```bash
   npm run dev
   ```

### Building for Production
```bash
npm run build
```

This will create a distributable application package.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

## Changelog

### Version 1.0.0
- Initial release
- Complete authentication system
- User management
- Test catalog and assignment
- Results management
- Desktop application with Electron
- Cross-platform support