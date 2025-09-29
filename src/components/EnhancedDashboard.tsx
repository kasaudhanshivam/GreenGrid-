import { useState, useEffect } from 'react';
import { Sun, Wind, Battery, Zap, Activity, RefreshCw, Wifi, AlertTriangle, TrendingUp, Search, Download, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts@2.15.2';

export function EnhancedDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock real-time data with dynamic updates
  const [currentData, setCurrentData] = useState({
    solarGeneration: 70.1,
    windGeneration: 14.0,
    batteryLevel: 52.9,
    gridUsage: 118.4,
    currentLoad: 202.5,
    efficiency: 91.5
  });

  // Generate mock hourly data for charts with Rajasthan-specific patterns
  const generateHourlyData = () => {
    const hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    return hours.map((hour, index) => {
      // Solar peaks between 10 AM - 2 PM (Rajasthan pattern)
      const solarMultiplier = index >= 3 && index <= 7 ? 1.5 : index >= 2 && index <= 8 ? 1.2 : 0.7;
      // Wind is generally low in Rajasthan during day, higher in evening
      const windMultiplier = index >= 9 ? 1.3 : 0.8;
      
      return {
        time: hour,
        solarGeneration: Math.max(0, (40 + Math.sin(index * 0.5) * 30) * solarMultiplier + Math.random() * 10),
        windGeneration: Math.max(0, (15 + Math.random() * 8) * windMultiplier),
        totalDemand: Math.max(50, 180 + Math.sin(index * 0.3) * 40 + Math.random() * 15),
        batteryLevel: Math.max(0, Math.min(100, 50 + Math.sin(index * 0.2) * 20 + Math.random() * 5)),
        gridUsage: Math.max(0, 100 + Math.cos(index * 0.4) * 30 + Math.random() * 20)
      };
    });
  };

  const [hourlyData] = useState(generateHourlyData());
  
  // Generate real-time minute data for consumption tracking
  const generateMinuteData = () => {
    const minutes = [];
    const now = new Date();
    for (let i = 9; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      minutes.push({
        time: time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        consumption: currentData.currentLoad + (Math.random() - 0.5) * 20,
        generation: currentData.solarGeneration + currentData.windGeneration + (Math.random() - 0.5) * 10
      });
    }
    return minutes;
  };

  const [realtimeData, setRealtimeData] = useState(generateMinuteData());

  const handleRefresh = () => {
    setIsLoading(true);
    try {
      // Simulate data refresh with realistic constraints
      setTimeout(() => {
        setCurrentData(prev => ({
          solarGeneration: Math.max(0, Math.min(150, prev.solarGeneration + (Math.random() - 0.5) * 8)),
          windGeneration: Math.max(0, Math.min(50, prev.windGeneration + (Math.random() - 0.5) * 4)),
          batteryLevel: Math.max(10, Math.min(100, prev.batteryLevel + (Math.random() - 0.5) * 8)),
          gridUsage: Math.max(0, Math.min(300, prev.gridUsage + (Math.random() - 0.5) * 20)),
          currentLoad: Math.max(50, Math.min(400, prev.currentLoad + (Math.random() - 0.5) * 25)),
          efficiency: Math.max(80, Math.min(98, prev.efficiency + (Math.random() - 0.5) * 1.5))
        }));
        
        // Update real-time minute data
        setRealtimeData(prev => {
          const newData = [...prev.slice(1)]; // Remove oldest data point
          const now = new Date();
          newData.push({
            time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            consumption: currentData.currentLoad + (Math.random() - 0.5) * 20,
            generation: currentData.solarGeneration + currentData.windGeneration + (Math.random() - 0.5) * 10
          });
          return newData;
        });
        
        setLastUpdated(new Date());
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setIsLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Real-time energy mix calculations (updates with currentData)
  const totalGeneration = currentData.solarGeneration + currentData.windGeneration;
  const energyBalance = totalGeneration - currentData.currentLoad;
  const batteryContribution = currentData.batteryLevel > 50 ? 25 : 0;

  // Real-time energy mix data for pie chart
  const energyMixData = [
    { name: 'Solar', value: currentData.solarGeneration, color: '#f59e0b' },
    { name: 'Wind', value: currentData.windGeneration, color: '#3b82f6' },
    { name: 'Battery', value: batteryContribution, color: '#8b5cf6' },
    { name: 'Grid', value: currentData.gridUsage, color: '#ef4444' }
  ];

  // Real-time consumption vs generation data
  const realTimeData = [
    {
      time: 'Now',
      consumption: currentData.currentLoad,
      solarGen: currentData.solarGeneration,
      windGen: currentData.windGeneration,
      batteryOut: batteryContribution,
      gridImport: currentData.gridUsage
    }
  ];

  // Smart recommendations
  const recommendations = [
    {
      type: 'optimization',
      title: 'Battery Optimization',
      description: 'Consider charging battery during peak solar hours (10 AM - 2 PM) for maximum efficiency.',
      priority: 'high'
    },
    {
      type: 'energy',
      title: 'Load Shifting',
      description: 'High energy activities can be scheduled during peak generation hours to reduce grid dependency.',
      priority: 'medium'
    },
    {
      type: 'maintenance',
      title: 'System Performance',
      description: 'Wind turbine #2 showing reduced efficiency. Schedule maintenance check.',
      priority: 'low'
    }
  ];

  const todaySummary = {
    energyGenerated: '1,247 kWh',
    energyConsumed: '1,089 kWh',
    costSavings: '₹2,340',
    carbonOffset: '0.89 tons CO₂'
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search energy data, reports..." 
            className="pl-10 bg-white"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm text-gray-600">
            Last updated: {lastUpdated.toLocaleString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit',
              day: '2-digit',
              month: 'short'
            })}
          </div>
          
          <Badge variant="outline" className="flex items-center gap-2 bg-green-50 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Data
          </Badge>
          
          <Badge variant="outline" className="flex items-center gap-2">
            <Wifi className="h-3 w-3 text-green-600" />
            Online
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
          System running in enhanced mode with real-time data visualization. All energy metrics are updating every 30 seconds.
        </AlertDescription>
      </Alert>

      {/* Enhanced Energy Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Solar Generation */}
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Solar Generation</CardTitle>
            <Sun className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{currentData.solarGeneration.toFixed(1)} kW</div>
            <p className="text-xs text-orange-700">
              Peak efficiency: 94%
            </p>
          </CardContent>
        </Card>

        {/* Wind Generation */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Wind Generation</CardTitle>
            <Wind className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{currentData.windGeneration.toFixed(1)} kW</div>
            <p className="text-xs text-blue-700">
              Wind speed: 12 km/h
            </p>
          </CardContent>
        </Card>

        {/* Battery Level */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Battery Level</CardTitle>
            <Battery className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{currentData.batteryLevel.toFixed(1)}%</div>
            <p className="text-xs text-purple-700">
              {currentData.batteryLevel > 50 ? 'Discharging' : 'Charging'}
            </p>
          </CardContent>
        </Card>

        {/* Grid Usage */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Grid Usage</CardTitle>
            <Zap className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{currentData.gridUsage.toFixed(1)} kW</div>
            <p className="text-xs text-red-700">
              High Consumption
            </p>
          </CardContent>
        </Card>

        {/* Current Load */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Current Load</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{currentData.currentLoad.toFixed(1)} kW</div>
            <p className="text-xs text-green-700">
              Efficiency: {currentData.efficiency.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Energy Mix Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Current Energy Mix Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Current Energy Mix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={energyMixData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {energyMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kW`, 'Power']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Consumption Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Energy Sources (Real-time)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={realTimeData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="time" type="category" width={60} />
                  <Tooltip />
                  <Bar dataKey="solarGen" stackId="sources" fill="#f59e0b" name="Solar (kW)" />
                  <Bar dataKey="windGen" stackId="sources" fill="#3b82f6" name="Wind (kW)" />
                  <Bar dataKey="batteryOut" stackId="sources" fill="#8b5cf6" name="Battery (kW)" />
                  <Bar dataKey="gridImport" stackId="sources" fill="#ef4444" name="Grid (kW)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Live Energy Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Live Energy Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Generation */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-yellow-600">⚡ Generation</span>
                  <span className="font-medium">{(currentData.solarGeneration + currentData.windGeneration).toFixed(1)} kW</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, ((currentData.solarGeneration + currentData.windGeneration) / 200) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Consumption */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-600">🏠 Consumption</span>
                  <span className="font-medium">{currentData.currentLoad.toFixed(1)} kW</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (currentData.currentLoad / 300) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Battery Status */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-600">🔋 Battery</span>
                  <span className="font-medium">{currentData.batteryLevel.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      currentData.batteryLevel > 50 ? 'bg-green-500' : 
                      currentData.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} 
                    style={{ width: `${currentData.batteryLevel}%` }}
                  />
                </div>
              </div>

              {/* Grid Usage */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-600">🏭 Grid Usage</span>
                  <span className="font-medium">{currentData.gridUsage.toFixed(1)} kW</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (currentData.gridUsage / 200) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Energy Balance Indicator */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Energy Balance:</span>
                  <Badge 
                    variant={
                      (currentData.solarGeneration + currentData.windGeneration) > currentData.currentLoad 
                        ? 'default' 
                        : 'destructive'
                    }
                    className={
                      (currentData.solarGeneration + currentData.windGeneration) > currentData.currentLoad
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {(currentData.solarGeneration + currentData.windGeneration) > currentData.currentLoad ? 'Surplus' : 'Deficit'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Consumption Trend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Consumption vs Generation (Last 10 Minutes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={realtimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#dc2626" 
                  strokeWidth={3}
                  name="Consumption (kW)"
                  dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="generation" 
                  stroke="#16a34a" 
                  strokeWidth={3}
                  name="Generation (kW)"
                  dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation vs Demand Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Generation vs Demand (Next 6 Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="totalDemand" 
                    stackId="1"
                    stroke="#ef4444" 
                    fill="#fecaca" 
                    name="Total Demand"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="solarGeneration" 
                    stackId="2"
                    stroke="#f59e0b" 
                    fill="#fed7aa" 
                    name="Solar Generation"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="windGeneration" 
                    stackId="3"
                    stroke="#3b82f6" 
                    fill="#93c5fd" 
                    name="Wind Generation"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Battery & Grid Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-5 w-5" />
              Battery & Grid Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="batteryLevel" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Battery Level (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gridUsage" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Grid Usage (kW)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Recommendations & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smart Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-3 rounded-lg border bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  <Badge 
                    variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{rec.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Energy Generated</p>
                <p className="text-lg font-semibold text-green-600">{todaySummary.energyGenerated}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Energy Consumed</p>
                <p className="text-lg font-semibold">{todaySummary.energyConsumed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cost Savings</p>
                <p className="text-lg font-semibold text-blue-600">{todaySummary.costSavings}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Carbon Offset</p>
                <p className="text-lg font-semibold text-green-600">{todaySummary.carbonOffset}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}