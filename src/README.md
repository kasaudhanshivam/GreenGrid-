# 🌱 GreenGrid - Campus Energy Platform

> Intelligent Renewable Energy Management for Educational Institutes in Rajasthan

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/yourusername/greengrid)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/greengrid)

## 🎯 Overview

GreenGrid is a comprehensive renewable energy management platform designed specifically for educational institutes in Rajasthan. It unifies existing solar, wind, and battery assets through an intelligent software orchestration layer, providing real-time monitoring, AI-powered forecasting, and smart optimization recommendations.

### 🌟 Key Features

- **🔄 Real-time Monitoring** - Live tracking of solar, wind, battery, and grid energy flows
- **🧠 AI-Powered Forecasting** - Weather-based predictive analytics for optimal energy planning
- **⚡ Smart Optimization** - Intelligent recommendations for load shifting and battery management
- **🏛️ Institute-Focused** - Designed specifically for educational institutions in Rajasthan
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **🔌 Offline-First** - Full functionality with simulated data, no external dependencies required

## 🚀 Quick Start

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

## 📊 Dashboard Preview

### Landing Page
- Compelling introduction to GreenGrid's capabilities
- Direct access to the platform for judges and evaluators
- Professional presentation of key features and benefits

### Institute Setup
- Guided 5-step configuration process
- Comprehensive energy asset configuration
- Smart defaults for Rajasthan institutions

### Energy Dashboard
- Real-time energy generation and consumption metrics
- Interactive charts and visualizations
- Battery status and grid import/export monitoring
- Smart recommendations for optimization

## 🏗️ Architecture

```
Frontend: React + TypeScript + Tailwind CSS v4
Components: Shadcn/UI component library
State: React hooks with localStorage persistence
Data: Sophisticated energy simulation with weather patterns
Charts: Recharts for interactive data visualization
Icons: Lucide React for consistent iconography
```

## 📁 Project Structure

```
greengrid/
├── App.tsx                           # Main application entry point
├── components/
│   ├── LandingPage.tsx              # Professional landing page
│   ├── InstituteSetup.tsx           # Guided setup wizard
│   ├── SimpleDashboard.tsx          # Main energy dashboard
│   ├── Navigation.tsx               # Sidebar navigation
│   ├── Analytics.tsx                # Historical data analysis
│   ├── ForecastPlanning.tsx         # Predictive planning tools
│   ├── Settings.tsx                 # Configuration management
│   └── ui/                          # Reusable UI components
├── hooks/
│   └── useEnergyData.ts             # Energy data management
├── services/
│   ├── energyDataService.ts         # Core energy data simulation
│   └── weatherBasedEnergyData.ts    # Rajasthan weather patterns
├── utils/
│   ├── energyData.ts                # Energy calculations
│   ├── instituteConfig.ts           # Configuration management
│   └── weatherBasedEnergyData.ts    # Climate simulation
├── docs/                            # Comprehensive documentation
└── styles/
    └── globals.css                  # Tailwind v4 configuration
```

## 🌤️ Data Simulation

GreenGrid includes sophisticated simulation systems:

### Weather Patterns
- **Rajasthan Climate Model** - Accurate seasonal weather simulation
- **Solar Irradiance** - Daily and seasonal solar energy patterns
- **Wind Speed Patterns** - Regional wind data with realistic variations
- **Temperature Impact** - Effects on system efficiency and performance

### Energy Generation
- **Solar Generation Curves** - Realistic daily solar production patterns
- **Wind Energy Patterns** - Variable wind generation with weather dependencies
- **Seasonal Variations** - Different patterns for summer/winter operations
- **System Efficiency** - Age and maintenance factors affecting performance

### Campus Load Simulation
- **Daily Usage Patterns** - Typical institutional energy consumption
- **Academic Calendar Integration** - Different patterns during holidays/terms
- **Seasonal Load Variations** - Higher cooling loads during Rajasthan summers
- **Random Fluctuations** - Realistic usage variations and peak demands

## 🔧 Configuration

### Institute Settings
```typescript
interface InstituteConfig {
  // Basic Information
  instituteName: string;
  instituteType: 'university' | 'college' | 'school' | 'research' | 'technical';
  location: { latitude: number; longitude: number };
  
  // Energy Assets
  solarCapacity: number;      // kW installed
  windCapacity: number;       // kW installed  
  batteryCapacity: number;    // kWh storage
  
  // System Configuration
  defaultMode: 'online' | 'offline';
  alertThresholds: {
    batteryLow: number;
    highGridUsage: number;
    systemEfficiency: number;
  };
}
```

### Customization Options
- **Theme Colors** - Customize the color scheme in `styles/globals.css`
- **Energy Patterns** - Modify simulation in `utils/energyData.ts`
- **Institute Types** - Add new categories in `components/InstituteSetup.tsx`
- **Alert Thresholds** - Configure monitoring limits and notifications

## 🌐 Deployment

### One-Click Deployment

**Vercel (Recommended)**
- Click the "Deploy with Vercel" button above
- Connect your GitHub repository
- Automatic deployments on every push

**Netlify**
- Click the "Deploy to Netlify" button above
- Connect your repository
- Instant global CDN deployment

### Manual Deployment

```bash
# Build for production
npm run build

# The 'out' folder contains the static site
# Deploy to any static hosting service
```

### Environment Variables (Optional)
```bash
NEXT_PUBLIC_WEATHER_API_KEY=your_api_key      # For live weather data
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id     # For usage tracking
```

## 📚 Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Get up and running in 5 minutes
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Comprehensive deployment instructions
- **[Component Guide](docs/COMPONENT_GUIDE.md)** - Detailed component documentation
- **[API Integration](docs/API_INTEGRATION.md)** - External service integration
- **[Backend Architecture](docs/BACKEND_ARCHITECTURE.md)** - System architecture details

## 🎯 Use Cases

### Educational Institutes
- **Universities** - Multi-campus energy management and optimization
- **Colleges** - Departmental energy monitoring and cost allocation
- **Schools** - Simple energy tracking with educational insights
- **Research Institutes** - Advanced analytics for energy research projects

### Features by Institute Type
- **Real-time Monitoring** - All energy flows and system status
- **Cost Optimization** - Reduce electricity bills through smart management
- **Sustainability Reporting** - Track and report environmental impact
- **Educational Integration** - Use for renewable energy curriculum
- **Research Platform** - Data for energy efficiency research

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 Performance

- **⚡ Fast Loading** - Optimized static site with minimal dependencies
- **📱 Responsive** - Works seamlessly on all device sizes
- **🔄 Real-time** - Smooth data updates with efficient state management
- **💾 Offline-First** - Full functionality without internet connection
- **🎨 Modern UI** - Clean, professional interface using Tailwind v4

## 🌟 Technical Highlights

- **TypeScript** - Full type safety throughout the application
- **React 18** - Latest React features with concurrent rendering
- **Tailwind v4** - Modern CSS framework with custom design system
- **Shadcn/UI** - High-quality, accessible UI components
- **Next.js 14** - Optimized builds with static site generation
- **Recharts** - Interactive, responsive data visualizations

## 📈 Future Roadmap

- **IoT Integration** - Direct sensor data integration
- **Machine Learning** - Enhanced predictive algorithms
- **Multi-Campus** - Support for institution networks
- **Mobile App** - Native mobile applications
- **API Platform** - RESTful API for third-party integrations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Rajasthan Government** - Support for renewable energy initiatives
- **Educational Partners** - Institutes providing requirements and feedback
- **Open Source Community** - Libraries and tools that make this possible
- **Climate Action** - Contributing to sustainable energy management

---

**Built with ❤️ for a sustainable future in Rajasthan's educational sector**

🌱 **GreenGrid** - *Powering Education with Clean Energy* ⚡