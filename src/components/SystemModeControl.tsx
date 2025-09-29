import { useState } from 'react';
import { Grid, Activity, Wifi, Settings, Key, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { SystemMode } from '../utils/weatherBasedEnergyData';

interface SystemModeControlProps {
  currentMode: SystemMode;
  onModeChange: (mode: SystemMode, apiKey?: string) => void;
}

export function SystemModeControl({ currentMode, onModeChange }: SystemModeControlProps) {
  const [isOnlineMode, setIsOnlineMode] = useState(currentMode === 'online');
  const [weatherApiKey, setWeatherApiKey] = useState('');
  const [location, setLocation] = useState('Jaipur, Rajasthan');
  const [isConfigured, setIsConfigured] = useState(false);

  const handleModeToggle = (online: boolean) => {
    setIsOnlineMode(online);
    const newMode: SystemMode = online ? 'online' : 'offline';
    onModeChange(newMode, online ? weatherApiKey : undefined);
  };

  const handleApiKeySubmit = () => {
    if (weatherApiKey.trim()) {
      setIsConfigured(true);
      onModeChange('online', weatherApiKey);
    }
  };

  const handleUseDefaultApi = () => {
    setIsConfigured(true);
    onModeChange('online', 'default_api');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Operation Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="system-mode" className="flex items-center gap-2">
                {isOnlineMode ? (
                  <>
                    <Grid className="h-4 w-4 text-blue-600" />
                    Online Mode (Weather API + IoT)
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 text-purple-600" />
                    Offline Mode (IoT Sensors Only)
                  </>
                )}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isOnlineMode 
                  ? "Uses real-time weather data for enhanced predictions and recommendations"
                  : "Uses local IoT sensor data and historical patterns for energy optimization"
                }
              </p>
            </div>
            <Switch
              id="system-mode"
              checked={isOnlineMode}
              onCheckedChange={handleModeToggle}
            />
          </div>

          <Separator />

          {/* Current Mode Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Current Configuration</h4>
              <Badge variant={isOnlineMode ? 'default' : 'secondary'}>
                {currentMode.toUpperCase()} MODE
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-muted-foreground mb-2">Data Sources:</div>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-green-600" />
                    IoT Sensor Data
                  </li>
                  {isOnlineMode && (
                    <li className="flex items-center gap-2">
                      <Wifi className="h-3 w-3 text-blue-600" />
                      Weather API Data
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <Grid className="h-3 w-3 text-gray-600" />
                    Historical Patterns
                  </li>
                </ul>
              </div>
              
              <div>
                <div className="font-medium text-muted-foreground mb-2">Capabilities:</div>
                <ul className="space-y-1">
                  <li className="text-xs">✓ Real-time energy monitoring</li>
                  <li className="text-xs">✓ Battery optimization</li>
                  <li className="text-xs">✓ Load demand prediction</li>
                  {isOnlineMode && (
                    <>
                      <li className="text-xs">✓ Weather-based forecasting</li>
                      <li className="text-xs">✓ Advanced AI recommendations</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Online Mode Configuration */}
        {isOnlineMode && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              Weather API Configuration
            </h4>
            
            {!isConfigured ? (
              <Alert>
                <Wifi className="h-4 w-4" />
                <AlertDescription>
                  Configure weather API access for enhanced energy predictions and optimization.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <Wifi className="h-4 w-4" />
                <AlertDescription className="text-green-700">
                  Weather API configured successfully. Enhanced predictions active.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter location (e.g., Jaipur, Rajasthan)"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Location used for weather data and solar calculations
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">Weather API Key (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type="password"
                    value={weatherApiKey}
                    onChange={(e) => setWeatherApiKey(e.target.value)}
                    placeholder="Enter your weather API key"
                  />
                  <Button onClick={handleApiKeySubmit} disabled={!weatherApiKey.trim()}>
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Provide your own API key for unlimited weather data access
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <span className="text-sm text-muted-foreground">Or</span>
                <Button variant="outline" onClick={handleUseDefaultApi}>
                  Use Default Weather Service
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Uses location-based weather simulation with realistic patterns for Rajasthan
              </p>
            </div>
          </div>
        )}

        {/* Offline Mode Information */}
        {!isOnlineMode && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              IoT Sensor Configuration
            </h4>
            
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                System operating in offline mode using local IoT sensors and historical data patterns.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Available Sensors:</h5>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Solar panel temperature sensors</li>
                  <li>• Ambient light sensors (lux)</li>
                  <li>• Wind turbine RPM monitoring</li>
                  <li>• Battery voltage & current sensors</li>
                  <li>• Inverter efficiency monitoring</li>
                  <li>• Load power factor measurement</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Prediction Methods:</h5>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Historical energy generation patterns</li>
                  <li>• Time-of-day load predictions</li>
                  <li>• Seasonal adjustment factors</li>
                  <li>• Equipment performance curves</li>
                  <li>• Local environmental correlations</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Performance Comparison */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Mode Comparison</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Grid className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Online Mode Benefits</span>
              </div>
              <ul className="text-xs space-y-1 text-muted-foreground ml-6">
                <li>• Real-time weather data integration</li>
                <li>• 24-48 hour accurate forecasting</li>
                <li>• Advanced AI-powered recommendations</li>
                <li>• Cloud cover & solar irradiance prediction</li>
                <li>• Regional weather pattern analysis</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Offline Mode Benefits</span>
              </div>
              <ul className="text-xs space-y-1 text-muted-foreground ml-6">
                <li>• No internet dependency</li>
                <li>• Direct sensor data accuracy</li>
                <li>• Lower latency responses</li>
                <li>• Privacy & data security</li>
                <li>• Reduced operational costs</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}