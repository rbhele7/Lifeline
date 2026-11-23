import { cn } from '../../lib/utils';

const statusStyles: Record<string, string> = {
  REPORTED: 'bg-blue-100 text-blue-800 border border-blue-200',
  SEARCHING_AMBULANCE: 'bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse',
  AMBULANCE_ASSIGNED: 'bg-orange-100 text-orange-800 border border-orange-200',
  DRIVER_ACCEPTED: 'bg-purple-100 text-purple-800 border border-purple-200',
  EN_ROUTE_TO_PATIENT: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  AT_PICKUP: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
  EN_ROUTE_TO_HOSPITAL: 'bg-blue-100 text-blue-800 border border-blue-200',
  AT_HOSPITAL: 'bg-teal-100 text-teal-800 border border-teal-200',
  COMPLETED: 'bg-green-100 text-green-800 border border-green-200',
  CANCELLED: 'bg-gray-100 text-gray-700 border border-gray-200',
  REASSIGNMENT_REQUIRED: 'bg-red-100 text-red-800 border border-red-200',
  NO_AMBULANCE_AVAILABLE: 'bg-red-100 text-red-800 border border-red-200',
  AVAILABLE: 'bg-green-100 text-green-800 border border-green-200',
  ASSIGNED: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  OUT_OF_SERVICE: 'bg-red-100 text-red-800 border border-red-200',
  CRITICAL: 'bg-red-600 text-white shadow-sm',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  LOW: 'bg-green-500 text-white',
  PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  ACCEPTED: 'bg-green-100 text-green-800 border border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border border-red-200',
};

const statusLabels: Record<string, string> = {
  REPORTED: 'Reported',
  SEARCHING_AMBULANCE: 'Searching Ambulance',
  AMBULANCE_ASSIGNED: 'Ambulance Assigned',
  DRIVER_ACCEPTED: 'Driver Accepted',
  EN_ROUTE_TO_PATIENT: 'En Route to Patient',
  AT_PICKUP: 'At Pickup Location',
  EN_ROUTE_TO_HOSPITAL: 'En Route to Hospital',
  AT_HOSPITAL: 'At Hospital',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REASSIGNMENT_REQUIRED: 'Reassignment Required',
  NO_AMBULANCE_AVAILABLE: 'No Ambulance Available',
  AVAILABLE: 'Available',
  ASSIGNED: 'Assigned',
  OUT_OF_SERVICE: 'Out of Service',
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
  const label = statusLabels[status] || status;
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
