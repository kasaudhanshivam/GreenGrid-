import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { EnhancedDashboard } from './components/EnhancedDashboard';
import { ForecastPlanning } from './components/ForecastPlanning';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { ManualDataEntry } from './components/ManualDataEntry';
import { InstituteSetup } from './components/InstituteSetup';
import { LandingPage } from './components/LandingPage';

interface InstituteConfig {
  instituteName: string;
  instituteType: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  email: string;
  phone: string;
  solarCapacity: number;
  solarPanels: number;
  solarInstallationDate: string;
  windCapacity: number;
  windTurbines: number;
  windInstallationDate: string;
  batteryCapacity: number;
  batteryType: string;
  batteryInstallationDate: string;
  gridConnectionCapacity: number;
  utilityProvider: string;
  hasSmartMeter: boolean;
  defaultMode: 'online' | 'offline';
  dataRetentionDays: number;
  alertThresholds: {
    batteryLow: number;
    highGridUsage: number;
    systemEfficiency: number;
  };
  weatherApiEnabled: boolean;
  weatherApiKey?: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [instituteConfig, setInstituteConfig] = useState<InstituteConfig | null>(null);

  // Check if setup is complete on app load
  useEffect(() => {
    const setupComplete = localStorage.getItem('greengrid_setup_complete');
    const savedConfig = localStorage.getItem('greengrid_institute_config');
    const hasVisitedBefore = localStorage.getItem('greengrid_visited');
    
    // If user has visited before, skip landing page
    if (hasVisitedBefore === 'true') {
      setShowLandingPage(false);
    }
    
    if (setupComplete === 'true' && savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setInstituteConfig(config);
        setIsSetupComplete(true);
      } catch (error) {
        console.error('Error loading institute config:', error);
        // Reset setup if config is corrupted
        localStorage.removeItem('greengrid_setup_complete');
        localStorage.removeItem('greengrid_institute_config');
      }
    }
  }, []);

  const handleSetupComplete = (config: InstituteConfig) => {
    setInstituteConfig(config);
    setIsSetupComplete(true);
  };

  const handleEnterPlatform = () => {
    localStorage.setItem('greengrid_visited', 'true');
    setShowLandingPage(false);
  };

  const handleEnterDemo = () => {
    localStorage.setItem('greengrid_visited', 'true');
    setIsDemoMode(true);
    setIsSetupComplete(true);
    setShowLandingPage(false);
    // Set demo institute config
    setInstituteConfig({
      instituteName: 'Rajasthan Institute of Technology',
      instituteType: 'Engineering College',
      address: 'Tech Campus, University Road',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302017',
      contactPerson: 'Dr. Priya Sharma',
      email: 'energy@rit.edu.in',
      phone: '+91-141-2567890',
      solarCapacity: 500,
      solarPanels: 200,
      solarInstallationDate: '2023-03-15',
      windCapacity: 150,
      windTurbines: 3,
      windInstallationDate: '2023-06-20',
      batteryCapacity: 200,
      batteryType: 'Lithium-ion',
      batteryInstallationDate: '2023-04-10',
      gridConnectionCapacity: 1000,
      utilityProvider: 'Rajasthan State Electricity Board',
      hasSmartMeter: true,
      defaultMode: 'online' as const,
      dataRetentionDays: 365,
      alertThresholds: {
        batteryLow: 20,
        highGridUsage: 80,
        systemEfficiency: 85
      },
      weatherApiEnabled: true,
      location: {
        latitude: 26.9124,
        longitude: 75.7873
      }
    });
  };

  const handleBackToLanding = () => {
    setShowLandingPage(true);
  };

  // Show landing page for first-time visitors
  if (showLandingPage) {
    return <LandingPage onEnterPlatform={handleEnterPlatform} onEnterDemo={handleEnterDemo} />;
  }

  // If setup is not complete, show setup page
  if (!isSetupComplete) {
    return <InstituteSetup onSetupComplete={handleSetupComplete} onBackToLanding={handleBackToLanding} />;
  }

  const getPageInfo = () => {
    const instituteName = instituteConfig?.instituteName || 'Campus';
    
    switch (currentPage) {
      case 'dashboard':
        return {
          title: `${instituteName} Energy Dashboard`,
          subtitle: 'Real-time renewable energy monitoring and optimization'
        };
      case 'forecast':
        return {
          title: 'Forecast & Planning',
          subtitle: 'Optimize energy usage with predictive analytics'
        };
      case 'analytics':
        return {
          title: 'Analytics & Reports',
          subtitle: 'Historical energy performance and sustainability metrics'
        };
      case 'settings':
        return {
          title: 'Settings & Administration',
          subtitle: 'Configure system settings and manage users'
        };
      case 'manual-entry':
        return {
          title: 'Manual Data Entry',
          subtitle: 'Input energy data manually for testing and calibration'
        };
      default:
        return {
          title: `${instituteName} Energy Platform`,
          subtitle: 'Smart renewable energy management system'
        };
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <EnhancedDashboard />;
      case 'forecast':
        return <ForecastPlanning />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'manual-entry':
        return <ManualDataEntry />;
      default:
        return <EnhancedDashboard />;
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      {/* Main Content Area */}
      <div className="lg:ml-72 flex-1 flex flex-col">
        <Header title={pageInfo.title} subtitle={pageInfo.subtitle} isDemoMode={isDemoMode} />
        
        <main className="flex-1 p-4 lg:p-8">
          {renderCurrentPage()}
        </main>
        
        <Footer />
      </div>
    </div>
  );
}