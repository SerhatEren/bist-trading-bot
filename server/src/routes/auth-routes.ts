import { Router } from 'express';
import * as authController from '../controllers/auth-controller';
import { authenticate } from '../middlewares/auth-middleware';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Yeni kullanıcı kaydı
 * @access Public
 */
router.post('/register', authController.registerValidationRules, authController.register);

/**
 * @route POST /api/auth/login
 * @desc Kullanıcı girişi
 * @access Public
 */
router.post('/login', authController.loginValidationRules, authController.login);

/**
 * @route GET /api/auth/me
 * @desc Mevcut kullanıcı bilgilerini getirme
 * @access Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

export default router; 