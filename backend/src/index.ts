import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import config from './config';
import { errorHandler } from './middlewares/errorHandler';
import { authMiddleware } from './middlewares/authMiddleware';

// Import routes
import authRoutes from './routes/authRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import bikeRoutes from './routes/bikeRoutes';
import surveyorRoutes from './routes/surveyorRoutes';
import projectRoutes from './routes/projectRoutes';
import locationRoutes from './routes/locationRoutes';
import geoFenceRoutes from './routes/geoFenceRoutes';
import dashboardRoutes from './routes/dashboard';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: [config.frontendUrl, config.mobileAppUrl],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SAMS Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', authMiddleware, attendanceRoutes);
app.use('/api/bike', authMiddleware, bikeRoutes);
app.use('/api/surveyors', authMiddleware, surveyorRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/locations', authMiddleware, locationRoutes);
app.use('/api/geo-fence', authMiddleware, geoFenceRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

export default app;