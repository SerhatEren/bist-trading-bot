import { Request, Response } from 'express';
import { validationResult, param, body } from 'express-validator';
import mlOrchestrationService from '../services/ml.orchestration.service';
import logger from '../utils/logger';
import { validateRequest } from '../middlewares/validate-request'; // Assuming a validation middleware exists

// Validation rules
export const symbolParamValidation = [
    param('symbol').isString().notEmpty().toUpperCase().withMessage('Symbol parameter must be a non-empty string')
];

export const sentimentBodyValidation = [
    body('symbol').isString().notEmpty().toUpperCase().withMessage('Symbol must be provided in the request body'),
    // Add validation for maxItems if you want to allow client to specify it
];

export const predictionBodyValidation = [
    body('symbol').isString().notEmpty().toUpperCase().withMessage('Symbol must be provided'),
    body('timeframe').optional().isString().withMessage('Timeframe must be a string if provided'),
    body('modelType').optional().isString().withMessage('ModelType must be a string if provided'),
];


// Controller Functions
export const getIndicators = async (req: Request, res: Response): Promise<void> => {
    if (!validateRequest(req, res)) return; // Use middleware

    const symbol = req.params.symbol;
    const timeframe = (req.query.timeframe as string) || '1d';

    try {
        const indicators = await mlOrchestrationService.getTechnicalIndicators(symbol, timeframe);
        if (!indicators) {
            res.status(404).json({ success: false, message: `Could not retrieve indicators for ${symbol}` });
            return;
        }
        res.status(200).json({ success: true, data: indicators });
    } catch (error: any) {
        logger.error(`Error in getIndicators controller for ${symbol}:`, error);
        res.status(500).json({ success: false, message: 'Internal server error getting indicators' });
    }
};

export const analyzeSentiment = async (req: Request, res: Response): Promise<void> => {
    // No specific validation needed here if we fetch news based on internal logic
    // const symbol = req.body.symbol; // Symbol might be used later to filter news

    try {
        // Using the implementation that fetches latest news and analyzes them
        const results = await mlOrchestrationService.getNewsAndSentiment();
        res.status(200).json({ success: true, data: results });
    } catch (error: any) {
        logger.error(`Error in analyzeSentiment controller:`, error);
        res.status(500).json({ success: false, message: 'Internal server error analyzing sentiment' });
    }
};

export const getPrediction = async (req: Request, res: Response): Promise<void> => {
    if (!validateRequest(req, res)) return; // Use middleware

    const { symbol, timeframe, modelType } = req.body;

    try {
        const prediction = await mlOrchestrationService.getPricePrediction(symbol, timeframe, modelType);
        if (!prediction) {
            res.status(404).json({ success: false, message: `Could not retrieve prediction for ${symbol}` });
            return;
        }
        res.status(200).json({ success: true, data: prediction });
    } catch (error: any) {
        logger.error(`Error in getPrediction controller for ${symbol}:`, error);
        res.status(500).json({ success: false, message: 'Internal server error getting prediction' });
    }
}; 