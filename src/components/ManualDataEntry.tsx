// Manual Data Entry Component
// Allows users to manually input energy data for testing and override scenarios

import { useState } from 'react';
import { Save, Upload, Download, RefreshCw, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { EnergyData } from '../utils/energyData';
import { energyDataService } from '../services/energyDataService';

interface ValidationError {
  field: string;
  message: string;
}

export function ManualDataEntry() {
  const [formData, setFormData] = useState<Partial<EnergyData>>({
    timestamp: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format
    solar_gen_kW: 0,
    wind_gen_kW: 0,
    load_demand_kW: 0,
    battery_soc_percent: 50,
    grid_import_kW: 0,
    grid_export_kW: 0,
    weather: 'Sunny',
    forecast: 'Balanced',
    temperature: 25,
    carbon_saved_kg: 0
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Weather condition options
  const weatherOptions = [
    'Sunny', 'Partly Cloudy', 'Cloudy', 'Overcast', 
    'Light Rain', 'Heavy Rain', 'Stormy', 'Foggy', 'Windy'
  ];

  // Forecast options
  const forecastOptions = ['Surplus', 'Balanced', 'Deficit'] as const;

  // Handle form field changes
  const handleFieldChange = (field: keyof EnergyData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation errors for this field
    setValidationErrors(prev => prev.filter(error => error.field !== field));
    setSubmitStatus('idle');
  };

  // Validate form data
  const validateForm = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Required fields
    if (!formData.timestamp) {
      errors.push({ field: 'timestamp', message: 'Timestamp is required' });
    }

    // Numeric validations
    const numericFields = [
      { field: 'solar_gen_kW', min: 0, max: 10000 },
      { field: 'wind_gen_kW', min: 0, max: 10000 },
      { field: 'load_demand_kW', min: 0, max: 10000 },
      { field: 'battery_soc_percent', min: 0, max: 100 },
      { field: 'grid_import_kW', min: 0, max: 10000 },
      { field: 'grid_export_kW', min: 0, max: 10000 },
      { field: 'temperature', min: -50, max: 70 },
      { field: 'carbon_saved_kg', min: 0, max: 100000 }
    ];

    numericFields.forEach(({ field, min, max }) => {
      const value = formData[field as keyof EnergyData] as number;
      if (value === undefined || value === null) {
        errors.push({ field, message: `${field} is required` });
      } else if (value < min || value > max) {
        errors.push({ field, message: `${field} must be between ${min} and ${max}` });
      }
    });

    // Business logic validations
    const solarGen = formData.solar_gen_kW || 0;
    const windGen = formData.wind_gen_kW || 0;
    const totalGen = solarGen + windGen;
    const loadDemand = formData.load_demand_kW || 0;
    const gridImport = formData.grid_import_kW || 0;
    const gridExport = formData.grid_export_kW || 0;

    // Grid import and export cannot both be positive
    if (gridImport > 0 && gridExport > 0) {
      errors.push({ 
        field: 'grid_import_kW', 
        message: 'Cannot import and export grid power simultaneously' 
      });
    }

    // Energy balance check (with tolerance)
    const energyBalance = totalGen + gridImport - loadDemand - gridExport;
    if (Math.abs(energyBalance) > (totalGen + loadDemand) * 0.1) { // 10% tolerance
      errors.push({ 
        field: 'load_demand_kW', 
        message: 'Energy balance seems incorrect. Check generation vs consumption values.' 
      });
    }

    return errors;
  };

  // Submit form data
  const handleSubmit = async () => {
    const errors = validateForm();
    setValidationErrors(errors);

    if (errors.length > 0) {
      setSubmitStatus('error');
      setSubmitMessage('Please fix validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Convert form data to complete EnergyData object
      const completeData: EnergyData = {
        timestamp: formData.timestamp || new Date().toISOString(),
        solar_gen_kW: formData.solar_gen_kW || 0,
        wind_gen_kW: formData.wind_gen_kW || 0,
        load_demand_kW: formData.load_demand_kW || 0,
        battery_soc_percent: formData.battery_soc_percent || 0,
        grid_import_kW: formData.grid_import_kW || 0,
        grid_export_kW: formData.grid_export_kW || 0,
        weather: formData.weather || 'Unknown',
        forecast: formData.forecast || 'Balanced',
        temperature: formData.temperature || 25,
        carbon_saved_kg: formData.carbon_saved_kg || 0
      };

      // TODO: Replace with actual API call to submit manual data
      // await energyDataService.submitManualData(completeData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Manual data submitted:', completeData);
      
      setSubmitStatus('success');
      setSubmitMessage('Energy data submitted successfully');
      
      // Reset form after successful submission
      setTimeout(() => {
        handleReset();
      }, 2000);

    } catch (error) {
      console.error('Error submitting manual data:', error);
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'Failed to submit data');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to default values
  const handleReset = () => {
    setFormData({
      timestamp: new Date().toISOString().slice(0, 16),
      solar_gen_kW: 0,
      wind_gen_kW: 0,
      load_demand_kW: 0,
      battery_soc_percent: 50,
      grid_import_kW: 0,
      grid_export_kW: 0,
      weather: 'Sunny',
      forecast: 'Balanced',
      temperature: 25,
      carbon_saved_kg: 0
    });
    setValidationErrors([]);
    setSubmitStatus('idle');
    setSubmitMessage('');
  };

  // Load current data to form
  const handleLoadCurrentData = async () => {
    try {
      const currentData = await energyDataService.getCurrentData();
      setFormData({
        ...currentData,
        timestamp: new Date().toISOString().slice(0, 16)
      });
      setSubmitMessage('Current system data loaded');
    } catch (error) {
      setSubmitMessage('Failed to load current data');
    }
  };

  // Export form data as JSON
  const handleExportData = () => {
    const dataToExport = {
      ...formData,
      exported_at: new Date().toISOString(),
      source: 'manual_entry'
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manual-energy-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Check if field has validation error
  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl">Manual Data Entry</h2>
          <p className="text-muted-foreground">
            Input energy data manually for testing, calibration, or emergency scenarios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Database className="h-3 w-3 mr-1" />
            Manual Input Mode
          </Badge>
        </div>
      </div>

      {/* Status Alert */}
      {submitStatus !== 'idle' && (
        <Alert className={submitStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {submitStatus === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={submitStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
            {submitMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Energy Data Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timestamp */}
            <div className="space-y-2">
              <Label htmlFor="timestamp">Timestamp *</Label>
              <Input
                id="timestamp"
                type="datetime-local"
                value={formData.timestamp?.slice(0, 16) || ''}
                onChange={(e) => handleFieldChange('timestamp', e.target.value)}
                className={getFieldError('timestamp') ? 'border-red-500' : ''}
              />
              {getFieldError('timestamp') && (
                <p className="text-sm text-red-600">{getFieldError('timestamp')?.message}</p>
              )}
            </div>

            <Separator />

            {/* Generation Data */}
            <div className="space-y-4">
              <h4 className="text-sm">Energy Generation (kW)</h4>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="solar_gen_kW">Solar Generation *</Label>
                  <Input
                    id="solar_gen_kW"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.solar_gen_kW || ''}
                    onChange={(e) => handleFieldChange('solar_gen_kW', parseFloat(e.target.value) || 0)}
                    className={getFieldError('solar_gen_kW') ? 'border-red-500' : ''}
                  />
                  {getFieldError('solar_gen_kW') && (
                    <p className="text-sm text-red-600">{getFieldError('solar_gen_kW')?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wind_gen_kW">Wind Generation *</Label>
                  <Input
                    id="wind_gen_kW"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.wind_gen_kW || ''}
                    onChange={(e) => handleFieldChange('wind_gen_kW', parseFloat(e.target.value) || 0)}
                    className={getFieldError('wind_gen_kW') ? 'border-red-500' : ''}
                  />
                  {getFieldError('wind_gen_kW') && (
                    <p className="text-sm text-red-600">{getFieldError('wind_gen_kW')?.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Consumption & Storage */}
            <div className="space-y-4">
              <h4 className="text-sm">Energy Consumption & Storage</h4>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="load_demand_kW">Load Demand (kW) *</Label>
                  <Input
                    id="load_demand_kW"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.load_demand_kW || ''}
                    onChange={(e) => handleFieldChange('load_demand_kW', parseFloat(e.target.value) || 0)}
                    className={getFieldError('load_demand_kW') ? 'border-red-500' : ''}
                  />
                  {getFieldError('load_demand_kW') && (
                    <p className="text-sm text-red-600">{getFieldError('load_demand_kW')?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="battery_soc_percent">Battery SOC (%) *</Label>
                  <Input
                    id="battery_soc_percent"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.battery_soc_percent || ''}
                    onChange={(e) => handleFieldChange('battery_soc_percent', parseFloat(e.target.value) || 0)}
                    className={getFieldError('battery_soc_percent') ? 'border-red-500' : ''}
                  />
                  {getFieldError('battery_soc_percent') && (
                    <p className="text-sm text-red-600">{getFieldError('battery_soc_percent')?.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Grid Exchange */}
            <div className="space-y-4">
              <h4 className="text-sm">Grid Exchange (kW)</h4>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="grid_import_kW">Grid Import *</Label>
                  <Input
                    id="grid_import_kW"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.grid_import_kW || ''}
                    onChange={(e) => handleFieldChange('grid_import_kW', parseFloat(e.target.value) || 0)}
                    className={getFieldError('grid_import_kW') ? 'border-red-500' : ''}
                  />
                  {getFieldError('grid_import_kW') && (
                    <p className="text-sm text-red-600">{getFieldError('grid_import_kW')?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grid_export_kW">Grid Export *</Label>
                  <Input
                    id="grid_export_kW"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.grid_export_kW || ''}
                    onChange={(e) => handleFieldChange('grid_export_kW', parseFloat(e.target.value) || 0)}
                    className={getFieldError('grid_export_kW') ? 'border-red-500' : ''}
                  />
                  {getFieldError('grid_export_kW') && (
                    <p className="text-sm text-red-600">{getFieldError('grid_export_kW')?.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Environmental Data */}
            <div className="space-y-4">
              <h4 className="text-sm">Environmental Conditions</h4>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weather">Weather Condition *</Label>
                  <Select 
                    value={formData.weather || ''} 
                    onValueChange={(value) => handleFieldChange('weather', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select weather condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {weatherOptions.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C) *</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="-50"
                    max="70"
                    step="0.1"
                    value={formData.temperature || ''}
                    onChange={(e) => handleFieldChange('temperature', parseFloat(e.target.value) || 0)}
                    className={getFieldError('temperature') ? 'border-red-500' : ''}
                  />
                  {getFieldError('temperature') && (
                    <p className="text-sm text-red-600">{getFieldError('temperature')?.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="forecast">Energy Forecast *</Label>
                  <Select 
                    value={formData.forecast || ''} 
                    onValueChange={(value) => handleFieldChange('forecast', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select forecast" />
                    </SelectTrigger>
                    <SelectContent>
                      {forecastOptions.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carbon_saved_kg">Carbon Saved (kg) *</Label>
                  <Input
                    id="carbon_saved_kg"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.carbon_saved_kg || ''}
                    onChange={(e) => handleFieldChange('carbon_saved_kg', parseFloat(e.target.value) || 0)}
                    className={getFieldError('carbon_saved_kg') ? 'border-red-500' : ''}
                  />
                  {getFieldError('carbon_saved_kg') && (
                    <p className="text-sm text-red-600">{getFieldError('carbon_saved_kg')?.message}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions & Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Actions & Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Actions */}
            <div className="grid gap-2">
              <Button 
                onClick={handleLoadCurrentData} 
                variant="outline" 
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Current System Data
              </Button>
              
              <Button 
                onClick={handleExportData} 
                variant="outline" 
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export as JSON
              </Button>
            </div>

            <Separator />

            {/* Data Preview */}
            <div className="space-y-2">
              <h4 className="text-sm">Data Preview</h4>
              <div className="text-xs space-y-1 bg-muted p-3 rounded-md max-h-60 overflow-y-auto">
                <pre>{JSON.stringify(formData, null, 2)}</pre>
              </div>
            </div>

            <Separator />

            {/* Validation Status */}
            {validationErrors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm text-red-600">Validation Errors</h4>
                <ul className="text-xs text-red-600 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Actions */}
            <div className="grid gap-2 pt-4">
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || validationErrors.length > 0}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit Data
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleReset} 
                variant="outline" 
                className="w-full"
                disabled={isSubmitting}
              >
                Reset Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}