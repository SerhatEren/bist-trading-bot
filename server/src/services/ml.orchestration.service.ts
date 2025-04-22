import { Spot } from '@binance/connector';
import config from '../config';
import logger from '../utils/logger';
import mlServiceClient from './mlServiceClient';
import newsService, { ParsedNewsItem } from './news.service';
import { TechnicalIndicators, NLPSentiment, MLPrediction } from 'src/types/ml'; // Explicit path from src

// Helper to get Binance client (reuse from controllers or define here)
const getBinanceClient = () => {
    const apiKey = config.binance.testnetApiKey;
    const apiSecret = config.binance.testnetApiSecret;
    const baseURL = config.binance.testnetBaseUrl;
    // For historical data, keys are often needed
    if (!apiKey || !apiSecret) {
        logger.error('Binance API keys not configured for market data fetching.');
        throw new Error('Binance API keys not configured.');
    }
    return new Spot(apiKey, apiSecret, { baseURL });
};

class MlOrchestrationService {

    /**
     * Fetches technical indicators by proxying to the ML service.
     */
    async getTechnicalIndicators(symbol: string, timeframe: string): Promise<TechnicalIndicators | null> {
        logger.info(`[ML Orchestration] Getting technical indicators for ${symbol} (${timeframe})`);
        const response = await mlServiceClient.get<TechnicalIndicators>(`/api/indicators/${symbol}`, { timeframe });
        if (!response.success || !response.data) {
            logger.error(`[ML Orchestration] Failed to get indicators from ML service for ${symbol}: ${response.error}`);
            return null;
        }
        return response.data;
    }

    /**
     * Fetches latest news and analyzes sentiment for each item.
     * Currently analyzes sentiment for all fetched news, not symbol-specific.
     */
    async getNewsAndSentiment(maxItems: number = 5): Promise<Array<ParsedNewsItem & { sentiment?: NLPSentiment }>> {
        logger.info(`[ML Orchestration] Fetching news and analyzing sentiment (max ${maxItems} items)`);
        const newsItems = await newsService.fetchNews(maxItems);
        if (!newsItems.length) {
            return [];
        }

        const analysisPromises = newsItems.map(async (item) => {
            const sentimentResponse = await mlServiceClient.post<NLPSentiment>('/api/sentiment/analyze', { text: item.fullText });
            return {
                ...item,
                sentiment: sentimentResponse.success ? sentimentResponse.data : undefined,
                error: !sentimentResponse.success ? sentimentResponse.error : undefined
            };
        });

        const results = await Promise.all(analysisPromises);
        logger.info(`[ML Orchestration] Finished sentiment analysis for ${results.length} news items.`);
        return results;
    }

    /**
     * Gets price prediction by fetching data, formatting, and calling the ML service.
     */
    async getPricePrediction(symbol: string, timeframe: string = '1d', modelType?: string): Promise<MLPrediction | null> {
        logger.info(`[ML Orchestration] Getting price prediction for ${symbol} (${timeframe})`);
        const client = getBinanceClient();
        const limit = 20; // Need 20 timesteps for the model

        try {
            // Fetch kline/candlestick data from Binance
            const interval = '1d'; // Assuming daily model
            const klinesResponse = await client.klines(symbol.toUpperCase(), interval, { limit: limit }); // Fetch exactly 20 for the model

            if (!klinesResponse || !klinesResponse.data || klinesResponse.data.length < limit) {
                logger.error(`[ML Orchestration] Not enough kline data received from Binance for ${symbol}. Needed ${limit}, got ${klinesResponse?.data?.length}`);
                return null;
            }

            // --- Data Formatting (CRITICAL STEP - Needs Verification) ---
            // Define the expected structure of a Binance kline item (array)
            // Based on Binance API and potential library interpretations:
            type BinanceKline = [
                number, // Open time
                string, // Open
                string, // High
                string, // Low
                string, // Close
                string, // Volume
                number, // Close time
                string, // Quote asset volume
                number | string, // Number of trades (can be string)
                string, // Taker buy base asset volume
                string, // Taker buy quote asset volume
                string  // Ignore
            ];

            // **THIS MAPPING MUST MATCH YOUR MODEL'S TRAINING DATA AND scaler.pkl**
            // Placeholder: Assuming [Open, High, Low, Close, Volume, Quote asset volume, Number of trades, Taker buy base asset volume, Taker buy quote asset volume]
            const featureData = klinesResponse.data.slice(0, limit).map((k: BinanceKline) => [
                parseFloat(k[1]), // Open
                parseFloat(k[2]), // High
                parseFloat(k[3]), // Low
                parseFloat(k[4]), // Close
                parseFloat(k[5]), // Volume
                parseFloat(k[7]), // Quote asset volume
                parseFloat(k[8] as string), // Number of trades (treat as string then parse)
                parseFloat(k[9]), // Taker buy base asset volume
                parseFloat(k[10]), // Taker buy quote asset volume
            ]); // Now exactly 9 features

            if (featureData.length !== limit || featureData.some((row: number[]) => row.length !== 9 || row.some(isNaN))) {
                 logger.error(`[ML Orchestration] Formatted feature data has incorrect shape or contains NaN. Expected (${limit}, 9 numeric), got (${featureData.length}, ${featureData[0]?.length})`);
                 console.log('Problematic feature data:', featureData.filter((row: number[]) => row.length !== 9 || row.some(isNaN))); // Log problematic rows
                 return null;
            }
            // -------------------------------------------------------------

            // Call the ML service
            const predictionResponse = await mlServiceClient.post<MLPrediction>('/api/prediction/price', {
                recent_data: featureData,
                symbol: symbol,
                timeframe: timeframe,
                modelType: modelType
            });

            if (!predictionResponse.success || !predictionResponse.data) {
                logger.error(`[ML Orchestration] Failed to get prediction from ML service for ${symbol}: ${predictionResponse.error}`);
                return null;
            }

            logger.info(`[ML Orchestration] Successfully received prediction for ${symbol}: ${predictionResponse.data.prediction}`);
            return predictionResponse.data;

        } catch (error: any) {
            logger.error(`[ML Orchestration] Error fetching market data or getting prediction for ${symbol}:`, error?.response?.data || error?.message || error);
            return null;
        }
    }
}

export default new MlOrchestrationService(); 