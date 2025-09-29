import { Bell, User, Sun, Moon, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

interface HeaderProps {
  title: string;
  subtitle?: string;
  isDemoMode?: boolean;
}

export function Header({ title, subtitle, isDemoMode }: HeaderProps) {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white border-b border-border px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl flex items-center gap-2">
            <span className="text-green-600">🌱</span>
            {title}
          </h1>
          <div className="flex items-center gap-3">
            {subtitle && (
              <p className="text-muted-foreground text-sm lg:text-base">{subtitle}</p>
            )}
            {isDemoMode && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Demo Mode
              </Badge>
            )}
          </div>
        </div>

        {/* Center - Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search energy data, reports..." 
              className="pl-10"
            />
          </div>
        </div>

        {/* Right - Status & Controls */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Date & Time */}
          <div className="hidden lg:block text-right">
            <div className="text-sm">{currentTime}</div>
            <div className="text-xs text-muted-foreground">{currentDate}</div>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white">
              2
            </Badge>
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="sm">
            <Sun className="h-5 w-5" />
          </Button>

          {/* User Profile */}
          <Button variant="ghost" size="sm" className="hidden lg:flex items-center gap-2">
            <User className="h-5 w-5" />
            <span className="text-sm">Admin</span>
          </Button>
        </div>
      </div>
    </header>
  );
}