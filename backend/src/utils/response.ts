import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  data?: any
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  message: string,
  data?: T
): void => {
  sendSuccess(res, message, data, 201);
};

export const sendBadRequest = (
  res: Response,
  message: string = 'Bad Request',
  data?: any
): void => {
  sendError(res, message, 400, data);
};

export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized'
): void => {
  sendError(res, message, 401);
};

export const sendForbidden = (
  res: Response,
  message: string = 'Forbidden'
): void => {
  sendError(res, message, 403);
};

export const sendNotFound = (
  res: Response,
  message: string = 'Not Found'
): void => {
  sendError(res, message, 404);
};

export const sendInternalServerError = (
  res: Response,
  message: string = 'Internal Server Error'
): void => {
  sendError(res, message, 500);
};