import { Router } from 'express';
import * as portfolioController from '../controllers/portfolio-controller';
import { authenticate } from '../middlewares/auth-middleware';

const router = Router();

/**
 * @route GET /api/portfolio
 * @desc Portföy bilgilerini getirme
 * @access Private
 */
router.get('/', authenticate, portfolioController.getPortfolio);

export default router; 