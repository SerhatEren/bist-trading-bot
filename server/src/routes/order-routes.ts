import { Router } from 'express';
import * as orderController from '../controllers/order-controller';
import { authenticate } from '../middlewares/auth-middleware';

const router = Router();

/**
 * @route POST /api/orders
 * @desc Yeni emir oluşturma
 * @access Private
 */
router.post(
  '/', 
  authenticate, 
  orderController.createOrderValidationRules, 
  orderController.createOrder
);

/**
 * @route GET /api/orders
 * @desc Tüm emirleri getirme
 * @access Private
 */
router.get('/', authenticate, orderController.getOrders);

/**
 * @route GET /api/orders/:orderId
 * @desc Emir detaylarını getirme
 * @access Private
 */
router.get(
  '/:orderId', 
  authenticate, 
  orderController.getOrderValidationRules, 
  orderController.getOrder
);

/**
 * @route DELETE /api/orders/:orderId
 * @desc Emri iptal etme
 * @access Private
 */
router.delete(
  '/:orderId', 
  authenticate, 
  orderController.cancelOrderValidationRules, 
  orderController.cancelOrder
);

export default router; 