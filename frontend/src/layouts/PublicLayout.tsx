import { Link, Outlet } from 'react-router-dom';
import { Heart, PhoneCall, ShieldCheck } from 'lucide-react';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="bg-navy text-white px-6 py-4 flex items-center justify-between border-b border-white/10 sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-3 font-extrabold text-xl">
          <div className="w-9 h-9 bg-emergency rounded-xl flex items-center justify-center shadow-md">
            <span className="font-black text-white text-base">L</span>
          </div>
          <span className="tracking-tight">LifeLine</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/about" className="text-blue-100 hover:text-white text-sm font-medium transition-colors hidden sm:inline">
            About
          </Link>
          <Link to="/how-it-works" className="text-blue-100 hover:text-white text-sm font-medium transition-colors hidden sm:inline">
            How It Works
          </Link>
          <Link
            to="/login"
            className="bg-white text-navy px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all shadow-xs"
          >
            Portal Login
          </Link>
        </div>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-navy-dark text-blue-200 py-12 px-6 border-t border-white/10 text-center text-sm">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 bg-emergency rounded-md flex items-center justify-center">
              <Heart size={14} className="text-white" />
            </div>
            <span className="text-white font-extrabold text-lg">LifeLine Emergency System</span>
          </div>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Next-generation ambulance routing and hospital coordination platform with intelligent allocation and live tracking.
          </p>
          <div className="pt-4 border-t border-white/5 text-xs text-slate-500">
            ⚠️ Academic prototype for demonstration and evaluation only. Not a certified emergency dispatch service.
          </div>
        </div>
      </footer>
    </div>
  );
}
