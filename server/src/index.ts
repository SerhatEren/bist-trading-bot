import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error-middleware';
import config from './config';
import logger from './utils/logger';
import { initializeWebSocketService } from './services/websocket-service';

// Express uygulaması oluşturma
const app = express();

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: config.cors.origin,
    methods: ["GET", "POST"]
  }
});

// CORS yapılandırması
app.use(cors({
  origin: config.cors.origin,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders
}));

// Güvenlik middleware'leri
app.use(helmet());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Loglama
app.use(morgan('dev'));

// Oran sınırlama
app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin'
}));

// API route'ları
app.use('/api', routes);

// 404 hata işleyici
app.use(notFoundHandler);

// Genel hata işleyici
app.use(errorHandler);

// Initialize WebSocket Service after Socket.IO is setup
initializeWebSocketService(io);

// Sunucuyu başlatma
const PORT = config.server.port;
server.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Environment: ${config.server.env}`);
  logger.info(`CORS enabled for: ${config.cors.origin}`);
  logger.info('Socket.IO server initialized');
});

// Beklenmeyen hataları yakalama
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export { app, io }; 