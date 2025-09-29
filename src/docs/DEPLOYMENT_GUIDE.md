# GreenGrid Deployment Guide

## 🚀 Overview

This guide covers deploying GreenGrid (2025) to production. GreenGrid is a renewable energy management platform for educational institutes in Rajasthan, featuring real-time monitoring, AI-powered forecasting, and intelligent battery optimization.

**Architecture:**
- Frontend: React with TypeScript and Tailwind CSS v4
- Components: Shadcn/UI components
- State Management: React hooks with localStorage persistence
- Data: Mock data services with weather-based energy simulation
- Deployment: Static site generation suitable for Vercel, Netlify, or any static hosting

## 📋 Pre-Deployment Requirements

### 1. Repository Setup
- ✅ Code pushed to GitHub
- ✅ Node.js 18+ installed locally
- ✅ All dependencies resolved

### 2. Hosting Platform Account
- ✅ Vercel/Netlify account (recommended)
- ✅ Domain name (optional)

### 3. Optional Integrations
- ⚡ Supabase project (for enhanced features)
- 🌤️ Weather API key (for live weather data)
- 📊 Analytics service (for usage tracking)

**Note:** GreenGrid 2025 works completely offline with simulated data, making deployment extremely simple without requiring database setup.

## 🔧 Step-by-Step Deployment

### Step 1: Quick Deploy (Recommended)

**Option A: Deploy to Vercel (One-Click)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/yourusername/greengrid)

**Option B: Deploy to Netlify (One-Click)**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/greengrid)

### Step 2: Manual Deployment Setup

#### Local Development Setup:
```bash
# Clone the repository
git clone https://github.com/yourusername/greengrid.git
cd greengrid

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

#### Optional Environment Variables:
```bash
# For enhanced features (optional)
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# For Supabase integration (if using enhanced backend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### To get Supabase Access Token:
1. Go to [Supabase Dashboard](https://app.supabase.com/account/tokens)
2. Generate a new access token
3. Copy the token to GitHub Secrets

#### To get Project Reference ID:
1. Go to your Supabase project settings
2. Copy the "Reference ID" from the General tab

### Step 2: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy GreenGrid

on:
  push:
    branches: [ main, production ]
  pull_request:
    branches: [ main ]

env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type check
        run: npm run type-check

      - name: Run linting
        run: npm run lint

  database:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Run database migrations
        run: |
          supabase db push --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

  deploy:
    needs: [test, database]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./
```

### Step 3: Database Migration Setup

Create `/supabase/config.toml`:

```toml
# A string used to distinguish different Supabase projects on the same machine.
project_id = "greengrid"

[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
major_version = 15

[studio]
enabled = true
port = 54323

[inbucket]
enabled = true
port = 54324
smtp_port = 54325
pop3_port = 54326

[storage]
enabled = true
port = 54325
image_transformation = true

[auth]
enabled = true
port = 54326
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://greengrid.vercel.app"]
jwt_expiry = 3600
enable_signup = true

[edge_functions]
enabled = true
port = 54327

[analytics]
enabled = false
port = 54328
vector_port = 54329
```

### Step 4: Environment Configuration

Create `/next.config.js` (or update if exists):

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Step 5: Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset",
    "supabase:generate-types": "supabase gen types typescript --local > utils/supabase/database.types.ts",
    "deploy:staging": "vercel --prod",
    "deploy:production": "vercel --prod --yes"
  }
}
```

## 🌐 Platform-Specific Deployment

### Vercel Deployment

1. **Connect GitHub Repository:**
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   ```

2. **Configure Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all the secrets from GitHub

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Netlify Deployment

1. **Create `netlify.toml`:**
   ```toml
   [build]
     command = "npm run build"
     publish = "out"

   [build.environment]
     NODE_VERSION = "18"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Connect GitHub and Deploy via Netlify Dashboard**

### Railway Deployment

1. **Create `railway.toml`:**
   ```toml
   [build]
   builder = "nixpacks"
   buildCommand = "npm run build"

   [deploy]
   startCommand = "npm start"
   restartPolicyType = "on_failure"
   restartPolicyMaxRetries = 10
   ```

## 🔍 Post-Deployment Verification

### 1. Health Checks

Create `/pages/api/health.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('energy_readings')
      .select('count')
      .limit(1);

    if (error) throw error;

    // Test real-time connection
    const channel = supabase.channel('health-check');
    const isConnected = channel.socket.isConnected();

    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      realtime: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
```

### 2. Monitoring Setup

Create `/pages/api/metrics.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [readingsCount, recentReadings, systemStatus] = await Promise.all([
      // Count total readings
      supabase
        .from('energy_readings')
        .select('*', { count: 'exact', head: true }),
      
      // Get recent readings (last hour)
      supabase
        .from('energy_readings')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 3600000).toISOString())
        .order('timestamp', { ascending: false }),
      
      // Check system logs for errors
      supabase
        .from('system_logs')
        .select('*')
        .eq('level', 'error')
        .gte('created_at', new Date(Date.now() - 3600000).toISOString())
    ]);

    res.status(200).json({
      metrics: {
        totalReadings: readingsCount.count || 0,
        recentReadings: recentReadings.data?.length || 0,
        recentErrors: systemStatus.data?.length || 0,
        lastReading: recentReadings.data?.[0]?.timestamp || null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading:**
   ```bash
   # Check if variables are set
   echo $NEXT_PUBLIC_SUPABASE_URL
   
   # Verify in deployment logs
   vercel logs your-deployment-url
   ```

2. **Database Connection Issues:**
   ```typescript
   // Test connection
   const { data, error } = await supabase.from('energy_readings').select('count');
   console.log('DB Test:', { data, error });
   ```

3. **Real-time Not Working:**
   ```typescript
   // Check WebSocket connection
   const channel = supabase.channel('test');
   channel.on('broadcast', { event: 'test' }, (payload) => {
     console.log('Real-time working:', payload);
   });
   channel.subscribe();
   ```

4. **Build Failures:**
   ```bash
   # Local build test
   npm run build
   
   # Check TypeScript errors
   npm run type-check
   ```

### Rollback Strategy

```bash
# Rollback to previous deployment (Vercel)
vercel rollback your-deployment-url

# Rollback database migration (Supabase)
supabase db reset --project-ref your-project-ref
```

## 📊 Performance Optimization

### 1. Database Indexing

```sql
-- Add indexes for better query performance
CREATE INDEX idx_energy_readings_timestamp ON energy_readings(timestamp);
CREATE INDEX idx_energy_readings_recent ON energy_readings(timestamp DESC, id);
CREATE INDEX idx_weather_data_timestamp ON weather_data(timestamp);
```

### 2. Connection Pooling

```typescript
// Configure connection pooling in Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: { 'x-my-custom-header': 'greengrid' },
  },
});
```

### 3. Caching Strategy

```typescript
// Implement caching for frequently accessed data
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

export async function getCachedData(key: string, fetcher: () => Promise<any>) {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

---

## 🎉 Deployment Complete!

Your GreenGrid platform should now be live with:
- ✅ Real-time energy monitoring
- ✅ Persistent data storage
- ✅ User authentication
- ✅ Automated deployments
- ✅ Health monitoring

**Next Steps:**
1. Set up monitoring alerts
2. Configure custom domain
3. Implement backup strategy
4. Scale based on usage

For support, check the [troubleshooting section](#🚨-troubleshooting) or create an issue in the GitHub repository.