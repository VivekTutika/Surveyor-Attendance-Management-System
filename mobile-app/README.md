# SAMS Mobile App

Surveyor Attendance Management System - Mobile application built with React Native and Expo for field surveyors.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- Physical device or emulator for testing

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   # Update .env with your backend API URL
   API_BASE_URL=http://your-backend-url:5000/api
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Run on device:**
   ```bash
   # For Android
   npm run android
   
   # For iOS (macOS only)
   npm run ios
   
   # For web browser
   npm run web
   ```

## 📱 Features

### 🔐 Authentication
- Secure login with mobile number and password
- JWT token-based authentication
- Auto-login with stored credentials
- Demo credentials for quick testing

### 📍 Attendance Management
- **Morning/Evening Attendance**: Mark attendance with selfie and GPS location
- **Real-time GPS**: Automatic location capture for attendance verification
- **Photo Verification**: Front-camera selfie capture for identity verification
- **Status Tracking**: View today's attendance status and history

### 🏍️ Bike Meter Management
- **Photo Upload**: Capture odometer readings with device camera
- **Manual Entry**: Optional manual KM reading input for accuracy
- **Gallery Support**: Choose photos from gallery or capture new ones
- **Reading History**: Track morning and evening meter readings

### 🚴 Bike Trip Management (v2 Feature)
- **Trip Creation**: Log bike trips with start/end photos
- **Distance Tracking**: Automatic distance calculation
- **Trip History**: View previous trips and status
- **Admin Approval**: Trips require admin approval

### 👤 Profile Management
- **User Information**: View personal and work details
- **Account Status**: Check active/inactive status
- **Contact Details**: Access mobile number and project information
- **App Information**: Version and company details

### 🎨 User Interface
- **Modern Design**: Clean and intuitive interface
- **Dark/Light Theme**: Adaptive theme support
- **Responsive Layout**: Works on various screen sizes
- **Accessibility**: Screen reader and accessibility support

## 🏗️ Architecture

```
src/
├── api/                 # API service layer
│   ├── index.js         # Axios configuration
│   ├── authService.js   # Authentication APIs
│   ├── attendanceService.js  # Attendance APIs
│   └── bikeService.js   # Bike meter APIs
├── components/          # Reusable UI components
│   ├── Button.js        # Custom button component
│   ├── InputField.js    # Text input with validation
│   ├── LoadingSpinner.js # Loading indicator
│   └── Card.js          # Card container
├── navigation/          # Navigation setup
│   ├── RootNavigator.js # Main navigation controller
│   ├── AuthNavigator.js # Authentication flow
│   └── AppNavigator.js  # Main app navigation
├── screens/             # App screens
│   ├── Auth/            # Authentication screens
│   ├── Dashboard/       # Main app screens
│   └── Profile/         # Profile screens
├── store/               # Redux state management
│   ├── authSlice.js     # Authentication state
│   ├── attendanceSlice.js # Attendance state
│   ├── bikeMeterSlice.js # Bike meter state
│   └── index.js         # Store configuration
├── theme/               # Design system
│   ├── colors.js        # Color palette
│   ├── typography.js    # Text styles
│   └── index.js         # Theme configuration
└── utils/               # Helper utilities
```

## 🔧 Configuration

### Environment Variables
Update `.env` file with your configuration:

```env
# API Configuration
API_BASE_URL=http://localhost:5000/api
API_TIMEOUT=10000

# App Configuration
APP_NAME=Surveyor Attendance
APP_VERSION=1.0.0
```

### Backend Integration
The app connects to the SAMS backend API. Ensure the backend is running and accessible at the configured URL.

## 📱 Screens

### 🔐 Login Screen
- Mobile number and password input
- Demo credential buttons
- Automatic login with stored tokens
- Error handling and validation

### 🏠 Dashboard Screen
- Today's task overview
- 4 action cards: Morning/Evening Attendance & Bike Meter
- Quick status indicators
- Refresh functionality

### 📍 Attendance Screen
- Front camera selfie capture
- Real-time GPS location tracking
- Photo preview and retake options
- Location display

### 🏍️ Bike Meter Screen
- Camera/gallery photo selection
- Manual KM reading input
- Photo preview and editing
- Upload progress tracking

### 🚴 Bike Trip Screen (v2 Feature)
- Start trip with photo capture
- End trip with photo capture
- Distance calculation display
- Trip status tracking

### 👤 Profile Screen
- User information display
- Account status and details
- App version information
- Logout functionality

## 🎯 User Flow

1. **Login**: Enter credentials or use demo login
2. **Dashboard**: View today's tasks and status
3. **Mark Attendance**: Take selfie with GPS location
4. **Upload Bike Meter**: Capture odometer photo
5. **Log Bike Trip**: Record bike trips (if applicable)
6. **View Profile**: Check account information
7. **Logout**: Secure session termination

## 🔐 Security Features

- JWT token authentication
- Secure credential storage
- Auto-logout on token expiry
- Permission-based camera/location access
- Network request encryption

## 📊 State Management

Using Redux Toolkit for centralized state management:
- **Auth State**: User authentication and profile
- **Attendance State**: Attendance records and status
- **Bike Meter State**: Meter readings and uploads

## 🎨 Design System

### Colors
- **Primary**: Blue (#1976D2)
- **Secondary**: Green (#388E3C)
- **Success**: Green (#4CAF50)
- **Warning**: Orange (#FF9800)
- **Error**: Red (#F44336)

### Typography
- **Headings**: Bold system font
- **Body**: Regular system font
- **Captions**: Light system font

## 📱 Device Support

- **Android**: 6.0+ (API level 23+)
- **iOS**: 11.0+
- **Web**: Modern browsers (Chrome, Safari, Firefox)

## 🔧 Development

### Available Scripts
```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator
npm run web        # Run in web browser
```

### Testing
- Test on physical devices for camera/GPS features
- Use Expo Go app for quick testing
- Test offline scenarios and network errors

## 🚀 Deployment

### Build for Production
```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios

# Build for web
npm run build
```

### Distribution
- **Android**: Google Play Store or APK distribution
- **iOS**: Apple App Store
- **Web**: Host on web server

## 🐛 Troubleshooting

### Common Issues

1. **Camera not working**: Check camera permissions
2. **GPS not available**: Enable location services
3. **Login fails**: Verify backend API URL
4. **Images not uploading**: Check network connection

### Debug Mode
Enable debugging in Expo Dev Tools for detailed logs and network inspection.

## 📝 Notes

- Requires backend API to be running
- Camera and location permissions are mandatory
- Works best on physical devices for full functionality
- Offline mode is limited (login and API calls require internet)

## 🏢 About

Developed by LRMC Solutions for field surveyor attendance and bike meter tracking.

**Project Status**: 95% Complete - Production Ready  
**Last Updated**: October 2025  
**Version**: 1.0.0  
**Platform**: React Native with Expo  
**Backend**: Node.js API integration