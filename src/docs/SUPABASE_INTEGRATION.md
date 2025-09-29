# GreenGrid Supabase Integration Guide

## Overview

This guide covers how to connect GreenGrid to Supabase for backend services, including real-time data storage, user authentication, and cloud deployment.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Note down your project URL and API keys:
   - Project URL: `https://[your-project-id].supabase.co`
   - Anon Key: `eyJ...` (public key)
   - Service Role Key: `eyJ...` (secret key)

### 2. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 3. Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Weather API (Optional)
WEATHER_API_KEY=your-weather-api-key

# WebSocket Configuration
WEBSOCKET_URL=wss://your-websocket-server.com
```

## 📊 Database Schema

### Energy Data Tables

```sql
-- Energy readings table
CREATE TABLE energy_readings (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  solar_gen_kw DECIMAL(10,2),
  wind_gen_kw DECIMAL(10,2),
  load_demand_kw DECIMAL(10,2),
  battery_soc_percent DECIMAL(5,2),
  grid_import_kw DECIMAL(10,2),
  grid_export_kw DECIMAL(10,2),
  weather_condition TEXT,
  temperature DECIMAL(5,2),
  carbon_saved_kg DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weather data table
CREATE TABLE weather_data (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  condition TEXT,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  wind_speed DECIMAL(5,2),
  cloud_cover DECIMAL(5,2),
  uv_index DECIMAL(3,1),
  visibility DECIMAL(5,2),
  forecast JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Energy assets table
CREATE TABLE energy_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('solar', 'wind', 'battery', 'grid')),
  capacity_kw DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  location TEXT,
  installation_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'operator', 'viewer')),
  institute_name TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert thresholds table
CREATE TABLE alert_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  threshold_value DECIMAL(10,2),
  unit TEXT,
  enabled BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System logs table
CREATE TABLE system_logs (
  id BIGSERIAL PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error')),
  message TEXT NOT NULL,
  component TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE energy_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Policies for energy_readings (readable by authenticated users)
CREATE POLICY "Energy readings are viewable by authenticated users" 
  ON energy_readings FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Energy readings are insertable by service role" 
  ON energy_readings FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = id);
```

## 🔧 Supabase Client Setup

Create `/utils/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database types (auto-generated)
export type Database = {
  public: {
    Tables: {
      energy_readings: {
        Row: {
          id: number;
          timestamp: string;
          solar_gen_kw: number;
          wind_gen_kw: number;
          load_demand_kw: number;
          battery_soc_percent: number;
          grid_import_kw: number;
          grid_export_kw: number;
          weather_condition: string;
          temperature: number;
          carbon_saved_kg: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['energy_readings']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['energy_readings']['Insert']>;
      };
      // Add other table types...
    };
  };
};
```

## 📡 Real-time Data Integration

### Energy Data Service with Supabase

Update `/services/energyDataService.ts`:

```typescript
import { supabase } from '../utils/supabase/client';
import type { Database } from '../utils/supabase/client';

type EnergyReading = Database['public']['Tables']['energy_readings']['Row'];

export class SupabaseEnergyDataService {
  async saveEnergyReading(data: any): Promise<void> {
    const { error } = await supabase
      .from('energy_readings')
      .insert({
        solar_gen_kw: data.solar_gen_kW,
        wind_gen_kw: data.wind_gen_kW,
        load_demand_kw: data.load_demand_kW,
        battery_soc_percent: data.battery_soc_percent,
        grid_import_kw: data.grid_import_kW,
        grid_export_kw: data.grid_export_kW,
        weather_condition: data.weather,
        temperature: data.temperature,
        carbon_saved_kg: data.carbon_saved_kg
      });

    if (error) {
      throw new Error(`Failed to save energy reading: ${error.message}`);
    }
  }

  async getRecentReadings(limit: number = 100): Promise<EnergyReading[]> {
    const { data, error } = await supabase
      .from('energy_readings')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch readings: ${error.message}`);
    }

    return data || [];
  }

  async getHistoricalData(days: number): Promise<EnergyReading[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('energy_readings')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch historical data: ${error.message}`);
    }

    return data || [];
  }

  // Real-time subscription
  subscribeToEnergyUpdates(callback: (data: EnergyReading) => void) {
    return supabase
      .channel('energy_readings')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'energy_readings' },
        (payload) => callback(payload.new as EnergyReading)
      )
      .subscribe();
  }
}

export const supabaseEnergyService = new SupabaseEnergyDataService();
```

### Authentication Service

Create `/utils/supabase/auth.ts`:

```typescript
import { supabase } from './client';

export const authService = {
  // Sign up new user
  async signUp(email: string, password: string, fullName: string, instituteName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          institute_name: instituteName
        }
      }
    });

    if (error) throw error;
    return data;
  },

  // Sign in user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
```

## 🌐 GitHub Deployment Setup

### 1. Environment Variables in GitHub

In your GitHub repository, go to Settings > Secrets and Variables > Actions and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
WEATHER_API_KEY=your-weather-api-key
```

### 2. GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy GreenGrid to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run Supabase migrations
      run: |
        npm install -g supabase
        echo "${{ secrets.SUPABASE_ACCESS_TOKEN }}" | supabase auth login --token
        supabase db push --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        SUPABASE_PROJECT_REF: ${{ secrets.SUPABASE_PROJECT_REF }}
    
    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

### 3. Database Migrations

Create `/supabase/migrations/001_initial_schema.sql`:

```sql
-- Initial GreenGrid database schema
-- This file contains all the table creation and RLS policies
-- (Include the SQL from the Database Schema section above)
```

### 4. Supabase CLI Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Generate types
supabase gen types typescript --local > utils/supabase/database.types.ts

# Deploy migrations
supabase db push
```

## 🔌 Integration Points

### 1. Enhanced Energy Hook with Supabase

Update `/hooks/useEnergyData.ts`:

```typescript
import { useState, useEffect } from 'react';
import { supabaseEnergyService } from '../services/energyDataService';
import { weatherBasedEnergySimulator } from '../utils/weatherBasedEnergyData';

export function useEnergyDataWithSupabase() {
  const [state, setState] = useState({
    currentData: null,
    historicalData: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Subscribe to real-time updates
    const subscription = supabaseEnergyService.subscribeToEnergyUpdates((newData) => {
      setState(prev => ({
        ...prev,
        currentData: newData,
        isLoading: false
      }));
    });

    // Load initial data
    loadInitialData();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const [recent, historical] = await Promise.all([
        supabaseEnergyService.getRecentReadings(1),
        supabaseEnergyService.getHistoricalData(7)
      ]);

      setState(prev => ({
        ...prev,
        currentData: recent[0] || null,
        historicalData,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  };

  return { ...state, refresh: loadInitialData };
}
```

### 2. Data Synchronization

Create `/services/dataSyncService.ts`:

```typescript
import { supabaseEnergyService } from './energyDataService';
import { weatherBasedEnergySimulator } from '../utils/weatherBasedEnergyData';

export class DataSyncService {
  private syncInterval: NodeJS.Timeout | null = null;

  startAutoSync(intervalMs: number = 30000) {
    this.syncInterval = setInterval(async () => {
      try {
        // Generate new energy data
        const enhancedData = weatherBasedEnergySimulator.generateEnhancedEnergyData();
        
        // Save to Supabase
        await supabaseEnergyService.saveEnergyReading(enhancedData.energyData);
        
        console.log('Data synced to Supabase:', new Date().toISOString());
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }, intervalMs);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const dataSyncService = new DataSyncService();
```

## 🚀 Deployment Checklist

### Before Deployment:

- [ ] Supabase project created and configured
- [ ] Database schema migrated
- [ ] Environment variables set in GitHub Secrets
- [ ] RLS policies tested
- [ ] Authentication flow tested
- [ ] Real-time subscriptions working

### GitHub Secrets Required:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_REF
VERCEL_TOKEN (if using Vercel)
ORG_ID (if using Vercel)
PROJECT_ID (if using Vercel)
```

### Post-Deployment:

- [ ] Verify database connections
- [ ] Test real-time data updates
- [ ] Check authentication flows
- [ ] Monitor error logs
- [ ] Validate data persistence

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [GitHub Actions with Supabase](https://supabase.com/docs/guides/cli/github-action)

---

**Note**: Remember to never commit your `.env.local` file to GitHub. All sensitive environment variables should be stored in GitHub Secrets for deployment.