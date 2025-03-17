import { Request, Response } from 'express';
import { param, query, validationResult } from 'express-validator';
import ApiFactory from '../services/api-factory';
import logger from '../utils/logger';

// ALGOLAB API istemcisi (gerçek veya mock)
const algolabClient = ApiFactory.getApiClient();

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
 * Hisse senedi fiyatları validasyon kuralları
 */
export const getQuotesValidationRules = [
  query('symbols')
    .isString()
    .withMessage('Semboller bir metin olarak belirtilmelidir')
    .notEmpty()
    .withMessage('En az bir sembol belirtilmelidir')
];

/**
 * Hisse senedi detayları validasyon kuralları
 */
export const getStockDetailsValidationRules = [
  param('symbol')
    .isString()
    .withMessage('Sembol bir metin olarak belirtilmelidir')
    .notEmpty()
    .withMessage('Sembol belirtilmelidir')
];

/**
 * Hisse senedi fiyatlarını alma işlemi
 */
export const getQuotes = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validasyon kontrolü
    if (!validateRequest(req, res)) return;

    // Hisse senedi sembollerini ayırma
    const symbolsParam = req.query.symbols as string;
    const symbols = symbolsParam.split(',').map(symbol => symbol.trim());
    
    // ALGOLAB API'den fiyat bilgilerini alma
    const quotes = await algolabClient.getStockQuotes(symbols);
    
    res.status(200).json({
      success: true,
      data: quotes
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Hisse fiyatları alma hatası:', err);
    res.status(500).json({ message: err.message || 'Hisse fiyatları alınırken bir hata oluştu' });
  }
};

/**
 * Hisse senedi detaylarını alma işlemi
 */
export const getStockDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validasyon kontrolü
    if (!validateRequest(req, res)) return;

    // Hisse senedi sembolü
    const symbol = req.params.symbol;
    
    // ALGOLAB API'den hisse detaylarını alma
    const stockDetails = await algolabClient.getStockDetails(symbol);
    
    res.status(200).json({
      success: true,
      data: stockDetails
    });
  } catch (error) {
    const err = error as Error;
    logger.error(`${req.params.symbol} için hisse detayları alma hatası:`, err);
    res.status(500).json({ message: err.message || 'Hisse detayları alınırken bir hata oluştu' });
  }
}; 