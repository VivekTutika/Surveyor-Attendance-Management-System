import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../config/db';
import { generateToken, JWTPayload } from '../utils/jwtUtils';

export interface CreateUserData {
  name: string;
  mobileNumber: string;
  password: string;
  role?: Role;
  projectId?: number;
  locationId?: number;
}

export interface LoginData {
  mobileNumber: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    mobileNumber: string;
    role: Role;
    projectId: number | null;
    locationId: number | null;
    project?: {
      id: number;
      name: string;
    } | null;
    location?: {
      id: number;
      name: string;
    } | null;
  };
  token: string;
}

export class AuthService {
  // Register new user (Admin only)
  static async register(userData: CreateUserData): Promise<AuthResponse> {
    const { name, mobileNumber, password, role = Role.SURVEYOR, projectId, locationId } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (existingUser) {
      throw new Error('User with this mobile number already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        mobileNumber,
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
    const tokenPayload: JWTPayload = {
      userId: user.id,
      mobileNumber: user.mobileNumber,
      role: user.role,
    };
    const token = generateToken(tokenPayload);

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
  static async login(loginData: LoginData): Promise<AuthResponse> {
    const { mobileNumber, password } = loginData;

    // Find user
    const user = await prisma.user.findUnique({
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
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid mobile number or password');
    }

    // Generate token
    const tokenPayload: JWTPayload = {
      userId: user.id,
      mobileNumber: user.mobileNumber,
      role: user.role,
    };
    const token = generateToken(tokenPayload);

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
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
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
  static async updateProfile(userId: string, updateData: {
    name?: string;
    project?: string;
    location?: string;
  }) {
    const user = await prisma.user.update({
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
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Password updated successfully' };
  }
}