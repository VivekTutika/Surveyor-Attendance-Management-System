"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
exports.config = {
    // Server
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    // Database
    databaseUrl: process.env.DATABASE_URL,
    // JWT
    jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d', // Extended from 7d to 30d
    // Cloudinary
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    // CORS
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    mobileAppUrl: process.env.MOBILE_APP_URL || 'exp://localhost:19000',
    // Supabase
    supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
};
// Validate critical environment variables
const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}
exports.default = exports.config;
//# sourceMappingURL=index.js.map