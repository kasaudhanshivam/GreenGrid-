// WebSocket Service for Real-time Energy Data Updates
// Provides live data streaming for dashboard components

import { EnergyData } from '../utils/energyData';

export type WebSocketEventType = 
  | 'energy_data_update'
  | 'system_alert'
  | 'connection_status'
  | 'heartbeat';

export interface WebSocketMessage {
  type: WebSocketEventType;
  data: any;
  timestamp: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export type WebSocketEventListener = (message: WebSocketMessage) => void;

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private eventListeners = new Map<WebSocketEventType, Set<WebSocketEventListener>>();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isIntentionalDisconnect = false;

  private config: WebSocketConfig = {
    url: 'ws://localhost:3001/ws', // Update for production
    reconnectInterval: 5000, // 5 seconds
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000 // 30 seconds
  };

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  // Configure WebSocket connection
  configure(config: Partial<WebSocketConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Connect to WebSocket server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isIntentionalDisconnect = false;
        
        // Use simulated WebSocket in development
        if (process.env.NODE_ENV === 'development') {
          this.startSimulatedWebSocket();
          resolve();
          return;
        }

        // Real WebSocket connection for production
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connection_status', { connected: true });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.stopHeartbeat();
          this.emit('connection_status', { connected: false });
          
          if (!this.isIntentionalDisconnect) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        reject(error);
      }
    });
  }

  // Disconnect WebSocket
  disconnect() {
    this.isIntentionalDisconnect = true;
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    
    this.ws = null;
  }

  // Subscribe to WebSocket events
  on(eventType: WebSocketEventType, listener: WebSocketEventListener) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }

  // Unsubscribe from WebSocket events
  off(eventType: WebSocketEventType, listener: WebSocketEventListener) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  // Send message to WebSocket server
  send(message: Omit<WebSocketMessage, 'timestamp'>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString()
      };
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.warn('WebSocket not connected. Cannot send message:', message);
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // Private methods
  private handleMessage(message: WebSocketMessage) {
    const listeners = this.eventListeners.get(message.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(message);
        } catch (error) {
          console.error('Error in WebSocket event listener:', error);
        }
      });
    }
  }

  private emit(type: WebSocketEventType, data: any) {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: new Date().toISOString()
    };
    this.handleMessage(message);
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, this.config.reconnectInterval * this.reconnectAttempts);
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({
        type: 'heartbeat',
        data: { timestamp: Date.now() }
      });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Simulated WebSocket for development
  private startSimulatedWebSocket() {
    console.log('Starting simulated WebSocket for development');
    
    // Emit connection status
    setTimeout(() => {
      this.emit('connection_status', { connected: true });
    }, 100);

    // Simulate real-time energy data updates
    setInterval(() => {
      // Import energySimulator dynamically to avoid circular dependencies
      import('../utils/energyData').then(({ energySimulator }) => {
        const currentData = energySimulator.generateCurrentData();
        this.emit('energy_data_update', currentData);
        console.log('WebSocket: Sent energy data update', new Date().toLocaleTimeString());
      });
    }, 3000); // Update every 3 seconds for better real-time demo

    // Simulate occasional system alerts
    setInterval(() => {
      const alerts = [
        { type: 'info', message: 'Solar generation peak detected' },
        { type: 'warning', message: 'Battery charge level below 20%' },
        { type: 'info', message: 'Grid export optimized' }
      ];
      
      if (Math.random() > 0.7) { // 30% chance of alert
        const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
        this.emit('system_alert', randomAlert);
      }
    }, 30000); // Check every 30 seconds

    // Simulate heartbeat
    setInterval(() => {
      this.emit('heartbeat', { timestamp: Date.now() });
    }, this.config.heartbeatInterval);
  }
}

// Export singleton instance
export const websocketService = WebSocketService.getInstance();

// React hook for WebSocket integration
export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await websocketService.connect();
        setConnectionError(null);
      } catch (error) {
        setConnectionError(error instanceof Error ? error.message : 'Connection failed');
      }
    };

    connectWebSocket();

    // Subscribe to connection status
    const unsubscribeStatus = websocketService.on('connection_status', (message) => {
      setIsConnected(message.data.connected);
    });

    // Subscribe to all messages for debugging
    const unsubscribeAll = websocketService.on('energy_data_update', (message) => {
      setLastMessage(message);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeAll();
      websocketService.disconnect();
    };
  }, []);

  const sendMessage = (type: WebSocketEventType, data: any) => {
    websocketService.send({ type, data });
  };

  const subscribe = (eventType: WebSocketEventType, listener: WebSocketEventListener) => {
    return websocketService.on(eventType, listener);
  };

  return {
    isConnected,
    lastMessage,
    connectionError,
    sendMessage,
    subscribe
  };
}

import { useState, useEffect } from 'react';