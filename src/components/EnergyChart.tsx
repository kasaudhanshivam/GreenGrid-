import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts@2.15.2';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { EnergyData } from '../utils/energyData';

interface EnergyChartProps {
  data: EnergyData[];
  title: string;
  type?: 'line' | 'area' | 'bar';
  dataKeys: {
    key: keyof EnergyData;
    name: string;
    color: string;
  }[];
  height?: number;
  timeInterval?: string;
}

export function EnergyChart({ data, title, type = 'area', dataKeys, height = 300, timeInterval = '1h' }: EnergyChartProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    // Format based on time interval
    switch (timeInterval) {
      case '15m':
      case '30m':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      case '1h':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      case '6h':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit',
          hour12: false 
        });
      case '1d':
        return date.toLocaleDateString('en-US', { 
          month: 'short',
          day: 'numeric'
        });
      default:
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
    }
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (typeof value === 'number') {
      return [value.toFixed(1), name];
    }
    return [value, name];
  };

  // Sample data based on time interval to avoid overcrowding
  const getSampledData = () => {
    if (!data || data.length === 0) return [];
    
    let sampleRate = 1;
    switch (timeInterval) {
      case '15m':
        sampleRate = 1; // Show all points for fine detail
        break;
      case '30m':
        sampleRate = 1;
        break;
      case '1h':
        sampleRate = 1;
        break;
      case '6h':
        sampleRate = Math.max(1, Math.floor(data.length / 12)); // Max 12 points
        break;
      case '1d':
        sampleRate = Math.max(1, Math.floor(data.length / 24)); // Max 24 points
        break;
    }
    
    return data.filter((_, index) => index % sampleRate === 0);
  };

  const chartData = getSampledData().map(item => ({
    ...item,
    time: formatTime(item.timestamp)
  }));

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="time" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              formatter={formatTooltipValue}
              labelClassName="text-sm"
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            {dataKeys.map(({ key, name, color }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                name={name}
                dot={false}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="time" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              formatter={formatTooltipValue}
              labelClassName="text-sm"
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            {dataKeys.map(({ key, name, color }) => (
              <Bar
                key={key}
                dataKey={key}
                fill={color}
                name={name}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        );

      default: // area
        return (
          <AreaChart data={chartData}>
            <defs>
              {dataKeys.map(({ key, color }) => (
                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.05}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="time" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              formatter={formatTooltipValue}
              labelClassName="text-sm"
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            {dataKeys.map(({ key, name, color }) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${key})`}
                name={name}
              />
            ))}
          </AreaChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}