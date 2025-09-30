@echo off
REM Lab Management Desktop Application Setup Script for Windows
REM This script sets up the development environment

echo.
echo 🏥 Lab Management Desktop Application Setup
echo =============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v18 or higher) first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher first.
    echo    Visit: https://python.org/
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ Python version:
python --version
echo.

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install Node.js dependencies
    pause
    exit /b 1
)

REM Install Python dependencies
echo.
echo 🐍 Installing Python dependencies...
cd server
call pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo 🎉 Setup completed successfully!
echo.
echo To start the application:
echo 1. Start the backend: cd server ^&^& python app.py
echo 2. Start the frontend: npm start
echo.
echo Default login credentials:
echo - Admin: admin@lab.com / admin123
echo - Personnel: personnel@lab.com / personnel123
echo.
echo Happy coding! 🚀
pause
