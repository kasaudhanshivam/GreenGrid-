import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Building2, MapPin, Phone, Mail, Zap, Wind, Battery, Sun, Settings, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface InstituteConfig {
  // Institute Information
  instituteName: string;
  instituteType: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  email: string;
  phone: string;
  
  // Energy Assets
  solarCapacity: number;
  solarPanels: number;
  solarInstallationDate: string;
  windCapacity: number;
  windTurbines: number;
  windInstallationDate: string;
  batteryCapacity: number;
  batteryType: string;
  batteryInstallationDate: string;
  
  // Grid Connection
  gridConnectionCapacity: number;
  utilityProvider: string;
  hasSmartMeter: boolean;
  
  // System Preferences
  defaultMode: 'online' | 'offline';
  dataRetentionDays: number;
  alertThresholds: {
    batteryLow: number;
    highGridUsage: number;
    systemEfficiency: number;
  };
  
  // Additional Settings
  weatherApiEnabled: boolean;
  weatherApiKey?: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface InstituteSetupProps {
  onSetupComplete: (config: InstituteConfig) => void;
  onBackToLanding?: () => void;
}

export function InstituteSetup({ onSetupComplete, onBackToLanding }: InstituteSetupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<InstituteConfig>({
    instituteName: '',
    instituteType: '',
    address: '',
    city: '',
    state: 'Rajasthan',
    pincode: '',
    contactPerson: '',
    email: '',
    phone: '',
    solarCapacity: 0,
    solarPanels: 0,
    solarInstallationDate: '',
    windCapacity: 0,
    windTurbines: 0,
    windInstallationDate: '',
    batteryCapacity: 0,
    batteryType: '',
    batteryInstallationDate: '',
    gridConnectionCapacity: 0,
    utilityProvider: '',
    hasSmartMeter: false,
    defaultMode: 'online',
    dataRetentionDays: 365,
    alertThresholds: {
      batteryLow: 20,
      highGridUsage: 80,
      systemEfficiency: 70
    },
    weatherApiEnabled: false,
    location: {
      latitude: 26.9124,
      longitude: 75.7873 // Default to Jaipur, Rajasthan
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Institute Information
        if (!config.instituteName.trim()) stepErrors.instituteName = 'Institute name is required';
        if (!config.instituteType) stepErrors.instituteType = 'Institute type is required';
        if (!config.address.trim()) stepErrors.address = 'Address is required';
        if (!config.city.trim()) stepErrors.city = 'City is required';
        if (!config.pincode.trim()) stepErrors.pincode = 'Pincode is required';
        if (!config.contactPerson.trim()) stepErrors.contactPerson = 'Contact person is required';
        if (!config.email.trim()) stepErrors.email = 'Email is required';
        if (!config.phone.trim()) stepErrors.phone = 'Phone number is required';
        break;

      case 2: // Solar System
        if (config.solarCapacity <= 0) stepErrors.solarCapacity = 'Solar capacity must be greater than 0';
        if (config.solarPanels <= 0) stepErrors.solarPanels = 'Number of solar panels must be greater than 0';
        if (!config.solarInstallationDate) stepErrors.solarInstallationDate = 'Installation date is required';
        break;

      case 3: // Wind & Battery
        // Wind is optional, but if capacity > 0, other fields are required
        if (config.windCapacity > 0) {
          if (config.windTurbines <= 0) stepErrors.windTurbines = 'Number of wind turbines required';
          if (!config.windInstallationDate) stepErrors.windInstallationDate = 'Wind installation date required';
        }
        // Battery is optional
        if (config.batteryCapacity > 0) {
          if (!config.batteryType) stepErrors.batteryType = 'Battery type is required';
          if (!config.batteryInstallationDate) stepErrors.batteryInstallationDate = 'Battery installation date required';
        }
        break;

      case 4: // Grid Connection
        if (config.gridConnectionCapacity <= 0) stepErrors.gridConnectionCapacity = 'Grid connection capacity is required';
        if (!config.utilityProvider.trim()) stepErrors.utilityProvider = 'Utility provider is required';
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Save configuration to localStorage for persistence
      localStorage.setItem('greengrid_institute_config', JSON.stringify(config));
      localStorage.setItem('greengrid_setup_complete', 'true');
      onSetupComplete(config);
    }
  };

  const updateConfig = (updates: Partial<InstituteConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    // Clear related errors
    const updatedErrors = { ...errors };
    Object.keys(updates).forEach(key => {
      delete updatedErrors[key];
    });
    setErrors(updatedErrors);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="text-lg">Institute Information</h3>
                <p className="text-sm text-muted-foreground">Basic details about your educational institution</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="instituteName">Institute Name *</Label>
                <Input
                  id="instituteName"
                  value={config.instituteName}
                  onChange={(e) => updateConfig({ instituteName: e.target.value })}
                  placeholder="e.g., Rajasthan Technical University"
                  className={errors.instituteName ? 'border-red-500' : ''}
                />
                {errors.instituteName && <p className="text-sm text-red-500 mt-1">{errors.instituteName}</p>}
              </div>

              <div>
                <Label htmlFor="instituteType">Institute Type *</Label>
                <Select value={config.instituteType} onValueChange={(value) => updateConfig({ instituteType: value })}>
                  <SelectTrigger className={errors.instituteType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="research">Research Institute</SelectItem>
                    <SelectItem value="technical">Technical Institute</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.instituteType && <p className="text-sm text-red-500 mt-1">{errors.instituteType}</p>}
              </div>

              <div>
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={config.contactPerson}
                  onChange={(e) => updateConfig({ contactPerson: e.target.value })}
                  placeholder="Energy Manager / Administrator"
                  className={errors.contactPerson ? 'border-red-500' : ''}
                />
                {errors.contactPerson && <p className="text-sm text-red-500 mt-1">{errors.contactPerson}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={config.address}
                  onChange={(e) => updateConfig({ address: e.target.value })}
                  placeholder="Complete address with landmarks"
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={config.city}
                  onChange={(e) => updateConfig({ city: e.target.value })}
                  placeholder="e.g., Jaipur"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={config.pincode}
                  onChange={(e) => updateConfig({ pincode: e.target.value })}
                  placeholder="6-digit PIN code"
                  className={errors.pincode ? 'border-red-500' : ''}
                />
                {errors.pincode && <p className="text-sm text-red-500 mt-1">{errors.pincode}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email}
                  onChange={(e) => updateConfig({ email: e.target.value })}
                  placeholder="energy@institute.edu"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={config.phone}
                  onChange={(e) => updateConfig({ phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Sun className="h-6 w-6 text-yellow-600" />
              <div>
                <h3 className="text-lg">Solar Energy System</h3>
                <p className="text-sm text-muted-foreground">Configure your solar power installation</p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Solar energy system is mandatory for GreenGrid setup. Please ensure you have solar panels installed.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="solarCapacity">Total Solar Capacity (kW) *</Label>
                <Input
                  id="solarCapacity"
                  type="number"
                  value={config.solarCapacity || ''}
                  onChange={(e) => updateConfig({ solarCapacity: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 100"
                  className={errors.solarCapacity ? 'border-red-500' : ''}
                />
                {errors.solarCapacity && <p className="text-sm text-red-500 mt-1">{errors.solarCapacity}</p>}
              </div>

              <div>
                <Label htmlFor="solarPanels">Number of Solar Panels *</Label>
                <Input
                  id="solarPanels"
                  type="number"
                  value={config.solarPanels || ''}
                  onChange={(e) => updateConfig({ solarPanels: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 250"
                  className={errors.solarPanels ? 'border-red-500' : ''}
                />
                {errors.solarPanels && <p className="text-sm text-red-500 mt-1">{errors.solarPanels}</p>}
              </div>

              <div>
                <Label htmlFor="solarInstallationDate">Installation Date *</Label>
                <Input
                  id="solarInstallationDate"
                  type="date"
                  value={config.solarInstallationDate}
                  onChange={(e) => updateConfig({ solarInstallationDate: e.target.value })}
                  className={errors.solarInstallationDate ? 'border-red-500' : ''}
                />
                {errors.solarInstallationDate && <p className="text-sm text-red-500 mt-1">{errors.solarInstallationDate}</p>}
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-2">☀️</div>
                  <div className="text-sm text-muted-foreground">
                    Average Panel Wattage: {config.solarPanels > 0 ? Math.round((config.solarCapacity * 1000) / config.solarPanels) : 0}W
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-2">
                <Wind className="h-6 w-6 text-blue-600" />
                <Battery className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg">Wind & Battery Systems</h3>
                <p className="text-sm text-muted-foreground">Configure additional renewable energy assets (optional)</p>
              </div>
            </div>

            {/* Wind System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wind className="h-5 w-5 text-blue-600" />
                  Wind Energy System
                </CardTitle>
                <CardDescription>
                  Configure your wind turbines if available (leave as 0 if not installed)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="windCapacity">Wind Capacity (kW)</Label>
                    <Input
                      id="windCapacity"
                      type="number"
                      value={config.windCapacity || ''}
                      onChange={(e) => updateConfig({ windCapacity: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g., 50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="windTurbines">Number of Wind Turbines</Label>
                    <Input
                      id="windTurbines"
                      type="number"
                      value={config.windTurbines || ''}
                      onChange={(e) => updateConfig({ windTurbines: parseInt(e.target.value) || 0 })}
                      placeholder="e.g., 5"
                      className={errors.windTurbines ? 'border-red-500' : ''}
                    />
                    {errors.windTurbines && <p className="text-sm text-red-500 mt-1">{errors.windTurbines}</p>}
                  </div>

                  {config.windCapacity > 0 && (
                    <div>
                      <Label htmlFor="windInstallationDate">Wind Installation Date</Label>
                      <Input
                        id="windInstallationDate"
                        type="date"
                        value={config.windInstallationDate}
                        onChange={(e) => updateConfig({ windInstallationDate: e.target.value })}
                        className={errors.windInstallationDate ? 'border-red-500' : ''}
                      />
                      {errors.windInstallationDate && <p className="text-sm text-red-500 mt-1">{errors.windInstallationDate}</p>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Battery System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Battery className="h-5 w-5 text-green-600" />
                  Battery Storage System
                </CardTitle>
                <CardDescription>
                  Configure your battery storage if available (leave as 0 if not installed)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batteryCapacity">Battery Capacity (kWh)</Label>
                    <Input
                      id="batteryCapacity"
                      type="number"
                      value={config.batteryCapacity || ''}
                      onChange={(e) => updateConfig({ batteryCapacity: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g., 200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="batteryType">Battery Type</Label>
                    <Select 
                      value={config.batteryType} 
                      onValueChange={(value) => updateConfig({ batteryType: value })}
                      disabled={config.batteryCapacity <= 0}
                    >
                      <SelectTrigger className={errors.batteryType ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select battery type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lithium-ion">Lithium-ion</SelectItem>
                        <SelectItem value="lead-acid">Lead Acid</SelectItem>
                        <SelectItem value="nickel-cadmium">Nickel Cadmium</SelectItem>
                        <SelectItem value="flow-battery">Flow Battery</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.batteryType && <p className="text-sm text-red-500 mt-1">{errors.batteryType}</p>}
                  </div>

                  {config.batteryCapacity > 0 && (
                    <div>
                      <Label htmlFor="batteryInstallationDate">Battery Installation Date</Label>
                      <Input
                        id="batteryInstallationDate"
                        type="date"
                        value={config.batteryInstallationDate}
                        onChange={(e) => updateConfig({ batteryInstallationDate: e.target.value })}
                        className={errors.batteryInstallationDate ? 'border-red-500' : ''}
                      />
                      {errors.batteryInstallationDate && <p className="text-sm text-red-500 mt-1">{errors.batteryInstallationDate}</p>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-6 w-6 text-orange-600" />
              <div>
                <h3 className="text-lg">Grid Connection</h3>
                <p className="text-sm text-muted-foreground">Configure your grid connection and utility details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gridConnectionCapacity">Grid Connection Capacity (kW) *</Label>
                <Input
                  id="gridConnectionCapacity"
                  type="number"
                  value={config.gridConnectionCapacity || ''}
                  onChange={(e) => updateConfig({ gridConnectionCapacity: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 500"
                  className={errors.gridConnectionCapacity ? 'border-red-500' : ''}
                />
                {errors.gridConnectionCapacity && <p className="text-sm text-red-500 mt-1">{errors.gridConnectionCapacity}</p>}
              </div>

              <div>
                <Label htmlFor="utilityProvider">Utility Provider *</Label>
                <Select 
                  value={config.utilityProvider} 
                  onValueChange={(value) => updateConfig({ utilityProvider: value })}
                >
                  <SelectTrigger className={errors.utilityProvider ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select utility provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jvvnl">JVVNL (Jaipur Vidyut Vitran Nigam)</SelectItem>
                    <SelectItem value="avvnl">AVVNL (Ajmer Vidyut Vitran Nigam)</SelectItem>
                    <SelectItem value="jdvvnl">JdVVNL (Jodhpur Vidyut Vitran Nigam)</SelectItem>
                    <SelectItem value="rseb">RSEB (Rajasthan State Electricity Board)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.utilityProvider && <p className="text-sm text-red-500 mt-1">{errors.utilityProvider}</p>}
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasSmartMeter"
                    checked={config.hasSmartMeter}
                    onCheckedChange={(checked) => updateConfig({ hasSmartMeter: checked as boolean })}
                  />
                  <Label htmlFor="hasSmartMeter">Smart meter installed for accurate energy monitoring</Label>
                </div>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Smart meters provide real-time energy consumption data and enable bidirectional energy flow monitoring.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="text-lg">System Configuration</h3>
                <p className="text-sm text-muted-foreground">Configure system preferences and alert thresholds</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* System Mode */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Operating Mode</CardTitle>
                  <CardDescription>Choose default system mode</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={config.defaultMode} 
                    onValueChange={(value: 'online' | 'offline') => updateConfig({ defaultMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online Mode (with weather data)</SelectItem>
                      <SelectItem value="offline">Offline Mode (sensor data only)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Data Retention */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Data Retention</CardTitle>
                  <CardDescription>How long to keep historical data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={config.dataRetentionDays.toString()} 
                    onValueChange={(value) => updateConfig({ dataRetentionDays: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">3 Months</SelectItem>
                      <SelectItem value="180">6 Months</SelectItem>
                      <SelectItem value="365">1 Year</SelectItem>
                      <SelectItem value="730">2 Years</SelectItem>
                      <SelectItem value="1095">3 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Alert Thresholds */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alert Thresholds</CardTitle>
                <CardDescription>Configure when to receive system alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="batteryLow">Battery Low Warning (%)</Label>
                    <Input
                      id="batteryLow"
                      type="number"
                      min="5"
                      max="50"
                      value={config.alertThresholds.batteryLow}
                      onChange={(e) => updateConfig({ 
                        alertThresholds: { 
                          ...config.alertThresholds, 
                          batteryLow: parseInt(e.target.value) || 20 
                        } 
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="highGridUsage">High Grid Usage (%)</Label>
                    <Input
                      id="highGridUsage"
                      type="number"
                      min="50"
                      max="100"
                      value={config.alertThresholds.highGridUsage}
                      onChange={(e) => updateConfig({ 
                        alertThresholds: { 
                          ...config.alertThresholds, 
                          highGridUsage: parseInt(e.target.value) || 80 
                        } 
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="systemEfficiency">Low System Efficiency (%)</Label>
                    <Input
                      id="systemEfficiency"
                      type="number"
                      min="30"
                      max="90"
                      value={config.alertThresholds.systemEfficiency}
                      onChange={(e) => updateConfig({ 
                        alertThresholds: { 
                          ...config.alertThresholds, 
                          systemEfficiency: parseInt(e.target.value) || 70 
                        } 
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weather API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weather Integration</CardTitle>
                <CardDescription>Configure weather data for enhanced predictions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weatherApiEnabled"
                    checked={config.weatherApiEnabled}
                    onCheckedChange={(checked) => updateConfig({ weatherApiEnabled: checked as boolean })}
                  />
                  <Label htmlFor="weatherApiEnabled">Enable weather API integration for better forecasting</Label>
                </div>

                {config.weatherApiEnabled && (
                  <div>
                    <Label htmlFor="weatherApiKey">Weather API Key (Optional)</Label>
                    <Input
                      id="weatherApiKey"
                      type="password"
                      value={config.weatherApiKey || ''}
                      onChange={(e) => updateConfig({ weatherApiKey: e.target.value })}
                      placeholder="Leave empty to use default weather service"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      If not provided, we'll use a default weather service for your location
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-between mb-4">
              {onBackToLanding && (
                <Button
                  variant="ghost"
                  onClick={onBackToLanding}
                  className="flex items-center gap-2 text-gray-600 hover:text-green-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Landing
                </Button>
              )}
              <div className="flex items-center gap-2 mx-auto">
                <span className="text-3xl">🌱</span>
                <h1 className="text-3xl">GreenGrid Setup</h1>
              </div>
              <div className="w-24"></div> {/* Spacer for centering */}
            </div>
            <CardDescription className="text-base">
              Welcome! Let's configure your renewable energy management dashboard
            </CardDescription>
            
            {/* Progress Indicator */}
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i + 1}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                    i + 1 < currentStep
                      ? 'bg-green-600 text-white'
                      : i + 1 === currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i + 1 < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="px-6 py-8">
            {renderStepContent()}
          </CardContent>

          {/* Navigation Buttons */}
          <div className="flex justify-between p-6 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <Button onClick={nextStep} className="bg-green-600 hover:bg-green-700">
                  Next Step
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}