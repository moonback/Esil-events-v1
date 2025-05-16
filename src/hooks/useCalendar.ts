import { useState, useEffect } from 'react';
import { getQuoteRequests } from '../services/quoteRequestService';
import { CalendarEvent, CalendarFilters, CalendarViewState, EventType, TimeFilter, EventTypeFilter } from '../types/calendar';
import { getTimeOfDay } from '../utils/calendarUtils';
import { QuoteRequest } from '../services/quoteRequestService';

export const useCalendar = () => {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CalendarFilters>({
    searchTerm: '',
    statusFilter: 'all',
    timeFilter: 'all',
    eventTypeFilter: 'all',
    showDeliveries: true,
    showPickups: true
  });
  const [viewState, setViewState] = useState<CalendarViewState>({
    viewMode: 'month',
    currentMonth: new Date(),
    selectedDate: null,
    isFullscreen: false,
    isCompact: false,
    showEventCount: true,
    showLegend: true
  });
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<QuoteRequest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchQuoteRequests();
  }, []);

  const fetchQuoteRequests = async () => {
    try {
      const response = await getQuoteRequests();
      if (response.data) {
        setQuoteRequests(response.data);
      }
    } catch (error) {
      console.error('Error fetching quote requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertToCalendarEvent = (request: QuoteRequest, type: EventType, displayTime: string): CalendarEvent => {
    // Ensure required fields are present
    if (!request.id || !request.status || !request.first_name || !request.last_name) {
      throw new Error('Missing required fields for calendar event');
    }

    return {
      id: request.id,
      type,
      status: request.status,
      first_name: request.first_name,
      last_name: request.last_name,
      displayTime,
      event_date: request.event_date ? new Date(request.event_date).toISOString() : undefined,
      event_location: request.event_location || undefined,
      event_duration: request.event_duration || undefined,
      delivery_date: request.delivery_date ? new Date(request.delivery_date).toISOString() : undefined,
      delivery_time_slot: request.delivery_time_slot || undefined,
      delivery_address: request.delivery_address || undefined,
      delivery_postal_code: request.delivery_postal_code || undefined,
      delivery_city: request.delivery_city || undefined,
      delivery_type: request.delivery_type || undefined,
      exterior_access: request.exterior_access || undefined,
      interior_access: request.interior_access || undefined,
      elevator_width: request.elevator_width || undefined,
      elevator_height: request.elevator_height || undefined,
      elevator_depth: request.elevator_depth || undefined,
      pickup_return_date: request.pickup_return_date ? new Date(request.pickup_return_date).toISOString() : undefined,
      pickup_return_start_time: request.pickup_return_start_time || undefined,
      pickup_return_end_time: request.pickup_return_end_time || undefined,
      comments: request.comments || undefined
    };
  };

  const getRequestsForDate = (date: Date): CalendarEvent[] => {
    const allEvents = quoteRequests.flatMap(request => {
      const events: CalendarEvent[] = [];
      const eventDate = request.event_date ? new Date(request.event_date) : null;
      const deliveryDate = request.delivery_date ? new Date(request.delivery_date) : null;
      const pickupDate = request.pickup_return_date ? new Date(request.pickup_return_date) : null;

      // Événement principal
      if (eventDate && eventDate.toDateString() === date.toDateString()) {
        events.push(convertToCalendarEvent(request, 'event', request.event_start_time || '00:00'));
      }

      // Livraison
      if (filters.showDeliveries && deliveryDate && deliveryDate.toDateString() === date.toDateString()) {
        events.push(convertToCalendarEvent(request, 'delivery', request.delivery_time_slot || '00:00'));
      }

      // Reprise
      if (filters.showPickups && pickupDate && pickupDate.toDateString() === date.toDateString()) {
        events.push(convertToCalendarEvent(request, 'pickup', request.pickup_return_start_time || '00:00'));
      }

      return events;
    });

    return allEvents
      .filter(event => {
        const matchesStatus = filters.statusFilter === 'all' || event.status === filters.statusFilter;
        const matchesSearch = !filters.searchTerm || 
          event.first_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          event.last_name.toLowerCase().includes(filters.searchTerm.toLowerCase());
        const matchesEventType = filters.eventTypeFilter === 'all' || event.type === filters.eventTypeFilter;
        const matchesTime = filters.timeFilter === 'all' || getTimeOfDay(event.displayTime) === filters.timeFilter;
        return matchesStatus && matchesSearch && matchesEventType && matchesTime;
      })
      .sort((a, b) => a.displayTime.localeCompare(b.displayTime));
  };

  const getStats = () => {
    const totalRequests = quoteRequests.length;
    const pendingRequests = quoteRequests.filter(r => r.status === 'pending').length;
    const upcomingEvents = quoteRequests.filter(r => {
      if (!r.event_date) return false;
      const eventDate = new Date(r.event_date);
      const today = new Date();
      return eventDate >= today;
    }).length;

    return {
      total: totalRequests,
      pending: pendingRequests,
      upcoming: upcomingEvents
    };
  };

  const handleRequestClick = (event: CalendarEvent) => {
    const request = quoteRequests.find(r => r.id === event.id);
    if (request) {
      setSelectedRequestDetails(request);
      setIsDetailsModalOpen(true);
    }
  };

  const updateFilters = (newFilters: Partial<CalendarFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const updateViewState = (newState: Partial<CalendarViewState>) => {
    setViewState(prev => ({ ...prev, ...newState }));
  };

  return {
    quoteRequests,
    loading,
    filters,
    viewState,
    selectedRequestDetails,
    isDetailsModalOpen,
    getRequestsForDate,
    getStats,
    handleRequestClick,
    updateFilters,
    updateViewState,
    setSelectedRequestDetails,
    setIsDetailsModalOpen
  };
}; 