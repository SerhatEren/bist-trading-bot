// Uygulama çalıştırma ortamı
export enum Environment {
  PRODUCTION = 'production',
  TEST = 'test',
  DEVELOPMENT = 'development'
}

// Mevcut ortamı belirle
export const currentEnvironment = (): Environment => {
  // Check window.__TEST_MODE__ global flag
  if (typeof window !== 'undefined' && window.__TEST_MODE__) {
    console.log('Test mode enabled via global flag');
    return Environment.TEST;
  }
  
  // Otherwise check environment variable
  const env = import.meta.env.VITE_APP_ENV || 'development';
  console.log('Environment from env variable:', env);
  
  switch (env) {
    case 'production':
      return Environment.PRODUCTION;
    case 'test':
      return Environment.TEST;
    default:
      return Environment.DEVELOPMENT;
  }
};

// Get current environment once
const env = currentEnvironment();
console.log('Detected environment:', env);

// API URL'lerini yapılandır
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  isTestMode: env === Environment.TEST || env === Environment.DEVELOPMENT // Force test mode in dev too
};

// Log fonksiyonları
export const logger = {
  info: (message: string, data?: any) => {
    if (env !== Environment.PRODUCTION) {
      console.info(`[INFO] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    if (env !== Environment.PRODUCTION) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  },
  debug: (message: string, data?: any) => {
    if (env === Environment.DEVELOPMENT) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
}; 