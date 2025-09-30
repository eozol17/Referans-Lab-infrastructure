# Contributing to Lab Management Desktop Application

Thank you for your interest in contributing to the Lab Management Desktop Application! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/lab-management-desktop.git
   cd lab-management-desktop
   ```

3. Set up the development environment:
   ```bash
   # Install Node.js dependencies
   npm install
   
   # Install Python dependencies
   cd server
   pip install -r requirements.txt
   cd ..
   ```

## Development Workflow

### Backend Development (Python Flask)
- The main backend code is in the `server/` directory
- Main application file: `server/app.py`
- Database: SQLite (`server/database.sqlite`)
- API endpoints follow RESTful conventions

### Frontend Development (Electron + HTML/JS)
- Main UI file: `index.html`
- Electron main process: `main.js`
- Preload script: `preload.js`
- Styling: Inline CSS in `index.html`

### Testing
1. Start the Flask backend:
   ```bash
   cd server && python app.py
   ```

2. Start Electron in development mode:
   ```bash
   npm start
   ```

3. Test all functionality:
   - Login as admin/personnel
   - Register new patients
   - Manage test catalog
   - Assign tests to users
   - Update test results

## Code Style Guidelines

### Python (Backend)
- Follow PEP 8 style guidelines
- Use meaningful variable and function names
- Add docstrings for functions and classes
- Handle exceptions properly

### JavaScript (Frontend)
- Use modern ES6+ syntax
- Use meaningful variable and function names
- Add comments for complex logic
- Handle errors gracefully

### HTML/CSS
- Use semantic HTML elements
- Keep CSS organized and maintainable
- Use consistent indentation (2 spaces)
- Comment complex CSS rules

## Submitting Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test thoroughly

3. Commit your changes:
   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   ```

4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request on GitHub

## Pull Request Guidelines

- Provide a clear description of what the PR does
- Include screenshots for UI changes
- Test all functionality before submitting
- Ensure the code follows the project's style guidelines
- Update documentation if necessary

## Issue Reporting

When reporting issues, please include:
- Operating system and version
- Node.js and Python versions
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable

## Feature Requests

For feature requests, please:
- Describe the feature clearly
- Explain why it would be useful
- Provide any relevant examples or mockups
- Consider the impact on existing functionality

## Questions?

If you have questions about contributing, please:
- Open an issue on GitHub
- Check existing issues and discussions
- Review the README.md for setup instructions

Thank you for contributing to the Lab Management Desktop Application!
