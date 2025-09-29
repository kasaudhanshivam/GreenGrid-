import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Settings, Menu, X, Database, User, Building2 } from 'lucide-react';
import { getInstituteConfig, InstituteConfig } from '../utils/instituteConfig';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [instituteConfig, setInstituteConfig] = useState<InstituteConfig | null>(null);

  useEffect(() => {
    const config = getInstituteConfig();
    setInstituteConfig(config);
  }, []);

  const handleSetupNewInstitute = () => {
    // Clear existing setup and reload
    localStorage.removeItem('greengrid_setup_complete');
    localStorage.removeItem('greengrid_institute_config');
    window.location.reload();
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'forecast', label: 'Forecast & Planning', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics & Reports', icon: Calendar },
    { id: 'manual-entry', label: 'Manual Data Entry', icon: Database },
    { id: 'settings', label: 'Settings & Admin', icon: Settings }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-lg">GreenGrid</h1>
            <p className="text-xs text-muted-foreground">Campus Energy Platform</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-lg">GreenGrid</h1>
                  <p className="text-xs text-muted-foreground">Campus Energy Platform</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onPageChange(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
            
            {/* Mobile Profile Section */}
            <div className="p-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSetupNewInstitute}
                className="w-full justify-start gap-2 p-3 rounded-lg hover:bg-muted"
              >
                <Building2 className="h-4 w-4" />
                <span className="text-sm">Setup New Institute</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-72 bg-white border-r border-border">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl">GreenGrid</h1>
              <p className="text-sm text-muted-foreground">Campus Energy Platform</p>
              {instituteConfig && (
                <p className="text-xs text-green-600 mt-1">{instituteConfig.instituteName}</p>
              )}
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">System Status</span>
              <Badge className="bg-green-100 text-green-800 border-green-300">Online</Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-6">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Profile Section & Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
          {/* Profile Section */}
          <div className="mb-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-full justify-start gap-2 p-3 rounded-lg hover:bg-muted"
              >
                <User className="h-4 w-4" />
                <span className="text-sm">Institute Profile</span>
              </Button>
              
              {showProfileMenu && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-border rounded-lg shadow-lg p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSetupNewInstitute}
                    className="w-full justify-start gap-2 p-2 rounded-md hover:bg-muted text-xs"
                  >
                    <Building2 className="h-3 w-3" />
                    Setup New Institute
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full justify-start gap-2 p-2 rounded-md hover:bg-muted text-xs"
                  >
                    <Settings className="h-3 w-3" />
                    Institute Settings
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="mb-4" />
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Renewable Energy Management System</p>
            <p>Vendor-neutral orchestration platform</p>
            <p className="pt-2 border-t border-border">© 2025 GreenGrid Solutions</p>
          </div>
        </div>
      </div>
    </>
  );
}