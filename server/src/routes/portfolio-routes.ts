import { Router } from 'express';
import * as portfolioController from '../controllers/portfolio-controller';

const router = Router();

/**
 * @route GET /api/portfolio
 * @desc Portföy bilgilerini getirme
 * @access Public (No auth needed now)
 */
router.get('/', portfolioController.getPortfolio);

export default router; 