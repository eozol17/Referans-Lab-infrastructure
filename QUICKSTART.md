# Lab Management Desktop Application - Quick Start Guide

## 🚀 Quick Setup & Run

### Prerequisites
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python 3.8+** - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

### 🏃‍♂️ Quick Start (3 Steps)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/lab-management-desktop.git
   cd lab-management-desktop
   ```

2. **Run the auto-setup script:**
   ```bash
   # On macOS/Linux:
   chmod +x setup.sh && ./setup.sh
   
   # On Windows:
   setup.bat
   ```

3. **Start the application:**
   ```bash
   # Terminal 1 - Start backend:
   cd server && python app.py
   
   # Terminal 2 - Start frontend:
   npm start
   ```

### 🎯 Default Login Credentials
- **Admin**: `admin@lab.com` / `admin123`
- **Personnel**: `personnel@lab.com` / `personnel123`
- **Patients**: Use generated user numbers (PAT000001, PAT000002, etc.)

---

## 📋 Manual Setup (Alternative)

### Backend Setup (Python Flask)
```bash
cd server
pip install -r requirements.txt
python app.py
```

### Frontend Setup (Electron)
```bash
npm install
npm start
```

---

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Electron desktop app |
| `npm run dev` | Start in development mode |
| `npm run build` | Build for production |
| `cd server && python app.py` | Start Flask backend |

---

## 📁 Project Structure
```
LabProg/
├── 📄 index.html          # Main application UI
├── 📄 main.js             # Electron main process
├── 📄 package.json        # Node.js dependencies
├── 📄 setup.sh            # Auto-setup script (macOS/Linux)
├── 📄 setup.bat           # Auto-setup script (Windows)
├── 📁 server/             # Python Flask backend
│   ├── 📄 app.py          # Main Flask application
│   ├── 📄 requirements.txt # Python dependencies
│   └── 📄 database.sqlite # SQLite database
└── 📁 src/                # React frontend (legacy)
```

---

## 🔧 Troubleshooting

### Common Issues:

**1. Port 8000 already in use:**
```bash
# Kill process using port 8000
lsof -ti:8000 | xargs kill -9
```

**2. Node modules not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**3. Python dependencies issues:**
```bash
cd server
pip install --upgrade pip
pip install -r requirements.txt
```

**4. Database issues:**
```bash
cd server
rm database.sqlite
python app.py  # This will recreate the database
```

---

## 🌟 Features Overview

- ✅ **Cross-Platform Desktop App** (macOS & Windows)
- ✅ **Dual Authentication** (Personnel with password, Patients with user number)
- ✅ **User Management** (Register patients & personnel)
- ✅ **Test Catalog** (Manage available test types)
- ✅ **Test Assignment** (Assign tests to users)
- ✅ **Results Management** (Update & track test results)
- ✅ **Modern UI** (Clean, professional interface)

---

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/lab-management-desktop/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/lab-management-desktop/discussions)
- 📖 **Documentation**: [README.md](./README.md)

---

**Happy coding! 🚀**
