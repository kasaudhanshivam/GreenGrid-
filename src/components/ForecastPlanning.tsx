import { useState, useEffect } from 'react';
import { Cloud, Sun, Wind, Zap, Calendar, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { EnergyChart } from './EnergyChart';
import { energySimulator, EnergyData } from '../utils/energyData';

interface TimeBlock {
  time: string;
  period: string;
  generation: number;
  demand: number;
  surplus: number;
  weather: string | undefined;
  recommendation: string;
  status: 'surplus' | 'deficit' | 'balanced';
}

export function ForecastPlanning() {
  const [forecastData, setForecastData] = useState<EnergyData[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'6h' | '12h' | '24h'>('12h');

  useEffect(() => {
    const updateData = () => {
      const hours = selectedPeriod === '6h' ? 6 : selectedPeriod === '12h' ? 12 : 24;
      const forecast = energySimulator.generateForecastData(hours);
      setForecastData(forecast);
      
      // Create time blocks for planning view
      const blocks: TimeBlock[] = [];
      for (let i = 0; i < forecast.length; i += 2) {
        const data = forecast[i];
        const nextData = forecast[i + 1];
        if (!data) continue;
        
        const time = new Date(data.timestamp);
        const generation = data.solar_gen_kW + data.wind_gen_kW;
        const surplus = generation - data.load_demand_kW;
        
        const getRecommendation = () => {
          if (surplus > 50) return "Ideal for heavy machinery, lab equipment";
          if (surplus > 20) return "Good for pumps, HVAC optimization";
          if (surplus > 0) return "Light equipment operation recommended";
          if (surplus > -30) return "Essential loads only";
          return "Peak demand - avoid non-critical loads";
        };

        blocks.push({
          time: time.toISOString(),
          period: `${time.getHours().toString().padStart(2, '0')}:00-${(time.getHours() + 2).toString().padStart(2, '0')}:00`,
          generation: generation,
          demand: data.load_demand_kW,
          surplus: surplus,
          weather: data.weather,
          recommendation: getRecommendation(),
          status: surplus > 10 ? 'surplus' : surplus < -10 ? 'deficit' : 'balanced'
        });
      }
      setTimeBlocks(blocks);
    };

    updateData();
    const interval = setInterval(updateData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const getWeatherIcon = (weather: string | undefined) => {
    if (!weather) return <Sun className="h-4 w-4 text-yellow-500" />;
    
    switch (weather.toLowerCase()) {
      case 'sunny': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'windy': return <Wind className="h-4 w-4 text-blue-500" />;
      case 'cloudy':
      case 'partly cloudy': return <Cloud className="h-4 w-4 text-gray-500" />;
      case 'clear': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'dusty': return <Cloud className="h-4 w-4 text-orange-500" />;
      default: return <Sun className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: 'surplus' | 'deficit' | 'balanced') => {
    switch (status) {
      case 'surplus': return 'bg-green-50 border-green-200 text-green-800';
      case 'deficit': return 'bg-red-50 border-red-200 text-red-800';
      case 'balanced': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getStatusBadge = (status: 'surplus' | 'deficit' | 'balanced') => {
    switch (status) {
      case 'surplus': return <Badge className="bg-green-100 text-green-800 border-green-300">Surplus</Badge>;
      case 'deficit': return <Badge variant="destructive">Deficit</Badge>;
      case 'balanced': return <Badge variant="secondary">Balanced</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl">Forecast & Planning</h1>
          <p className="text-muted-foreground">Optimize energy usage with predictive analytics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={selectedPeriod === '6h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('6h')}
          >
            6 Hours
          </Button>
          <Button
            variant={selectedPeriod === '12h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('12h')}
          >
            12 Hours
          </Button>
          <Button
            variant={selectedPeriod === '24h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('24h')}
          >
            24 Hours
          </Button>
        </div>
      </div>

      {/* Forecast Overview Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <EnergyChart
          title={`Energy Forecast - Next ${selectedPeriod.replace('h', ' Hours')}`}
          data={forecastData}
          type="area"
          dataKeys={[
            { key: 'solar_gen_kW', name: 'Solar Generation', color: '#f59e0b' },
            { key: 'wind_gen_kW', name: 'Wind Generation', color: '#3b82f6' },
            { key: 'load_demand_kW', name: 'Expected Demand', color: '#ef4444' }
          ]}
          height={300}
        />
      </div>

      {/* Time Blocks Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Load Planning Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeBlocks.map((block, index) => (
              <Card key={index} className={`${getStatusColor(block.status)} transition-all hover:shadow-md`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{block.period}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getWeatherIcon(block.weather)}
                      {getStatusBadge(block.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Generation:</span>
                      <div className="text-green-600">{block.generation.toFixed(1)} kW</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Demand:</span>
                      <div className="text-blue-600">{block.demand.toFixed(1)} kW</div>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-muted-foreground">Net:</span>
                    <div className={`${block.surplus > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {block.surplus > 0 ? '+' : ''}{block.surplus.toFixed(1)} kW
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-current/20">
                    <div className="text-xs text-muted-foreground mb-1">Recommendation:</div>
                    <div className="text-sm">{block.recommendation}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Planning Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Times Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Optimal Operation Windows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeBlocks
              .filter(block => block.status === 'surplus')
              .sort((a, b) => b.surplus - a.surplus)
              .slice(0, 3)
              .map((block, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <div className="text-sm">{block.period}</div>
                    <div className="text-xs text-muted-foreground">{block.weather || 'Clear'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-600">+{block.surplus.toFixed(1)} kW</div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Caution Periods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              High Demand Periods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeBlocks
              .filter(block => block.status === 'deficit')
              .sort((a, b) => a.surplus - b.surplus)
              .slice(0, 3)
              .map((block, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <div className="text-sm">{block.period}</div>
                    <div className="text-xs text-muted-foreground">{block.weather || 'Clear'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-red-600">{block.surplus.toFixed(1)} kW</div>
                    <div className="text-xs text-muted-foreground">Deficit</div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Load Shifting Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Smart Load Shifting Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm mb-2">Laboratory Equipment</h4>
              <p className="text-xs text-muted-foreground mb-2">High energy consumption (50-100 kW)</p>
              <p className="text-sm text-blue-700">
                Best window: {timeBlocks.find(b => b.surplus > 50)?.period || 'No optimal window'} 
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="text-sm mb-2">HVAC Systems</h4>
              <p className="text-xs text-muted-foreground mb-2">Moderate consumption (30-60 kW)</p>
              <p className="text-sm text-green-700">
                Best window: {timeBlocks.find(b => b.surplus > 30)?.period || 'Multiple windows available'}
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="text-sm mb-2">Water Pumps</h4>
              <p className="text-xs text-muted-foreground mb-2">Low consumption (10-30 kW)</p>
              <p className="text-sm text-yellow-700">
                Best window: {timeBlocks.find(b => b.surplus > 20)?.period || 'Flexible scheduling'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}