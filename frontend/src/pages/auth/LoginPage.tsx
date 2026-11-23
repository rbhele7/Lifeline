import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Heart, AlertCircle, ArrowRight } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

const roleRedirects: Record<string, string> = {
  patient: '/patient',
  driver: '/driver',
  hospital_admin: '/hospital',
  super_admin: '/admin',
};

const demoLogins = [
  { label: 'Patient', email: 'john.patient@example.com', pass: 'Patient@123', color: 'border-blue-200 hover:border-blue-400 bg-blue-50/50' },
  { label: 'Driver', email: 'driver1@lifeline.com', pass: 'Driver@123', color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/50' },
  { label: 'Hospital', email: 'hospital@lifeline.com', pass: 'Hospital@123', color: 'border-purple-200 hover:border-purple-400 bg-purple-50/50' },
  { label: 'Super Admin', email: 'admin@lifeline.com', pass: 'Admin@123', color: 'border-rose-200 hover:border-rose-400 bg-rose-50/50' },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: location.state?.email || '',
      password: location.state?.password || '',
    },
  });

  useEffect(() => {
    if (location.state?.email && location.state?.password) {
      setValue('email', location.state.email);
      setValue('password', location.state.password);
    }
  }, [location.state, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Authenticated as ${user.full_name}`);
      navigate(roleRedirects[user.role] || '/');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-emergency rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40">
              <Heart className="text-white w-6 h-6" />
            </div>
            <span className="text-3xl font-black text-white tracking-tight">LifeLine</span>
          </Link>
          <p className="text-sm text-blue-200 font-medium">Emergency Coordination & Routing Portal</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white/10">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-navy">Sign In</h2>
            <p className="text-xs text-gray-500 mt-1">Select a role or enter your credentials</p>
          </div>

          {/* Quick Demo Selector */}
          <div className="mb-6">
            <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Quick Demo Fill
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {demoLogins.map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => handleQuickLogin(d.email, d.pass)}
                  className={`text-left p-2.5 rounded-xl border text-xs font-semibold text-gray-800 transition-all ${d.color}`}
                >
                  <p className="font-bold text-navy truncate">{d.label}</p>
                  <p className="text-[10px] text-gray-500 truncate">{d.email}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="mt-1"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} /> {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} /> {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-navy hover:bg-navy-light text-white font-bold h-12 rounded-xl mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Need a patient account?{' '}
            <Link to="/register" className="font-bold text-navy hover:underline">
              Register here
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-blue-200 hover:text-white transition-colors">
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
