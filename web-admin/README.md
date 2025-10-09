# SAMS Web Admin Portal

The Web Admin Portal for the Surveyor Attendance Management System (SAMS) built with Next.js 13+ App Router, TypeScript, and Material-UI.

## Features

### 🔐 Authentication & Security
- **Admin-only Access**: Role-based authentication with JWT tokens
- **Secure Cookies**: HTTP-only cookies for token storage
- **Protected Routes**: Middleware-based route protection
- **Session Management**: Automatic token validation and refresh

### 📊 Dashboard & Analytics
- **Real-time Statistics**: Live data on surveyors, attendance, and bike readings
- **Interactive Charts**: Weekly attendance trends and monthly statistics
- **System Status**: API, database, and storage health monitoring
- **Quick Actions**: Direct access to all management functions

### 👥 Surveyor Management
- **CRUD Operations**: Create, read, update, and delete surveyors
- **Status Management**: Activate/deactivate surveyor accounts
- **Profile Management**: Complete surveyor information management
- **Bulk Operations**: Mass status updates and exports

### 📋 Attendance Reports
- **Comprehensive Filtering**: Date range, surveyor, and type filters
- **Photo Verification**: View attendance selfies in full-screen modal
- **Location Tracking**: GPS coordinates with mapping integration
- **Export Options**: CSV and PDF export with custom formatting

### 🚴 Bike Meter Reports
- **Dual View Modes**: Table view and image gallery
- **Reading Analytics**: Average, maximum, and trend analysis
- **Photo Gallery**: Masonry layout with zoom functionality
- **Data Export**: Comprehensive reporting in multiple formats

### 📈 Export & Reporting
- **CSV Export**: Structured data export for spreadsheet analysis
- **PDF Reports**: Professional formatted reports with branding
- **Real-time Data**: Always up-to-date information
- **Custom Filters**: Export specific data ranges and criteria

## Tech Stack

### Frontend
- **Next.js 13+**: App Router with Server/Client Components
- **TypeScript**: Full type safety and better development experience
- **Material-UI v5**: Modern React component library
- **Recharts**: Interactive and responsive charts
- **Day.js**: Lightweight date manipulation library

### State Management
- **Context API**: Authentication and global state
- **React Hooks**: Local component state management
- **Axios**: HTTP client with interceptors

### Development Tools
- **ESLint**: Code linting and formatting
- **TypeScript**: Static type checking
- **Hot Reload**: Development server with instant updates

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Backend API running on port 5000
- PostgreSQL database configured

### Environment Configuration
Create a `.env.local` file in the web-admin directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# Authentication
NEXT_PUBLIC_APP_NAME=SAMS Admin Portal
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Install Dependencies
```bash
cd web-admin
npm install
```

### Development Server
```bash
npm run dev
```
Access the admin portal at `http://localhost:3000`

### Build for Production
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js 13 App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page (redirects to login/dashboard)
│   ├── login/             # Authentication pages
│   ├── dashboard/         # Admin dashboard
│   ├── surveyors/         # Surveyor management
│   ├── attendance/        # Attendance reports
│   └── bike-readings/     # Bike meter reports
├── components/            # Reusable React components
│   ├── AdminLayout.tsx    # Main admin layout with navigation
│   └── ProtectedRoute.tsx # Route protection wrapper
├── context/               # React Context providers
│   └── AuthContext.tsx    # Authentication state management
├── services/              # API service layer
│   └── api.ts            # Axios configuration and API calls
├── utils/                 # Utility functions
│   └── exportUtils.ts    # CSV and PDF export functions
└── lib/                   # Configuration and setup
    └── theme.ts          # Material-UI theme configuration
```

## API Integration

The web admin portal integrates with the SAMS backend API:

### Authentication Endpoints
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get user profile

### Data Endpoints
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/surveyors` - Surveyor management
- `GET /api/attendance/list` - Attendance data
- `GET /api/bike/list` - Bike meter readings

### Security Features
- JWT token authentication
- Request/response interceptors
- Automatic token refresh
- Error handling and redirect

## Key Features Explained

### Dashboard Analytics
The dashboard provides real-time insights with:
- **Live Statistics**: Total surveyors, active count, today's attendance
- **Trend Analysis**: 7-day attendance patterns
- **Monthly Comparisons**: Historical data visualization
- **System Health**: API and database status monitoring

### Surveyor Management
Complete CRUD interface featuring:
- **Add New Surveyors**: Form with validation
- **Edit Profiles**: In-place editing with immediate updates
- **Status Toggle**: Quick activate/deactivate functionality
- **Bulk Operations**: Mass management capabilities

### Advanced Filtering
All data views include sophisticated filtering:
- **Date Range Pickers**: Start and end date selection
- **Multi-select Dropdowns**: Surveyor and type filtering
- **Real-time Updates**: Instant data refresh on filter changes
- **Persistent State**: Filters maintained across page refreshes

### Export Functionality
Professional reporting capabilities:
- **CSV Export**: Structured data for analysis
- **PDF Reports**: Formatted documents with branding
- **Custom Filtering**: Export only relevant data
- **High Performance**: Optimized for large datasets

## Security Considerations

### Authentication
- **Role-based Access**: Only ADMIN users can access
- **Secure Token Storage**: HTTP-only cookies
- **Session Validation**: Server-side token verification
- **Automatic Logout**: Invalid token handling

### Data Protection
- **Input Validation**: Client and server-side validation
- **XSS Prevention**: Sanitized data rendering
- **CSRF Protection**: Token-based request validation
- **HTTPS Only**: Production environment security

## Performance Optimizations

### Client-side Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js image components
- **Bundle Analysis**: Optimized dependencies
- **Caching Strategy**: Browser and API response caching

### Server-side Features
- **Static Generation**: Pre-rendered pages where possible
- **API Routes**: Server-side API handling
- **Middleware**: Request processing optimization
- **Error Boundaries**: Graceful error handling

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile Responsive**: Touch-friendly interface
- **Accessibility**: WCAG 2.1 AA compliance
- **Progressive Enhancement**: Works without JavaScript for basic features

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Check API endpoint configuration
   - Verify admin user credentials
   - Ensure backend is running

2. **Data Loading Issues**
   - Verify database connection
   - Check API response formats
   - Review browser console for errors

3. **Build Errors**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall
   - Check TypeScript errors

### Development Tips

- Use browser dev tools for debugging
- Check Network tab for API calls
- Monitor console for React warnings
- Use React Developer Tools extension

## Contributing

1. Follow TypeScript best practices
2. Maintain component modularity
3. Add proper error handling
4. Include loading states
5. Test on multiple screen sizes
6. Document complex logic

## License

This project is part of the SAMS (Surveyor Attendance Management System) and is proprietary software developed for LRMC Solutions.

---

**Built with ❤️ by the SAMS Development Team**