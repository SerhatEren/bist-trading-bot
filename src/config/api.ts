// Uygulama çalıştırma ortamı
export enum Environment {
  PRODUCTION = 'production',
  TEST = 'test',
  DEVELOPMENT = 'development'
}

// Mevcut ortamı belirle - Simplified
export const currentEnvironment = (): Environment => {
  // Remove check for window.__TEST_MODE__ global flag
  /* 
  if (typeof window !== 'undefined' && window.__TEST_MODE__) {
    console.log('Test mode enabled via global flag');
    return Environment.TEST;
  }
  */
  
  // Rely solely on environment variable
  const env = import.meta.env.VITE_APP_ENV || 'development'; // Default to development
  console.log('Environment from VITE_APP_ENV:', env);
  
  switch (env) {
    case 'production':
      return Environment.PRODUCTION;
    case 'test': // Use TEST if you want to trigger mock service via env var
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
  // Only enable test mode if explicitly set to TEST
  isTestMode: env === Environment.TEST 
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