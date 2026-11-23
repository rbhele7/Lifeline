import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Heart, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const schema = z
  .object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(5, 'Phone number is required'),
    emergency_contact: z.string().min(5, 'Emergency contact is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'patient',
        emergency_contact: data.emergency_contact,
      });
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-emergency rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40">
              <Heart className="text-white w-6 h-6" />
            </div>
            <span className="text-3xl font-black text-white tracking-tight">LifeLine</span>
          </Link>
          <p className="text-sm text-blue-200 font-medium">Patient Registration</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white/10">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-navy">Create Account</h2>
            <p className="text-xs text-gray-500 mt-1">Register for patient emergency services</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                placeholder="Jane Doe"
                className="mt-1"
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                className="mt-1"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+44 7700 900000"
                className="mt-1"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="emergency_contact">Emergency Contact Phone</Label>
              <Input
                id="emergency_contact"
                type="tel"
                placeholder="+44 7700 900001 (Next of Kin)"
                className="mt-1"
                {...register('emergency_contact')}
              />
              {errors.emergency_contact && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.emergency_contact.message}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="••••••••"
                className="mt-1"
                {...register('confirm_password')}
              />
              {errors.confirm_password && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.confirm_password.message}
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
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-navy hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
