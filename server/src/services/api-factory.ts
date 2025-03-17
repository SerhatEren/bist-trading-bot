import AlgolabApiClient from './algolab-api';
import MockAlgolabApiClient from './mock-algolab-api';
import config from '../config';
import logger from '../utils/logger';

/**
 * API İstemci Factory
 * 
 * Yapılandırmaya göre gerçek veya mock API istemcisi döndürür.
 * API anahtarınız yoksa veya geliştirme/test yapıyorsanız, 
 * .env dosyasında USE_MOCK_API=true ayarlayarak mock API'yi kullanabilirsiniz.
 */
class ApiFactory {
  private static instance: AlgolabApiClient | MockAlgolabApiClient;

  /**
   * ALGOLAB API İstemcisi oluşturur (gerçek veya mock)
   */
  public static getApiClient(): AlgolabApiClient | MockAlgolabApiClient {
    if (!ApiFactory.instance) {
      if (config.algolab.useMockApi) {
        logger.info('Mock ALGOLAB API istemcisi kullanılıyor');
        ApiFactory.instance = new MockAlgolabApiClient();
      } else {
        if (!config.algolab.apiKey) {
          logger.warn('API anahtarı bulunamadı! Mock API istemcisine geçiliyor...');
          ApiFactory.instance = new MockAlgolabApiClient();
        } else {
          logger.info('Gerçek ALGOLAB API istemcisi kullanılıyor');
          ApiFactory.instance = new AlgolabApiClient({
            apiKey: config.algolab.apiKey,
            apiSecret: config.algolab.apiSecret,
            username: config.algolab.username,
            password: config.algolab.password
          });
        }
      }
    }
    
    return ApiFactory.instance;
  }
}

export default ApiFactory; 