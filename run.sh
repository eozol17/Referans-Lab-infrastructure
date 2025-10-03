#!/bin/bash

# Lab Management Desktop Application - Run Script
# This script starts both the backend and frontend

echo "🏥 Starting Lab Management Desktop Application"
echo "=============================================="

# Check if server is already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8000 is already in use. Stopping existing process..."
    lsof -ti:8000 | xargs kill -9
    sleep 2
fi

# Start backend in background
echo "🚀 Starting Flask backend..."
cd server
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend started successfully
if ! curl -s http://localhost:8000/api/health > /dev/null; then
    echo "❌ Backend failed to start. Please check the logs."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend started successfully on http://localhost:8000"

# Start frontend
echo "🖥️  Starting Electron frontend..."
npm start

# Cleanup when frontend closes
echo "🛑 Shutting down backend..."
kill $BACKEND_PID 2>/dev/null
echo "👋 Application stopped."
