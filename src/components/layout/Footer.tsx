import { Heart, Zap, Globe, Mail, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-border mt-12">
      <div className="px-4 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg">Campus Energy Platform</h3>
                <p className="text-sm text-muted-foreground">Rajasthan Institute</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Comprehensive renewable energy management system for educational institutes. 
              Vendor-neutral orchestration platform that unifies solar, wind, and battery 
              assets for optimal energy efficiency.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>Multi-campus ready</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span>Real-time monitoring</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#dashboard" className="hover:text-foreground transition-colors">Dashboard</a></li>
              <li><a href="#forecast" className="hover:text-foreground transition-colors">Energy Forecasting</a></li>
              <li><a href="#analytics" className="hover:text-foreground transition-colors">Analytics & Reports</a></li>
              <li><a href="#settings" className="hover:text-foreground transition-colors">System Settings</a></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>energy@institute.edu</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 XXX XXX XXXX</span>
              </li>
              <li><a href="#help" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#api" className="hover:text-foreground transition-colors">API Documentation</a></li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© {currentYear} Campus Energy Solutions</span>
            <span>•</span>
            <span>Built for sustainable education</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-sm text-muted-foreground">
              Privacy Policy
            </Button>
            <Button variant="ghost" size="sm" className="text-sm text-muted-foreground">
              Terms of Service
            </Button>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for sustainable future</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}