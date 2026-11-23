import { useState, useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  AlertTriangle,
  History,
  Users,
  BarChart3,
  Map,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ClipboardList,
  Navigation,
  Activity,
  Building2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Ambulance, Hospital } from '../components/common/Icons';
import { AuthContext } from '../contexts/AuthContext';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

const navItems: Record<string, Array<{ label: string; path: string; icon: React.ElementType }>> = {
  patient: [
    { label: 'Dashboard', path: '/patient', icon: Home },
    { label: 'Report Emergency', path: '/patient/report', icon: AlertTriangle },
    { label: 'Track Ambulance', path: '/patient/track', icon: Ambulance },
    { label: 'Hospitals', path: '/patient/hospitals', icon: Hospital },
    { label: 'History', path: '/patient/history', icon: History },
  ],
  driver: [
    { label: 'Dashboard', path: '/driver', icon: Home },
    { label: 'Assignments', path: '/driver/assignments', icon: ClipboardList },
    { label: 'Navigate', path: '/driver/navigate', icon: Navigation },
    { label: 'History', path: '/driver/history', icon: History },
  ],
  hospital_admin: [
    { label: 'Dashboard', path: '/hospital', icon: Home },
    { label: 'Incoming Requests', path: '/hospital/requests', icon: AlertTriangle },
    { label: 'Capacity Management', path: '/hospital/capacity', icon: Activity },
    { label: 'Facilities', path: '/hospital/facilities', icon: Settings },
    { label: 'Incoming Map', path: '/hospital/map', icon: Map },
    { label: 'History', path: '/hospital/history', icon: History },
  ],
  super_admin: [
    { label: 'Overview', path: '/admin', icon: Home },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Hospitals', path: '/admin/hospitals', icon: Building2 },
    { label: 'Ambulances', path: '/admin/ambulances', icon: Ambulance },
    { label: 'Emergencies', path: '/admin/emergencies', icon: ShieldAlert },
    { label: 'Live Map', path: '/admin/map', icon: Map },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Reports', path: '/admin/reports', icon: ClipboardList },
  ],
};

const roleTitles: Record<string, string> = {
  patient: 'Patient Portal',
  driver: 'Ambulance Driver',
  hospital_admin: 'Hospital Administration',
  super_admin: 'Super Admin System',
};

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const role = user?.role || 'patient';
  const items = navItems[role] || [];
  const title = roleTitles[role] || 'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/patient' || path === '/driver' || path === '/hospital' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Desktop & Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-auto`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emergency rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-xl">L</span>
            </div>
            <div>
              <span className="font-extrabold text-white text-xl tracking-tight">LifeLine</span>
              <p className="text-xs text-blue-200 font-medium">{title}</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/70 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-4 flex-1 overflow-y-auto space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-emergency text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10 border border-white/20">
              <AvatarFallback className="bg-white/20 text-white font-bold">
                {user?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-blue-200 truncate capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-red-300 hover:text-white hover:bg-red-600/30 font-medium transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              <Menu size={22} />
            </button>
            <h1 className="font-bold text-gray-800 text-lg hidden sm:block">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                System Active
              </span>
            </div>
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium hidden md:inline">
                {user?.full_name}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
