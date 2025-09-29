# GreenGrid Quick Start Guide

## 🚀 Getting Started (5 Minutes)

GreenGrid is a renewable energy management platform designed for educational institutes in Rajasthan. This guide will get you up and running in minutes.

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Quick Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/greengrid.git
cd greengrid

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see GreenGrid in action!

## 🎯 First Time Experience

### 1. Landing Page
- First-time visitors see the landing page showcasing GreenGrid's capabilities
- **Two access options:**
  - **"Access Dashboard"** - Enter the full platform with institute setup
  - **"View Demo"** - Experience the enhanced dashboard immediately with realistic data

### 2. Demo Mode (Instant Access)
- **No Setup Required**: Instantly access the full enhanced dashboard
- **Realistic Data**: Pre-configured with Rajasthan Institute of Technology profile
- **Complete Features**: All charts, recommendations, and monitoring enabled
- **Auto-Refresh**: Live data simulation with 30-second updates
- **Perfect for**: Quick demos, feature exploration, and presentations

### 3. Institute Setup (Full Configuration)
- Complete the guided 5-step setup process:
  1. **Institute Information** - Basic details about your institution
  2. **Solar Assets** - Solar panel configuration and capacity
  3. **Wind Assets** - Wind turbine setup (if applicable)
  4. **Battery Storage** - Battery system specifications
  5. **System Configuration** - Operating modes and alert settings

### 4. Dashboard Access
- After setup, access the full dashboard with real-time monitoring
- Navigate between Dashboard, Forecast & Planning, Analytics & Reports, and Settings

## 🏗️ Project Structure

```
greengrid/
├── App.tsx                 # Main application component
├── components/
│   ├── LandingPage.tsx     # First-time visitor landing page
│   ├── InstituteSetup.tsx  # Guided setup wizard
│   ├── SimpleDashboard.tsx # Main energy dashboard
│   ├── Navigation.tsx      # Sidebar navigation
│   └── ui/                 # Reusable UI components (Shadcn)
├── hooks/
│   └── useEnergyData.ts    # Energy data management hook
├── services/
│   ├── energyDataService.ts        # Energy data simulation
│   └── weatherBasedEnergyData.ts   # Weather-based energy generation
├── utils/
│   ├── energyData.ts       # Energy calculation utilities
│   └── weatherBasedEnergyData.ts   # Weather simulation for Rajasthan
└── styles/
    └── globals.css         # Tailwind CSS v4 configuration
```

## 🎨 Key Features

### Real-time Monitoring
- **Solar Generation**: Live solar panel output based on Rajasthan weather patterns
- **Wind Generation**: Wind turbine energy production simulation
- **Battery Status**: State of charge, charging/discharging rates
- **Grid Import/Export**: Net energy flow with the electrical grid
- **Load Demand**: Current campus energy consumption

### AI-Powered Forecasting
- **Weather Integration**: Simulated weather data for Rajasthan climate
- **Solar Prediction**: AI-driven solar generation forecasts
- **Wind Prediction**: Wind energy production estimates
- **Load Forecasting**: Campus energy demand predictions

### Smart Recommendations
- **Battery Optimization**: Intelligent charging/discharging recommendations
- **Load Shifting**: Suggestions for optimal energy usage timing
- **Efficiency Alerts**: System performance notifications
- **Cost Optimization**: Recommendations for reducing energy costs

## 🔧 Customization

### Institute Configuration
```typescript
// Update institute settings in InstituteSetup.tsx
const defaultConfig = {
  instituteName: 'Your Institute Name',
  instituteType: 'university', // university, college, school, etc.
  state: 'Rajasthan',
  solarCapacity: 100, // kW
  windCapacity: 50,   // kW
  batteryCapacity: 200, // kWh
  // ... more settings
};
```

### Energy Data Simulation
```typescript
// Customize energy patterns in utils/energyData.ts
export const generateRealisticEnergyData = (config: any) => {
  // Modify solar generation curves
  // Adjust wind patterns
  // Customize load profiles
};
```

### UI Themes
```css
/* Customize colors in styles/globals.css */
:root {
  --primary: #16a34a; /* Green for renewable energy theme */
  --secondary: #0ea5e9; /* Blue accent */
  /* Update other CSS variables */
}
```

## 🌐 Deployment

### Quick Deploy Options

**Vercel (Recommended)**
```bash
npm i -g vercel
vercel
```

**Netlify**
```bash
npm run build
# Drag and drop the 'out' folder to Netlify
```

**Static Hosting**
```bash
npm run build
# Deploy the 'out' folder to any static host
```

## 📊 Data Simulation

GreenGrid includes sophisticated data simulation:

### Weather Patterns
- **Rajasthan Climate**: Accurate seasonal weather simulation
- **Solar Irradiance**: Daily and seasonal solar patterns
- **Wind Speed**: Regional wind data simulation
- **Temperature**: Impact on system efficiency

### Energy Generation
- **Solar Curves**: Realistic daily solar generation patterns
- **Wind Patterns**: Variable wind energy production
- **Seasonal Variations**: Different patterns for summer/winter
- **Weather Dependencies**: Generation affected by weather conditions

### Campus Load Simulation
- **Daily Patterns**: Typical institutional energy usage
- **Seasonal Variations**: Higher cooling loads in summer
- **Academic Calendar**: Different patterns during holidays
- **Random Variations**: Realistic usage fluctuations

## 🔍 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Development Server Issues**
```bash
# Restart development server
npm run dev
```

**Missing Dependencies**
```bash
# Install all dependencies
npm install --legacy-peer-deps
```

## 📚 Next Steps

1. **Explore Features**: Navigate through all dashboard sections
2. **Customize Setup**: Update institute configuration as needed
3. **Deploy**: Choose a hosting platform and deploy your instance
4. **Integrate**: Connect with real sensors and weather APIs (optional)
5. **Extend**: Add custom features for your specific requirements

## 🤝 Support

- **Documentation**: Check `/docs` folder for detailed guides
- **Issues**: Report bugs on GitHub
- **Features**: Request new features via GitHub issues
- **Community**: Join discussions and share improvements

---

**Ready to revolutionize energy management at your institute?** 🌱⚡

Start with `npm run dev` and experience the future of renewable energy monitoring!