import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Users, Activity, Award, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function AboutPage() {
  return (
    <div className="py-16 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-navy mb-4">About LifeLine</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          An integrated emergency ambulance routing and hospital coordination system designed to minimize response delays and streamline medical handovers.
        </p>
      </div>

      <div className="space-y-12 text-gray-700 leading-relaxed">
        <div className="bg-slate-50 border border-gray-200 p-8 rounded-3xl">
          <h2 className="text-2xl font-bold text-navy mb-4">Problem Statement</h2>
          <p className="mb-4">
            During critical medical emergencies, every minute counts. Traditional dispatch mechanisms often rely on fragmented telephone communications, suboptimal straight-line routing estimates, and minimal pre-arrival coordination with emergency departments.
          </p>
          <p>
            LifeLine resolves these bottlenecks by combining real road-network routing (OSRM), weighted multi-criteria ambulance allocation, real-time WebSocket vehicle telematics, and explicit hospital capacity verification.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-gray-200 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-navy mb-2 flex items-center gap-2">
              <CheckCircle className="text-emerald-500 w-5 h-5" />
              Smart Ambulance Allocation
            </h3>
            <p className="text-sm text-gray-600">
              Evaluates available units using normalized travel time (70%) and distance (30%), using PostgreSQL database transactions to prevent race conditions.
            </p>
          </div>
          <div className="border border-gray-200 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-navy mb-2 flex items-center gap-2">
              <CheckCircle className="text-emerald-500 w-5 h-5" />
              Hospital Recommendation Engine
            </h3>
            <p className="text-sm text-gray-600">
              Ranks receiving facilities by road proximity (40%), bed availability (30%), and specialized emergency facilities (30%), preventing destination saturation.
            </p>
          </div>
        </div>

        <div className="text-center pt-8">
          <Link to="/login">
            <Button size="lg" className="bg-navy hover:bg-navy-light text-white font-bold px-8 rounded-xl">
              Access the System
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
