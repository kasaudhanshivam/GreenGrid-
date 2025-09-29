// Dynamic energy data simulation for the renewable energy platform

export interface EnergyData {
  timestamp: string;
  solar_gen_kW: number;
  wind_gen_kW: number;
  load_demand_kW: number;
  battery_soc_percent: number;
  grid_import_kW: number;
  grid_export_kW: number;
  weather: string;
  forecast: 'Surplus' | 'Deficit' | 'Balanced';
  temperature: number;
  carbon_saved_kg: number;
}

export interface CurrentMetrics {
  solarGeneration: number;
  windGeneration: number;
  batteryLevel: number;
  gridUsage: number;
  currentLoad: number;
  totalGeneration: number;
  efficiency: number;
}

export class EnergyDataSimulator {
  private currentTime = new Date();
  private batteryTrend = 0; // -1 to 1 for charging/discharging trend
  private weatherPattern = 0; // 0-1 for weather consistency
  private lastValues = {
    solar: 0,
    wind: 0,
    load: 0,
    battery: 50
  };

  private getRealisticVariation(baseValue: number, trend: number = 0): number {
    // Add smooth transitions with realistic variations
    const randomWalk = (Math.random() - 0.5) * 0.1; // Small random changes
    const momentum = trend * 0.05; // Trend influence
    return Math.max(0, baseValue + baseValue * (randomWalk + momentum));
  }

  private getHourlyMultiplier(hour: number, type: 'solar' | 'wind' | 'load'): number {
    switch (type) {
      case 'solar':
        // More realistic solar curve with weather effects
        if (hour < 6 || hour > 18) return 0;
        const solarBase = Math.sin(((hour - 6) / 12) * Math.PI);
        // Add weather variability
        const cloudFactor = 0.7 + 0.3 * Math.sin(this.weatherPattern * Math.PI * 2 + hour);
        return solarBase * cloudFactor;
      
      case 'wind':
        // Wind varies more realistically throughout the day
        const windBase = 0.5 + 0.3 * Math.sin((hour / 24) * 2 * Math.PI);
        const gustFactor = 0.8 + 0.4 * Math.sin((hour * 3 + this.weatherPattern * 10) / 24 * Math.PI);
        return windBase * gustFactor;
      
      case 'load':
        // More realistic load patterns for Rajasthan (hot climate)
        if (hour < 5) return 0.3; // Early morning low
        if (hour < 7) return 0.5; // Morning rise
        if (hour < 10) return 0.7; // Morning peak
        if (hour < 14) return 0.9; // Midday AC load (hot)
        if (hour < 17) return 1.0; // Afternoon peak (hottest)
        if (hour < 20) return 0.8; // Evening
        if (hour < 23) return 0.6; // Night
        return 0.4; // Late night
      
      default:
        return 1;
    }
  }

  generateCurrentData(): EnergyData {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Update weather pattern slowly
    this.weatherPattern += (Math.random() - 0.5) * 0.01;
    this.weatherPattern = Math.max(0, Math.min(1, this.weatherPattern));
    
    const solarMultiplier = this.getHourlyMultiplier(hour, 'solar');
    const windMultiplier = this.getHourlyMultiplier(hour, 'wind');
    const loadMultiplier = this.getHourlyMultiplier(hour, 'load');

    // Generate more realistic values with smooth transitions
    const solar_gen_kW = this.getRealisticVariation(
      this.lastValues.solar * 0.7 + (300 * solarMultiplier) * 0.3
    );
    
    const wind_gen_kW = this.getRealisticVariation(
      this.lastValues.wind * 0.8 + (100 * windMultiplier) * 0.2
    );
    
    const load_demand_kW = this.getRealisticVariation(
      this.lastValues.load * 0.85 + (250 * loadMultiplier) * 0.15
    );
    
    const totalGeneration = solar_gen_kW + wind_gen_kW;
    const energyBalance = totalGeneration - load_demand_kW;
    
    // Realistic battery charging/discharging
    let battery_soc_percent = this.lastValues.battery;
    
    if (energyBalance > 20 && battery_soc_percent < 95) {
      // Charging when surplus
      battery_soc_percent += Math.min(2, energyBalance * 0.05);
      this.batteryTrend = 1;
    } else if (energyBalance < -10 && battery_soc_percent > 10) {
      // Discharging when deficit
      battery_soc_percent -= Math.min(1.5, Math.abs(energyBalance) * 0.03);
      this.batteryTrend = -1;
    } else {
      // Standby
      this.batteryTrend *= 0.9; // Gradual trend decay
    }
    
    battery_soc_percent = Math.max(5, Math.min(100, battery_soc_percent));
    
    const grid_import_kW = Math.max(0, load_demand_kW - totalGeneration - 
      (this.batteryTrend < 0 ? Math.abs(energyBalance) * 0.7 : 0));
    const grid_export_kW = Math.max(0, energyBalance - 
      (this.batteryTrend > 0 ? energyBalance * 0.3 : 0));
    
    // Store for next iteration
    this.lastValues = {
      solar: solar_gen_kW,
      wind: wind_gen_kW,
      load: load_demand_kW,
      battery: battery_soc_percent
    };
    
    const weather = this.getWeatherCondition(hour, this.weatherPattern);
    const forecast = energyBalance > 20 ? 'Surplus' : 
                    energyBalance < -20 ? 'Deficit' : 'Balanced';
    
    const temperature = 28 + Math.sin((hour - 6) / 12 * Math.PI) * 12 + 
                       Math.random() * 3; // Realistic daily temperature curve
    const carbon_saved_kg = Math.round(totalGeneration * 0.82 * 100) / 100;

    return {
      timestamp: now.toISOString(),
      solar_gen_kW: Math.round(solar_gen_kW * 100) / 100,
      wind_gen_kW: Math.round(wind_gen_kW * 100) / 100,
      load_demand_kW: Math.round(load_demand_kW * 100) / 100,
      battery_soc_percent: Math.round(battery_soc_percent * 100) / 100,
      grid_import_kW: Math.round(grid_import_kW * 100) / 100,
      grid_export_kW: Math.round(grid_export_kW * 100) / 100,
      weather,
      forecast: forecast as 'Surplus' | 'Deficit' | 'Balanced',
      temperature: Math.round(temperature * 100) / 100,
      carbon_saved_kg
    };
  }

  generateForecastData(hours: number = 12): EnergyData[] {
    const data: EnergyData[] = [];
    const startTime = new Date();

    for (let i = 0; i < hours; i++) {
      const time = new Date(startTime.getTime() + i * 60 * 60 * 1000);
      const hour = time.getHours();
      
      const solarMultiplier = this.getHourlyMultiplier(hour, 'solar');
      const windMultiplier = this.getHourlyMultiplier(hour, 'wind');
      const loadMultiplier = this.getHourlyMultiplier(hour, 'load');
      
      const baseVariation = () => 0.8 + Math.random() * 0.4;

      const solar_gen_kW = Math.round(250 * solarMultiplier * baseVariation() * 100) / 100;
      const wind_gen_kW = Math.round(80 * windMultiplier * baseVariation() * 100) / 100;
      const load_demand_kW = Math.round(200 * loadMultiplier * baseVariation() * 100) / 100;
      
      const totalGeneration = solar_gen_kW + wind_gen_kW;
      const grid_import_kW = Math.max(0, load_demand_kW - totalGeneration);
      const grid_export_kW = Math.max(0, totalGeneration - load_demand_kW);
      
      const battery_soc_percent = Math.max(20, Math.min(100, 40 + Math.random() * 50));
      
      const weather = this.getWeatherCondition(hour, this.weatherPattern);
      const forecast = totalGeneration > load_demand_kW ? 'Surplus' : 
                      totalGeneration < load_demand_kW * 0.8 ? 'Deficit' : 'Balanced';
      
      const temperature = 25 + Math.random() * 15;
      const carbon_saved_kg = Math.round(totalGeneration * 0.7 * 100) / 100;

      data.push({
        timestamp: time.toISOString(),
        solar_gen_kW,
        wind_gen_kW,
        load_demand_kW,
        battery_soc_percent,
        grid_import_kW,
        grid_export_kW,
        weather,
        forecast: forecast as 'Surplus' | 'Deficit' | 'Balanced',
        temperature,
        carbon_saved_kg
      });
    }

    return data;
  }

  generateHistoricalData(days: number = 7): EnergyData[] {
    const data: EnergyData[] = [];
    const endTime = new Date();
    
    for (let day = days; day >= 0; day--) {
      for (let hour = 0; hour < 24; hour += 2) { // Every 2 hours
        const time = new Date(endTime.getTime() - day * 24 * 60 * 60 * 1000 + hour * 60 * 60 * 1000);
        const currentHour = time.getHours();
        
        const solarMultiplier = this.getHourlyMultiplier(currentHour, 'solar');
        const windMultiplier = this.getHourlyMultiplier(currentHour, 'wind');
        const loadMultiplier = this.getHourlyMultiplier(currentHour, 'load');
        
        const baseVariation = () => 0.8 + Math.random() * 0.4;

        const solar_gen_kW = Math.round(250 * solarMultiplier * baseVariation() * 100) / 100;
        const wind_gen_kW = Math.round(80 * windMultiplier * baseVariation() * 100) / 100;
        const load_demand_kW = Math.round(200 * loadMultiplier * baseVariation() * 100) / 100;
        
        const totalGeneration = solar_gen_kW + wind_gen_kW;
        const grid_import_kW = Math.max(0, load_demand_kW - totalGeneration);
        const grid_export_kW = Math.max(0, totalGeneration - load_demand_kW);
        
        const battery_soc_percent = Math.max(20, Math.min(100, 40 + Math.random() * 50));
        
        const weather = this.getWeatherCondition(currentHour);
        const forecast = totalGeneration > load_demand_kW ? 'Surplus' : 
                        totalGeneration < load_demand_kW * 0.8 ? 'Deficit' : 'Balanced';
        
        const temperature = 25 + Math.random() * 15;
        const carbon_saved_kg = Math.round(totalGeneration * 0.7 * 100) / 100;

        data.push({
          timestamp: time.toISOString(),
          solar_gen_kW,
          wind_gen_kW,
          load_demand_kW,
          battery_soc_percent,
          grid_import_kW,
          grid_export_kW,
          weather,
          forecast: forecast as 'Surplus' | 'Deficit' | 'Balanced',
          temperature,
          carbon_saved_kg
        });
      }
    }

    return data;
  }

  private getWeatherCondition(hour: number, weatherPattern: number): string {
    // More realistic weather based on time and pattern
    if (hour >= 6 && hour <= 18) {
      // Daytime
      if (weatherPattern > 0.7) return 'Sunny';
      if (weatherPattern > 0.4) return 'Partly Cloudy';
      if (weatherPattern > 0.2) return 'Cloudy';
      return 'Dusty'; // Common in Rajasthan
    } else {
      // Nighttime
      const nightConditions = ['Clear', 'Partly Cloudy', 'Cloudy'];
      return nightConditions[Math.floor(weatherPattern * nightConditions.length)];
    }
  }

  // Get battery status information
  getBatteryStatus(data: EnergyData): {
    status: 'Charging' | 'Discharging' | 'Standby';
    rate: number;
    timeToFull?: number;
    timeToEmpty?: number;
  } {
    const totalGeneration = data.solar_gen_kW + data.wind_gen_kW;
    const energyBalance = totalGeneration - data.load_demand_kW;
    
    if (energyBalance > 10) {
      return {
        status: 'Charging',
        rate: Math.abs(energyBalance * 0.05),
        timeToFull: (100 - data.battery_soc_percent) / (energyBalance * 0.05)
      };
    } else if (energyBalance < -10) {
      return {
        status: 'Discharging',
        rate: Math.abs(energyBalance * 0.03),
        timeToEmpty: data.battery_soc_percent / Math.abs(energyBalance * 0.03)
      };
    }
    
    return {
      status: 'Standby',
      rate: 0
    };
  }

  // Get recent energy samples for comparison
  getRecentSamples(): Array<{
    time: string;
    value: number;
    unit: string;
    label: string;
  }> {
    const now = new Date();
    const samples = [];
    
    // Generate 4 time periods like in the reference
    const periods = [
      { hours: 1, label: '1hr ago' },
      { hours: 6, label: '6hr ago' },
      { hours: 12, label: '12hr ago' },
      { hours: 24, label: '24hr ago' }
    ];
    
    periods.forEach(period => {
      const time = new Date(now.getTime() - period.hours * 60 * 60 * 1000);
      const hour = time.getHours();
      const solarMult = this.getHourlyMultiplier(hour, 'solar');
      const windMult = this.getHourlyMultiplier(hour, 'wind');
      const loadMult = this.getHourlyMultiplier(hour, 'load');
      
      samples.push({
        time: period.label,
        value: Math.round((300 * solarMult + 100 * windMult) * 100) / 100,
        unit: 'kW',
        label: 'Generation'
      });
    });
    
    return samples;
  }

  getCurrentMetrics(data: EnergyData): CurrentMetrics {
    const totalGeneration = data.solar_gen_kW + data.wind_gen_kW;
    const efficiency = totalGeneration > 0 ? Math.min(100, (totalGeneration / (totalGeneration + data.grid_import_kW)) * 100) : 0;
    
    return {
      solarGeneration: data.solar_gen_kW,
      windGeneration: data.wind_gen_kW,
      batteryLevel: data.battery_soc_percent,
      gridUsage: data.grid_import_kW,
      currentLoad: data.load_demand_kW,
      totalGeneration,
      efficiency: Math.round(efficiency * 100) / 100
    };
  }

  getRecommendations(data: EnergyData): Array<{
    message: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
    action?: string;
    acknowledged?: boolean;
  }> {
    const recommendations = [];
    const totalGeneration = data.solar_gen_kW + data.wind_gen_kW;
    const energyBalance = totalGeneration - data.load_demand_kW;
    
    // High priority recommendations (red/urgent)
    if (data.battery_soc_percent < 20) {
      recommendations.push({
        message: "Battery critically low - immediate charging required",
        priority: 'high' as const,
        icon: "🔴",
        action: "Switch to grid power and charge battery"
      });
    }
    
    if (data.grid_import_kW > 100) {
      recommendations.push({
        message: "High grid demand detected - reduce non-essential loads",
        priority: 'high' as const,
        icon: "⚠️",
        action: "Turn off AC, lighting in unused areas"
      });
    }
    
    // Medium priority recommendations (yellow/warning)
    if (data.battery_soc_percent < 40 && energyBalance > 10) {
      recommendations.push({
        message: "Surplus energy available - charge battery now",
        priority: 'medium' as const,
        icon: "⚡",
        action: "Enable battery charging mode"
      });
    }
    
    if (totalGeneration > data.load_demand_kW * 1.3) {
      recommendations.push({
        message: "Excess solar/wind generation - run heavy equipment",
        priority: 'medium' as const,
        icon: "💡",
        action: "Start washing machines, water pumps"
      });
    }
    
    if (data.grid_import_kW > 50 && data.battery_soc_percent > 60) {
      recommendations.push({
        message: "Use battery power to reduce grid dependency",
        priority: 'medium' as const,
        icon: "🔄",
        action: "Switch to battery backup mode"
      });
    }
    
    // Low priority recommendations (green/info)
    if (data.solar_gen_kW > 200 && data.battery_soc_percent > 80) {
      recommendations.push({
        message: "Peak solar generation - optimal performance",
        priority: 'low' as const,
        icon: "☀️",
        action: "System operating efficiently"
      });
    }
    
    if (energyBalance > -10 && energyBalance < 10) {
      recommendations.push({
        message: "Energy balanced - good optimization",
        priority: 'low' as const,
        icon: "✅",
        action: "Continue current settings"
      });
    }

    return recommendations.length > 0 ? recommendations : [{
      message: "Energy system operating efficiently",
      priority: 'low' as const,
      icon: "✅",
      action: "No action required"
    }];
  }

  getAlerts(data: EnergyData): Array<{type: 'warning' | 'error' | 'info', message: string}> {
    const alerts: Array<{type: 'warning' | 'error' | 'info', message: string}> = [];
    
    if (data.battery_soc_percent < 20) {
      alerts.push({type: 'error', message: 'Battery critically low'});
    }
    
    if (data.grid_import_kW > 100) {
      alerts.push({type: 'warning', message: 'High grid demand detected'});
    }
    
    if (data.solar_gen_kW === 0 && new Date().getHours() >= 8 && new Date().getHours() <= 17) {
      alerts.push({type: 'warning', message: 'Solar generation below expected'});
    }
    
    if (data.load_demand_kW > 250) {
      alerts.push({type: 'info', message: 'Peak load period detected'});
    }

    return alerts;
  }
}

export const energySimulator = new EnergyDataSimulator();