import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Bilinen hataları işleyen middleware
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Sunucu hatası';
  const isOperational = err.isOperational || false;

  // Hata günlüğü
  logger.error(`Hata: ${message}`, {
    url: req.originalUrl,
    method: req.method,
    statusCode,
    isOperational,
    stack: err.stack
  });

  // İstemciye yanıt
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * 404 - Bulunamadı hatası middleware'i
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error: AppError = new Error(`${req.originalUrl} - Bulunamadı`);
  error.statusCode = 404;
  error.isOperational = true;
  next(error);
};

/**
 * Hata oluşturucu yardımcı fonksiyon
 */
export const createError = (
  message: string,
  statusCode: number,
  isOperational = true
): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
}; 