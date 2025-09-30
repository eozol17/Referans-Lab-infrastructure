#!/bin/bash

# Lab Management Desktop Application Setup Script
# This script sets up the development environment

echo "🏥 Lab Management Desktop Application Setup"
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18 or higher) first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher first."
    echo "   Visit: https://python.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ Python version: $(python3 --version)"

# Install Node.js dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

# Install Python dependencies
echo ""
echo "🐍 Installing Python dependencies..."
cd server
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To start the application:"
echo "1. Start the backend: cd server && python3 app.py"
echo "2. Start the frontend: npm start"
echo ""
echo "Default login credentials:"
echo "- Admin: admin@lab.com / admin123"
echo "- Personnel: personnel@lab.com / personnel123"
echo ""
echo "Happy coding! 🚀"
