import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, Leaf, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { EnergyChart } from './EnergyChart';
import { energySimulator, EnergyData } from '../utils/energyData';

interface DailySummary {
  date: string;
  totalGeneration: number;
  totalConsumption: number;
  batteryEfficiency: number;
  carbonSaved: number;
  gridDependency: number;
}

export function Analytics() {
  const [historicalData, setHistoricalData] = useState<EnergyData[]>([]);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    const updateData = () => {
      const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
      const historical = energySimulator.generateHistoricalData(days);
      setHistoricalData(historical);

      // Calculate daily summaries
      const summaries: DailySummary[] = [];
      const dataByDay = historical.reduce((acc, data) => {
        const date = new Date(data.timestamp).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(data);
        return acc;
      }, {} as Record<string, EnergyData[]>);

      Object.entries(dataByDay).forEach(([date, dayData]) => {
        const totalGeneration = dayData.reduce((sum, d) => sum + d.solar_gen_kW + d.wind_gen_kW, 0);
        const totalConsumption = dayData.reduce((sum, d) => sum + d.load_demand_kW, 0);
        const avgBattery = dayData.reduce((sum, d) => sum + d.battery_soc_percent, 0) / dayData.length;
        const carbonSaved = dayData.reduce((sum, d) => sum + d.carbon_saved_kg, 0);
        const gridUsage = dayData.reduce((sum, d) => sum + d.grid_import_kW, 0);
        
        summaries.push({
          date,
          totalGeneration: Math.round(totalGeneration * 100) / 100,
          totalConsumption: Math.round(totalConsumption * 100) / 100,
          batteryEfficiency: Math.round(avgBattery * 100) / 100,
          carbonSaved: Math.round(carbonSaved * 100) / 100,
          gridDependency: Math.round((gridUsage / (totalConsumption || 1)) * 100 * 100) / 100
        });
      });

      setDailySummaries(summaries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    };

    updateData();
  }, [selectedPeriod]);

  const exportToCSV = () => {
    const headers = ['Date', 'Total Generation (kWh)', 'Total Consumption (kWh)', 'Battery Efficiency (%)', 'Carbon Saved (kg)', 'Grid Dependency (%)'];
    const csvData = dailySummaries.map(summary => [
      summary.date,
      summary.totalGeneration,
      summary.totalConsumption,
      summary.batteryEfficiency,
      summary.carbonSaved,
      summary.gridDependency
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `energy-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const reportData = {
      period: selectedPeriod,
      generated: new Date().toISOString(),
      summaries: dailySummaries,
      totalStats: {
        totalGeneration: dailySummaries.reduce((sum, s) => sum + s.totalGeneration, 0),
        totalConsumption: dailySummaries.reduce((sum, s) => sum + s.totalConsumption, 0),
        totalCarbonSaved: dailySummaries.reduce((sum, s) => sum + s.carbonSaved, 0),
        avgGridDependency: dailySummaries.reduce((sum, s) => sum + s.gridDependency, 0) / dailySummaries.length
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `energy-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalGeneration = dailySummaries.reduce((sum, s) => sum + s.totalGeneration, 0);
  const totalConsumption = dailySummaries.reduce((sum, s) => sum + s.totalConsumption, 0);
  const totalCarbonSaved = dailySummaries.reduce((sum, s) => sum + s.carbonSaved, 0);
  const avgEfficiency = dailySummaries.length > 0 ? 
    dailySummaries.reduce((sum, s) => sum + s.batteryEfficiency, 0) / dailySummaries.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl">Analytics & Reports</h1>
          <p className="text-muted-foreground">Historical energy performance and sustainability metrics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={(value: '7d' | '30d' | '90d') => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <p className="text-sm text-muted-foreground">Total Generation</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-700">{totalGeneration.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">kWh in {selectedPeriod.replace('d', ' days')}</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-muted-foreground">Total Consumption</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-700">{totalConsumption.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">kWh consumed</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <p className="text-sm text-muted-foreground">Avg Efficiency</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-purple-700">{avgEfficiency.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">System efficiency</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-600" />
              <p className="text-sm text-muted-foreground">Carbon Saved</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-emerald-700">{totalCarbonSaved.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">kg CO₂ prevented</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <EnergyChart
          title="Historical Generation vs Consumption Trend"
          data={historicalData.filter((_, index) => index % 6 === 0)} // Sample every 6th point for readability
          type="area"
          dataKeys={[
            { key: 'solar_gen_kW', name: 'Solar', color: '#f59e0b' },
            { key: 'wind_gen_kW', name: 'Wind', color: '#3b82f6' },
            { key: 'load_demand_kW', name: 'Demand', color: '#ef4444' }
          ]}
          height={350}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnergyChart
          title="Battery Performance Over Time"
          data={historicalData.filter((_, index) => index % 8 === 0)}
          type="line"
          dataKeys={[
            { key: 'battery_soc_percent', name: 'Battery Level %', color: '#10b981' }
          ]}
          height={300}
        />

        <EnergyChart
          title="Grid Dependency Trend"
          data={historicalData.filter((_, index) => index % 8 === 0)}
          type="bar"
          dataKeys={[
            { key: 'grid_import_kW', name: 'Grid Import', color: '#8b5cf6' },
            { key: 'grid_export_kW', name: 'Grid Export', color: '#06b6d4' }
          ]}
          height={300}
        />
      </div>

      {/* Detailed Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-right p-2">Generation (kWh)</th>
                  <th className="text-right p-2">Consumption (kWh)</th>
                  <th className="text-right p-2">Battery Avg (%)</th>
                  <th className="text-right p-2">Carbon Saved (kg)</th>
                  <th className="text-right p-2">Grid Dependency (%)</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {dailySummaries.slice(-7).map((summary, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2">{new Date(summary.date).toLocaleDateString()}</td>
                    <td className="text-right p-2 text-green-600">{summary.totalGeneration.toFixed(1)}</td>
                    <td className="text-right p-2 text-blue-600">{summary.totalConsumption.toFixed(1)}</td>
                    <td className="text-right p-2">{summary.batteryEfficiency.toFixed(1)}%</td>
                    <td className="text-right p-2 text-emerald-600">{summary.carbonSaved.toFixed(1)}</td>
                    <td className="text-right p-2">{summary.gridDependency.toFixed(1)}%</td>
                    <td className="text-center p-2">
                      <Badge variant={
                        summary.gridDependency < 30 ? 'default' : 
                        summary.gridDependency < 60 ? 'secondary' : 'destructive'
                      }>
                        {summary.gridDependency < 30 ? 'Excellent' : 
                         summary.gridDependency < 60 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sustainability Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Environmental Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl text-green-600 mb-2">{totalCarbonSaved.toFixed(0)} kg</div>
              <div className="text-sm text-muted-foreground">CO₂ Emissions Prevented</div>
              <div className="text-xs text-muted-foreground mt-1">
                Equivalent to {(totalCarbonSaved / 21.77).toFixed(1)} trees planted
              </div>
            </div>
            
            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl text-blue-600 mb-2">{((totalGeneration / totalConsumption) * 100).toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Renewable Energy Ratio</div>
              <div className="text-xs text-muted-foreground mt-1">
                Of total energy consumption
              </div>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-3xl text-purple-600 mb-2">₹{(totalGeneration * 8).toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Estimated Savings</div>
              <div className="text-xs text-muted-foreground mt-1">
                Based on ₹8/kWh grid rate
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}