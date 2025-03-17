import dotenv from 'dotenv';

// .env dosyasını yükle
dotenv.config();

const config = {
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'supersecret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  algolab: {
    baseUrl: process.env.ALGOLAB_API_URL || 'https://api.algolab.com.tr',
    apiKey: process.env.ALGOLAB_API_KEY || '',
    apiSecret: process.env.ALGOLAB_API_SECRET || '',
    username: process.env.ALGOLAB_USERNAME || '',
    password: process.env.ALGOLAB_PASSWORD || '',
    useMockApi: process.env.USE_MOCK_API === 'true'
  },
  cors: {
    origin: [process.env.CORS_ORIGIN || 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100 // IP başına istek limiti
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

export default config; 