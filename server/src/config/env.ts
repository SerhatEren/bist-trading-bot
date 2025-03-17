import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  algolab: {
    apiUrl: string;
    apiKey: string;
    apiSecret: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  logLevel: string;
}

// Default configuration values
const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your_default_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  algolab: {
    apiUrl: process.env.ALGOLAB_API_URL || 'https://api.algolab.com.tr/api/v1',
    apiKey: process.env.ALGOLAB_API_KEY || '',
    apiSecret: process.env.ALGOLAB_API_SECRET || '',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '15000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate required environment variables
if (!config.algolab.apiKey || !config.algolab.apiSecret) {
  if (config.nodeEnv === 'production') {
    throw new Error('ALGOLAB_API_KEY and ALGOLAB_API_SECRET are required in production environment');
  } else {
    console.warn('Warning: ALGOLAB_API_KEY and/or ALGOLAB_API_SECRET are not set');
  }
}

export default config; 