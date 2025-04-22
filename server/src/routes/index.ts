import { Router } from 'express';
import marketRoutes from './market-routes';
import orderRoutes from './order-routes';
import portfolioRoutes from './portfolio-routes';
import mlRoutes from './ml.routes';

const router = Router();

// Auth routes
// router.use('/auth', authRoutes);

// Market data routes
router.use('/market', marketRoutes);

// Order routes
router.use('/orders', orderRoutes);

// Portfolio routes
router.use('/portfolio', portfolioRoutes);

// ML routes
router.use('/ml', mlRoutes);

export default router;