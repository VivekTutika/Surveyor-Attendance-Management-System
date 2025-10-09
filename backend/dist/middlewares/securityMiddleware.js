"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestValidation = exports.securityHeaders = exports.requestLogger = exports.rateLimitMiddleware = void 0;
// Rate limiting middleware (basic implementation)
const requestCounts = new Map();
const rateLimitMiddleware = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    return (req, res, next) => {
        const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const clientData = requestCounts.get(clientIP) || { count: 0, resetTime: now + windowMs };
        // Reset count if window has expired
        if (now > clientData.resetTime) {
            clientData.count = 0;
            clientData.resetTime = now + windowMs;
        }
        clientData.count++;
        requestCounts.set(clientIP, clientData);
        // Check if limit exceeded
        if (clientData.count > maxRequests) {
            res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
            });
            return;
        }
        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - clientData.count));
        res.setHeader('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000));
        next();
    };
};
exports.rateLimitMiddleware = rateLimitMiddleware;
// Request logging middleware
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    // Log request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}`);
    // Override res.end to log response
    const originalEnd = res.end.bind(res);
    res.end = function (chunk, encoding, cb) {
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
        return originalEnd(chunk, encoding, cb);
    };
    next();
};
exports.requestLogger = requestLogger;
// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Add HSTS header in production
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
};
exports.securityHeaders = securityHeaders;
// Request validation middleware
const requestValidation = (req, res, next) => {
    // Check content length
    if (req.method === 'POST' || req.method === 'PUT') {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (contentLength > maxSize) {
            res.status(413).json({
                success: false,
                message: 'Request entity too large',
            });
            return;
        }
    }
    next();
};
exports.requestValidation = requestValidation;
//# sourceMappingURL=securityMiddleware.js.map