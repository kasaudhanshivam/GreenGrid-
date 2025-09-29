import { useState, useMemo } from 'react';
import { Sun, Wind, Battery, Zap, Activity, Download, AlertTriangle, RefreshCw, Wifi, WifiOff, Clock, Grid, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { EnergyMetricCard } from './EnergyMetricCard';
import { EnergyChart } from './EnergyChart';
import { SmartRecommendationsCard } from './SmartRecommendationsCard';
import { WeatherForecastCard } from './WeatherForecastCard';
import { useCurrentEnergyData, useForecastData } from '../hooks/useEnergyData';


export function Dashboard() {
  // Chart configuration state
  const [timeInterval, setTimeInterval] = useState('1h');
  const [showRenewableOnly, setShowRenewableOnly] = useState(false);

  // Use custom hooks for data management with weather integration
  const {
    currentData,
    metrics,
    recommendations,
    alerts,
    isLoading: currentLoading,
    error: currentError,
    refresh: refreshCurrent,
    isWebSocketConnected,
    weatherData,
    energyPrediction,
    iotData,
    systemMode,
    setSystemMode
  } = useCurrentEnergyData(60000); // 60 second refresh

  // Dynamic forecast hours based on time interval
  const forecastHours = useMemo(() => {
    switch (timeInterval) {
      case '15m': return 2;
      case '30m': return 4;
      case '1h': return 6;
      case '6h': return 24;
      case '1d': return 72;
      default: return 6;
    }
  }, [timeInterval]);

  const {
    forecastData,
    isLoading: forecastLoading,
    error: forecastError,
    refresh: refreshForecast
  } = useForecastData(forecastHours);

  const handleDownloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      current_data: currentData,
      metrics: metrics,
      recommendations: recommendations,
      alerts: alerts
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `energy-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    refreshCurrent();
    refreshForecast();
  };

  if (currentLoading && !currentData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Loading energy data...</span>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg">Error Loading Data</h3>
          <p className="text-muted-foreground">{currentError}</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!currentData || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Initializing dashboard...</span>
      </div>
    );
  }

  const getMetricStatus = (value: number, thresholds: {good: number, warning: number}) => {
    if (value >= thresholds.good) return 'good';
    if (value >= thresholds.warning) return 'warning';
    return 'critical';
  };

  // Use weather-based recommendations from the hook
  
  // Filter chart data based on energy source preference
  const getFilteredDataKeys = () => {
    const allKeys = [
      { key: 'solar_gen_kW' as keyof typeof currentData, name: 'Solar', color: '#f59e0b' },
      { key: 'wind_gen_kW' as keyof typeof currentData, name: 'Wind', color: '#3b82f6' },
      { key: 'load_demand_kW' as keyof typeof currentData, name: 'Demand', color: '#ef4444' },
      { key: 'grid_import_kW' as keyof typeof currentData, name: 'Grid Import', color: '#8b5cf6' }
    ];
    
    if (showRenewableOnly) {
      return allKeys.filter(key => 
        key.key === 'solar_gen_kW' || 
        key.key === 'wind_gen_kW' || 
        key.key === 'load_demand_kW'
      );
    }
    
    return allKeys;
  };

  return (
    <div className="space-y-6">
      {/* Smart Recommendations - Moved to Top */}
      <SmartRecommendationsCard recommendations={recommendations || []} />

      {/* Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Last updated: {new Date(currentData.timestamp).toLocaleTimeString()}
          </Badge>
          
          {/* System Mode Status */}
          <Badge 
            variant="outline" 
            className={systemMode === 'online' 
              ? "bg-blue-50 text-blue-700 border-blue-200" 
              : "bg-purple-50 text-purple-700 border-purple-200"
            }
          >
            {systemMode === 'online' ? (
              <>
                <Grid className="h-3 w-3 mr-1" />
                Online Mode
              </>
            ) : (
              <>
                <Activity className="h-3 w-3 mr-1" />
                Offline Mode (IoT)
              </>
            )}
          </Badge>
          
          {/* Weather Status */}
          {weatherData && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              {weatherData.condition.replace('_', ' ')} - {weatherData.temperature}°C
            </Badge>
          )}
          
          {/* WebSocket Connection Status */}
          <Badge 
            variant="outline" 
            className={isWebSocketConnected 
              ? "bg-green-50 text-green-700 border-green-200" 
              : "bg-orange-50 text-orange-700 border-orange-200"
            }
          >
            {isWebSocketConnected ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Live Data
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Polling Mode
              </>
            )}
          </Badge>
          
          {currentLoading && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Updating...
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={currentLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${currentLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleDownloadReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Report
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <EnergyMetricCard
          title="Solar Generation"
          value={metrics.solarGeneration}
          unit="kW"
          icon={Sun}
          status={getMetricStatus(metrics.solarGeneration, {good: 100, warning: 50})}
          subtitle={`${currentData.weather}`}
        />
        
        <EnergyMetricCard
          title="Wind Generation"
          value={metrics.windGeneration}
          unit="kW"
          icon={Wind}
          status={getMetricStatus(metrics.windGeneration, {good: 40, warning: 20})}
        />
        
        <EnergyMetricCard
          title="Battery Level"
          value={metrics.batteryLevel}
          unit="%"
          icon={Battery}
          status={getMetricStatus(metrics.batteryLevel, {good: 60, warning: 30})}
        />
        
        <EnergyMetricCard
          title="Grid Usage"
          value={metrics.gridUsage}
          unit="kW"
          icon={Zap}
          status={metrics.gridUsage < 50 ? 'good' : metrics.gridUsage < 100 ? 'warning' : 'critical'}
        />
        
        <EnergyMetricCard
          title="Current Load"
          value={metrics.currentLoad}
          unit="kW"
          icon={Activity}
          status='good'
          subtitle={`Efficiency: ${metrics.efficiency}%`}
        />
      </div>

      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Energy Monitoring & Forecasting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Time Interval Selection */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Label htmlFor="timeInterval">Time Interval:</Label>
              </div>
              <Select value={timeInterval} onValueChange={setTimeInterval}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">15 minutes</SelectItem>
                  <SelectItem value="30m">30 minutes</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="6h">6 hours</SelectItem>
                  <SelectItem value="1d">1 day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Energy Source Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="energySource" className="flex items-center gap-2">
                  {showRenewableOnly ? (
                    <>
                      <Leaf className="h-4 w-4 text-green-600" />
                      Renewable Only
                    </>
                  ) : (
                    <>
                      <Grid className="h-4 w-4" />
                      All Sources
                    </>
                  )}
                </Label>
              </div>
              <Switch
                id="energySource"
                checked={showRenewableOnly}
                onCheckedChange={setShowRenewableOnly}
              />
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generation vs Demand */}
            <EnergyChart
              title={`Energy Flow (${timeInterval} intervals)`}
              data={forecastData}
              dataKeys={getFilteredDataKeys()}
              height={300}
              timeInterval={timeInterval}
            />

            {/* Battery and Grid Usage */}
            <EnergyChart
              title="Battery & Grid Status"
              data={forecastData}
              type="line"
              dataKeys={[
                { key: 'battery_soc_percent' as keyof typeof currentData, name: 'Battery %', color: '#10b981' },
                ...(showRenewableOnly ? [] : [{ key: 'grid_import_kW' as keyof typeof currentData, name: 'Grid Import', color: '#8b5cf6' }])
              ]}
              height={300}
              timeInterval={timeInterval}
            />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Energy Summary with Weather Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.totalGeneration.toFixed(1)} kW</div>
                <div className="text-sm text-muted-foreground">Total Generation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.efficiency.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">System Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentData.carbon_saved_kg.toFixed(1)} kg</div>
                <div className="text-sm text-muted-foreground">Carbon Saved</div>
              </div>
              <div className="text-center">
                <Badge variant={currentData.forecast === 'Surplus' ? 'default' : 
                               currentData.forecast === 'Deficit' ? 'destructive' : 'secondary'} 
                       className="text-lg px-3 py-1">
                  {currentData.forecast}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">Current Status</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather-Based Efficiency Predictions */}
        {energyPrediction && weatherData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Weather-Based Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {Math.round(energyPrediction.solarEfficiency * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Solar Efficiency</div>
                  <div className="text-xs text-muted-foreground">
                    {weatherData.cloudCover}% clouds
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(energyPrediction.windEfficiency * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Wind Efficiency</div>
                  <div className="text-xs text-muted-foreground">
                    {weatherData.windSpeed} m/s
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {Math.round(energyPrediction.loadMultiplier * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Load Factor</div>
                  <div className="text-xs text-muted-foreground">
                    Due to weather
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {energyPrediction.batteryOptimalCharge.toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Optimal Battery</div>
                  <div className="text-xs text-muted-foreground">
                    Recommended level
                  </div>
                </div>
              </div>
              
              {/* System Mode & IoT Data */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">System Mode:</span>
                  <Badge variant={systemMode === 'online' ? 'default' : 'secondary'}>
                    {systemMode.toUpperCase()}
                  </Badge>
                </div>
                {iotData && systemMode === 'offline' && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Panel Temp: {iotData.panelTemperature}°C | 
                    Wind RPM: {iotData.windTurbineRPM} | 
                    Light: {Math.round(iotData.ambientLight/1000)}k lux
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Weather Forecast & Optimization */}
      {weatherData && energyPrediction && (
        <WeatherForecastCard 
          weatherData={weatherData} 
          energyPrediction={energyPrediction} 
          systemMode={systemMode} 
        />
      )}
    </div>
  );
}