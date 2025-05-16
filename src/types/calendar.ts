export type ViewMode = 'month' | 'week' | 'day';
export type TimeFilter = 'all' | 'morning' | 'afternoon' | 'evening';
export type EventTypeFilter = 'all' | 'event' | 'delivery' | 'pickup';
export type EventType = 'event' | 'delivery' | 'pickup';

export interface CalendarEvent {
  id: string;
  type: EventType;
  status: string;
  first_name: string;
  last_name: string;
  displayTime: string;
  event_date?: string;
  event_location?: string;
  event_duration?: string;
  delivery_date?: string;
  delivery_time_slot?: string;
  delivery_address?: string;
  delivery_postal_code?: string;
  delivery_city?: string;
  delivery_type?: string;
  exterior_access?: string;
  interior_access?: string;
  elevator_width?: number;
  elevator_height?: number;
  elevator_depth?: number;
  pickup_return_date?: string;
  pickup_return_start_time?: string;
  pickup_return_end_time?: string;
  comments?: string;
}

export interface CalendarStats {
  total: number;
  pending: number;
  upcoming: number;
}

export interface CalendarFilters {
  searchTerm: string;
  statusFilter: string;
  timeFilter: TimeFilter;
  eventTypeFilter: EventTypeFilter;
  showDeliveries: boolean;
  showPickups: boolean;
}

export interface CalendarViewState {
  viewMode: ViewMode;
  currentMonth: Date;
  selectedDate: Date | null;
  isFullscreen: boolean;
  isCompact: boolean;
  showEventCount: boolean;
  showLegend: boolean;
} 