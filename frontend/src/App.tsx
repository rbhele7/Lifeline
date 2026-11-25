import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Public Pages
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const HowItWorksPage = lazy(() => import('./pages/public/HowItWorksPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Patient Pages
const PatientDashboard = lazy(() => import('./pages/patient/Dashboard'));
const ReportEmergency = lazy(() => import('./pages/patient/ReportEmergency'));
const TrackAmbulance = lazy(() => import('./pages/patient/TrackAmbulance'));
const HospitalRecommendations = lazy(() => import('./pages/patient/HospitalRecommendations'));
const EmergencyHistory = lazy(() => import('./pages/patient/EmergencyHistory'));

// Driver Pages
const DriverDashboard = lazy(() => import('./pages/driver/Dashboard'));
const DriverAssignments = lazy(() => import('./pages/driver/Assignments'));
const DriverNavigation = lazy(() => import('./pages/driver/Navigation'));
const DriverHistory = lazy(() => import('./pages/driver/History'));

// Hospital Pages
const HospitalDashboard = lazy(() => import('./pages/hospital/Dashboard'));
const IncomingRequests = lazy(() => import('./pages/hospital/IncomingRequests'));
const CapacityManagement = lazy(() => import('./pages/hospital/CapacityManagement'));
const FacilityManagement = lazy(() => import('./pages/hospital/FacilityManagement'));
const IncomingMap = lazy(() => import('./pages/hospital/IncomingMap'));
const HospitalEmergencyHistory = lazy(() => import('./pages/hospital/EmergencyHistory'));

// Super Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const HospitalManagement = lazy(() => import('./pages/admin/HospitalManagement'));
const AmbulanceManagement = lazy(() => import('./pages/admin/AmbulanceManagement'));
const EmergencyMonitoring = lazy(() => import('./pages/admin/EmergencyMonitoring'));
const LiveMap = lazy(() => import('./pages/admin/LiveMap'));
const AnalyticsDashboard = lazy(() => import('./pages/admin/Analytics'));
const Reports = lazy(() => import('./pages/admin/Reports'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors expand={true} />
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading LifeLine..." /></div>}>
          <Routes>
            {/* Public Portal Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/about" element={<AboutPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
            </Route>

            {/* Full Screen Landing & Auth Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 1. Patient Protected Routes */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute role="patient">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PatientDashboard />} />
              <Route path="report" element={<ReportEmergency />} />
              <Route path="track" element={<TrackAmbulance />} />
              <Route path="track/:emergencyId" element={<TrackAmbulance />} />
              <Route path="hospitals" element={<HospitalRecommendations />} />
              <Route path="history" element={<EmergencyHistory />} />
            </Route>

            {/* 2. Driver Protected Routes */}
            <Route
              path="/driver"
              element={
                <ProtectedRoute role="driver">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DriverDashboard />} />
              <Route path="assignments" element={<DriverAssignments />} />
              <Route path="navigate" element={<DriverNavigation />} />
              <Route path="history" element={<DriverHistory />} />
            </Route>

            {/* 3. Hospital Admin Protected Routes */}
            <Route
              path="/hospital"
              element={
                <ProtectedRoute role="hospital_admin">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HospitalDashboard />} />
              <Route path="requests" element={<IncomingRequests />} />
              <Route path="capacity" element={<CapacityManagement />} />
              <Route path="facilities" element={<FacilityManagement />} />
              <Route path="map" element={<IncomingMap />} />
              <Route path="history" element={<HospitalEmergencyHistory />} />
            </Route>

            {/* 4. Super Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="super_admin">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="hospitals" element={<HospitalManagement />} />
              <Route path="ambulances" element={<AmbulanceManagement />} />
              <Route path="emergencies" element={<EmergencyMonitoring />} />
              <Route path="map" element={<LiveMap />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
