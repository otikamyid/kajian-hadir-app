
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Users, Calendar, QrCode, BarChart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
  ];

  const participantNavItems = [
    { path: '/participant/dashboard', label: 'Dashboard', icon: BarChart },
    { path: '/sessions', label: 'Sessions', icon: Calendar },
    { path: '/scan', label: 'QR Code Saya', icon: QrCode },
  ];

  const navItems = isAdmin ? adminNavItems : participantNavItems;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">
              Kajian Attendance {isAdmin ? '- Admin' : '- Peserta'}
            </h1>
            <div className="flex space-x-4">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Button
                  key={path}
                  variant={location.pathname === path ? "default" : "ghost"}
                  onClick={() => navigate(path)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {profile?.email || 'Loading...'} 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                isAdmin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isAdmin ? 'Administrator' : 'Peserta'}
              </span>
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
