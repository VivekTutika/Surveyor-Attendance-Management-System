@echo off
REM SURVEYOR ATTENDANCE MANAGEMENT SYSTEM - QUICK SETUP SCRIPT (Windows)
REM This script helps you quickly set up the development environment

echo 🚀 Setting up Surveyor Attendance Management System...
echo ==================================================

REM Check prerequisites
echo 📋 Checking prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install dependencies for all projects
echo.
echo 📦 Installing dependencies...

REM Backend
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

REM Mobile App
echo 📦 Installing mobile app dependencies...
cd ..\mobile-app
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install mobile app dependencies
    pause
    exit /b 1
)
echo ✅ Mobile app dependencies installed

REM Web Admin
echo 📦 Installing web admin dependencies...
cd ..\web-admin
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install web admin dependencies
    pause
    exit /b 1
)
echo ✅ Web admin dependencies installed

REM Generate Prisma client
echo.
echo 🔧 Setting up Prisma...
cd ..\backend
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✅ Prisma client generated

cd ..

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📝 Next steps:
echo 1. Configure your .env files (see ENV_SETUP_GUIDE.md)
echo 2. Set up Supabase database connection
echo 3. Configure Cloudinary credentials
echo 4. Run database migrations: cd backend ^&^& npx prisma migrate dev
echo 5. Seed the database: cd backend ^&^& npm run db:seed
echo.
echo 🚀 To start development:
echo Backend: cd backend ^&^& npm run dev
echo Mobile: cd mobile-app ^&^& npm start
echo Web Admin: cd web-admin ^&^& npm run dev
echo.
pause