import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import authService from '../services/auth-service';
import logger from '../utils/logger';
import { createError } from '../middlewares/error-middleware';

/**
 * Kayıt validasyon kuralları
 */
export const registerValidationRules = [
  body('username')
    .isString()
    .isLength({ min: 3, max: 30 })
    .withMessage('Kullanıcı adı 3-30 karakter arasında olmalıdır'),
  body('email')
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz'),
  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır')
];

/**
 * Giriş validasyon kuralları
 */
export const loginValidationRules = [
  body('username')
    .isString()
    .withMessage('Kullanıcı adı gereklidir'),
  body('password')
    .isString()
    .withMessage('Şifre gereklidir')
];

/**
 * Validasyon sonuçlarını kontrol eden yardımcı fonksiyon
 */
const validateRequest = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

/**
 * Kullanıcı kaydı işlemi
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validasyon kontrolü
    if (!validateRequest(req, res)) return;

    const { username, email, password } = req.body;
    
    // Kullanıcı kaydı
    const user = await authService.register({ username, email, password });
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Kullanıcı kaydı hatası:', err);
    
    if (err.message.includes('zaten kullanılıyor')) {
      res.status(409).json({ message: err.message });
      return;
    }
    
    res.status(500).json({ message: 'Kullanıcı kaydı sırasında bir hata oluştu' });
  }
};

/**
 * Kullanıcı girişi işlemi
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validasyon kontrolü
    if (!validateRequest(req, res)) return;

    const { username, password } = req.body;
    
    // Kullanıcı girişi
    const authData = await authService.login({ username, password });
    
    res.status(200).json({
      success: true,
      data: authData
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Kullanıcı girişi hatası:', err);
    
    if (err.message.includes('Geçersiz kullanıcı adı veya şifre')) {
      res.status(401).json({ message: err.message });
      return;
    }
    
    res.status(500).json({ message: 'Kullanıcı girişi sırasında bir hata oluştu' });
  }
};

/**
 * Geçerli kullanıcı bilgilerini getirme
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Kimlik doğrulama gerekli', 401);
    }
    
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Kullanıcı bilgisi getirme hatası:', err);
    res.status(500).json({ message: 'Kullanıcı bilgisi alınırken bir hata oluştu' });
  }
}; 