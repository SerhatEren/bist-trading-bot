import { Request, Response } from 'express';
// import ApiFactory from '../services/api-factory'; // Remove old factory import
// @ts-ignore - Suppress type error for connector
import { Spot } from '@binance/connector'; // Import Binance Connector
import logger from '../utils/logger';
import config from '../config'; // Import config to access environment variables

// Removed old client instantiation
// const algolabClient = ApiFactory.getApiClient();

/**
 * Portföy bilgilerini Binance Testnet'ten getirme işlemi
 */
export const getPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    // Retrieve API keys and base URL from server environment variables
    const apiKey = config.binance.testnetApiKey; 
    const apiSecret = config.binance.testnetApiSecret; 
    const baseURL = config.binance.testnetBaseUrl;

    if (!apiKey || !apiSecret) {
      logger.error('Binance API keys are not configured on the server.');
      res.status(500).json({ message: 'API keys not configured.' });
      return;
    }

    // Instantiate Binance Spot Client
    const client = new Spot(apiKey, apiSecret, { baseURL });

    // Fetch account information from Binance
    const accountInfo = await client.account();
    
    res.status(200).json({
      success: true,
      // Return the data directly from Binance API response
      data: accountInfo.data 
    });

  } catch (error: any) { // Catch specific Binance errors if possible
    logger.error('Binance portföy bilgisi alma hatası:', error);
    // Try to return Binance error message if available
    const message = error?.response?.data?.msg || error?.message || 'Portföy bilgisi alınırken bir hata oluştu';
    const statusCode = error?.response?.status || 500;
    res.status(statusCode).json({ message });
  }
}; 