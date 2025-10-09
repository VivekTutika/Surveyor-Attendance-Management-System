"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInternalServerError = exports.sendNotFound = exports.sendForbidden = exports.sendUnauthorized = exports.sendBadRequest = exports.sendCreated = exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, message, data, statusCode = 200, meta) => {
    const response = {
        success: true,
        message,
        data,
        meta,
    };
    res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 500, data) => {
    const response = {
        success: false,
        message,
        data,
    };
    res.status(statusCode).json(response);
};
exports.sendError = sendError;
const sendCreated = (res, message, data) => {
    (0, exports.sendSuccess)(res, message, data, 201);
};
exports.sendCreated = sendCreated;
const sendBadRequest = (res, message = 'Bad Request', data) => {
    (0, exports.sendError)(res, message, 400, data);
};
exports.sendBadRequest = sendBadRequest;
const sendUnauthorized = (res, message = 'Unauthorized') => {
    (0, exports.sendError)(res, message, 401);
};
exports.sendUnauthorized = sendUnauthorized;
const sendForbidden = (res, message = 'Forbidden') => {
    (0, exports.sendError)(res, message, 403);
};
exports.sendForbidden = sendForbidden;
const sendNotFound = (res, message = 'Not Found') => {
    (0, exports.sendError)(res, message, 404);
};
exports.sendNotFound = sendNotFound;
const sendInternalServerError = (res, message = 'Internal Server Error') => {
    (0, exports.sendError)(res, message, 500);
};
exports.sendInternalServerError = sendInternalServerError;
//# sourceMappingURL=response.js.map