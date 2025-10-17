# SAMS Backend API

Surveyor Attendance Management System - Backend API built with Node.js, Express, Prisma, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- Cloudinary account for image storage

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Update .env with your actual credentials
   ```

3. **Setup database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with default users
```

## 🔐 Default Credentials

**Admin:**
- Mobile: `+1234567890`
- Password: `admin123`

**Sample Surveyors:**
- John Smith: `+1234567891` / `surveyor123`
- Sarah Johnson: `+1234567892` / `surveyor123`
- Mike Wilson: `+1234567893` / `surveyor123`

## 🏗️ Architecture

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middlewares/     # Express middlewares
├── routes/          # API route definitions
├── services/        # Business logic
├── utils/           # Helper utilities
├── index.ts         # Express app setup
└── server.ts        # Server startup
```

## 📦 Core Features

### 🔐 Authentication
- JWT-based authentication
- Role-based access control (Admin/Surveyor)
- Password hashing with bcrypt

### 📍 Attendance Management
- GPS-based attendance marking
- Selfie photo capture with Cloudinary storage
- Morning/Evening attendance types
- Attendance history and reporting

### 🏍️ Bike Meter Management
- Odometer photo upload
- Manual KM reading entry
- Morning/Evening readings
- Bike meter history and reporting

### 👥 Surveyor Management
- CRUD operations for surveyors
- Project and location assignment
- Password reset functionality
- Statistics and reporting

### 🌐 Geo-Fencing (v2 Ready)
- Polygon-based geo-fence definition
- Point-in-polygon validation
- GPS coordinate validation
- Geo-fence status management

## 🛡️ Security Features

- Rate limiting
- Security headers
- Input validation with Zod
- File upload restrictions
- CORS configuration
- Request logging

## 🗄️ Database

- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Migrations**: Automated with Prisma
- **Seeding**: Default admin and sample users

### Models
- **User**: Admin and surveyor accounts
- **Attendance**: GPS-tracked attendance records
- **BikeMeterReading**: Odometer readings with photos
- **GeoFence**: Geographical boundaries (v2)
- **Report**: Generated report metadata

## 📁 File Storage

- **Provider**: Cloudinary
- **Upload Types**: Attendance selfies, bike meter photos
- **Formats**: JPG, JPEG, PNG
- **Size Limit**: 5MB per file
- **Organization**: Folder-based (attendance/, bike-meter/)

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# JWT
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Server
PORT=5000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:3000"
MOBILE_APP_URL="exp://localhost:19000"
```

## 🚦 API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `POST /change-password` - Change password
- `POST /register` - Register user (Admin only)

### Attendance (`/api/attendance`)
- `POST /mark` - Mark attendance with photo + GPS
- `GET /list` - Get attendance records
- `GET /today` - Get today's status
- `GET /summary` - Get attendance summary
- `DELETE /:id` - Delete record (Admin)

### Bike Meter (`/api/bike`)
- `POST /upload` - Upload meter reading
- `GET /list` - Get readings
- `GET /today` - Get today's status
- `PUT /:id/km-reading` - Update KM (Admin)
- `GET /summary` - Get summary
- `DELETE /:id` - Delete record (Admin)

### Surveyors (`/api/surveyors`)
- `POST /` - Create surveyor (Admin)
- `GET /` - List surveyors (Admin)
- `GET /:id` - Get surveyor (Admin)
- `PUT /:id` - Update surveyor (Admin)
- `DELETE /:id` - Delete surveyor (Admin)
- `POST /:id/reset-password` - Reset password (Admin)
- `GET /:id/statistics` - Get statistics (Admin)

### Geo-Fence (`/api/geo-fence`)
- `GET /` - List geo-fences (Admin)
- `GET /:surveyorId` - Get geo-fence
- `POST /:surveyorId` - Create/update geo-fence (Admin)
- `PUT /:surveyorId` - Update geo-fence (Admin)
- `DELETE /:surveyorId` - Delete geo-fence (Admin)
- `PATCH /:surveyorId/toggle` - Toggle status (Admin)

## 🧪 Testing

The API can be tested using:
- Postman collection
- cURL commands
- Frontend applications (mobile-app, web-admin)

## 🚀 Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

4. **Start production server:**
   ```bash
   npm start
   ```

## 📝 Version History

- **v1.0.0**: MVP with core attendance and bike meter features
- **v2.0.0**: Geo-fencing and advanced analytics (planned)
- **v3.0.0**: OCR and mobile optimizations (planned)

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Add proper error handling
4. Include API documentation updates
5. Test all endpoints before submission

## 📄 License

Private project for LRMC Solutions.