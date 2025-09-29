export interface InstituteConfig {
  instituteName: string;
  instituteType: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  email: string;
  phone: string;
  solarCapacity: number;
  solarPanels: number;
  solarInstallationDate: string;
  windCapacity: number;
  windTurbines: number;
  windInstallationDate: string;
  batteryCapacity: number;
  batteryType: string;
  batteryInstallationDate: string;
  gridConnectionCapacity: number;
  utilityProvider: string;
  hasSmartMeter: boolean;
  defaultMode: 'online' | 'offline';
  dataRetentionDays: number;
  alertThresholds: {
    batteryLow: number;
    highGridUsage: number;
    systemEfficiency: number;
  };
  weatherApiEnabled: boolean;
  weatherApiKey?: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export function getInstituteConfig(): InstituteConfig | null {
  try {
    const config = localStorage.getItem('greengrid_institute_config');
    return config ? JSON.parse(config) : null;
  } catch (error) {
    console.error('Error loading institute config:', error);
    return null;
  }
}

export function saveInstituteConfig(config: InstituteConfig): void {
  try {
    localStorage.setItem('greengrid_institute_config', JSON.stringify(config));
    localStorage.setItem('greengrid_setup_complete', 'true');
  } catch (error) {
    console.error('Error saving institute config:', error);
  }
}

export function isSetupComplete(): boolean {
  return localStorage.getItem('greengrid_setup_complete') === 'true';
}

export function resetSetup(): void {
  localStorage.removeItem('greengrid_setup_complete');
  localStorage.removeItem('greengrid_institute_config');
}

export function getEnergyAssetsSummary(): {
  totalCapacity: number;
  solarCapacity: number;
  windCapacity: number;
  batteryCapacity: number;
  gridCapacity: number;
  hasWind: boolean;
  hasBattery: boolean;
} {
  const config = getInstituteConfig();
  
  if (!config) {
    return {
      totalCapacity: 0,
      solarCapacity: 0,
      windCapacity: 0,
      batteryCapacity: 0,
      gridCapacity: 0,
      hasWind: false,
      hasBattery: false
    };
  }

  return {
    totalCapacity: config.solarCapacity + config.windCapacity,
    solarCapacity: config.solarCapacity,
    windCapacity: config.windCapacity,
    batteryCapacity: config.batteryCapacity,
    gridCapacity: config.gridConnectionCapacity,
    hasWind: config.windCapacity > 0,
    hasBattery: config.batteryCapacity > 0
  };
}

export function getLocationData(): { latitude: number; longitude: number; city: string; state: string } {
  const config = getInstituteConfig();
  
  return {
    latitude: config?.location.latitude || 26.9124, // Default to Jaipur
    longitude: config?.location.longitude || 75.7873,
    city: config?.city || 'Jaipur',
    state: config?.state || 'Rajasthan'
  };
}