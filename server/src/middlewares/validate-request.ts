import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors from express-validator.
 * Returns a 400 response if errors exist, otherwise calls next().
 *
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next Express NextFunction object.
 * @returns boolean indicating if the request is valid (true) or handled (false).
 */
export const validateRequest = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return false; // Indicate request has been handled (invalid)
  }
  return true; // Indicate request is valid
};

// Optional: If you need a version that calls next() directly
export const validationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return; // Stop processing
    }
    next(); // Proceed to the next middleware/handler
}; 