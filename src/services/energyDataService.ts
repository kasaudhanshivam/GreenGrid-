// Energy Data Service - Handles all data operations
// This service will be connected to real APIs in production

import { energySimulator, EnergyData, CurrentMetrics } from '../utils/energyData';

export interface ApiEndpoints {
  currentData: string;
  forecastData: string;
  historicalData: string;
  weatherData: string;
  meterReadings: string;
  batteryStatus: string;
}

export class EnergyDataService {
  private static instance: EnergyDataService;
  private useSimulatedData = true; // Set to false when connecting to real APIs
  
  // API Configuration - Update these URLs when connecting to real systems
  private apiEndpoints: ApiEndpoints = {
    currentData: '/api/energy/current',
    forecastData: '/api/energy/forecast',
    historicalData: '/api/energy/historical',
    weatherData: '/api/weather/current',
    meterReadings: '/api/meters/readings',
    batteryStatus: '/api/battery/status'
  };

  private constructor() {}

  static getInstance(): EnergyDataService {
    if (!EnergyDataService.instance) {
      EnergyDataService.instance = new EnergyDataService();
    }
    return EnergyDataService.instance;
  }

  // Toggle between simulated and real API data
  setDataSource(useSimulated: boolean) {
    this.useSimulatedData = useSimulated;
  }

  // Get current energy data
  async getCurrentData(): Promise<EnergyData> {
    if (this.useSimulatedData) {
      // SIMULATED DATA - Remove this section when connecting to real APIs
      return energySimulator.generateCurrentData();
    }

    // REAL API INTEGRATION - Uncomment and configure when ready
    /*
    try {
      const response = await fetch(this.apiEndpoints.currentData, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ENERGY_API_TOKEN}` // Configure in environment
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform API response to match EnergyData interface
      return {
        timestamp: data.timestamp || new Date().toISOString(),
        solar_gen_kW: data.solarGeneration || 0,
        wind_gen_kW: data.windGeneration || 0,
        load_demand_kW: data.loadDemand || 0,
        battery_soc_percent: data.batteryLevel || 0,
        grid_import_kW: data.gridImport || 0,
        grid_export_kW: data.gridExport || 0,
        weather: data.weather || 'Unknown',
        forecast: data.forecast || 'Balanced',
        temperature: data.temperature || 25,
        carbon_saved_kg: data.carbonSaved || 0
      } as EnergyData;

    } catch (error) {
      console.error('Error fetching current energy data:', error);
      // Fallback to simulated data on API failure
      return energySimulator.generateCurrentData();
    }
    */

    // Fallback for development
    return energySimulator.generateCurrentData();
  }

  // Get forecast data
  async getForecastData(hours: number = 12): Promise<EnergyData[]> {
    if (this.useSimulatedData) {
      // SIMULATED DATA - Remove this section when connecting to real APIs
      return energySimulator.generateForecastData(hours);
    }

    // REAL API INTEGRATION - Uncomment and configure when ready
    /*
    try {
      const response = await fetch(`${this.apiEndpoints.forecastData}?hours=${hours}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ENERGY_API_TOKEN}`
        }
      });

      if (!response.ok) {
        throw new Error(`Forecast API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform and validate forecast data
      return data.forecast.map((item: any) => ({
        timestamp: item.timestamp,
        solar_gen_kW: item.solarGeneration || 0,
        wind_gen_kW: item.windGeneration || 0,
        load_demand_kW: item.loadDemand || 0,
        battery_soc_percent: item.batteryLevel || 0,
        grid_import_kW: item.gridImport || 0,
        grid_export_kW: item.gridExport || 0,
        weather: item.weather || 'Unknown',
        forecast: item.forecast || 'Balanced',
        temperature: item.temperature || 25,
        carbon_saved_kg: item.carbonSaved || 0
      })) as EnergyData[];

    } catch (error) {
      console.error('Error fetching forecast data:', error);
      return energySimulator.generateForecastData(hours);
    }
    */

    // Fallback for development
    return energySimulator.generateForecastData(hours);
  }

  // Get historical data
  async getHistoricalData(days: number = 7): Promise<EnergyData[]> {
    if (this.useSimulatedData) {
      // SIMULATED DATA - Remove this section when connecting to real APIs
      return energySimulator.generateHistoricalData(days);
    }

    // REAL API INTEGRATION - Uncomment and configure when ready
    /*
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const response = await fetch(
        `${this.apiEndpoints.historicalData}?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ENERGY_API_TOKEN}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Historical API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.historical.map((item: any) => ({
        timestamp: item.timestamp,
        solar_gen_kW: item.solarGeneration || 0,
        wind_gen_kW: item.windGeneration || 0,
        load_demand_kW: item.loadDemand || 0,
        battery_soc_percent: item.batteryLevel || 0,
        grid_import_kW: item.gridImport || 0,
        grid_export_kW: item.gridExport || 0,
        weather: item.weather || 'Unknown',
        forecast: item.forecast || 'Balanced',
        temperature: item.temperature || 25,
        carbon_saved_kg: item.carbonSaved || 0
      })) as EnergyData[];

    } catch (error) {
      console.error('Error fetching historical data:', error);
      return energySimulator.generateHistoricalData(days);
    }
    */

    // Fallback for development
    return energySimulator.generateHistoricalData(days);
  }

  // Get current metrics
  getCurrentMetrics(data: EnergyData): CurrentMetrics {
    return energySimulator.getCurrentMetrics(data);
  }

  // Get recommendations
  getRecommendations(data: EnergyData): Array<{
    message: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
    action?: string;
    acknowledged?: boolean;
  }> {
    return energySimulator.getRecommendations(data);
  }

  // Get alerts
  getAlerts(data: EnergyData): Array<{type: 'warning' | 'error' | 'info', message: string}> {
    return energySimulator.getAlerts(data);
  }

  // Weather API integration
  async getWeatherData(): Promise<any> {
    if (this.useSimulatedData) {
      return {
        temperature: 30 + Math.random() * 10,
        humidity: 40 + Math.random() * 30,
        windSpeed: 5 + Math.random() * 15,
        solarIrradiance: 800 + Math.random() * 200,
        condition: 'Sunny'
      };
    }

    // REAL WEATHER API INTEGRATION - Uncomment when ready
    /*
    try {
      const response = await fetch(this.apiEndpoints.weatherData, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WEATHER_API_TOKEN}`
        }
      });

      if (!response.ok) {
        throw new Error(`Weather API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
    */

    return null;
  }

  // Update API endpoints configuration
  updateApiEndpoints(endpoints: Partial<ApiEndpoints>) {
    this.apiEndpoints = { ...this.apiEndpoints, ...endpoints };
  }

  // Health check for API connectivity
  async checkApiHealth(): Promise<boolean> {
    if (this.useSimulatedData) {
      return true; // Simulated data is always available
    }

    try {
      // Test connection to main API endpoint
      const response = await fetch(`${this.apiEndpoints.currentData}/health`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const energyDataService = EnergyDataService.getInstance();