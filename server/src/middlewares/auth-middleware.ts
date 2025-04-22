import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import logger from '../utils/logger';
import { JwtPayload } from '../types/auth'; // Assuming JwtPayload is defined here

// Extend Express Request type to include user payload
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        logger.warn('Auth token missing');
        return res.status(401).json({ success: false, message: 'Authentication token required' });
    }

    jwt.verify(token, config.server.jwtSecret, (err: any, user: any) => {
        if (err) {
            logger.error('Auth token verification failed:', err);
            // Differentiate between expired and invalid tokens
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Token expired' });
            }
            return res.status(403).json({ success: false, message: 'Invalid token' }); // Forbidden
        }

        // Attach user payload to the request object
        req.user = user as JwtPayload;
        logger.debug('Auth token verified successfully for user:', req.user.username);
        next(); // Proceed to the next middleware or route handler
    });
}; 