@echo off
REM Lab Management Desktop Application - Run Script for Windows
REM This script starts both the backend and frontend

echo.
echo 🏥 Starting Lab Management Desktop Application
echo ==============================================
echo.

REM Check if server is already running
netstat -ano | findstr :8000 >nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 8000 is already in use. Stopping existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /PID %%a /F >nul 2>&1
    timeout /t 2 >nul
)

REM Start backend in background
echo 🚀 Starting Flask backend...
cd server
start /B python app.py
cd ..

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 3 >nul

REM Check if backend started successfully
curl -s http://localhost:8000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend failed to start. Please check the logs.
    exit /b 1
)

echo ✅ Backend started successfully on http://localhost:8000

REM Start frontend
echo 🖥️  Starting Electron frontend...
call npm start

echo.
echo 👋 Application stopped.
pause
