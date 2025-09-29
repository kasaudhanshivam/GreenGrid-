import { useState } from 'react';
import { Sun, Wind, Battery, Zap, Activity, Download, AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

export function SimpleDashboard() {
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for testing
  const mockCurrentData = {
    timestamp: new Date().toISOString(),
    solarGeneration: 45.2,
    windGeneration: 12.8,
    batteryLevel: 78,
    gridConsumption: 32.5,
    totalLoad: 58.0
  };

  const mockMetrics = {
    totalGeneration: 58.0,
    totalConsumption: 32.5,
    efficiency: 89.5,
    carbonSaved: 12.4
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Energy Dashboard</h2>
          <p className="text-muted-foreground">Real-time renewable energy monitoring</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Wifi className="h-3 w-3 text-green-600" />
            System Online
          </Badge>
          
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          System running in test mode with mock data. All values are simulated for demonstration purposes.
        </AlertDescription>
      </Alert>

      {/* Energy Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solar Generation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solar Generation</CardTitle>
            <Sun className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCurrentData.solarGeneration} kW</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        {/* Wind Generation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wind Generation</CardTitle>
            <Wind className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCurrentData.windGeneration} kW</div>
            <p className="text-xs text-muted-foreground">
              -5% from yesterday
            </p>
          </CardContent>
        </Card>

        {/* Battery Level */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Battery Level</CardTitle>
            <Battery className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCurrentData.batteryLevel}%</div>
            <p className="text-xs text-muted-foreground">
              Charging at 2.5 kW
            </p>
          </CardContent>
        </Card>

        {/* Total Load */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Load</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCurrentData.totalLoad} kW</div>
            <p className="text-xs text-muted-foreground">
              Peak: 67.2 kW today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">System Efficiency</span>
              <span className="font-medium">{mockMetrics.efficiency}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Generation</span>
              <span className="font-medium">{mockMetrics.totalGeneration} kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Grid Consumption</span>
              <span className="font-medium">{mockCurrentData.gridConsumption} kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Carbon Saved Today</span>
              <span className="font-medium text-green-600">{mockMetrics.carbonSaved} kg CO₂</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Solar Panels</span>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Wind Turbines</span>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Battery Storage</span>
              <Badge className="bg-green-100 text-green-800">Charging</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Grid Connection</span>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              View Alerts
            </Button>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              System Diagnostics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}