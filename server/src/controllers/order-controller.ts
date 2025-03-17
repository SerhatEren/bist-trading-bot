import { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import ApiFactory from '../services/api-factory';
import { OrderSide, OrderType } from '../types/algolab';
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
 * Emir oluşturma validasyon kuralları
 */
export const createOrderValidationRules = [
  body('symbol')
    .isString()
    .notEmpty()
    .withMessage('Hisse senedi sembolü gereklidir'),
  body('side')
    .isIn(Object.values(OrderSide))
    .withMessage('Geçerli bir emir tarafı belirtilmelidir (BUY, SELL)'),
  body('type')
    .isIn(Object.values(OrderType))
    .withMessage('Geçerli bir emir türü belirtilmelidir (MARKET, LIMIT, STOP, STOP_LIMIT)'),
  body('quantity')
    .isNumeric()
    .custom((value: number) => value > 0)
    .withMessage('Miktar pozitif bir sayı olmalıdır'),
  body('price')
    .optional()
    .isNumeric()
    .custom((value: number) => value > 0)
    .withMessage('Fiyat pozitif bir sayı olmalıdır'),
  body('stopPrice')
    .optional()
    .isNumeric()
    .custom((value: number) => value > 0)
    .withMessage('Stop fiyatı pozitif bir sayı olmalıdır')
];

/**
 * Emir görüntüleme validasyon kuralları
 */
export const getOrderValidationRules = [
  param('orderId')
    .isString()
    .notEmpty()
    .withMessage('Emir ID gereklidir')
];

/**
 * Emir iptal validasyon kuralları
 */
export const cancelOrderValidationRules = [
  param('orderId')
    .isString()
    .notEmpty()
    .withMessage('Emir ID gereklidir')
];

/**
 * Emir oluşturma işlemi
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validasyon kontrolü
    if (!validateRequest(req, res)) return;

    // Talep verilerini alma
    const { symbol, side, type, quantity, price, stopPrice, timeInForce, clientOrderId } = req.body;
    
    // ALGOLAB API ile emir oluşturma
    const order = await algolabClient.createOrder({
      symbol,
      side,
      type,
      quantity,
      price,
      stopPrice,
      timeInForce,
      clientOrderId
    });
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Emir oluşturma hatası:', err);
    res.status(500).json({ message: err.message || 'Emir oluşturulurken bir hata oluştu' });
  }
};

/**
 * Tüm emirleri listeleme işlemi
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    // ALGOLAB API ile tüm emirleri alma
    const orders = await algolabClient.getOrders();
    
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Emir listesi alma hatası:', err);
    res.status(500).json({ message: err.message || 'Emirler alınırken bir hata oluştu' });
  }
};

/**
 * Emir detaylarını görüntüleme işlemi
 */
export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validasyon kontrolü
    if (!validateRequest(req, res)) return;

    // Emir ID'si
    const orderId = req.params.orderId;
    
    // ALGOLAB API ile emir detaylarını alma
    const order = await algolabClient.getOrder(orderId);
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    const err = error as Error;
    logger.error(`${req.params.orderId} ID'li emir alma hatası:`, err);
    res.status(500).json({ message: err.message || 'Emir detayları alınırken bir hata oluştu' });
  }
};

/**
 * Emir iptal işlemi
 */
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validasyon kontrolü
    if (!validateRequest(req, res)) return;

    // Emir ID'si
    const orderId = req.params.orderId;
    
    // ALGOLAB API ile emir iptal etme
    const order = await algolabClient.cancelOrder(orderId);
    
    res.status(200).json({
      success: true,
      data: order,
      message: 'Emir başarıyla iptal edildi'
    });
  } catch (error) {
    const err = error as Error;
    logger.error(`${req.params.orderId} ID'li emir iptal hatası:`, err);
    res.status(500).json({ message: err.message || 'Emir iptal edilirken bir hata oluştu' });
  }
}; 