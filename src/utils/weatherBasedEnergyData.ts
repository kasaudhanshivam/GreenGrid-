// Advanced weather-based energy data simulation for renewable energy platform
// Simulates realistic energy patterns for Rajasthan climate with online/offline modes

export interface WeatherData {
  condition: 'sunny' | 'partly_cloudy' | 'cloudy' | 'dusty' | 'rainy' | 'clear_night';
  temperature: number; // Celsius
  humidity: number; // Percentage
  windSpeed: number; // m/s
  cloudCover: number; // Percentage (0-100)
  uvIndex: number; // 0-11
  visibility: number; // km
  forecast: {
    next1h: { condition: string; temperature: number; windSpeed: number; cloudCover: number };
    next6h: { condition: string; temperature: number; windSpeed: number; cloudCover: number };
    next24h: { condition: string; temperature: number; windSpeed: number; cloudCover: number };
  };
}

export interface EnergyPrediction {
  solarEfficiency: number; // 0-1 (factor of max generation)
  windEfficiency: number; // 0-1 (factor of max generation)
  loadMultiplier: number; // Expected load factor based on weather
  batteryOptimalCharge: number; // Recommended battery level for next 24h
  recommendation: 'charge_now' | 'discharge_now' | 'maintain' | 'prepare_for_peak';
}

export interface IoTSensorData {
  panelTemperature: number;
  panelTilt: number;
  windTurbineRPM: number;
  ambientLight: number; // Lux
  batteryVoltage: number;
  inverterEfficiency: number;
  loadPowerFactor: number;
}

export type SystemMode = 'online' | 'offline';

export class WeatherBasedEnergySimulator {
  private mode: SystemMode = 'online';
  private historicalWeatherPattern: number[] = [];
  private lastIoTUpdate: Date = new Date();
  private weatherApiKey: string = '';
  private location = { lat: 26.9124, lon: 75.7873 }; // Jaipur, Rajasthan
  
  // Seasonal patterns for Rajasthan
  private rajashtanSeasonalFactors = {
    winter: { months: [12, 1, 2], solarBoost: 0.9, heatLoad: 0.3 },
    summer: { months: [3, 4, 5, 6], solarBoost: 1.1, heatLoad: 1.5 },
    monsoon: { months: [7, 8, 9], solarBoost: 0.6, heatLoad: 0.8 },
    postMonsoon: { months: [10, 11], solarBoost: 1.0, heatLoad: 0.9 }
  };

  constructor(mode: SystemMode = 'online', apiKey: string = '') {
    this.mode = mode;
    this.weatherApiKey = apiKey;
    this.initializeHistoricalPattern();
  }

  setMode(mode: SystemMode, apiKey?: string) {
    this.mode = mode;
    if (apiKey) this.weatherApiKey = apiKey;
  }

  private initializeHistoricalPattern() {
    // Initialize with 30 days of weather pattern history
    for (let i = 0; i < 720; i++) { // 30 days * 24 hours
      this.historicalWeatherPattern.push(Math.random());
    }
  }

  private getCurrentSeason(): keyof typeof this.rajashtanSeasonalFactors {
    const month = new Date().getMonth() + 1;
    if (this.rajashtanSeasonalFactors.winter.months.includes(month)) return 'winter';
    if (this.rajashtanSeasonalFactors.summer.months.includes(month)) return 'summer';
    if (this.rajashtanSeasonalFactors.monsoon.months.includes(month)) return 'monsoon';
    return 'postMonsoon';
  }

  private generateRealisticWeatherData(hour: number): WeatherData {
    const season = this.getCurrentSeason();
    const seasonData = this.rajashtanSeasonalFactors[season];
    
    // Temperature follows realistic daily and seasonal patterns
    const baseTemp = this.getSeasonalBaseTemperature(season);
    const dailyVariation = Math.sin((hour - 6) / 12 * Math.PI) * this.getTemperatureRange(season);
    const temperature = baseTemp + dailyVariation + (Math.random() - 0.5) * 3;

    // Cloud cover affects solar generation significantly
    let cloudCover: number;
    let condition: WeatherData['condition'];
    
    if (season === 'monsoon') {
      cloudCover = 60 + Math.random() * 40; // 60-100% clouds during monsoon
      condition = cloudCover > 80 ? 'cloudy' : 'partly_cloudy';
      if (Math.random() < 0.3) condition = 'rainy';
    } else if (season === 'summer') {
      cloudCover = Math.random() * 30; // 0-30% clouds in summer
      condition = cloudCover < 10 ? 'sunny' : cloudCover < 20 ? 'partly_cloudy' : 'dusty';
    } else {
      cloudCover = Math.random() * 50; // 0-50% clouds
      condition = cloudCover < 15 ? 'sunny' : cloudCover < 35 ? 'partly_cloudy' : 'cloudy';
    }

    if (hour < 6 || hour > 19) {
      condition = 'clear_night';
    }

    // Wind speed patterns (higher in summer, moderate in other seasons)
    const windSpeed = season === 'summer' ? 
      (3 + Math.random() * 8) : // 3-11 m/s in summer
      (2 + Math.random() * 5);   // 2-7 m/s otherwise

    // Humidity varies by season
    const humidity = season === 'monsoon' ? 
      (70 + Math.random() * 25) : // 70-95% in monsoon
      season === 'summer' ? 
        (20 + Math.random() * 30) : // 20-50% in summer
        (40 + Math.random() * 35);   // 40-75% otherwise

    const uvIndex = condition === 'sunny' ? 
      Math.min(11, 6 + Math.sin((hour - 6) / 12 * Math.PI) * 5) : 
      condition === 'partly_cloudy' ? 
        Math.min(8, 4 + Math.sin((hour - 6) / 12 * Math.PI) * 3) : 2;

    const visibility = condition === 'dusty' ? 2 + Math.random() * 3 : 
                      condition === 'rainy' ? 1 + Math.random() * 2 : 
                      8 + Math.random() * 7;

    // Ensure forecast is always properly generated
    const forecast = this.generateShortTermForecast(hour, season);
    
    return {
      condition,
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity * 10) / 10,
      windSpeed: Math.round(windSpeed * 10) / 10,
      cloudCover: Math.round(cloudCover * 10) / 10,
      uvIndex: Math.round(uvIndex * 10) / 10,
      visibility: Math.round(visibility * 10) / 10,
      forecast
    };
  }

  private getSeasonalBaseTemperature(season: keyof typeof this.rajashtanSeasonalFactors): number {
    switch (season) {
      case 'winter': return 18; // Base 18°C in winter
      case 'summer': return 35; // Base 35°C in summer
      case 'monsoon': return 28; // Base 28°C in monsoon
      case 'postMonsoon': return 25; // Base 25°C post-monsoon
    }
  }

  private getTemperatureRange(season: keyof typeof this.rajashtanSeasonalFactors): number {
    switch (season) {
      case 'winter': return 8; // ±8°C daily variation
      case 'summer': return 12; // ±12°C daily variation
      case 'monsoon': return 6; // ±6°C daily variation
      case 'postMonsoon': return 9; // ±9°C daily variation
    }
  }

  private generateShortTermForecast(currentHour: number, season: keyof typeof this.rajashtanSeasonalFactors) {
    const baseTemp = this.getSeasonalBaseTemperature(season);
    const tempRange = this.getTemperatureRange(season);
    
    // Generate more realistic forecast conditions
    const getConditionForHour = (hour: number) => {
      if (season === 'monsoon') {
        return Math.random() < 0.4 ? 'rainy' : 'cloudy';
      }
      if (season === 'summer') {
        return Math.random() < 0.7 ? 'sunny' : 'dusty';
      }
      return Math.random() < 0.6 ? 'sunny' : 'partly_cloudy';
    };
    
    return {
      next1h: {
        condition: getConditionForHour(currentHour + 1),
        temperature: Math.round((baseTemp + Math.sin((currentHour + 1 - 6) / 12 * Math.PI) * tempRange) * 10) / 10,
        windSpeed: Math.round((3 + Math.random() * 5) * 10) / 10,
        cloudCover: Math.round((20 + Math.random() * 40) * 10) / 10
      },
      next6h: {
        condition: getConditionForHour(currentHour + 6),
        temperature: Math.round((baseTemp + Math.sin((currentHour + 6 - 6) / 12 * Math.PI) * tempRange) * 10) / 10,
        windSpeed: Math.round((4 + Math.random() * 6) * 10) / 10,
        cloudCover: Math.round((10 + Math.random() * 30) * 10) / 10
      },
      next24h: {
        condition: getConditionForHour(currentHour + 24),
        temperature: Math.round(baseTemp * 10) / 10,
        windSpeed: Math.round((3 + Math.random() * 7) * 10) / 10,
        cloudCover: Math.round((25 + Math.random() * 35) * 10) / 10
      }
    };
  }

  private generateIoTSensorData(weather: WeatherData): IoTSensorData {
    // Simulate realistic IoT sensor readings
    const panelTemperature = weather.temperature + 15 + (weather.uvIndex * 2); // Panels heat up
    const ambientLight = weather.condition === 'sunny' ? 80000 + Math.random() * 20000 :
                        weather.condition === 'partly_cloudy' ? 40000 + Math.random() * 30000 :
                        weather.condition === 'cloudy' ? 10000 + Math.random() * 15000 : 500;

    return {
      panelTemperature: Math.round(panelTemperature * 10) / 10,
      panelTilt: 30, // Fixed tilt for Rajasthan latitude
      windTurbineRPM: Math.round(weather.windSpeed * 25 + Math.random() * 50),
      ambientLight: Math.round(ambientLight),
      batteryVoltage: 48.0 + (Math.random() - 0.5) * 2, // 48V system ±1V
      inverterEfficiency: 94 + Math.random() * 4, // 94-98% efficiency
      loadPowerFactor: 0.85 + Math.random() * 0.1 // 0.85-0.95 power factor
    };
  }

  predictEnergyEfficiency(weather: WeatherData, iotData?: IoTSensorData): EnergyPrediction {
    const season = this.getCurrentSeason();
    const seasonData = this.rajashtanSeasonalFactors[season];

    // Solar efficiency calculation based on multiple factors
    let solarEfficiency = 1.0;
    
    // Cloud cover impact (most significant)
    solarEfficiency *= (100 - weather.cloudCover) / 100;
    
    // Temperature impact (panels lose efficiency when hot)
    const optimalTemp = 25; // Optimal panel temperature
    const tempDerating = Math.max(0.7, 1 - (Math.max(0, weather.temperature - optimalTemp) * 0.004));
    solarEfficiency *= tempDerating;
    
    // UV Index correlation
    solarEfficiency *= Math.min(1.0, weather.uvIndex / 8);
    
    // Visibility impact (dust, pollution)
    solarEfficiency *= Math.min(1.0, weather.visibility / 10);
    
    // Seasonal adjustment
    solarEfficiency *= seasonData.solarBoost;
    
    // IoT sensor adjustments if available (offline mode)
    if (iotData) {
      // Panel temperature adjustment
      if (iotData.panelTemperature > 60) {
        solarEfficiency *= 0.9; // Hot panels lose efficiency
      }
      
      // Ambient light correlation
      if (iotData.ambientLight < 20000) {
        solarEfficiency *= 0.8;
      }
    }

    // Wind efficiency calculation
    let windEfficiency = 1.0;
    
    // Wind speed correlation (cubic relationship)
    if (weather.windSpeed < 3) {
      windEfficiency = 0.1; // Cut-in speed not reached
    } else if (weather.windSpeed > 15) {
      windEfficiency = 0.3; // Reduced efficiency at high speeds
    } else {
      // Optimal between 3-15 m/s
      windEfficiency = Math.min(1.0, Math.pow(weather.windSpeed / 12, 2));
    }
    
    // Temperature impact on wind (air density)
    windEfficiency *= 1 + (25 - weather.temperature) * 0.005;

    // Load multiplier based on weather (cooling/heating needs)
    let loadMultiplier = 1.0;
    
    // Temperature impact on load
    if (weather.temperature > 30) {
      // AC load increases exponentially with temperature
      loadMultiplier = 1 + Math.pow((weather.temperature - 30) / 10, 1.5) * seasonData.heatLoad;
    } else if (weather.temperature < 15) {
      // Heating load in winter
      loadMultiplier = 1 + (15 - weather.temperature) * 0.1 * seasonData.heatLoad;
    }
    
    // Humidity impact (dehumidification load)
    if (weather.humidity > 70) {
      loadMultiplier *= 1 + (weather.humidity - 70) * 0.005;
    }

    // Battery optimization strategy
    const batteryOptimalCharge = this.calculateOptimalBatteryLevel(weather, solarEfficiency, windEfficiency, loadMultiplier);
    
    // Recommendation based on predictions
    const recommendation = this.generateActionRecommendation(
      solarEfficiency, 
      windEfficiency, 
      loadMultiplier, 
      weather
    );

    return {
      solarEfficiency: Math.max(0, Math.min(1, solarEfficiency)),
      windEfficiency: Math.max(0, Math.min(1, windEfficiency)),
      loadMultiplier: Math.max(0.3, Math.min(2.5, loadMultiplier)),
      batteryOptimalCharge,
      recommendation
    };
  }

  private calculateOptimalBatteryLevel(
    weather: WeatherData, 
    solarEff: number, 
    windEff: number, 
    loadMult: number
  ): number {
    // Ensure forecast exists
    if (!weather.forecast) {
      return 60; // Default safe level
    }

    try {
      // Use simplified efficiency calculations for forecast without recursion
      const forecastEfficiencies = [
        this.calculateSimplifiedEfficiency(weather.forecast.next1h, weather),
        this.calculateSimplifiedEfficiency(weather.forecast.next6h, weather),
        this.calculateSimplifiedEfficiency(weather.forecast.next24h, weather)
      ];

      const avgFutureGeneration = forecastEfficiencies.reduce((acc, eff) => 
        acc + (eff.solarEff + eff.windEff) / 2, 0) / 3;
      
      const avgFutureLoad = forecastEfficiencies.reduce((acc, eff) => 
        acc + eff.loadMult, 0) / 3;

      // If future generation looks poor, charge battery now
      if (avgFutureGeneration < 0.4) {
        return Math.min(95, 70 + (1 - avgFutureGeneration) * 25);
      }
      
      // If future load will be high, prepare battery
      if (avgFutureLoad > 1.3) {
        return Math.min(90, 60 + (avgFutureLoad - 1) * 30);
      }
      
      // Normal conditions
      return Math.max(40, Math.min(80, 60 + (avgFutureGeneration - avgFutureLoad) * 20));
    } catch (error) {
      console.warn('Error calculating optimal battery level:', error);
      return 60; // Default safe level
    }
  }

  // Simplified efficiency calculation to avoid recursion
  private calculateSimplifiedEfficiency(forecastData: any, currentWeather: WeatherData): {
    solarEff: number;
    windEff: number;
    loadMult: number;
  } {
    const season = this.getCurrentSeason();
    const seasonData = this.rajashtanSeasonalFactors[season];

    // Solar efficiency calculation
    let solarEfficiency = 1.0;
    solarEfficiency *= (100 - forecastData.cloudCover) / 100;
    const optimalTemp = 25;
    const tempDerating = Math.max(0.7, 1 - (Math.max(0, forecastData.temperature - optimalTemp) * 0.004));
    solarEfficiency *= tempDerating;
    solarEfficiency *= seasonData.solarBoost;

    // Wind efficiency calculation
    let windEfficiency = 1.0;
    if (forecastData.windSpeed < 3) {
      windEfficiency = 0.1;
    } else if (forecastData.windSpeed > 15) {
      windEfficiency = 0.3;
    } else {
      windEfficiency = Math.min(1.0, Math.pow(forecastData.windSpeed / 12, 2));
    }
    windEfficiency *= 1 + (25 - forecastData.temperature) * 0.005;

    // Load multiplier
    let loadMultiplier = 1.0;
    if (forecastData.temperature > 30) {
      loadMultiplier = 1 + Math.pow((forecastData.temperature - 30) / 10, 1.5) * seasonData.heatLoad;
    } else if (forecastData.temperature < 15) {
      loadMultiplier = 1 + (15 - forecastData.temperature) * 0.1 * seasonData.heatLoad;
    }

    return {
      solarEff: Math.max(0, Math.min(1, solarEfficiency)),
      windEff: Math.max(0, Math.min(1, windEfficiency)),
      loadMult: Math.max(0.3, Math.min(2.5, loadMultiplier))
    };
  }

  private generateActionRecommendation(
    solarEff: number, 
    windEff: number, 
    loadMult: number, 
    weather: WeatherData
  ): EnergyPrediction['recommendation'] {
    const totalRenewableEff = (solarEff + windEff) / 2;
    
    // High renewable generation, low load
    if (totalRenewableEff > 0.7 && loadMult < 1.2) {
      return 'charge_now';
    }
    
    // Low renewable generation, high load expected
    if (totalRenewableEff < 0.3 || loadMult > 1.5) {
      return 'prepare_for_peak';
    }
    
    // Current generation insufficient for load
    if (totalRenewableEff < loadMult * 0.6) {
      return 'discharge_now';
    }
    
    return 'maintain';
  }

  generateEnhancedEnergyData(): {
    energyData: any;
    weatherData: WeatherData;
    prediction: EnergyPrediction;
    iotData?: IoTSensorData;
    mode: SystemMode;
  } {
    try {
      const now = new Date();
      const hour = now.getHours();
      
      // Generate weather data (real or simulated based on mode)
      const weatherData = this.mode === 'online' && this.weatherApiKey ? 
        this.generateRealisticWeatherData(hour) : // In real implementation, fetch from API
        this.generateRealisticWeatherData(hour);
      
      // Validate weather data structure
      if (!weatherData || !weatherData.forecast) {
        throw new Error('Invalid weather data generated');
      }
      
      // Generate IoT data for offline mode
      const iotData = this.mode === 'offline' ? 
        this.generateIoTSensorData(weatherData) : undefined;
      
      // Get energy efficiency predictions
      const prediction = this.predictEnergyEfficiency(weatherData, iotData);
      
      // Generate energy data using predictions
      const maxSolarCapacity = 300; // kW
      const maxWindCapacity = 100; // kW
      const baseLoad = 200; // kW
      
      const solar_gen_kW = maxSolarCapacity * prediction.solarEfficiency * 
        this.getDaytimeFactor(hour);
      
      const wind_gen_kW = maxWindCapacity * prediction.windEfficiency;
      
      const load_demand_kW = baseLoad * prediction.loadMultiplier * 
        this.getLoadPattern(hour);
      
      const totalGeneration = solar_gen_kW + wind_gen_kW;
      const energyBalance = totalGeneration - load_demand_kW;
      
      // Calculate grid usage
      const grid_import_kW = Math.max(0, -energyBalance);
      const grid_export_kW = Math.max(0, energyBalance);
      
      // Battery management based on recommendations
      const battery_soc_percent = this.calculateBatteryLevel(
        energyBalance, 
        prediction.batteryOptimalCharge, 
        prediction.recommendation
      );
      
      const energyData = {
        timestamp: now.toISOString(),
        solar_gen_kW: Math.round(solar_gen_kW * 100) / 100,
        wind_gen_kW: Math.round(wind_gen_kW * 100) / 100,
        load_demand_kW: Math.round(load_demand_kW * 100) / 100,
        battery_soc_percent: Math.round(battery_soc_percent * 100) / 100,
        grid_import_kW: Math.round(grid_import_kW * 100) / 100,
        grid_export_kW: Math.round(grid_export_kW * 100) / 100,
        weather: weatherData.condition,
        forecast: energyBalance > 20 ? 'Surplus' : 
                  energyBalance < -20 ? 'Deficit' : 'Balanced',
        temperature: weatherData.temperature,
        carbon_saved_kg: Math.round(totalGeneration * 0.82 * 100) / 100
      };

      return {
        energyData,
        weatherData,
        prediction,
        iotData,
        mode: this.mode
      };
    } catch (error) {
      console.error('Error generating enhanced energy data:', error);
      
      // Return fallback data structure
      const now = new Date();
      const fallbackWeatherData: WeatherData = {
        condition: 'sunny',
        temperature: 30,
        humidity: 50,
        windSpeed: 5,
        cloudCover: 20,
        uvIndex: 6,
        visibility: 10,
        forecast: {
          next1h: { condition: 'sunny', temperature: 30, windSpeed: 5, cloudCover: 20 },
          next6h: { condition: 'sunny', temperature: 32, windSpeed: 6, cloudCover: 15 },
          next24h: { condition: 'partly_cloudy', temperature: 28, windSpeed: 4, cloudCover: 30 }
        }
      };
      
      const fallbackPrediction: EnergyPrediction = {
        solarEfficiency: 0.8,
        windEfficiency: 0.6,
        loadMultiplier: 1.0,
        batteryOptimalCharge: 60,
        recommendation: 'maintain'
      };
      
      return {
        energyData: {
          timestamp: now.toISOString(),
          solar_gen_kW: 200,
          wind_gen_kW: 60,
          load_demand_kW: 180,
          battery_soc_percent: 65,
          grid_import_kW: 0,
          grid_export_kW: 80,
          weather: 'sunny',
          forecast: 'Surplus',
          temperature: 30,
          carbon_saved_kg: 213.2
        },
        weatherData: fallbackWeatherData,
        prediction: fallbackPrediction,
        iotData: this.mode === 'offline' ? this.generateIoTSensorData(fallbackWeatherData) : undefined,
        mode: this.mode
      };
    }
  }

  private getDaytimeFactor(hour: number): number {
    if (hour < 6 || hour > 18) return 0;
    return Math.sin(((hour - 6) / 12) * Math.PI);
  }

  private getLoadPattern(hour: number): number {
    // Rajasthan-specific load pattern (high AC usage in afternoons)
    if (hour < 5) return 0.4;
    if (hour < 8) return 0.6;
    if (hour < 12) return 0.8;
    if (hour < 16) return 1.2; // Peak AC load
    if (hour < 20) return 1.0;
    if (hour < 23) return 0.7;
    return 0.5;
  }

  private batteryLevel = 60; // Persistent battery level
  
  private calculateBatteryLevel(
    energyBalance: number, 
    optimalLevel: number, 
    recommendation: EnergyPrediction['recommendation']
  ): number {
    const chargeRate = 2; // %/hour max charge rate
    const dischargeRate = 1.5; // %/hour max discharge rate
    
    switch (recommendation) {
      case 'charge_now':
        if (energyBalance > 0 && this.batteryLevel < optimalLevel) {
          this.batteryLevel += Math.min(chargeRate, energyBalance * 0.1);
        }
        break;
        
      case 'discharge_now':
        if (energyBalance < 0 && this.batteryLevel > 20) {
          this.batteryLevel -= Math.min(dischargeRate, Math.abs(energyBalance) * 0.05);
        }
        break;
        
      case 'prepare_for_peak':
        // Charge if possible to prepare for high load period
        if (energyBalance > 10 && this.batteryLevel < 90) {
          this.batteryLevel += Math.min(chargeRate * 1.5, energyBalance * 0.08);
        }
        break;
        
      case 'maintain':
      default:
        // Maintain current level with minimal changes
        if (energyBalance > 20 && this.batteryLevel < 80) {
          this.batteryLevel += Math.min(1, energyBalance * 0.03);
        } else if (energyBalance < -20 && this.batteryLevel > 30) {
          this.batteryLevel -= Math.min(1, Math.abs(energyBalance) * 0.02);
        }
        break;
    }
    
    return Math.max(5, Math.min(100, this.batteryLevel));
  }

  generateSmartRecommendations(
    energyData: any, 
    weatherData: WeatherData, 
    prediction: EnergyPrediction
  ): Array<{
    message: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
    action?: string;
    weatherBased: boolean;
  }> {
    const recommendations = [];
    const currentHour = new Date().getHours();
    
    try {
      // Weather-based recommendations with safety checks
      if (weatherData.forecast && weatherData.forecast.next6h && 
          weatherData.forecast.next6h.cloudCover > 70 && 
          energyData.battery_soc_percent < 60) {
        recommendations.push({
          message: `Heavy clouds expected in 6h (${weatherData.forecast.next6h.cloudCover}% cover) - charge battery now`,
          priority: 'high' as const,
          icon: "☁️",
          action: "Enable maximum battery charging while solar is available",
          weatherBased: true
        });
      }
      
      if (weatherData.forecast && weatherData.forecast.next24h && 
          weatherData.forecast.next24h.temperature > 40 && 
          currentHour < 12) {
        recommendations.push({
          message: `Extreme heat expected tomorrow (${weatherData.forecast.next24h.temperature}°C) - prepare for high AC load`,
          priority: 'high' as const,
          icon: "🌡️",
          action: "Charge battery to 90%+ and schedule non-essential loads for night",
          weatherBased: true
        });
      }
    
    if (prediction.windEfficiency > 0.8 && energyData.battery_soc_percent < prediction.batteryOptimalCharge) {
      recommendations.push({
        message: `Excellent wind conditions (${weatherData.windSpeed} m/s) - optimize charging`,
        priority: 'medium' as const,
        icon: "💨",
        action: "Utilize high wind generation for battery charging",
        weatherBased: true
      });
    }
    
    if (weatherData.condition === 'dusty' && prediction.solarEfficiency < 0.6) {
      recommendations.push({
        message: "Dust storm reducing solar efficiency - clean panels when safe",
        priority: 'medium' as const,
        icon: "🌪️",
        action: "Schedule panel cleaning and rely more on wind/battery",
        weatherBased: true
      });
    }
    
    // Prediction-based recommendations
    switch (prediction.recommendation) {
      case 'charge_now':
        recommendations.push({
          message: "Optimal charging window - maximize renewable energy storage",
          priority: 'medium' as const,
          icon: "⚡",
          action: "Switch to maximum charge mode",
          weatherBased: true
        });
        break;
        
      case 'prepare_for_peak':
        recommendations.push({
          message: "High load period approaching - ensure battery readiness",
          priority: 'high' as const,
          icon: "🔋",
          action: `Charge battery to ${prediction.batteryOptimalCharge}%`,
          weatherBased: true
        });
        break;
        
      case 'discharge_now':
        recommendations.push({
          message: "Low renewable generation - use stored battery power",
          priority: 'medium' as const,
          icon: "🔄",
          action: "Switch to battery backup mode",
          weatherBased: true
        });
        break;
    }
    
    // Efficiency-based recommendations
    if (prediction.solarEfficiency < 0.3 && currentHour >= 10 && currentHour <= 16) {
      recommendations.push({
        message: `Solar efficiency very low (${Math.round(prediction.solarEfficiency * 100)}%) during peak hours`,
        priority: 'high' as const,
        icon: "☀️",
        action: "Check for panel obstructions or maintenance needs",
        weatherBased: true
      });
    }
      
      // Default system recommendations if no weather-based ones
      if (recommendations.length === 0) {
        recommendations.push({
          message: `Weather-optimized system running efficiently (${this.mode} mode)`,
          priority: 'low' as const,
          icon: "✅",
          action: "Continue current operation",
          weatherBased: true
        });
      }
      
    } catch (error) {
      console.warn('Error generating smart recommendations:', error);
      
      // Return basic fallback recommendations
      recommendations.push({
        message: "Energy system operating in safe mode",
        priority: 'low' as const,
        icon: "⚠️",
        action: "Manual monitoring recommended",
        weatherBased: false
      });
    }
    
    return recommendations;
  }
}

// Export enhanced simulator instance
export const weatherBasedEnergySimulator = new WeatherBasedEnergySimulator();