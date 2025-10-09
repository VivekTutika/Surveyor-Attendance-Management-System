"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const db_1 = require("../config/db");
const jwtUtils_1 = require("../utils/jwtUtils");
class AuthService {
    // Register new user (Admin only)
    static async register(userData) {
        const { name, mobileNumber, password, role = client_1.Role.SURVEYOR, project, location } = userData;
        // Check if user already exists
        const existingUser = await db_1.prisma.user.findUnique({
            where: { mobileNumber },
        });
        if (existingUser) {
            throw new Error('User with this mobile number already exists');
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = await db_1.prisma.user.create({
            data: {
                name,
                mobileNumber,
                passwordHash,
                role,
                project,
                location,
            },
        });
        // Generate token
        const tokenPayload = {
            userId: user.id,
            mobileNumber: user.mobileNumber,
            role: user.role,
        };
        const token = (0, jwtUtils_1.generateToken)(tokenPayload);
        return {
            user: {
                id: user.id,
                name: user.name,
                mobileNumber: user.mobileNumber,
                role: user.role,
                project: user.project,
                location: user.location,
            },
            token,
        };
    }
    // Login user
    static async login(loginData) {
        const { mobileNumber, password } = loginData;
        // Find user
        const user = await db_1.prisma.user.findUnique({
            where: { mobileNumber },
        });
        if (!user) {
            throw new Error('Invalid mobile number or password');
        }
        // Check if user is active
        if (!user.isActive) {
            throw new Error('Account is inactive. Please contact administrator.');
        }
        // Check password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid mobile number or password');
        }
        // Generate token
        const tokenPayload = {
            userId: user.id,
            mobileNumber: user.mobileNumber,
            role: user.role,
        };
        const token = (0, jwtUtils_1.generateToken)(tokenPayload);
        return {
            user: {
                id: user.id,
                name: user.name,
                mobileNumber: user.mobileNumber,
                role: user.role,
                project: user.project,
                location: user.location,
            },
            token,
        };
    }
    // Get user profile
    static async getProfile(userId) {
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                mobileNumber: true,
                role: true,
                project: true,
                location: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    // Update user profile (limited fields for surveyors)
    static async updateProfile(userId, updateData) {
        const user = await db_1.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                mobileNumber: true,
                role: true,
                project: true,
                location: true,
                isActive: true,
                updatedAt: true,
            },
        });
        return user;
    }
    // Change password
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Verify current password
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }
        // Hash new password
        const newPasswordHash = await bcryptjs_1.default.hash(newPassword, 12);
        // Update password
        await db_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
        return { message: 'Password updated successfully' };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map