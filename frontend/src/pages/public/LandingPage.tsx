import { Link } from 'react-router-dom';
import {
  MapPin,
  Bell,
  BarChart3,
  Shield,
  ArrowRight,
  Heart,
  PhoneCall,
  Zap,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { Ambulance, Hospital } from '../../components/common/Icons';
import { Button } from '../../components/ui/button';

const features = [
  {
    icon: Zap,
    title: 'Smart Allocation',
    description: 'Dynamic algorithm ranks available ambulances based on road travel time, distance and availability status.',
    badge: 'Real-time',
  },
  {
    icon: MapPin,
    title: 'Live GPS Tracking',
    description: 'Track the ambulance route in real time on interactive maps with OSRM road geometry and live status updates.',
    badge: 'Interactive',
  },
  {
    icon: Hospital,
    title: 'Hospital Coordination',
    description: 'Hospitals receive incoming emergency notifications with severity and ETA, with explicit accept/reject confirmation.',
    badge: 'Collaborative',
  },
  {
    icon: Activity,
    title: 'Emergency Lifecycle',
    description: 'End-to-end visibility: Reported → Assigned → Driver Accepted → En Route → Pickup → Hospital → Completed.',
    badge: 'Full Auditing',
  },
  {
    icon: Bell,
    title: 'Instant Notifications',
    description: 'Real-time in-app alerts and status transitions broadcast to patients, drivers and hospital administrators.',
    badge: 'WebSockets',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Comprehensive administrative oversight with response time analytics, triage distribution and CSV export.',
    badge: 'Data-driven',
  },
];

const steps = [
  {
    step: '01',
    title: 'Report Emergency',
    desc: 'Patient identifies location, emergency type and severity in seconds.',
  },
  {
    step: '02',
    title: 'Intelligent Dispatch',
    desc: 'The system computes road routes via OSRM and assigns the optimal available ambulance.',
  },
  {
    step: '03',
    title: 'Live Tracking',
    desc: 'Patient and hospital monitor ambulance progress and ETA live on the map.',
  },
  {
    step: '04',
    title: 'Hospital Handover',
    desc: 'Hospital confirms capacity and facilities, ensuring immediate patient care upon arrival.',
  },
];

const demoAccounts = [
  {
    role: 'Patient',
    email: 'john.patient@example.com',
    password: 'Patient@123',
    description: 'Report emergencies, live track ambulance and view hospital recommendations.',
    color: 'from-blue-600 to-indigo-700',
  },
  {
    role: 'Ambulance Driver',
    email: 'driver1@lifeline.com',
    password: 'Driver@123',
    description: 'Accept/reject dispatches, view turn-by-turn navigation, simulate or update GPS.',
    color: 'from-emerald-600 to-teal-700',
  },
  {
    role: 'Hospital Admin',
    email: 'hospital@lifeline.com',
    password: 'Hospital@123',
    description: 'Manage bed capacity, specialties, accept incoming patients and track incoming ambulances.',
    color: 'from-purple-600 to-violet-700',
  },
  {
    role: 'Super Admin',
    email: 'admin@lifeline.com',
    password: 'Admin@123',
    description: 'System-wide monitoring, fleet overview, analytics, audits and resource management.',
    color: 'from-rose-600 to-red-700',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-dark via-navy to-navy-light text-white pt-24 pb-32 px-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider mb-8 text-blue-200">
            <Heart size={14} className="text-emergency animate-pulse" />
            LIFELINE EMERGENCY PLATFORM
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            Emergency Ambulance Routing &{' '}
            <span className="text-emergency underline decoration-white/20">
              Hospital Coordination
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            A centralized digital emergency coordination platform connecting patients, ambulance
            crews, hospitals, and dispatchers for rapid response and road-route optimization.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link to="/login">
              <Button size="lg" className="bg-emergency hover:bg-emergency-dark text-white px-8 py-6 rounded-2xl text-base font-bold shadow-xl shadow-red-900/30">
                <PhoneCall className="mr-2 h-5 w-5" />
                Launch Portal Demo
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 rounded-2xl text-base font-semibold bg-white/5">
                System Overview
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-5 rounded-2xl text-left">
              <p className="text-3xl font-black text-white">&lt; 3 min</p>
              <p className="text-xs text-blue-200 uppercase font-semibold tracking-wider mt-1">Average Dispatch</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-5 rounded-2xl text-left">
              <p className="text-3xl font-black text-white">4 Roles</p>
              <p className="text-xs text-blue-200 uppercase font-semibold tracking-wider mt-1">Integrated Coordination</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-5 rounded-2xl text-left">
              <p className="text-3xl font-black text-white">OSRM</p>
              <p className="text-xs text-blue-200 uppercase font-semibold tracking-wider mt-1">Road Route Engine</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-5 rounded-2xl text-left">
              <p className="text-3xl font-black text-white">100%</p>
              <p className="text-xs text-blue-200 uppercase font-semibold tracking-wider mt-1">Real-Time WebSocket</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Accounts Section */}
      <section className="py-20 px-6 bg-slate-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-navy mb-3">Instant Demo Credentials</h2>
            <p className="text-gray-600 max-w-xl mx-auto text-sm">
              Explore the end-to-end workflows of each stakeholder using pre-configured demo credentials.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoAccounts.map((acc) => (
              <div
                key={acc.role}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${acc.color} text-white font-black flex items-center justify-center text-sm shadow-sm mb-4`}>
                    {acc.role[0]}
                  </div>
                  <h3 className="font-extrabold text-navy text-lg mb-1">{acc.role}</h3>
                  <p className="text-xs text-gray-500 mb-4">{acc.description}</p>
                  
                  <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 font-mono text-xs space-y-1 mb-6">
                    <p className="text-gray-700 truncate font-semibold">{acc.email}</p>
                    <p className="text-gray-500">{acc.password}</p>
                  </div>
                </div>

                <Link to="/login" state={{ email: acc.email, password: acc.password }}>
                  <Button variant="outline" className="w-full font-bold text-xs border-navy/20 hover:bg-navy hover:text-white">
                    Sign in as {acc.role.split(' ')[0]}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-navy mb-4">Core System Capabilities</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Engineered with modern algorithms, strict transactional integrity, and reactive real-time coordination.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-8 rounded-3xl border border-gray-100 bg-white hover:border-navy/20 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-navy">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-navy/70 bg-navy/5 px-2.5 py-1 rounded-full">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works / 4 Steps */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Emergency Flow Lifecycle</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Controlled status transitions from initial triage to hospital arrival.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
                <span className="text-3xl font-black text-emergency/80 mb-3 block">{s.step}</span>
                <h4 className="font-bold text-lg mb-2 text-white">{s.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
