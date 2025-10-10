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

// Helper function to normalize mobile numbers for comparison
function normalizeMobileNumber(mobileNumber: string): string {
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
function getMobileNumberVariants(mobileNumber: string): string[] {
  const variants = new Set<string>();
  
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

export class AuthService {
  // Register new user (Admin only)
  static async register(userData: CreateUserData): Promise<AuthResponse> {
    const { name, mobileNumber, password, role = Role.SURVEYOR, projectId, locationId } = userData;

    // Normalize mobile number for storage
    const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);

    // Check if user already exists (check all variants)
    const mobileVariants = getMobileNumberVariants(mobileNumber);
    let existingUser = null;
    
    for (const variant of mobileVariants) {
      existingUser = await prisma.user.findUnique({
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
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
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

    // Get all possible variants of the mobile number
    const mobileVariants = getMobileNumberVariants(mobileNumber);
    
    // Try to find user with any of the variants
    let user = null;
    for (const variant of mobileVariants) {
      user = await prisma.user.findUnique({
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
        projectId: user.projectId,
        locationId: user.locationId,
        project: user.project || null,
        location: user.location || null,
      },
      token,
    };
  }

  // Get user profile
  static async getProfile(userId: number) {  // Changed from string to number
    const user = await prisma.user.findUnique({
      where: { id: userId },  // Now correctly typed as number
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
  static async updateProfile(userId: number, updateData: {  // Changed from string to number
    name?: string;
  }) {
    // Only allow updating the name field for now
    const user = await prisma.user.update({
      where: { id: userId },  // Now correctly typed as number
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
  static async changePassword(userId: number, currentPassword: string, newPassword: string) {  // Changed from string to number
    const user = await prisma.user.findUnique({
      where: { id: userId },  // Now correctly typed as number
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
      where: { id: userId },  // Now correctly typed as number
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Password updated successfully' };
  }
}