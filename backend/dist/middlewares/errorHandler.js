"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    console.error('Error caught by error handler:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString(),
    });
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
        }
        else if (error.message.includes('Record to update not found')) {
            message = 'Record not found';
        }
        else if (error.message.includes('Foreign key constraint')) {
            message = 'Cannot delete record due to existing dependencies';
        }
        else {
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
exports.errorHandler = errorHandler;
// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map