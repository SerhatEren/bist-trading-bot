import WebSocket from 'ws'; // Import ws library
import logger from '../utils/logger';
import config from '../config';
import { Server } from 'socket.io';

// --- Configuration ---
// Switch back to combined stream for efficiency, adjust parsing if needed
const STREAM_TO_SUBSCRIBE = ['!miniTicker@arr']; 
const WEBSOCKET_URL = config.binance.testnetWsUrl;
const INITIAL_RECONNECT_DELAY = 5000; // 5 seconds
const MAX_RECONNECT_DELAY = 60000; // 60 seconds
const PING_INTERVAL = 3 * 60 * 1000; // 3 minutes (as per Binance docs)
const PONG_TIMEOUT_MARGIN = 10 * 1000; // Allow 10 seconds margin for pong response

// --- State Variables ---
let ws: WebSocket | null = null;
let socketIOServer: Server | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let pingInterval: NodeJS.Timeout | null = null;
let pongTimeout: NodeJS.Timeout | null = null;
let currentReconnectDelay = INITIAL_RECONNECT_DELAY;
let isAlive = true;
let intentionalDisconnect = false;

// --- WebSocket Event Handlers ---

function handleOpen() {
    logger.info(`WebSocket connected to ${WEBSOCKET_URL}`);
    isAlive = true;
    intentionalDisconnect = false;
    // Reset reconnect delay on successful connection
    currentReconnectDelay = INITIAL_RECONNECT_DELAY; 
    clearReconnectTimer(); // Clear any pending reconnect

    // Subscribe to stream(s)
    subscribeToStreams(STREAM_TO_SUBSCRIBE);

    // Start periodic ping
    startPingInterval();
}

function handleMessage(data: WebSocket.RawData) {
    isAlive = true; // Got data, connection is alive
    const messageString = data.toString();
    // logger.debug('Raw message received:', messageString.substring(0, 300) + '...');

    try {
        const message = JSON.parse(messageString);

        if (socketIOServer) {
            let eventName = 'binanceStreamMessage'; // Default
            let payload = message;

            // Handle combined stream format !miniTicker@arr
            if (Array.isArray(message)) { 
                eventName = 'marketTickersUpdate'; 
                payload = message;
            } 
            // Add handling for other stream types if needed
            // else if (message.stream && message.data) { // Example: other combined streams
            //    eventName = message.stream;
            //    payload = message.data;
            // } else if (message.e) { // Example: single streams often have an event type 'e'
            //    eventName = message.e;
            //    payload = message;
            // }

            // logger.debug(`Emitting Socket.IO event: [${eventName}]`);
            socketIOServer.emit(eventName, payload);
        } else {
            logger.warn('Socket.IO server not available to emit message.');
        }
    } catch (error) {
        logger.error('Failed to parse WebSocket message:', error);
        logger.error('Original raw data:', messageString);
    }
}

function handlePing(data: Buffer) {
    logger.debug('Received PING from Binance');
    isAlive = true; // Got ping, connection is alive
    ws?.pong(data); // Respond with pong immediately
    logger.debug('Sent PONG to Binance');
    // Reset pong timeout timer
    resetPongTimeout();
}

function handlePong(data: Buffer) {
    logger.debug('Received PONG from Binance');
    isAlive = true; // Got pong, connection is alive
    // Reset pong timeout timer
    resetPongTimeout();
}

function handleError(error: Error) {
    logger.error('WebSocket Error:', error);
    // Don't schedule reconnect here directly, rely on the close event
    // Attempt to close cleanly if possible, otherwise close event handles reconnect
    if (ws && ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
        ws.terminate(); // Force close if error occurs
    }
}

function handleClose(code: number, reason: Buffer) {
    logger.warn(`WebSocket disconnected. Code: ${code}, Reason: ${reason.toString()}`);
    isAlive = false;
    clearPingInterval();
    clearPongTimeout();
    ws = null; // Clear the instance
    if (!intentionalDisconnect) {
        logger.info('Connection was not intentionally closed, scheduling reconnect...');
        scheduleReconnect();
    } else {
        logger.info('Intentional disconnect, not reconnecting.');
        intentionalDisconnect = false; // Reset flag
    }
}

// --- Helper Functions ---

function subscribeToStreams(streams: string[]) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const subscriptionMessage = JSON.stringify({
            method: "SUBSCRIBE",
            params: streams,
            id: 1 // Unique ID for the request
        });
        logger.info(`Sending subscription request for: ${streams.join(', ')}`);
        ws.send(subscriptionMessage);
    } else {
        logger.warn('WebSocket not open, cannot subscribe yet.');
    }
}

function clearTimers() {
    clearPingInterval();
    clearPongTimeout();
    clearReconnectTimer();
}

function clearPingInterval() {
    if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
        logger.debug('Cleared ping interval');
    }
}

function clearPongTimeout() {
    if (pongTimeout) {
        clearTimeout(pongTimeout);
        pongTimeout = null;
         logger.debug('Cleared pong timeout');
    }
}

function clearReconnectTimer() {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
        logger.debug('Cleared reconnect timer');
    }
}

function startPingInterval() {
    clearPingInterval(); // Clear existing interval just in case
    logger.debug(`Starting ping interval (${PING_INTERVAL}ms)`);
    isAlive = true; // Assume alive at start
    pingInterval = setInterval(() => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            logger.warn('Ping interval: WebSocket not open, clearing interval.');
            clearPingInterval();
            return;
        }
        if (!isAlive) {
            logger.warn('No pong received within interval, terminating connection.');
            ws.terminate(); // Force close if no pong received
            clearTimers(); // Clear all timers
            scheduleReconnect(); // Attempt reconnect
            return;
        }
        isAlive = false; // Assume dead until next pong/message
        logger.debug('Sending PING to Binance');
        ws.ping();
        // Set a timeout to expect a pong back
        resetPongTimeout(); 
    }, PING_INTERVAL);
}

function resetPongTimeout() {
    clearPongTimeout();
    pongTimeout = setTimeout(() => {
         if (!isAlive) { // Check again after timeout margin
            logger.warn(`Pong timeout expired (${(PING_INTERVAL + PONG_TIMEOUT_MARGIN)/1000}s), terminating connection.`);
            ws?.terminate();
            clearTimers();
            scheduleReconnect();
         }
    }, PONG_TIMEOUT_MARGIN);
}

function scheduleReconnect() {
    clearReconnectTimer(); // Clear existing timer first

    logger.info(`Scheduling WebSocket reconnect in ${currentReconnectDelay / 1000} seconds...`);
    reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        logger.info('Attempting WebSocket reconnect now...');
        connectToBinanceStream();
        // Increase the delay for the next potential reconnect attempt
        currentReconnectDelay = Math.min(currentReconnectDelay * 2, MAX_RECONNECT_DELAY);
    }, currentReconnectDelay);
}

function connectToBinanceStream() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        logger.warn('WebSocket connection attempt already in progress or open.');
        return;
    }
    
    // Ensure previous instance is fully cleaned up (listeners removed)
    if(ws) {
        ws.removeAllListeners();
    }

    logger.info(`Attempting to connect WebSocket to: ${WEBSOCKET_URL}`);
    ws = new WebSocket(WEBSOCKET_URL);

    ws.on('open', handleOpen);
    ws.on('message', handleMessage);
    ws.on('ping', handlePing);
    ws.on('pong', handlePong);
    ws.on('error', handleError);
    ws.on('close', handleClose);
}

// --- Public Service Functions ---

export const initializeWebSocketService = (io: Server) => {
    socketIOServer = io;
    logger.info("Initializing WebSocket Service with 'ws' library...");
    connectToBinanceStream();
};

export const disconnectWebSocket = () => {
    if (!ws) {
        logger.warn('WebSocket client not initialized or already disconnected.');
        return;
    }
    logger.info('Intentional WebSocket disconnect requested.');
    intentionalDisconnect = true;
    clearTimers();
    ws.close(1000, 'Client initiated disconnect'); // Clean close
};

// --- Graceful Shutdown ---
process.on('SIGINT', () => {
    logger.info('SIGINT received, closing WebSocket connection...');
    disconnectWebSocket();
    // Give time for close frame to send before exiting
    setTimeout(() => {
        process.exit(0);
    }, 500);
}); 