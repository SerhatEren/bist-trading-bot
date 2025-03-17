import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth-service';
import { UserResponse } from '../types/auth';
import logger from '../utils/logger';

// Express Request türünü genişletme
declare global {
  namespace Express {
    interface Request {
      user?: UserResponse;
    }
  }
}

/**
 * JWT kimlik doğrulama middleware'i
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Authorization header kontrolü
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Kimlik doğrulama başarısız - geçersiz token formatı' });
      return;
    }

    // Token çıkarma
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ message: 'Kimlik doğrulama başarısız - token bulunamadı' });
      return;
    }

    // Token doğrulama
    const user = await authService.verifyToken(token);
    
    if (!user) {
      res.status(401).json({ message: 'Kimlik doğrulama başarısız - geçersiz token' });
      return;
    }

    // Kullanıcıyı request nesnesine ekleme
    req.user = user;
    
    next();
  } catch (error) {
    logger.error('Kimlik doğrulama hatası:', error);
    res.status(401).json({ message: 'Kimlik doğrulama başarısız' });
  }
};

/**
 * İsteğe bağlı kimlik doğrulama middleware'i
 * Token varsa kullanıcıyı ekler, yoksa isteği geçirir
 */
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Authorization header kontrolü
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    // Token çıkarma
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      next();
      return;
    }

    // Token doğrulama
    const user = await authService.verifyToken(token);
    
    if (user) {
      // Kullanıcıyı request nesnesine ekleme
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Hata durumunda hata döndürmeden devam et
    next();
  }
}; 