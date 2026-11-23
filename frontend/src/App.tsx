import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import ReportEmergency from './pages/patient/ReportEmergency';
import TrackAmbulance from './pages/patient/TrackAmbulance';
import HospitalRecommendations from './pages/patient/HospitalRecommendations';
import EmergencyHistory from './pages/patient/EmergencyHistory';

// Driver Pages
import DriverDashboard from './pages/driver/Dashboard';
import DriverAssignments from './pages/driver/Assignments';
import DriverNavigation from './pages/driver/Navigation';
import DriverHistory from './pages/driver/History';

// Hospital Pages
import HospitalDashboard from './pages/hospital/Dashboard';
import IncomingRequests from './pages/hospital/IncomingRequests';
import CapacityManagement from './pages/hospital/CapacityManagement';
import FacilityManagement from './pages/hospital/FacilityManagement';
import IncomingMap from './pages/hospital/IncomingMap';
import HospitalEmergencyHistory from './pages/hospital/EmergencyHistory';

// Super Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import HospitalManagement from './pages/admin/HospitalManagement';
import AmbulanceManagement from './pages/admin/AmbulanceManagement';
import EmergencyMonitoring from './pages/admin/EmergencyMonitoring';
import LiveMap from './pages/admin/LiveMap';
import AnalyticsDashboard from './pages/admin/Analytics';
import Reports from './pages/admin/Reports';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors expand={true} />
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
      </BrowserRouter>
    </AuthProvider>
  );
}
