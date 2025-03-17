import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Error response interface
 */
export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: any[];
  stack?: string;
}

/**
 * Custom error class
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found middleware - handles 404 errors
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Error handler middleware
 */
export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get status code if available, otherwise default to 500
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const isOperational = 'isOperational' in err ? err.isOperational : false;

  // Log error
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    logger.error(err.stack);
  } else {
    logger.warn(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Include stack trace in development environment
  if (process.env.NODE_ENV === 'development' && !isOperational) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}; 