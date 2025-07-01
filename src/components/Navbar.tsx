
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Users, Calendar, QrCode, BarChart, Menu, History } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const isAdmin = profile?.role === 'admin';

  // Different navigation items based on role
  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart },
    { path: '/sessions', label: 'Sessions', icon: Calendar },
    { path: '/scan', label: 'Scan QR', icon: QrCode },
    { path: '/participants', label: 'Participants', icon: Users },
    { path: '/attendance', label: 'Riwayat', icon: History },
    { path: '/admin/settings', label: 'Settings', icon: BarChart },
  ];

  const participantNavItems = [
    { path: '/participant/dashboard', label: 'Dashboard', icon: BarChart },
    { path: '/sessions', label: 'Sessions', icon: Calendar },
    { path: '/participant/checkin', label: 'Check-in', icon: QrCode },
    { path: '/scan', label: 'QR Code Saya', icon: QrCode },
    { path: '/attendance', label: 'Riwayat', icon: History },
  ];

  const navItems = isAdmin ? adminNavItems : participantNavItems;

  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path);
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/8a2bf4c5-d7e4-4716-8ea7-1b72802a300d.png" 
                alt="Hadir Kajian Logo" 
                className="h-6 w-auto sm:h-8"
              />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Hadir Kajian {isAdmin ? 'Admin' : 'Peserta'}
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-8 space-x-4">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Button
                  key={path}
                  variant={location.pathname === path ? "default" : "ghost"}
                  onClick={() => handleNavigation(path)}
                  className="flex items-center space-x-2"
                  size="sm"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{label}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Desktop User Info */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {profile?.email || 'Loading...'} 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                isAdmin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isAdmin ? 'Admin' : 'Peserta'}
              </span>
            </span>
            <Button variant="outline" onClick={handleSignOut} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">Sign Out</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              size="sm"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Button
                  key={path}
                  variant={location.pathname === path ? "default" : "ghost"}
                  onClick={() => handleNavigation(path)}
                  className="w-full justify-start"
                  size="sm"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              ))}
              
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-700 mb-2 px-3">
                  {profile?.email || 'Loading...'} 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    isAdmin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isAdmin ? 'Admin' : 'Peserta'}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full justify-start"
                  size="sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
