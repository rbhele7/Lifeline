import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    REPORTED: 'bg-blue-100 text-blue-800',
    SEARCHING_AMBULANCE: 'bg-yellow-100 text-yellow-800',
    AMBULANCE_ASSIGNED: 'bg-orange-100 text-orange-800',
    DRIVER_ACCEPTED: 'bg-purple-100 text-purple-800',
    EN_ROUTE_TO_PATIENT: 'bg-indigo-100 text-indigo-800',
    AT_PICKUP: 'bg-cyan-100 text-cyan-800',
    EN_ROUTE_TO_HOSPITAL: 'bg-blue-100 text-blue-800',
    AT_HOSPITAL: 'bg-teal-100 text-teal-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    AVAILABLE: 'bg-green-100 text-green-800',
    ASSIGNED: 'bg-yellow-100 text-yellow-800',
    OUT_OF_SERVICE: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    LOW: 'bg-green-100 text-green-800 border-green-300',
  };
  return colors[severity] || 'bg-gray-100 text-gray-800';
}
