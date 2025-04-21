import { Router } from 'express';
import * as orderController from '../controllers/order-controller';

const router = Router();

/**
 * @route POST /api/orders
 * @desc Yeni emir oluşturma
 * @access Private
 */
router.post(
  '/', 
  orderController.createOrderValidationRules, 
  orderController.createOrder
);

/**
 * @route GET /api/orders
 * @desc Tüm emirleri getirme
 * @access Private
 */
router.get(
  '/', 
  orderController.getOrdersValidationRules,
  orderController.getOrders
);

/**
 * @route GET /api/orders/detail
 * @desc Emir detaylarını getirme
 * @access Private
 */
router.get(
  '/detail',
  orderController.getOrderValidationRules,
  orderController.getOrder
);

/**
 * @route DELETE /api/orders
 * @desc Emri iptal etme
 * @access Private
 */
router.delete(
  '/',
  orderController.cancelOrderValidationRules,
  orderController.cancelOrder
);

export default router; 