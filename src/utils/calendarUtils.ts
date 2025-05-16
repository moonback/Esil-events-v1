import { EventType } from '../types/calendar';

export const getEventStyle = (type: EventType, status: string): string => {
  const baseStyle = 'text-xs p-2 rounded-lg cursor-pointer hover:opacity-90 transition-all duration-200 flex items-center gap-2';
  const statusColor = getStatusColor(status);

  switch (type) {
    case 'delivery':
      return `${baseStyle} bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100`;
    case 'pickup':
      return `${baseStyle} bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100`;
    default:
      return `${baseStyle} ${statusColor} hover:shadow-sm`;
  }
};

export const getEventLabel = (type: EventType): string => {
  switch (type) {
    case 'delivery':
      return 'Livraison';
    case 'pickup':
      return 'Reprise';
    default:
      return 'Événement';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
    case 'in_progress':
      return 'bg-blue-50 text-blue-800 border border-blue-200';
    case 'completed':
      return 'bg-green-50 text-green-800 border border-green-200';
    case 'cancelled':
      return 'bg-red-50 text-red-800 border border-red-200';
    default:
      return 'bg-gray-50 text-gray-800 border border-gray-200';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'in_progress':
      return 'En cours';
    case 'completed':
      return 'Terminé';
    case 'cancelled':
      return 'Annulé';
    default:
      return 'Inconnu';
  }
};

export const getTimeOfDay = (time: string): 'morning' | 'afternoon' | 'evening' => {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}; 