// Custom React hook for enhanced weather-based energy data management
// Provides centralized state management for all energy-related data with weather integration

import { useState, useEffect, useCallback } from 'react';
import { energyDataService } from '../services/energyDataService';
import { websocketService } from '../services/websocketService';
import { EnergyData, CurrentMetrics } from '../utils/energyData';
import { weatherBasedEnergySimulator, SystemMode, WeatherData, EnergyPrediction, IoTSensorData } from '../utils/weatherBasedEnergyData';

export interface EnergyDataState {
  currentData: EnergyData | null;
  forecastData: EnergyData[];
  historicalData: EnergyData[];
  metrics: CurrentMetrics | null;
  recommendations: Array<{
    message: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
    action?: string;
    acknowledged?: boolean;
    weatherBased?: boolean;
  }>;
  alerts: Array<{type: 'warning' | 'error' | 'info', message: string}>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  // Enhanced weather-based data
  weatherData: WeatherData | null;
  energyPrediction: EnergyPrediction | null;
  iotData: IoTSensorData | null;
  systemMode: SystemMode;
}

export interface UseEnergyDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  forecastHours?: number;
  historicalDays?: number;
  systemMode?: SystemMode;
  weatherApiKey?: string;
}

export function useEnergyData(options: UseEnergyDataOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 60000, // 60 seconds (reduced from 30)
    forecastHours = 12,
    historicalDays = 7,
    systemMode = 'online',
    weatherApiKey = ''
  } = options;

  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const [state, setState] = useState<EnergyDataState>({
    currentData: null,
    forecastData: [],
    historicalData: [],
    metrics: null,
    recommendations: [],
    alerts: [],
    isLoading: true,
    error: null,
    lastUpdated: null,
    weatherData: null,
    energyPrediction: null,
    iotData: null,
    systemMode
  });

  // Initialize weather-based simulator with mode and API key
  useEffect(() => {
    weatherBasedEnergySimulator.setMode(systemMode, weatherApiKey);
  }, [systemMode, weatherApiKey]);

  // Update current data and derived metrics with weather integration
  const updateCurrentData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get enhanced weather-based energy data
      const enhancedData = weatherBasedEnergySimulator.generateEnhancedEnergyData();
      const currentData = enhancedData.energyData;
      
      // Get traditional metrics
      const metrics = energyDataService.getCurrentMetrics(currentData);
      
      // Get weather-based recommendations
      const weatherRecommendations = weatherBasedEnergySimulator.generateSmartRecommendations(
        currentData, 
        enhancedData.weatherData, 
        enhancedData.prediction
      );
      
      // Get traditional alerts
      const alerts = energyDataService.getAlerts(currentData);

      setState(prev => ({
        ...prev,
        currentData,
        metrics,
        recommendations: weatherRecommendations,
        alerts,
        weatherData: enhancedData.weatherData,
        energyPrediction: enhancedData.prediction,
        iotData: enhancedData.iotData,
        systemMode: enhancedData.mode,
        isLoading: false,
        lastUpdated: new Date()
      }));

    } catch (error) {
      console.error('Error updating current data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch current data',
        isLoading: false
      }));
    }
  }, [systemMode, weatherApiKey]);

  // Update forecast data
  const updateForecastData = useCallback(async () => {
    try {
      const forecastData = await energyDataService.getForecastData(forecastHours);
      
      setState(prev => ({
        ...prev,
        forecastData
      }));

    } catch (error) {
      console.error('Error updating forecast data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch forecast data'
      }));
    }
  }, [forecastHours]);

  // Update historical data
  const updateHistoricalData = useCallback(async () => {
    try {
      const historicalData = await energyDataService.getHistoricalData(historicalDays);
      
      setState(prev => ({
        ...prev,
        historicalData
      }));

    } catch (error) {
      console.error('Error updating historical data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch historical data'
      }));
    }
  }, [historicalDays]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    await Promise.all([
      updateCurrentData(),
      updateForecastData(),
      updateHistoricalData()
    ]);
  }, [updateCurrentData, updateForecastData, updateHistoricalData]);

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Change system mode (online/offline)
  const setSystemMode = useCallback((mode: SystemMode, apiKey?: string) => {
    weatherBasedEnergySimulator.setMode(mode, apiKey);
    setState(prev => ({ ...prev, systemMode: mode }));
    updateCurrentData(); // Refresh data with new mode
  }, [updateCurrentData]);

  // WebSocket integration for real-time updates
  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect().catch(console.error);

    // Subscribe to connection status
    const unsubscribeConnection = websocketService.on('connection_status', (message) => {
      console.log('WebSocket connection status:', message.data.connected);
      setIsWebSocketConnected(message.data.connected);
    });

    // Subscribe to real-time energy data updates
    const unsubscribeEnergyData = websocketService.on('energy_data_update', (message) => {
      const newData = message.data as EnergyData;
      const newMetrics = energyDataService.getCurrentMetrics(newData);
      const newRecommendations = energyDataService.getRecommendations(newData);
      const newAlerts = energyDataService.getAlerts(newData);

      console.log('WebSocket: Received energy data update', new Date().toLocaleTimeString());

      setState(prev => ({
        ...prev,
        currentData: newData,
        metrics: newMetrics,
        recommendations: newRecommendations,
        alerts: newAlerts,
        lastUpdated: new Date(),
        error: null
      }));
    });

    // Subscribe to system alerts
    const unsubscribeAlerts = websocketService.on('system_alert', (message) => {
      setState(prev => ({
        ...prev,
        alerts: [...prev.alerts, message.data]
      }));
    });

    return () => {
      unsubscribeConnection();
      unsubscribeEnergyData();
      unsubscribeAlerts();
      websocketService.disconnect();
    };
  }, []);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        updateCurrentData(),
        updateForecastData(),
        updateHistoricalData()
      ]);
    };
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array for initial load only

  // Auto refresh setup (only when WebSocket is not connected)
  useEffect(() => {
    if (!autoRefresh || isWebSocketConnected) return;

    console.log('Starting fallback polling (WebSocket disconnected)');
    
    const interval = setInterval(() => {
      updateCurrentData();
      // Update forecast data less frequently (every 5 minutes)
      if (Date.now() % (5 * 60 * 1000) < refreshInterval) {
        updateForecastData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isWebSocketConnected, updateCurrentData, updateForecastData]);

  // Return state and control functions
  return {
    ...state,
    isWebSocketConnected,
    refresh,
    clearError,
    updateCurrentData,
    updateForecastData,
    updateHistoricalData,
    setSystemMode
  };
}

// Specialized hooks for specific data types
export function useCurrentEnergyData(refreshInterval = 30000, systemMode: SystemMode = 'online') {
  const { 
    currentData, 
    metrics, 
    recommendations, 
    alerts, 
    isLoading, 
    error, 
    refresh, 
    isWebSocketConnected,
    weatherData,
    energyPrediction,
    iotData,
    setSystemMode
  } = useEnergyData({
    autoRefresh: true,
    refreshInterval,
    forecastHours: 6, // Minimal forecast for current data hook
    historicalDays: 1,   // Minimal historical for current data hook
    systemMode
  });

  return {
    currentData,
    metrics,
    recommendations,
    alerts,
    isLoading,
    error,
    refresh,
    isWebSocketConnected,
    weatherData,
    energyPrediction,
    iotData,
    systemMode,
    setSystemMode
  };
}

export function useForecastData(hours = 12) {
  const { forecastData, isLoading, error, updateForecastData } = useEnergyData({
    autoRefresh: false, // Manual control for forecast
    forecastHours: hours,
    historicalDays: 1
  });

  return {
    forecastData,
    isLoading,
    error,
    refresh: updateForecastData
  };
}

export function useHistoricalData(days = 7) {
  const { historicalData, isLoading, error, updateHistoricalData } = useEnergyData({
    autoRefresh: false, // Manual control for historical data
    forecastHours: 6,
    historicalDays: days
  });

  return {
    historicalData,
    isLoading,
    error,
    refresh: updateHistoricalData
  };
}

// Specialized hook for weather-based energy forecasting
export function useWeatherBasedEnergyData(mode: SystemMode = 'online', apiKey?: string) {
  const { 
    currentData,
    weatherData,
    energyPrediction,
    iotData,
    systemMode,
    setSystemMode,
    isLoading,
    error,
    refresh
  } = useEnergyData({
    autoRefresh: true,
    refreshInterval: 30000,
    systemMode: mode,
    weatherApiKey: apiKey
  });

  return {
    currentData,
    weatherData,
    energyPrediction,
    iotData,
    systemMode,
    setSystemMode,
    isLoading,
    error,
    refresh
  };
}