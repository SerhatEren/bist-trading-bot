import { Request, Response } from 'express';
import { param, query, validationResult } from 'express-validator';
// import ApiFactory from '../services/api-factory'; // Remove old factory
// @ts-ignore - Suppress type error
import { Spot } from '@binance/connector'; // Import Binance Connector
import logger from '../utils/logger';
import config from '../config'; // Import config

// Removed old client
// const algolabClient = ApiFactory.getApiClient();

// Helper to get Binance client (avoids repetition)
const getClient = () => {
    const apiKey = config.binance.testnetApiKey;
    const apiSecret = config.binance.testnetApiSecret;
    const baseURL = config.binance.testnetBaseUrl;
    // Note: For public endpoints like tickerPrice/ticker24hr, API keys might not be strictly necessary,
    // but the connector likely requires them for instantiation.
    // If public-only access is needed later, the Spot client can be initialized with empty strings for keys.
    if (!apiKey || !apiSecret) {
        logger.warn('Binance API keys not configured, proceeding for public endpoints.');
        return new Spot('', '', { baseURL }); // Attempt public client if keys missing
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

/**
 * Hisse senedi fiyatları validasyon kuralları
 */
export const getQuotesValidationRules = [
  query('symbols')
    .isString()
    .withMessage('Semboller bir metin olarak belirtilmelidir')
    .notEmpty()
    .withMessage('En az bir sembol belirtilmelidir')
];

/**
 * Hisse senedi detayları validasyon kuralları
 */
export const getStockDetailsValidationRules = [
  param('symbol')
    .isString()
    .withMessage('Sembol bir metin olarak belirtilmelidir')
    .notEmpty()
    .withMessage('Sembol belirtilmelidir')
];

/**
 * Hisse senedi fiyatlarını (ticker) Binance'ten alma işlemi
 */
export const getQuotes = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateRequest(req, res)) return;

    const symbolsParam = req.query.symbols as string;
    const requestedSymbols = symbolsParam.split(',').map(symbol => symbol.trim().toUpperCase());
    // Create a Set for efficient lookup
    const requestedSymbolsSet = new Set(requestedSymbols);
    
    const client = getClient();
    
    logger.info(`Fetching all Binance ticker prices to filter for: ${requestedSymbols.join(', ')}`);
    // Fetch ALL ticker prices
    const allTickersResponse = await client.tickerPrice(); 
    const allTickers = allTickersResponse.data;

    let filteredQuotes: any[];

    // Ensure allTickers is an array before filtering
    if (Array.isArray(allTickers)) {
         // Filter the results based on the requested symbols
        filteredQuotes = allTickers.filter(ticker => requestedSymbolsSet.has(ticker.symbol));
    } else if (allTickers && typeof allTickers === 'object' && requestedSymbolsSet.has(allTickers.symbol)) {
        // Handle case where maybe only one symbol was requested/returned as object (less likely for full fetch)
        filteredQuotes = [allTickers];
    } else {
        // If the response is not an array or a single matching object, return empty
        filteredQuotes = [];
    }
    
    // Optional: Check if any requested symbols were not found
    if (filteredQuotes.length !== requestedSymbols.length) {
        logger.warn('Could not find ticker prices for all requested symbols.', { requested: requestedSymbols, found: filteredQuotes.map(q => q.symbol) });
    }

    // Log the exact response being sent
    const responseToSend = {
      success: true, 
      data: filteredQuotes
    };
    logger.info('Sending market quotes response:', responseToSend);

    res.status(200).json(responseToSend);

  } catch (error: any) {
    logger.error('Binance hisse fiyatları alma hatası (fetching all):', error);
    const message = error?.response?.data?.msg || error?.message || 'Hisse fiyatları alınırken bir hata oluştu';
    const statusCode = error?.response?.status || 500;
    res.status(statusCode).json({ message });
  }
};

/**
 * Hisse senedi 24hr istatistiklerini Binance'ten alma işlemi
 */
export const getStockDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateRequest(req, res)) return;

    const symbol = (req.params.symbol as string).toUpperCase();
    
    const client = getClient();
    // Fetch 24hr ticker statistics instead of generic details
    const ticker24hr = await client.ticker24hr(symbol);
    
    res.status(200).json({
      success: true,
      data: ticker24hr.data // Return Binance response data
    });
  } catch (error: any) {
    logger.error(`${req.params.symbol} için Binance 24hr istatistik alma hatası:`, error);
    const message = error?.response?.data?.msg || error?.message || 'Hisse detayları alınırken bir hata oluştu';
    const statusCode = error?.response?.status || 500;
    res.status(statusCode).json({ message });
  }
}; 