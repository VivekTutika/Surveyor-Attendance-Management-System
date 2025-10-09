@echo off
REM Development Start Script for SAMS
REM Starts all three development servers

echo 🚀 Starting Surveyor Attendance Management System Development Servers...
echo ============================================================================

echo.
echo Starting development servers:
echo - Backend API: http://localhost:5000
echo - Web Admin: http://localhost:3000
echo - Mobile: Will open Expo DevTools
echo.

REM Start backend server
echo 📡 Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start web admin
echo 🌐 Starting Web Admin Portal...
start "Web Admin" cmd /k "cd web-admin && npm run dev"

REM Wait a moment for web admin to start
timeout /t 3 /nobreak >nul

REM Start mobile app
echo 📱 Starting Mobile App...
start "Mobile App" cmd /k "cd mobile-app && npm start"

echo.
echo ✅ All development servers are starting...
echo.
echo 📝 Access your applications:
echo Backend API: http://localhost:5000
echo Web Admin: http://localhost:3000
echo Mobile: Follow the Expo CLI instructions
echo.
echo Press any key to close this window...
pause >nul