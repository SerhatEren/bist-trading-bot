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
  binance: {
    testnetApiKey: process.env.BINANCE_TESTNET_API_KEY || '',
    testnetApiSecret: process.env.BINANCE_TESTNET_SECRET_KEY || '',
    testnetBaseUrl: process.env.BINANCE_TESTNET_BASE_URL || 'https://testnet.binance.vision/api',
    testnetWsUrl: process.env.BINANCE_TESTNET_WS_URL || 'wss://stream.testnet.binance.vision/ws'
    // Add mainnet keys/url here if needed later
    // apiKey: process.env.BINANCE_API_KEY || '',
    // apiSecret: process.env.BINANCE_SECRET_KEY || '',
    // baseUrl: process.env.BINANCE_BASE_URL || 'https://api.binance.com/api'
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