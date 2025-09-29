import { useState } from 'react';
import { Settings as SettingsIcon, Plus, Trash2, Bell, Users, Wifi, Save, AlertTriangle, MapPin, Cloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { SystemModeControl } from './SystemModeControl';
import { useWeatherBasedEnergyData } from '../hooks/useEnergyData';
import { SystemMode } from '../utils/weatherBasedEnergyData';

interface EnergyAsset {
  id: string;
  name: string;
  type: 'solar' | 'wind' | 'battery' | 'grid';
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  location: string;
}

interface AlertThreshold {
  id: string;
  name: string;
  value: number;
  unit: string;
  enabled: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer' | 'operator';
  lastLogin: string;
}

export function Settings() {
  // Weather-based energy data hook
  const { systemMode, setSystemMode } = useWeatherBasedEnergyData();

  const handleReconfigureSetup = () => {
    const confirmReconfigure = window.confirm(
      'Are you sure you want to reconfigure your institute setup? This will reset your current configuration and take you back to the setup wizard.'
    );
    
    if (confirmReconfigure) {
      localStorage.removeItem('greengrid_setup_complete');
      localStorage.removeItem('greengrid_institute_config');
      window.location.reload(); // Reload to trigger setup page
    }
  };

  const [assets, setAssets] = useState<EnergyAsset[]>([
    { id: '1', name: 'Solar Panel Array A', type: 'solar', capacity: 150, status: 'active', location: 'Main Building Roof' },
    { id: '2', name: 'Wind Turbine Unit 1', type: 'wind', capacity: 80, status: 'active', location: 'North Campus' },
    { id: '3', name: 'Battery Bank Primary', type: 'battery', capacity: 200, status: 'active', location: 'Energy Storage Room' },
    { id: '4', name: 'Grid Connection', type: 'grid', capacity: 500, status: 'active', location: 'Main Electrical Panel' }
  ]);

  const [alertThresholds, setAlertThresholds] = useState<AlertThreshold[]>([
    { id: '1', name: 'Battery Low Warning', value: 20, unit: '%', enabled: true },
    { id: '2', name: 'High Grid Usage Alert', value: 100, unit: 'kW', enabled: true },
    { id: '3', name: 'Solar Generation Low', value: 50, unit: 'kW', enabled: false },
    { id: '4', name: 'Peak Load Warning', value: 250, unit: 'kW', enabled: true }
  ]);

  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Dr. Rajesh Kumar', email: 'rajesh@institute.edu', role: 'admin', lastLogin: '2024-01-15 09:30' },
    { id: '2', name: 'Priya Sharma', email: 'priya@institute.edu', role: 'operator', lastLogin: '2024-01-15 08:45' },
    { id: '3', name: 'Amit Singh', email: 'amit@institute.edu', role: 'viewer', lastLogin: '2024-01-14 16:20' }
  ]);

  const [newAsset, setNewAsset] = useState({ name: '', type: 'solar', capacity: 0, location: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'viewer' });
  
  // Weather API Configuration
  const [useCustomWeatherApi, setUseCustomWeatherApi] = useState(false);
  const [weatherApiKey, setWeatherApiKey] = useState('');
  const [location, setLocation] = useState({
    latitude: 26.9124, // Jaipur, Rajasthan
    longitude: 75.7873,
    city: 'Jaipur',
    state: 'Rajasthan'
  });
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const addAsset = () => {
    if (newAsset.name && newAsset.capacity > 0 && newAsset.location) {
      const asset: EnergyAsset = {
        id: Date.now().toString(),
        name: newAsset.name,
        type: newAsset.type as 'solar' | 'wind' | 'battery' | 'grid',
        capacity: newAsset.capacity,
        status: 'active',
        location: newAsset.location
      };
      setAssets([...assets, asset]);
      setNewAsset({ name: '', type: 'solar', capacity: 0, location: '' });
    }
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const toggleAssetStatus = (id: string) => {
    setAssets(assets.map(asset => 
      asset.id === id 
        ? { ...asset, status: asset.status === 'active' ? 'inactive' : 'active' }
        : asset
    ));
  };

  const addUser = () => {
    if (newUser.name && newUser.email) {
      const user: User = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as 'admin' | 'viewer' | 'operator',
        lastLogin: 'Never'
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', role: 'viewer' });
    }
  };

  const removeUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const updateThreshold = (id: string, value: number) => {
    setAlertThresholds(alertThresholds.map(threshold =>
      threshold.id === id ? { ...threshold, value } : threshold
    ));
  };

  const toggleThreshold = (id: string) => {
    setAlertThresholds(alertThresholds.map(threshold =>
      threshold.id === id ? { ...threshold, enabled: !threshold.enabled } : threshold
    ));
  };

  const saveSettings = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'solar': return '☀️';
      case 'wind': return '🌪️';
      case 'battery': return '🔋';
      case 'grid': return '⚡';
      default: return '⚙️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl">Settings & Administration</h1>
          <p className="text-muted-foreground">Configure system settings and manage users</p>
        </div>
        
        <Button onClick={saveSettings} disabled={saveStatus === 'saving'}>
          <Save className="h-4 w-4 mr-2" />
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>

      {/* Institute Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Institute Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Need to update your institute information or renewable energy assets? 
              You can reconfigure your GreenGrid setup at any time.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button variant="outline" onClick={handleReconfigureSetup}>
              <SettingsIcon className="h-4 w-4 mr-2" />
              Reconfigure Institute Setup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Mode Control */}
      <SystemModeControl 
        currentMode={systemMode} 
        onModeChange={setSystemMode}
      />

      {/* Energy Assets Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Energy Assets Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Assets */}
          <div className="space-y-3">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getAssetIcon(asset.type)}</span>
                  <div>
                    <div className="text-sm">{asset.name}</div>
                    <div className="text-xs text-muted-foreground">{asset.location}</div>
                  </div>
                  <Badge className={getStatusColor(asset.status)}>
                    {asset.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{asset.capacity} kW</span>
                  <Switch
                    checked={asset.status === 'active'}
                    onCheckedChange={() => toggleAssetStatus(asset.id)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAsset(asset.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Add New Asset */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="asset-name">Asset Name</Label>
              <Input
                id="asset-name"
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                placeholder="e.g., Solar Panel Array B"
              />
            </div>
            <div>
              <Label htmlFor="asset-type">Type</Label>
              <Select value={newAsset.type} onValueChange={(value) => setNewAsset({ ...newAsset, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solar">Solar Panel</SelectItem>
                  <SelectItem value="wind">Wind Turbine</SelectItem>
                  <SelectItem value="battery">Battery Storage</SelectItem>
                  <SelectItem value="grid">Grid Connection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="asset-capacity">Capacity (kW)</Label>
              <Input
                id="asset-capacity"
                type="number"
                value={newAsset.capacity || ''}
                onChange={(e) => setNewAsset({ ...newAsset, capacity: parseFloat(e.target.value) || 0 })}
                placeholder="150"
              />
            </div>
            <div>
              <Label htmlFor="asset-location">Location</Label>
              <Input
                id="asset-location"
                value={newAsset.location}
                onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                placeholder="Building location"
              />
            </div>
          </div>
          <Button onClick={addAsset} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Energy Asset
          </Button>
        </CardContent>
      </Card>

      {/* Alert Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alertThresholds.map((threshold) => (
            <div key={threshold.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Switch
                  checked={threshold.enabled}
                  onCheckedChange={() => toggleThreshold(threshold.id)}
                />
                <div>
                  <div className="text-sm">{threshold.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Alert when value crosses threshold
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={threshold.value}
                  onChange={(e) => updateThreshold(threshold.id, parseFloat(e.target.value) || 0)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">{threshold.unit}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Users */}
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                  <div className="text-xs text-muted-foreground">Last login: {user.lastLogin}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Add New User */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="user-name">Full Name</Label>
              <Input
                id="user-name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="john@institute.edu"
              />
            </div>
            <div>
              <Label htmlFor="user-role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={addUser} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            System Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Integration settings allow the system to connect with external data sources and APIs.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="weather-api">Weather API Key</Label>
              <Input
                id="weather-api"
                value={weatherApiKey}
                onChange={(e) => setWeatherApiKey(e.target.value)}
                placeholder="Enter your weather service API key"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Used for weather-based solar and wind generation forecasting
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm mb-2">Meter Integration</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Connect smart meters via Modbus/TCP protocol
                </p>
                <Badge className="bg-green-100 text-green-800 border-green-300">Connected</Badge>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm mb-2">Inverter Data</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Real-time data from solar and wind inverters
                </p>
                <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm mb-2">Battery Management</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Battery bank monitoring and control
                </p>
                <Badge className="bg-green-100 text-green-800 border-green-300">Monitoring</Badge>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm mb-2">Grid Interface</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Bi-directional grid connection monitoring
                </p>
                <Badge className="bg-green-100 text-green-800 border-green-300">Online</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}