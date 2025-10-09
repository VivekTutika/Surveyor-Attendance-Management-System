"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.surveyorMiddleware = exports.adminMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const config_1 = __importDefault(require("../config"));
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
            // Fetch user from database to ensure they still exist
            const user = await db_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    role: true,
                    mobileNumber: true,
                    isActive: true,
                },
            });
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid token. User not found.',
                });
                return;
            }
            if (!user.isActive) {
                res.status(401).json({
                    success: false,
                    message: 'Account is inactive. Please contact administrator.',
                });
                return;
            }
            // Attach user to request
            req.user = {
                id: user.id,
                role: user.role,
                mobileNumber: user.mobileNumber,
            };
            next();
        }
        catch (jwtError) {
            res.status(401).json({
                success: false,
                message: 'Invalid token.',
            });
            return;
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.',
        });
    }
};
exports.authMiddleware = authMiddleware;
// Admin-only middleware
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required.',
        });
        return;
    }
    if (req.user.role !== 'ADMIN') {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.',
        });
        return;
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
// Surveyor-only middleware
const surveyorMiddleware = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required.',
        });
        return;
    }
    if (req.user.role !== 'SURVEYOR') {
        res.status(403).json({
            success: false,
            message: 'Access denied. Surveyor privileges required.',
        });
        return;
    }
    next();
};
exports.surveyorMiddleware = surveyorMiddleware;
//# sourceMappingURL=authMiddleware.js.map