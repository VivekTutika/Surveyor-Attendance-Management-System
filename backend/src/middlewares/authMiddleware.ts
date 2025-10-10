import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import config from '../config';
import { JWTPayload } from '../utils/jwtUtils';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;  // Changed from string to number to match Prisma schema
        role: string;
        mobileNumber: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
      
      // Fetch user from database to ensure they still exist
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },  // Now correctly using number type
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
        id: user.id,  // Now correctly typed as number
        role: user.role,
        mobileNumber: user.mobileNumber,
      };

      next();
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

// Admin-only middleware
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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

// Surveyor-only middleware
export const surveyorMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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