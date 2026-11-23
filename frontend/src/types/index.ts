export enum UserRole {
  PATIENT = 'patient',
  DRIVER = 'driver',
  HOSPITAL_ADMIN = 'hospital_admin',
  SUPER_ADMIN = 'super_admin',
}

export enum AmbulanceStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  EN_ROUTE_TO_PATIENT = 'EN_ROUTE_TO_PATIENT',
  AT_PICKUP = 'AT_PICKUP',
  EN_ROUTE_TO_HOSPITAL = 'EN_ROUTE_TO_HOSPITAL',
  AT_HOSPITAL = 'AT_HOSPITAL',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export enum EmergencyStatus {
  REPORTED = 'REPORTED',
  SEARCHING_AMBULANCE = 'SEARCHING_AMBULANCE',
  AMBULANCE_ASSIGNED = 'AMBULANCE_ASSIGNED',
  DRIVER_ACCEPTED = 'DRIVER_ACCEPTED',
  EN_ROUTE_TO_PATIENT = 'EN_ROUTE_TO_PATIENT',
  AT_PICKUP = 'AT_PICKUP',
  EN_ROUTE_TO_HOSPITAL = 'EN_ROUTE_TO_HOSPITAL',
  AT_HOSPITAL = 'AT_HOSPITAL',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REASSIGNMENT_REQUIRED = 'REASSIGNMENT_REQUIRED',
  NO_AMBULANCE_AVAILABLE = 'NO_AMBULANCE_AVAILABLE',
}

export enum EmergencyType {
  CARDIAC = 'CARDIAC',
  ACCIDENT = 'ACCIDENT',
  TRAUMA = 'TRAUMA',
  RESPIRATORY = 'RESPIRATORY',
  PREGNANCY = 'PREGNANCY',
  GENERAL = 'GENERAL',
}

export enum EmergencySeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Patient {
  id: number;
  user_id: number;
  emergency_contact?: string;
  user?: User;
}

export interface Driver {
  id: number;
  user_id: number;
  license_number?: string;
  assigned_ambulance_id?: number;
  user?: User;
  ambulance?: Ambulance;
}

export interface Hospital {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_number?: string;
  is_active: boolean;
  facilities?: HospitalFacility[];
  capacity?: HospitalCapacity;
}

export interface HospitalFacility {
  id: number;
  hospital_id: number;
  facility_name: string;
  is_available: boolean;
}

export interface HospitalCapacity {
  id: number;
  hospital_id: number;
  total_beds: number;
  available_beds: number;
  last_updated: string;
}

export interface Ambulance {
  id: number;
  vehicle_number: string;
  driver_id?: number;
  latitude?: number;
  longitude?: number;
  status: AmbulanceStatus;
  last_location_update?: string;
  driver?: Driver;
}

export interface AmbulanceAssignment {
  id: number;
  emergency_id: number;
  ambulance_id: number;
  assigned_at: string;
  accepted_at?: string;
  completed_at?: string;
  status: string;
  estimated_arrival_minutes?: number;
  distance_km?: number;
  ambulance?: Ambulance;
}

export interface EmergencyRequest {
  id: number;
  patient_id: number;
  emergency_type: EmergencyType;
  severity: EmergencySeverity;
  description?: string;
  latitude: number;
  longitude: number;
  contact_name?: string;
  contact_phone?: string;
  status: EmergencyStatus;
  created_at: string;
  updated_at: string;
  assignments?: AmbulanceAssignment[];
  patient?: Patient;
}

export interface HospitalNotification {
  id: number;
  emergency_id: number;
  hospital_id: number;
  status: string;
  estimated_arrival_minutes?: number;
  created_at: string;
  emergency?: EmergencyRequest;
  hospital?: Hospital;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Analytics {
  total_emergencies: number;
  active_emergencies: number;
  completed_emergencies: number;
  available_ambulances: number;
  busy_ambulances: number;
  registered_hospitals: number;
  hospital_acceptance_rate: number;
  average_dispatch_minutes?: number;
  emergency_type_distribution: Array<{ type: string; count: number }>;
  daily_stats: Array<{ date: string; count: number }>;
  total_patients: number;
  total_drivers: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface HospitalRecommendation {
  hospital: Hospital;
  distance_km: number;
  duration_minutes: number;
  is_estimated: boolean;
  facility_score: number;
  capacity_score: number;
  available_beds: number;
  matched_facilities: string[];
  recommendation_score: number;
}
