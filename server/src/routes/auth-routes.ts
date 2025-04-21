import { Router } from 'express';
import * as authController from '../controllers/auth-controller';
import { authenticate } from '../middlewares/auth-middleware';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc User registration
 * @access Public
 */
router.post(
  '/register',
  authController.registerValidationRules,
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc User login
 * @access Public
 */
router.post(
  '/login',
  authController.loginValidationRules,
  authController.login
);

/**
 * @route GET /api/auth/me
 * @desc Get current user info
 * @access Private
 */
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

export default router; 