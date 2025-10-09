# ENVIRONMENT FILE TEMPLATES FOR SURVEYOR ATTENDANCE MANAGEMENT SYSTEM

This document provides templates for all required environment files across the three subprojects.

## 1. Backend (.env)
Location: `backend/.env`

```
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/surveyor_attendance"
# Replace with your Supabase PostgreSQL connection string
# DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE_NAME]"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Server Configuration
PORT=5000
NODE_ENV="development"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/jpg"
```

## 2. Mobile App (.env)
Location: `mobile-app/.env`

```
# API Configuration
API_BASE_URL="http://localhost:5000"
# For development on device, use your computer's local IP:
# API_BASE_URL="http://192.168.1.XXX:5000"
# For production, use your deployed backend URL:
# API_BASE_URL="https://your-deployed-backend.com"

# Cloudinary Configuration (for direct uploads if needed)
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"

# App Configuration
EXPO_PUBLIC_APP_NAME="SAMS Mobile"
EXPO_PUBLIC_APP_VERSION="1.0.0"

# Development Configuration
EXPO_PUBLIC_ENABLE_DEBUG_MODE="true"
```

## 3. Web Admin (.env.local)
Location: `web-admin/.env.local`

```
# API Configuration
NEXT_PUBLIC_API_BASE_URL="http://localhost:5000"
# For production, use your deployed backend URL:
# NEXT_PUBLIC_API_BASE_URL="https://your-deployed-backend.com"

# Cloudinary Configuration (for viewing images)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"

# App Configuration
NEXT_PUBLIC_APP_NAME="SAMS Admin Portal"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# Development Configuration
NEXT_PUBLIC_ENABLE_DEBUG_MODE="true"

# Map Configuration (for geo-fence features in v2)
NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT="40.7128"
NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG="-74.0060"
NEXT_PUBLIC_DEFAULT_MAP_ZOOM="13"
```

## IMPORTANT SETUP INSTRUCTIONS:

### 1. Supabase Setup
1. Create a new project at https://supabase.com
2. Get your PostgreSQL connection string from Project Settings > Database
3. Replace the DATABASE_URL in backend/.env

### 2. Cloudinary Setup
1. Create account at https://cloudinary.com
2. Get your cloud name, API key, and API secret from Dashboard
3. Update all Cloudinary variables in respective .env files

### 3. Mobile Development IP Configuration
When testing the mobile app on a physical device:
1. Find your computer's local IP address
2. Update API_BASE_URL in mobile-app/.env to use this IP
3. Ensure your firewall allows connections on port 5000

### 4. Production Deployment
- Replace all localhost URLs with your deployed backend URL
- Use production Cloudinary credentials
- Set NODE_ENV="production" for backend
- Disable debug modes for production builds

## SECURITY NOTES:
- Never commit .env files to version control
- Use strong, unique JWT secrets for production
- Regularly rotate API keys and secrets
- Use HTTPS for all production URLs