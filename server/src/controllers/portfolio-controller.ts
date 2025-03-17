import { Request, Response } from 'express';
import ApiFactory from '../services/api-factory';
import logger from '../utils/logger';

// ALGOLAB API istemcisi (gerçek veya mock)
const algolabClient = ApiFactory.getApiClient();

/**
 * Portföy bilgilerini getirme işlemi
 */
export const getPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    // ALGOLAB API'den portföy bilgilerini alma
    const portfolio = await algolabClient.getPortfolio();
    
    res.status(200).json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Portföy bilgisi alma hatası:', err);
    res.status(500).json({ message: err.message || 'Portföy bilgisi alınırken bir hata oluştu' });
  }
}; 