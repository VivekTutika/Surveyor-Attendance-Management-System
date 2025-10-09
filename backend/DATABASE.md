# Database Setup & Configuration

## Overview
This document outlines the database schema and configuration for the Surveyor Attendance Management System (SAMS).

## Technology Stack
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Image Storage**: Cloudinary

## Database Schema

### Models

#### User
- **Purpose**: Stores admin and surveyor user information
- **Relationships**: 
  - One-to-many with Attendance
  - One-to-many with BikeMeterReading
  - One-to-one with GeoFence

#### Attendance
- **Purpose**: Records daily attendance with selfie photos and GPS coordinates
- **Key Features**: Morning/Evening types, GPS tracking, photo storage
- **Unique Constraint**: One attendance record per user per date per type

#### BikeMeterReading
- **Purpose**: Records bike odometer readings with photos
- **Key Features**: Morning/Evening types, manual KM entry option
- **Unique Constraint**: One reading per user per date per type

#### GeoFence
- **Purpose**: Defines geographical boundaries for surveyors (v2 feature)
- **Storage**: JSON coordinates for polygon boundaries

#### Report
- **Purpose**: Tracks generated reports for auditing
- **Types**: Monthly Attendance, Fortnightly KM reports

### Enums
- **Role**: ADMIN, SURVEYOR
- **AttendanceType**: MORNING, EVENING

## Setup Instructions

### 1. Environment Configuration
Update the `.env` file with your actual Supabase credentials:
```env
DATABASE_URL="postgresql://user:password@db.xxxxx.supabase.co:5432/postgres"
```

### 2. Database Migration
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npx prisma db push

# Or create and run migrations (production)
npm run db:migrate

# Seed default users
npm run db:seed
```

### 3. Default Users
After seeding, the following users will be available:

**Admin User:**
- Mobile: +1234567890
- Password: admin123

**Sample Surveyors:**
- John Smith: +1234567891 / surveyor123
- Sarah Johnson: +1234567892 / surveyor123
- Mike Wilson: +1234567893 / surveyor123

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Create and run migration
npm run db:migrate

# Push schema changes (dev only)
npx prisma db push

# Seed database
npm run db:seed

# View database in Prisma Studio
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

## Configuration Files

- `prisma/schema.prisma` - Database schema definition
- `prisma/seed.ts` - Database seeding script
- `src/config/db.ts` - Prisma client configuration
- `src/config/cloudinary.ts` - Image upload configuration
- `src/config/index.ts` - Environment variables configuration

## Notes

- All timestamps are stored in UTC
- Images are stored in Cloudinary with organized folder structure
- Soft delete is not implemented (using hard deletes)
- GeoFence feature is prepared but inactive in v1
- All foreign key relationships use CASCADE delete for data integrity