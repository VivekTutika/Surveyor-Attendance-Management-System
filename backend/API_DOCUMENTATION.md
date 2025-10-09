# SAMS Backend API Documentation

## Overview
This document provides comprehensive documentation for the Surveyor Attendance Management System (SAMS) Backend API.

**Base URL**: `http://localhost:5000/api`  
**Version**: 1.0.0  
**Authentication**: JWT Bearer Token

## Authentication

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Default Credentials
- **Admin**: `+1234567890` / `admin123`
- **Surveyor**: `+1234567891` / `surveyor123`

---

## API Endpoints

### 🔐 Authentication Routes (`/api/auth`)

#### POST `/auth/login`
Login user and get JWT token.

**Body:**
```json
{
  "mobileNumber": "+1234567890",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "System Administrator",
      "mobileNumber": "+1234567890",
      "role": "ADMIN",
      "project": "System Admin",
      "location": "Head Office"
    },
    "token": "jwt_token_here"
  }
}
```

#### GET `/auth/profile` 🔒
Get current user profile.

#### PUT `/auth/profile` 🔒
Update user profile.

#### POST `/auth/change-password` 🔒
Change user password.

#### POST `/auth/register` 🔒👑
Register new user (Admin only).

---

### 📍 Attendance Routes (`/api/attendance`) 🔒

#### POST `/attendance/mark`
Mark attendance with selfie and GPS.

**Body (multipart/form-data):**
- `photo`: Image file (required)
- `type`: "MORNING" | "EVENING" (required)
- `latitude`: Number (required)
- `longitude`: Number (required)

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "id": "uuid",
    "type": "MORNING",
    "photoPath": "cloudinary_url",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "capturedAt": "2024-01-01T06:00:00Z",
    "user": { ... }
  }
}
```

#### GET `/attendance/list`
Get attendance records with filters.

**Query Parameters:**
- `userId`: string (optional, admin only)
- `date`: YYYY-MM-DD (optional)
- `startDate`: YYYY-MM-DD (optional)
- `endDate`: YYYY-MM-DD (optional)
- `type`: "MORNING" | "EVENING" (optional)

#### GET `/attendance/today`
Get today's attendance status.

#### GET `/attendance/summary`
Get attendance summary for date range.

#### DELETE `/attendance/:id` 👑
Delete attendance record (Admin only).

---

### 🏍️ Bike Meter Routes (`/api/bike`) 🔒

#### POST `/bike/upload`
Upload bike meter reading with photo.

**Body (multipart/form-data):**
- `photo`: Image file (required)
- `type`: "MORNING" | "EVENING" (required)
- `kmReading`: Number (optional)

#### GET `/bike/list`
Get bike meter readings with filters.

#### GET `/bike/today`
Get today's bike meter reading status.

#### PUT `/bike/:id/km-reading` 👑
Update KM reading manually (Admin only).

#### GET `/bike/summary`
Get bike meter summary for date range.

#### DELETE `/bike/:id` 👑
Delete bike meter reading (Admin only).

---

### 👥 Surveyor Routes (`/api/surveyors`) 🔒👑

#### POST `/surveyors`
Create new surveyor.

**Body:**
```json
{
  "name": "John Doe",
  "mobileNumber": "+1234567899",
  "password": "password123",
  "project": "Highway Survey",
  "location": "Zone A"
}
```

#### GET `/surveyors`
Get all surveyors with filters.

**Query Parameters:**
- `search`: string (name or mobile)
- `project`: string
- `location`: string
- `isActive`: boolean
- `role`: "ADMIN" | "SURVEYOR"

#### GET `/surveyors/:id`
Get surveyor by ID.

#### PUT `/surveyors/:id`
Update surveyor.

#### DELETE `/surveyors/:id`
Delete surveyor.

#### POST `/surveyors/:id/reset-password`
Reset surveyor password.

#### GET `/surveyors/:id/statistics`
Get surveyor statistics.

#### GET `/surveyors/projects`
Get unique project names.

#### GET `/surveyors/locations`
Get unique location names.

---

### 🌐 Geo-Fence Routes (`/api/geo-fence`) 🔒👑

> **Note**: v2 feature - available but not actively used in v1

#### GET `/geo-fence`
Get all geo-fences.

#### GET `/geo-fence/:surveyorId`
Get geo-fence for specific surveyor.

#### POST `/geo-fence/:surveyorId`
Create or update geo-fence.

**Body:**
```json
{
  "coordinates": [
    { "latitude": 12.9716, "longitude": 77.5946 },
    { "latitude": 12.9720, "longitude": 77.5950 },
    { "latitude": 12.9710, "longitude": 77.5955 }
  ],
  "isActive": true
}
```

#### PUT `/geo-fence/:surveyorId`
Update geo-fence.

#### DELETE `/geo-fence/:surveyorId`
Delete geo-fence.

#### PATCH `/geo-fence/:surveyorId/toggle`
Toggle geo-fence status.

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

---

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Levels

- 🔒 **Protected**: Requires JWT token
- 👑 **Admin Only**: Requires admin role
- 🔓 **Public**: No authentication required

---

## File Upload

- **Supported formats**: JPG, JPEG, PNG
- **Max file size**: 5MB
- **Storage**: Cloudinary
- **Field name**: `photo`

---

## Error Handling

The API includes comprehensive error handling for:
- Authentication errors
- Validation errors
- Database errors
- File upload errors
- Cloudinary errors

---

## Health Check

### GET `/health`
Check API health status.

**Response:**
```json
{
  "success": true,
  "message": "SAMS Backend API is running",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```