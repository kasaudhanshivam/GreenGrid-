# API Integration Guide

## Overview

This guide provides detailed instructions for integrating the Campus Energy Platform with real-world energy management systems, inverters, meters, and weather services.

## Current Status

🚧 **Development Mode**: The platform currently uses simulated data for demonstration and development purposes. All real API integration code is prepared but commented out in the service layer.

## Integration Architecture

```
Energy Hardware → Data Collection APIs → Platform Service Layer → User Interface
                                     ↓
                               Database Storage
```

## Service Layer Structure

### Primary Service File
- **Location**: `/services/energyDataService.ts`
- **Purpose**: Centralized data management and API integration
- **Pattern**: Singleton service with fallback mechanisms

### Configuration
```typescript
// Toggle between simulated and real data
energyDataService.setDataSource(false); // false = real APIs, true = simulated
```

## API Endpoints Configuration

### Required Endpoints

1. **Current Energy Data**: `/api/energy/current`
2. **Forecast Data**: `/api/energy/forecast?hours={hours}`
3. **Historical Data**: `/api/energy/historical?start={start}&end={end}`
4. **Weather Data**: `/api/weather/current`
5. **Meter Readings**: `/api/meters/readings`
6. **Battery Status**: `/api/battery/status`

### Update Endpoints
```typescript
energyDataService.updateApiEndpoints({
  currentData: 'https://your-energy-api.com/current',
  forecastData: 'https://your-energy-api.com/forecast',
  // ... other endpoints
});
```

## Data Format Requirements

### Energy Data Response Format
All API responses must be transformed to match this interface:

```typescript
interface EnergyData {
  timestamp: string;           // ISO 8601 format
  solar_gen_kW: number;       // Solar generation in kW
  wind_gen_kW: number;        // Wind generation in kW  
  load_demand_kW: number;     // Current load in kW
  battery_soc_percent: number; // Battery state of charge (0-100)
  grid_import_kW: number;     // Grid import in kW
  grid_export_kW: number;     // Grid export in kW
  weather: string;            // Weather condition
  forecast: 'Surplus' | 'Deficit' | 'Balanced';
  temperature: number;        // Temperature in Celsius
  carbon_saved_kg: number;    // Carbon savings in kg
}
```

## Step-by-Step Integration

### Step 1: Prepare Your APIs

Ensure your energy management system provides RESTful APIs with:
- JSON response format
- Authentication support (Bearer tokens recommended)
- CORS headers for web access
- Rate limiting considerations

### Step 2: Environment Setup

Add API credentials to your environment:
```env
# Energy System API
ENERGY_API_TOKEN=your_energy_system_api_token
ENERGY_API_BASE_URL=https://your-energy-api.com

# Weather Service API  
WEATHER_API_TOKEN=your_weather_service_api_token
WEATHER_API_BASE_URL=https://api.openweathermap.org

# Meter Reading API
METER_API_TOKEN=your_meter_api_token
METER_API_BASE_URL=https://your-meter-system.com/api
```

### Step 3: Uncomment Integration Code

In `/services/energyDataService.ts`, uncomment the API integration sections:

```typescript
// REAL API INTEGRATION - Uncomment when ready
async getCurrentData(): Promise<EnergyData> {
  if (this.useSimulatedData) {
    return energySimulator.generateCurrentData();
  }

  try {
    const response = await fetch(this.apiEndpoints.currentData, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ENERGY_API_TOKEN}`
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
}
```

### Step 4: Configure Data Transformation

Adapt the data transformation logic to match your API response format:

```typescript
// Example: SMA Solar Inverter API Response
const smaResponse = {
  "6100_40263F00": 5420,  // DC Power
  "6380_40251E00": 5200,  // AC Power
  "6400_00462400": 98.5   // Efficiency
};

// Transform to platform format
const transformedData = {
  timestamp: new Date().toISOString(),
  solar_gen_kW: smaResponse["6380_40251E00"] / 1000, // Convert W to kW
  // ... other mappings
};
```

### Step 5: Test Integration

1. **Health Check**: Use the built-in health check function
```typescript
const isHealthy = await energyDataService.checkApiHealth();
console.log('API Status:', isHealthy ? 'Connected' : 'Disconnected');
```

2. **Data Validation**: Verify data format and completeness
3. **Error Handling**: Test fallback mechanisms
4. **Performance**: Monitor response times and rate limits

## Common Integration Patterns

### Solar Inverter Integration

#### SMA Sunny Central
```typescript
// SMA WebConnect API
const smaEndpoint = 'http://inverter-ip/dyn/getDashValues.json';
const response = await fetch(smaEndpoint, {
  headers: { 'Authorization': 'Basic ' + btoa('user:password') }
});
```

#### Fronius IG Plus
```typescript
// Fronius Solar API
const froniusEndpoint = 'http://fronius-ip/solar_api/v1/GetPowerFlowRealtimeData.fcgi';
const response = await fetch(froniusEndpoint);
const data = await response.json();
const solarPower = data.Body.Data.Site.P_PV / 1000; // Convert to kW
```

### Battery Management System Integration

#### Tesla Powerpack
```typescript
// Tesla Energy Gateway API
const teslaEndpoint = 'https://gateway-ip/api/meters/aggregates';
const response = await fetch(teslaEndpoint, {
  headers: { 'Authorization': `Bearer ${teslaToken}` }
});
```

#### LG Chem RESU
```typescript
// LG Chem EMS API
const lgChemEndpoint = 'http://ems-ip/api/battery/status';
const batteryData = await fetch(lgChemEndpoint).then(r => r.json());
const socPercent = batteryData.soc;
```

### Smart Meter Integration

#### Modbus TCP
```typescript
import ModbusRTU from 'modbus-serial';

const client = new ModbusRTU();
await client.connectTCP('meter-ip', 502);
const data = await client.readHoldingRegisters(1000, 10);
const powerReading = data.data[0] / 10; // Scale factor
```

#### MQTT
```typescript
import mqtt from 'mqtt';

const client = mqtt.connect('mqtt://broker-ip:1883');
client.on('message', (topic, message) => {
  if (topic === 'energy/meter/power') {
    const powerData = JSON.parse(message.toString());
    updateEnergyData(powerData);
  }
});
```

## Weather Service Integration

### OpenWeatherMap
```typescript
const weatherEndpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
const weatherData = await fetch(weatherEndpoint).then(r => r.json());

const weatherInfo = {
  temperature: weatherData.main.temp - 273.15, // Convert K to C
  humidity: weatherData.main.humidity,
  windSpeed: weatherData.wind.speed,
  condition: weatherData.weather[0].main
};
```

### Solar Irradiance Data
```typescript
const solarEndpoint = `https://api.solcast.com.au/radiation/forecasts?latitude=${lat}&longitude=${lon}&api_key=${apiKey}`;
const solarData = await fetch(solarEndpoint).then(r => r.json());
const irradiance = solarData.forecasts[0].ghi; // Global Horizontal Irradiance
```

## Error Handling & Resilience

### Retry Mechanism
```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

### Circuit Breaker Pattern
```typescript
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    return this.failureCount >= this.threshold &&
           Date.now() - this.lastFailureTime < this.timeout;
  }
}
```

### Data Validation
```typescript
function validateEnergyData(data: any): EnergyData {
  const validated: EnergyData = {
    timestamp: data.timestamp || new Date().toISOString(),
    solar_gen_kW: Math.max(0, Number(data.solar_gen_kW) || 0),
    wind_gen_kW: Math.max(0, Number(data.wind_gen_kW) || 0),
    load_demand_kW: Math.max(0, Number(data.load_demand_kW) || 0),
    battery_soc_percent: Math.min(100, Math.max(0, Number(data.battery_soc_percent) || 0)),
    grid_import_kW: Math.max(0, Number(data.grid_import_kW) || 0),
    grid_export_kW: Math.max(0, Number(data.grid_export_kW) || 0),
    weather: data.weather || 'Unknown',
    forecast: ['Surplus', 'Deficit', 'Balanced'].includes(data.forecast) ? data.forecast : 'Balanced',
    temperature: Number(data.temperature) || 25,
    carbon_saved_kg: Math.max(0, Number(data.carbon_saved_kg) || 0)
  };

  return validated;
}
```

## Security Considerations

### API Key Management
- Store API keys in environment variables
- Use different keys for development/production
- Rotate keys regularly
- Monitor API usage and rate limits

### Network Security
- Use HTTPS for all API communications
- Implement proper CORS policies
- Consider VPN for internal networks
- Monitor for unusual API access patterns

### Data Protection
- Encrypt sensitive data in transit and at rest
- Implement proper authentication and authorization
- Log access and modifications
- Comply with data protection regulations

## Testing & Validation

### Unit Tests
```typescript
import { energyDataService } from '../services/energyDataService';

describe('EnergyDataService', () => {
  test('should fetch current data successfully', async () => {
    const data = await energyDataService.getCurrentData();
    expect(data).toHaveProperty('timestamp');
    expect(data.solar_gen_kW).toBeGreaterThanOrEqual(0);
  });
});
```

### Integration Tests
```typescript
test('should handle API failures gracefully', async () => {
  // Mock API failure
  jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
  
  const data = await energyDataService.getCurrentData();
  expect(data).toBeDefined(); // Should fallback to simulated data
});
```

### Performance Testing
- Monitor API response times
- Test with various load conditions
- Validate data refresh intervals
- Check memory usage patterns

## Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints updated
- [ ] Authentication tokens set
- [ ] Error handling tested
- [ ] Fallback mechanisms verified
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Documentation updated

## Support & Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify API tokens are correct and not expired
   - Check API endpoint URLs
   - Ensure proper headers are set

2. **Data Format Mismatches**
   - Validate API response structure
   - Check data type conversions
   - Verify unit conversions (W to kW, etc.)

3. **Network Connectivity**
   - Test API endpoints directly (curl/Postman)
   - Check firewall and network configurations
   - Verify CORS settings

### Monitoring & Logging

Enable detailed logging for troubleshooting:
```typescript
console.log('API Request:', { url, headers, method });
console.log('API Response:', { status, data });
console.error('API Error:', error);
```

### Getting Help

- Review API documentation from hardware vendors
- Check platform logs for error details
- Contact technical support with specific error messages
- Use the built-in health check functions for diagnostics

---

For additional support, contact: energy-tech@institute.edu