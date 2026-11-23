import { Link } from 'react-router-dom';
import { ArrowRight, PhoneCall, Navigation, Building2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '1',
      title: 'Emergency Reporting & Triage',
      desc: 'The patient or bystander selects emergency category (Cardiac, Accident, Trauma, Respiratory, Pregnancy, General) and severity. Location is captured automatically via browser GPS or interactive pin drop.',
    },
    {
      num: '2',
      title: 'Automated Ambulance Dispatch',
      desc: 'The backend queries active and available ambulances, computes driving route distance and duration using OSRM, applies weighted scoring, and places a transactional lock to assign the best unit.',
    },
    {
      num: '3',
      title: 'Driver Navigation & Telematics',
      desc: 'The assigned driver reviews the pickup location and emergency details, accepts the assignment, and commences navigation. GPS updates broadcast directly to the patient and hospital via WebSockets.',
    },
    {
      num: '4',
      title: 'Hospital Readiness & Handover',
      desc: 'Receiving hospitals monitor incoming ambulances, evaluate patient trauma profiles against available ICU and specialty beds, and explicitly accept the patient prior to emergency department arrival.',
    },
  ];

  return (
    <div className="py-16 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-navy mb-4">How LifeLine Works</h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          A synchronized four-stage workflow connecting all emergency medical stakeholders in real time.
        </p>
      </div>

      <div className="space-y-8 mb-16">
        {steps.map((s) => (
          <div key={s.num} className="flex gap-6 items-start p-8 rounded-3xl bg-slate-50 border border-gray-200">
            <div className="w-12 h-12 rounded-2xl bg-emergency text-white font-black text-xl flex items-center justify-center shrink-0 shadow-sm">
              {s.num}
            </div>
            <div>
              <h3 className="text-xl font-bold text-navy mb-2">{s.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center bg-navy text-white p-10 rounded-3xl">
        <h2 className="text-2xl font-bold mb-3">Ready to experience the platform?</h2>
        <p className="text-blue-200 text-sm mb-6 max-w-md mx-auto">
          Log in with any of our four pre-configured role profiles to see the coordination flow in action.
        </p>
        <Link to="/login">
          <Button size="lg" className="bg-emergency hover:bg-emergency-dark text-white font-bold px-8 rounded-xl">
            Go to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}
