import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { JwtPayload, UserRole } from '../types/auth';
import { AppError } from './error.middleware';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware
 */
export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Protect routes - require valid JWT token
   */
  protect = (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Authentication required. Please provide a valid token.', 401);
      }

      // Get token from header
      const token = authHeader.split(' ')[1];

      if (!token) {
        throw new AppError('Authentication required. Please provide a valid token.', 401);
      }

      // Verify token
      const decoded = this.authService.verifyToken(token);

      // Set user in request
      req.user = decoded;

      next();
    } catch (error) {
      next(new AppError('Authentication failed. Invalid token.', 401));
    }
  };

  /**
   * Restrict routes to specific roles
   */
  restrictTo = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new AppError('User not found. Authentication required.', 401));
      }

      if (!roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action.', 403)
        );
      }

      next();
    };
  };
} 