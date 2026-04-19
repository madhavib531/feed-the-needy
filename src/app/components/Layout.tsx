import { Outlet, NavLink, useNavigate } from 'react-router';
import {
  Home,
  Users,
  Building2,
  Package,
  Truck,
  UserPlus,
  MapPin,
  UserCheck,
  Sparkles,
  LogOut,
  Heart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // ✅ IMPORTANT

  // ✅ FIXED LOGOUT FUNCTION
  const handleLogout = async () => {
    try {
      await logout(); // clears auth (from context)
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // safety cleanup (optional but fine)
      localStorage.clear();
      sessionStorage.clear();

      // ✅ CORRECT REDIRECT (React way)
      navigate('/login', { replace: true });
    }
  };

  const mainNavItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/food-requests', label: 'Food Requests', icon: Package },
    { path: '/supply-tracking', label: 'Supply Tracking', icon: Truck },
  ];

  const entityNavItems = [
    { path: '/donors', label: 'Donors', icon: Users },
    { path: '/care-institutions', label: 'Care Institutions', icon: Building2 },
    { path: '/ngos', label: 'Active NGOs', icon: Heart },
    { path: '/volunteers', label: 'Volunteers', icon: UserCheck },
  ];

  const communityNavItems = [
    { path: '/neighbor-sharing', label: 'Neighbor Sharing', icon: UserPlus },
    { path: '/pickup-points', label: 'Pickup Points', icon: MapPin },
    { path: '/smart-matching', label: 'Smart Matching', icon: Sparkles },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-green-600">
            Feed The Needy
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Admin Dashboard
          </p>
        </div>

        <nav className="px-3 pb-6 flex-1">
          {/* MAIN */}
          <div className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase">
              Main
            </h3>
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-green-50 text-green-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* ENTITIES */}
          <div className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase">
              Entities
            </h3>
            <div className="space-y-1">
              {entityNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-green-50 text-green-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* COMMUNITY */}
          <div>
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase">
              Community Solutions
            </h3>
            <div className="space-y-1">
              {communityNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-green-50 text-green-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>

        {/* USER + LOGOUT */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium text-gray-700 truncate">
              {user?.displayName || user?.email}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}