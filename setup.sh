#!/bin/bash

# SURVEYOR ATTENDANCE MANAGEMENT SYSTEM - QUICK SETUP SCRIPT
# This script helps you quickly set up the development environment

echo "🚀 Setting up Surveyor Attendance Management System..."
echo "=================================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies for all projects
echo ""
echo "📦 Installing dependencies..."

# Backend
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Mobile App
echo "📦 Installing mobile app dependencies..."
cd ../mobile-app
npm install
if [ $? -eq 0 ]; then
    echo "✅ Mobile app dependencies installed"
else
    echo "❌ Failed to install mobile app dependencies"
    exit 1
fi

# Web Admin
echo "📦 Installing web admin dependencies..."
cd ../web-admin
npm install
if [ $? -eq 0 ]; then
    echo "✅ Web admin dependencies installed"
else
    echo "❌ Failed to install web admin dependencies"
    exit 1
fi

# Generate Prisma client
echo ""
echo "🔧 Setting up Prisma..."
cd ../backend
npx prisma generate
if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated"
else
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Configure your .env files (see ENV_SETUP_GUIDE.md)"
echo "2. Set up Supabase database connection"
echo "3. Configure Cloudinary credentials"
echo "4. Run database migrations: cd backend && npx prisma migrate dev"
echo "5. Seed the database: cd backend && npm run db:seed"
echo ""
echo "🚀 To start development:"
echo "Backend: cd backend && npm run dev"
echo "Mobile: cd mobile-app && npm start"
echo "Web Admin: cd web-admin && npm run dev"