import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
// Correctly import Enums AND Spot
import { Spot, OrderSide, OrderType, TimeInForce } from '@binance/connector'; 
// Removed direct enum imports for validation, keep types for later use
// import { OrderSide as BinanceOrderSide, OrderType as BinanceOrderType, TimeInForce } from '@binance/connector'; 
import logger from '../utils/logger';
import config from '../config';

// Removed old client
// const algolabClient = ApiFactory.getApiClient();

// Helper to get Binance client
const getClient = () => {
    const apiKey = config.binance.testnetApiKey;
    const apiSecret = config.binance.testnetApiSecret;
    const baseURL = config.binance.testnetBaseUrl;
    if (!apiKey || !apiSecret) {
        logger.error('Binance API keys not configured on the server for order operations.');
        // Throw an error or handle appropriately - cannot proceed without keys for orders
        throw new Error('API keys not configured.'); 
    }
    return new Spot(apiKey, apiSecret, { baseURL });
};

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

// --- Updated Validation Rules ---

// Define expected string values for validation
const validOrderSides = ['BUY', 'SELL'];
const validOrderTypes = ['LIMIT', 'MARKET', 'STOP_LOSS', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT', 'TAKE_PROFIT_LIMIT', 'LIMIT_MAKER'];
const validTimeInForce = ['GTC', 'IOC', 'FOK'];

export const createOrderValidationRules = [
  body('symbol')
    .isString().notEmpty().withMessage('Hisse senedi sembolü gereklidir'),
  body('side')
    .isIn(validOrderSides) // Use string array
    .withMessage(`Geçerli bir emir tarafı belirtilmelidir (${validOrderSides.join(', ')})`),
  body('type')
    .isIn(validOrderTypes) // Use string array
    .withMessage(`Geçerli bir emir türü belirtilmelidir (${validOrderTypes.join(', ')})`),
  body('quantity')
    .isNumeric().custom((value: number) => value > 0).withMessage('Miktar pozitif bir sayı olmalıdır'),
  body('price').optional()
    // Use string array for type check
    .if(body('type').isIn(['LIMIT', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT_LIMIT']))
    .isNumeric().custom((value: number) => value > 0).withMessage('Limit emirler için fiyat pozitif bir sayı olmalıdır'),
  body('stopPrice').optional()
     // Use string array for type check
    .if(body('type').isIn(['STOP_LOSS', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT', 'TAKE_PROFIT_LIMIT']))
    .isNumeric().custom((value: number) => value > 0).withMessage('Stop emirler için stop fiyatı pozitif bir sayı olmalıdır'),
  body('timeInForce').optional()
    .isIn(validTimeInForce) // Use string array
    .withMessage(`Geçerli bir timeInForce belirtilmelidir (${validTimeInForce.join(', ')})`)
];

export const getOrdersValidationRules = [
  query('symbol')
    .isString().notEmpty().withMessage('Sembol gereklidir'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit 1 ile 1000 arasındadır')
];

export const getOrderValidationRules = [
  query('symbol') // Binance requires symbol
      .isString().notEmpty().withMessage('Sembol gereklidir'),
  // Binance allows querying by orderId OR origClientOrderId
  query('orderId').optional().isInt().withMessage('orderId sayı olmalıdır'),
  query('origClientOrderId').optional().isString().withMessage('origClientOrderId metin olmalıdır'),
  // Ensure at least one of orderId or origClientOrderId is provided
  query().custom((value, { req }) => {
      if (!req.query?.orderId && !req.query?.origClientOrderId) { 
          throw new Error('orderId veya origClientOrderId belirtilmelidir');
      }
      return true;
  })
];

export const cancelOrderValidationRules = [
  body('symbol') // Binance requires symbol
      .isString().notEmpty().withMessage('Sembol gereklidir'),
  // Binance allows canceling by orderId OR origClientOrderId
  body('orderId').optional().isInt().withMessage('orderId sayı olmalıdır'),
  body('origClientOrderId').optional().isString().withMessage('origClientOrderId metin olmalıdır'),
   // Ensure at least one of orderId or origClientOrderId is provided
  body().custom((value, { req }) => {
      if (!req.body.orderId && !req.body.origClientOrderId) {
          throw new Error('orderId veya origClientOrderId belirtilmelidir');
      }
      return true;
  })
];

// --- Controller Functions (Use imported types here) ---

export const createOrder = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    if (!validateRequest(req, res)) return;

    const { symbol, side, type, quantity, price, stopPrice, timeInForce, newClientOrderId } = req.body;
    const client = getClient();

    const options: any = { quantity: parseFloat(quantity) };
    // Pass validated strings directly
    const orderTypeString = type as string;
    const orderSideString = side as string;

    // Use strings for comparisons
    if (orderTypeString === 'LIMIT' || 
        orderTypeString === 'STOP_LOSS_LIMIT' || 
        orderTypeString === 'TAKE_PROFIT_LIMIT') {
        if (!price || parseFloat(price) <= 0) {
            // Return the response directly
            return res.status(400).json({ message: 'Price is required for LIMIT type orders.'}); 
        }
        options.price = price;
        options.timeInForce = timeInForce || 'GTC'; // Use string default
    }
    // Use strings for comparisons
    if (orderTypeString === 'STOP_LOSS' || 
        orderTypeString === 'STOP_LOSS_LIMIT' || 
        orderTypeString === 'TAKE_PROFIT' || 
        orderTypeString === 'TAKE_PROFIT_LIMIT') {
        if (!stopPrice || parseFloat(stopPrice) <= 0) {
            // Return the response directly
             return res.status(400).json({ message: 'Stop Price is required for STOP_LOSS/TAKE_PROFIT type orders.'}); 
        }
        options.stopPrice = stopPrice;
    }
    if (newClientOrderId) {
      options.newClientOrderId = newClientOrderId;
    }

    logger.info(`Placing Binance order: ${symbol}, ${side}, ${type}`, options);
    // Pass strings directly to the connector method
    const order = await client.newOrder(symbol.toUpperCase(), orderSideString, orderTypeString, options);
    
    // Use return here too for consistency (though technically void would work)
    return res.status(201).json({ 
      success: true,
      data: order.data
    });

  } catch (error: any) {
    logger.error('Binance emir oluşturma hatası:', error?.response?.data || error?.message || error);
    const message = error?.response?.data?.msg || error?.message || 'Emir oluşturulurken bir hata oluştu';
    const statusCode = error?.response?.status || 500;
    // Return error response
    return res.status(statusCode).json({ message }); 
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateRequest(req, res)) return;
    
    const client = getClient();
    const symbol = (req.query.symbol as string).toUpperCase();
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    
    const options: any = {};
    if (limit) options.limit = limit;

    logger.info(`Fetching Binance orders for ${symbol}`, options);
    const orders = await client.allOrders(symbol, options);
    
    res.status(200).json({
      success: true,
      data: orders.data
    });

  } catch (error: any) {
    logger.error('Binance emir listesi alma hatası:', error?.response?.data || error?.message || error);
    const message = error?.response?.data?.msg || error?.message || 'Emirler alınırken bir hata oluştu';
    const statusCode = error?.response?.status || 500;
    res.status(statusCode).json({ message });
  }
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateRequest(req, res)) return;

    const client = getClient();
    const symbol = (req.query.symbol as string).toUpperCase();
    const orderId = req.query.orderId ? parseInt(req.query.orderId as string, 10) : undefined;
    const origClientOrderId = req.query.origClientOrderId as string | undefined;

    const options: any = {};
    if (orderId) options.orderId = orderId;
    if (origClientOrderId) options.origClientOrderId = origClientOrderId;

    logger.info(`Fetching Binance order for ${symbol}`, options);
    const order = await client.getOrder(symbol, options);
    
    res.status(200).json({
      success: true,
      data: order.data
    });

  } catch (error: any) {
     logger.error(`Binance emir ${req.query.orderId || req.query.origClientOrderId} alma hatası:`, error?.response?.data || error?.message || error);
     const message = error?.response?.data?.msg || error?.message || 'Emir detayları alınırken bir hata oluştu';
     const statusCode = error?.response?.status || 500;
     res.status(statusCode).json({ message });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // Note: Validation rules expect params, but route uses DELETE with body?
    // Let's assume body for now based on validation rules
    if (!validateRequest(req, res)) return;

    const client = getClient();
    const { symbol, orderId, origClientOrderId } = req.body;

    const options: any = {};
    if (orderId) options.orderId = orderId;
    if (origClientOrderId) options.origClientOrderId = origClientOrderId;

    logger.info(`Canceling Binance order for ${symbol}`, options);
    const result = await client.cancelOrder(symbol.toUpperCase(), options);
    
    res.status(200).json({
      success: true,
      data: result.data,
      message: 'Emir başarıyla iptal edildi'
    });

  } catch (error: any) {
    logger.error(`Binance emir ${req.body.orderId || req.body.origClientOrderId} iptal hatası:`, error?.response?.data || error?.message || error);
    const message = error?.response?.data?.msg || error?.message || 'Emir iptal edilirken bir hata oluştu';
    const statusCode = error?.response?.status || 500;
    res.status(statusCode).json({ message });
  }
}; 