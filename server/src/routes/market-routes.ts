import { Router } from 'express';
import * as marketController from '../controllers/market-controller';
import { optionalAuthenticate } from '../middlewares/auth-middleware';

const router = Router();

/**
 * @route GET /api/market/quotes
 * @desc Hisse senedi fiyatlarını alma
 * @access Public/Private (İsteğe bağlı kimlik doğrulama)
 */
router.get(
  '/quotes', 
  optionalAuthenticate, 
  marketController.getQuotesValidationRules, 
  marketController.getQuotes
);

/**
 * @route GET /api/market/stocks/:symbol
 * @desc Hisse senedi detaylarını alma
 * @access Public/Private (İsteğe bağlı kimlik doğrulama)
 */
router.get(
  '/stocks/:symbol', 
  optionalAuthenticate, 
  marketController.getStockDetailsValidationRules, 
  marketController.getStockDetails
);

export default router; 