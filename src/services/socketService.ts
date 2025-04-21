import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'; // Use env var or default

class SocketService {
  private socket: Socket | null = null;

  connect(): void {
    // Prevent connecting if already connected
    if (this.socket && this.socket.connected) { 
      console.log('Socket already connected.');
      return;
    }

    console.log(`Connecting to Socket.IO server at ${SOCKET_URL}...`);
    // Ensure any previous partial connection is cleaned up
    if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
    }
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'], 
      reconnectionAttempts: 5, // Example: Limit reconnection attempts
      reconnectionDelay: 3000, // Example: Delay between retries
    });

    // --- Move Listeners Here ---
    console.log('Attaching core listeners...');
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      // Potentially notify listeners stored elsewhere if needed
    });
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.socket = null; // Reset socket on disconnect
      // Potentially notify listeners stored elsewhere if needed
    });
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    this.socket.onAny((eventName, ...args) => {
      // console.log(`Received socket event [${eventName}]:`, args);
    });
    // --- End Moved Listeners ---
  }

  disconnect(): void {
    // Prevent disconnecting if already disconnected
    if (!this.socket) { 
      console.log('Socket already disconnected or not initialized.');
      return;
    }
    console.log('Disconnecting socket...');
    this.socket.disconnect();
    // The 'disconnect' event handler above will set this.socket to null
    // this.socket = null; // Avoid setting null here, let the event handler do it
  }

  // Method to subscribe to a specific event
  on(eventName: string, callback: (...args: any[]) => void): void {
    // Revert: Always attempt to add listener. Socket.IO handles attaching it once connected.
    // if (!this.socket) { 
    //     console.warn(`Socket not initialized when registering listener for ${eventName}. Connect first.`);
    //     return; 
    // } 
    // Ensure socket exists before calling .on on it, even if null initially
    this.socket?.on(eventName, callback); 
  }

  // Method to unsubscribe from a specific event
  off(eventName: string, callback?: (...args: any[]) => void): void {
     // Check if socket exists before removing listener
    this.socket?.off(eventName, callback); // Use optional chaining
  }

  // Method to emit an event (if needed later)
  emit(eventName: string, data: any): void {
     // Check if socket exists before emitting
    this.socket?.emit(eventName, data); // Use optional chaining
  }

  // Add a helper to check connection status explicitly if needed
  isConnected(): boolean {
      return this.socket?.connected || false;
  }
}

// Singleton instance
const socketService = new SocketService();
export default socketService; 