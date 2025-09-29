import { Cloud, Sun, Wind, Droplets, Eye, Thermometer, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { WeatherData, EnergyPrediction, SystemMode } from '../utils/weatherBasedEnergyData';

interface WeatherForecastCardProps {
  weatherData: WeatherData;
  energyPrediction: EnergyPrediction;
  systemMode: SystemMode;
}

export function WeatherForecastCard({ weatherData, energyPrediction, systemMode }: WeatherForecastCardProps) {
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'partly_cloudy':
      case 'partly cloudy':
        return <Cloud className="h-5 w-5 text-gray-400" />;
      case 'cloudy':
        return <Cloud className="h-5 w-5 text-gray-600" />;
      case 'rainy':
        return <Droplets className="h-5 w-5 text-blue-500" />;
      case 'dusty':
        return <Wind className="h-5 w-5 text-orange-500" />;
      case 'clear_night':
      case 'clear night':
        return <Sun className="h-5 w-5 text-purple-400" />;
      default:
        return <Cloud className="h-5 w-5 text-gray-400" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'partly_cloudy':
      case 'partly cloudy':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'cloudy':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rainy':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'dusty':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'clear_night':
      case 'clear night':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRecommendationColor = (recommendation: EnergyPrediction['recommendation']) => {
    switch (recommendation) {
      case 'charge_now':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'discharge_now':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'prepare_for_peak':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'maintain':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRecommendationText = (recommendation: EnergyPrediction['recommendation']) => {
    switch (recommendation) {
      case 'charge_now':
        return 'Charge Battery Now';
      case 'discharge_now':
        return 'Use Battery Power';
      case 'prepare_for_peak':
        return 'Prepare for Peak Load';
      case 'maintain':
        return 'Maintain Current Level';
      default:
        return 'Maintain';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          Weather Forecast & Energy Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Weather Conditions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {getWeatherIcon(weatherData.condition)}
            </div>
            <Badge variant="outline" className={getConditionColor(weatherData.condition)}>
              {weatherData.condition.replace('_', ' ')}
            </Badge>
            <div className="text-sm text-muted-foreground mt-1">Current</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">{weatherData.temperature}°C</div>
            <div className="text-sm text-muted-foreground">Temperature</div>
            <div className="text-xs text-muted-foreground">{weatherData.humidity}% humidity</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{weatherData.windSpeed} m/s</div>
            <div className="text-sm text-muted-foreground">Wind Speed</div>
            <div className="text-xs text-muted-foreground">
              {weatherData.windSpeed > 10 ? 'Strong' : weatherData.windSpeed > 5 ? 'Moderate' : 'Light'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{weatherData.cloudCover}%</div>
            <div className="text-sm text-muted-foreground">Cloud Cover</div>
            <div className="text-xs text-muted-foreground">UV: {weatherData.uvIndex}</div>
          </div>
        </div>

        {/* 24-Hour Forecast */}
        {weatherData.forecast && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              24-Hour Energy Forecast
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Next 1 Hour */}
              {weatherData.forecast.next1h && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Next 1 Hour</span>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Temp:</span>
                      <span>{weatherData.forecast.next1h.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wind:</span>
                      <span>{weatherData.forecast.next1h.windSpeed.toFixed(1)} m/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clouds:</span>
                      <span>{weatherData.forecast.next1h.cloudCover.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Next 6 Hours */}
              {weatherData.forecast.next6h && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Next 6 Hours</span>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Temp:</span>
                      <span>{weatherData.forecast.next6h.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wind:</span>
                      <span>{weatherData.forecast.next6h.windSpeed.toFixed(1)} m/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clouds:</span>
                      <span>{weatherData.forecast.next6h.cloudCover.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Next 24 Hours */}
              {weatherData.forecast.next24h && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Next 24 Hours</span>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Temp:</span>
                      <span>{weatherData.forecast.next24h.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wind:</span>
                      <span>{weatherData.forecast.next24h.windSpeed.toFixed(1)} m/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clouds:</span>
                      <span>{weatherData.forecast.next24h.cloudCover.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Recommendation */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">AI-Powered Battery Optimization</h4>
          <div className="flex items-center justify-between">
            <div>
              <Badge 
                variant="outline" 
                className={`${getRecommendationColor(energyPrediction.recommendation)} text-base px-3 py-1`}
              >
                {getRecommendationText(energyPrediction.recommendation)}
              </Badge>
              <div className="text-sm text-muted-foreground mt-2">
                Optimal battery level: {energyPrediction.batteryOptimalCharge.toFixed(0)}%
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Data Source: {systemMode === 'online' ? 'Weather API' : 'IoT Sensors'}</div>
              <div className="flex items-center gap-1 mt-1">
                <Eye className="h-3 w-3" />
                Visibility: {weatherData.visibility} km
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}