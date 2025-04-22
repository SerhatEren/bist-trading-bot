import { Router } from 'express';
import * as mlController from '../controllers/ml.controller';
import { authenticateToken } from '../middlewares/auth-middleware'; // Assuming JWT auth middleware exists
import { validationMiddleware } from '../middlewares/validate-request';

const router = Router();

/**
 * @route   GET /api/ml/indicators/:symbol
 * @desc    Get technical indicators for a symbol
 * @access  Private (requires authentication)
 */
router.get(
    '/indicators/:symbol',
    authenticateToken, // Protect endpoint
    mlController.symbolParamValidation, // Validation rules
    validationMiddleware, // Apply validation
    mlController.getIndicators
);

/**
 * @route   POST /api/ml/sentiment/analyze
 * @desc    Get sentiment analysis for latest news
 * @access  Private (requires authentication)
 */
router.post(
    '/sentiment/analyze',
    authenticateToken, // Protect endpoint
    // mlController.sentimentBodyValidation, // Validation if needed (e.g., for maxItems)
    // validationMiddleware,
    mlController.analyzeSentiment
);

/**
 * @route   POST /api/ml/prediction/price
 * @desc    Get price prediction for a symbol
 * @access  Private (requires authentication)
 */
router.post(
    '/prediction/price',
    authenticateToken, // Protect endpoint
    mlController.predictionBodyValidation, // Validation rules
    validationMiddleware, // Apply validation
    mlController.getPrediction
);

// Add routes for other ML operations (train, status, list models) if needed later

export default router; 