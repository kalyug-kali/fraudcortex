
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, BarChart2, AlertTriangle, Shield, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: <BarChart2 className="w-4 h-4 mr-1.5" /> 
    },
    { 
      name: 'Rules', 
      path: '/rules', 
      icon: <Shield className="w-4 h-4 mr-1.5" /> 
    }
  ];

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-white/90 backdrop-blur-md border-b shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink 
              to="/" 
              className="flex items-center space-x-2"
            >
              <AlertTriangle className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-semibold text-blue-600">FraudCortex</span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                )}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        'md:hidden transition-all duration-300 overflow-hidden',
        mobileMenuOpen ? 'max-h-screen bg-white border-b' : 'max-h-0'
      )}>
        <div className="px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                'flex items-center px-3 py-2 rounded-md text-base font-medium',
                isActive 
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              )}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
