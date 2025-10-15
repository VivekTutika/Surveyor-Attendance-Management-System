import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

export const errorHandler = (
  error: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // For auth related errors (401) avoid printing stack traces to console to prevent leaking details
  if (error.status === 401 || error.statusCode === 401 || (error.message && error.message.toLowerCase().includes('invalid employee id') ) ) {
    console.warn('Authentication/Authorization error:', { message: error.message, url: req.url, method: req.method, timestamp: new Date().toISOString() })
  } else {
    console.error('Error caught by error handler:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString(),
    })
  }

  // Default error
  let status = 500;
  let message = 'Internal Server Error';

  // Check for specific error types
  if (error.status || error.statusCode) {
    status = error.status || error.statusCode || 500;
    message = error.message;
  }

  // Prisma errors
  if (error.message.includes('Prisma')) {
    status = 400;
    if (error.message.includes('Unique constraint')) {
      message = 'Record already exists with the provided information';
    } else if (error.message.includes('Record to update not found')) {
      message = 'Record not found';
    } else if (error.message.includes('Foreign key constraint')) {
      message = 'Cannot delete record due to existing dependencies';
    } else {
      message = 'Database operation failed';
    }
  }

  // JWT errors
  if (error.message.includes('jwt')) {
    status = 401;
    message = 'Invalid or expired token';
  }

  // Validation errors
  if (error.message.includes('validation')) {
    status = 400;
    message = error.message;
  }

  // Cloudinary errors
  if (error.message.includes('Cloudinary')) {
    status = 400;
    message = 'Image upload failed';
  }

  // Multer errors (file upload)
  if (error.message.includes('Multer') || error.message.includes('File too large')) {
    status = 400;
    message = 'File upload error. Please check file size and format.';
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: error.message,
      stack: error.stack,
    }),
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};