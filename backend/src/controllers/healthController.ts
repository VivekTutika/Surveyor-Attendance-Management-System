import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middlewares/errorHandler';

export class HealthController {
  // GET /api/health - protected health check that also verifies DB connectivity
  static getHealth = asyncHandler(async (req: Request, res: Response) => {
    try {
      // Simple DB ping
      await prisma.$queryRaw`SELECT 1`;

      sendSuccess(res, 'Backend healthy', {
        timestamp: new Date().toISOString(),
        db: 'ok',
        version: '1.0.0',
      });
    } catch (err) {
      // On DB failure, respond with 500 and basic message (avoid leaking details)
      sendError(res, 'Backend unhealthy: database connection failed', 500);
    }
  });
}
