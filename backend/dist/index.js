"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = __importDefault(require("./config"));
const errorHandler_1 = require("./middlewares/errorHandler");
const authMiddleware_1 = require("./middlewares/authMiddleware");
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const attendanceRoutes_1 = __importDefault(require("./routes/attendanceRoutes"));
const bikeRoutes_1 = __importDefault(require("./routes/bikeRoutes"));
const surveyorRoutes_1 = __importDefault(require("./routes/surveyorRoutes"));
const geoFenceRoutes_1 = __importDefault(require("./routes/geoFenceRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS configuration
app.use((0, cors_1.default)({
    origin: [config_1.default.frontendUrl, config_1.default.mobileAppUrl],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
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
app.use('/api/auth', authRoutes_1.default);
app.use('/api/attendance', authMiddleware_1.authMiddleware, attendanceRoutes_1.default);
app.use('/api/bike', authMiddleware_1.authMiddleware, bikeRoutes_1.default);
app.use('/api/surveyors', authMiddleware_1.authMiddleware, surveyorRoutes_1.default);
app.use('/api/geo-fence', authMiddleware_1.authMiddleware, geoFenceRoutes_1.default);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});
// Global error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=index.js.map