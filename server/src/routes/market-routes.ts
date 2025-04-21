import { Router } from 'express';
import * as marketController from '../controllers/market-controller';

const router = Router();

/**
 * @route GET /api/market/quotes
 * @desc Hisse senedi fiyatlarını alma
 * @access Public
 */
router.get(
  '/quotes', 
  marketController.getQuotesValidationRules, 
  marketController.getQuotes
);

/**
 * @route GET /api/market/stocks/:symbol
 * @desc Hisse senedi detaylarını alma
 * @access Public
 */
router.get(
  '/stocks/:symbol', 
  marketController.getStockDetailsValidationRules, 
  marketController.getStockDetails
);

export default router; 