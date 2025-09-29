import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Zap, 
  Wind, 
  Battery, 
  BarChart3, 
  Brain, 
  Settings, 
  TrendingUp, 
  Leaf,
  MapPin,
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface LandingPageProps {
  onEnterPlatform: () => void;
  onEnterDemo: () => void;
}

export function LandingPage({ onEnterPlatform, onEnterDemo }: LandingPageProps) {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Real-time Monitoring",
      description: "Monitor solar, wind, battery, and grid consumption in real-time with intelligent analytics"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Forecasting",
      description: "Weather-based predictive analytics for optimal energy planning and load management"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Smart Optimization",
      description: "Intelligent recommendations for load shifting and battery optimization"
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Software-Only Integration",
      description: "Unifies existing renewable assets through intelligent orchestration layer"
    }
  ];

  const stats = [
    { label: "Energy Saved", value: "2.4 MWh", change: "+15%" },
    { label: "Cost Reduction", value: "₹85,000", change: "+22%" },
    { label: "Carbon Offset", value: "1.8 tons", change: "+18%" },
    { label: "Efficiency", value: "94%", change: "+8%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 px-4 py-2 border-green-200 text-green-700">
              <Leaf className="h-4 w-4 mr-2" />
              Renewable Energy Management Platform
            </Badge>
            
            <h1 className="mx-auto max-w-4xl tracking-tight text-gray-900 sm:text-6xl">
              <span className="block">GreenGrid</span>
              <span className="block text-green-600 mt-2">Campus Energy Platform</span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Unifying renewable energy assets across Rajasthan institutes through intelligent 
              software orchestration, real-time monitoring, and AI-powered optimization.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                <MapPin className="h-4 w-4 mr-1" />
                Rajasthan Institutes
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Zap className="h-4 w-4 mr-1" />
                Solar Integration
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Wind className="h-4 w-4 mr-1" />
                Wind Power
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Battery className="h-4 w-4 mr-1" />
                Battery Optimization
              </Badge>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6">
              <Button 
                size="lg" 
                onClick={onEnterPlatform}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Access Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={onEnterDemo}
                className="px-8 py-4 rounded-lg border-green-600 text-green-600 hover:bg-green-50"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <section className="relative -mt-12 mb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1758453555993-f0d8a82e702c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVscyUyMHdpbmQlMjB0dXJiaW5lcyUyMHJlbmV3YWJsZSUyMGVuZXJneXxlbnwxfHx8fDE3NTkwNjk0MzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Renewable energy infrastructure with solar panels and wind turbines"
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-green-600 mb-4">Platform Performance</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real impact achieved by institutes using GreenGrid for renewable energy management
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-3xl text-green-600 mb-2">{stat.value}</div>
                  <div className="text-gray-600 mb-2">{stat.label}</div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-gray-900 mb-4">Comprehensive Energy Management</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              From real-time monitoring to AI-powered forecasting, GreenGrid provides everything 
              institutes need to optimize their renewable energy infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer border-0 shadow-lg"
                onClick={() => setCurrentFeature(index)}
              >
                <div className={`rounded-lg p-3 mb-4 w-fit ${
                  currentFeature === index ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Dashboard Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Intelligent Dashboard</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get comprehensive insights into your renewable energy systems with our 
              intuitive, data-driven dashboard interface.
            </p>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1748609160056-7b95f30041f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkYXNoYm9hcmQlMjBhbmFseXRpY3N8ZW58MXx8fHwxNzU5MDQxODY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Modern dashboard with analytics and data visualization"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-900">Live Demo Available</p>
                    <p className="text-xs text-gray-600">Real-time data simulation with Rajasthan weather patterns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-white mb-4">Ready to Optimize Your Energy Management?</h2>
          <p className="text-green-100 mb-8 text-lg">
            Experience GreenGrid's comprehensive renewable energy platform designed 
            specifically for educational institutes in Rajasthan.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={onEnterPlatform}
              className="bg-white text-green-600 hover:bg-gray-50 px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Users className="mr-2 h-5 w-5" />
              Access Full Platform
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={onEnterDemo}
              className="border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg bg-transparent"
            >
              View Live Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <h3 className="text-2xl mb-2">GreenGrid</h3>
            <p className="text-gray-400">Smart Renewable Energy Management for Educational Institutes</p>
          </div>
          
          <div className="flex justify-center space-x-8 mb-6">
            <div className="flex items-center space-x-2 text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>Rajasthan, India</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Leaf className="h-4 w-4" />
              <span>Sustainable Energy</span>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm">
            © 2025 GreenGrid. Empowering sustainable energy management across educational institutions.
          </p>
        </div>
      </footer>
    </div>
  );
}