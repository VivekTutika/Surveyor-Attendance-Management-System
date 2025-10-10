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
// Helper function to normalize mobile numbers for comparison
function normalizeMobileNumber(mobileNumber) {
    // Remove all non-digit characters except the leading +
    let normalized = mobileNumber.replace(/[^\d+]/g, '');
    // Ensure + prefix
    if (!normalized.startsWith('+')) {
        // If it starts with a digit and looks like it might be missing the country code
        // we'll add the + prefix
        if (normalized.length >= 10) { // Assuming minimum length for a valid number
            normalized = '+' + normalized;
        }
    }
    return normalized;
}
// Helper function to create search variants for mobile number
function getMobileNumberVariants(mobileNumber) {
    const variants = new Set();
    // Add the original number
    variants.add(mobileNumber);
    // Add normalized version
    const normalized = normalizeMobileNumber(mobileNumber);
    variants.add(normalized);
    // Add version without + prefix
    if (normalized.startsWith('+')) {
        variants.add(normalized.substring(1));
    }
    // Add version with + prefix
    if (!mobileNumber.startsWith('+')) {
        variants.add('+' + mobileNumber);
    }
    return Array.from(variants);
}
class AuthService {
    // Register new user (Admin only)
    static async register(userData) {
        const { name, mobileNumber, password, role = client_1.Role.SURVEYOR, projectId, locationId } = userData;
        // Normalize mobile number for storage
        const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);
        // Check if user already exists (check all variants)
        const mobileVariants = getMobileNumberVariants(mobileNumber);
        let existingUser = null;
        for (const variant of mobileVariants) {
            existingUser = await db_1.prisma.user.findUnique({
                where: { mobileNumber: variant },
            });
            if (existingUser) {
                break;
            }
        }
        if (existingUser) {
            throw new Error('User with this mobile number already exists');
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = await db_1.prisma.user.create({
            data: {
                name,
                mobileNumber: normalizedMobileNumber, // Store normalized version
                passwordHash,
                role,
                projectId,
                locationId,
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                location: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
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
                projectId: user.projectId,
                locationId: user.locationId,
                project: user.project,
                location: user.location,
            },
            token,
        };
    }
    // Login user
    static async login(loginData) {
        const { mobileNumber, password } = loginData;
        // Get all possible variants of the mobile number
        const mobileVariants = getMobileNumberVariants(mobileNumber);
        // Try to find user with any of the variants
        let user = null;
        for (const variant of mobileVariants) {
            user = await db_1.prisma.user.findUnique({
                where: { mobileNumber: variant },
                include: {
                    project: true,
                    location: true,
                },
            });
            if (user) {
                break;
            }
        }
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
                projectId: user.projectId,
                locationId: user.locationId,
                project: user.project || null,
                location: user.location || null,
            },
            token,
        };
    }
    // Get user profile
    static async getProfile(userId) {
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId }, // Now correctly typed as number
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
        // Only allow updating the name field for now
        const user = await db_1.prisma.user.update({
            where: { id: userId }, // Now correctly typed as number
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
            where: { id: userId }, // Now correctly typed as number
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
            where: { id: userId }, // Now correctly typed as number
            data: { passwordHash: newPasswordHash },
        });
        return { message: 'Password updated successfully' };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map