import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Search, Filter, BarChart2, Clock, Users, Tag, X, FileText, Mail, Phone, MapPin, Clock as ClockIcon, Truck, Package, DoorOpen, ArrowLeftRight, MessageSquare, ChevronUp, ChevronDown, Maximize2, Minimize2, Grid, List, MoreHorizontal } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { QuoteRequest } from '../../services/quoteRequestService';
import { getQuoteRequests } from '../../services/quoteRequestService';
import { formatDate, getStatusColor, getStatusLabel } from '../../components/admin/quoteRequests/QuoteRequestUtils';

type ViewMode = 'month' | 'week' | 'day';
type TimeFilter = 'all' | 'morning' | 'afternoon' | 'evening';
type EventTypeFilter = 'all' | 'event' | 'delivery' | 'pickup';
type EventType = 'event' | 'delivery' | 'pickup';

interface CalendarEvent extends QuoteRequest {
  type: EventType;
  displayTime: string;
}

const CalendarHeader: React.FC<{
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  showDeliveries: boolean;
  setShowDeliveries: (show: boolean) => void;
  showPickups: boolean;
  setShowPickups: (show: boolean) => void;
}> = ({ viewMode, setViewMode, showDeliveries, setShowDeliveries, showPickups, setShowPickups }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agenda des demandes de devis</h1>
        <p className="mt-2 text-sm text-gray-500">
          Visualisez et gérez les demandes de devis par date d'événement
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'month'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mois
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'week'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'day'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Jour
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDeliveries(!showDeliveries)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showDeliveries
                ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            Livraisons
          </button>
          <button
            onClick={() => setShowPickups(!showPickups)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showPickups
                ? 'bg-purple-100 text-purple-800 border border-purple-200 shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            Reprises
          </button>
        </div>
      </div>
    </div>
  </div>
);

const StatsSection: React.FC<{ stats: { total: number; pending: number; upcoming: number } }> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mr-4">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Total des demandes</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>
      </div>
    </div>
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-yellow-50 text-yellow-600 mr-4">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">En attente</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
        </div>
      </div>
    </div>
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Événements à venir</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.upcoming}</p>
        </div>
      </div>
    </div>
  </div>
);

const FiltersSection: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}> = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="all">Tous les statuts</option>
        <option value="pending">En attente</option>
        <option value="in_progress">En cours</option>
        <option value="completed">Terminé</option>
        <option value="cancelled">Annulé</option>
      </select>
    </div>
  </div>
);

const QuoteRequestCalendar: React.FC = () => {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<QuoteRequest[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<QuoteRequest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showDeliveries, setShowDeliveries] = useState(true);
  const [showPickups, setShowPickups] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeFilter>('all');
  const [showLegend, setShowLegend] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [showEventCount, setShowEventCount] = useState(true);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      dates.push(current);
    }
    return dates;
  };

  const getTimeOfDay = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  };

  const getRequestsForDate = (date: Date) => {
    const allEvents = quoteRequests.flatMap(request => {
      const events = [];
      const eventDate = request.event_date ? new Date(request.event_date) : null;
      const deliveryDate = request.delivery_date ? new Date(request.delivery_date) : null;
      const pickupDate = request.pickup_return_date ? new Date(request.pickup_return_date) : null;

      // Événement principal
      if (eventDate && eventDate.toDateString() === date.toDateString()) {
        events.push({
          ...request,
          type: 'event',
          displayTime: request.event_start_time || '00:00'
        });
      }

      // Livraison
      if (showDeliveries && deliveryDate && deliveryDate.toDateString() === date.toDateString()) {
        events.push({
          ...request,
          type: 'delivery',
          displayTime: request.delivery_time_slot || '00:00'
        });
      }

      // Reprise
      if (showPickups && pickupDate && pickupDate.toDateString() === date.toDateString()) {
        events.push({
          ...request,
          type: 'pickup',
          displayTime: request.pickup_return_start_time || '00:00'
        });
      }

      return events;
    });

    return allEvents
      .filter(event => {
        const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
        const matchesSearch = !searchTerm || 
          event.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEventType = eventTypeFilter === 'all' || event.type === eventTypeFilter;
        const matchesTime = timeFilter === 'all' || getTimeOfDay(event.displayTime) === timeFilter;
        return matchesStatus && matchesSearch && matchesEventType && matchesTime;
      })
      .sort((a, b) => a.displayTime.localeCompare(b.displayTime));
  };

  const getEventStyle = (type: 'event' | 'delivery' | 'pickup', status: string) => {
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

  const getEventLabel = (type: 'event' | 'delivery' | 'pickup') => {
    switch (type) {
      case 'delivery':
        return 'Livraison';
      case 'pickup':
        return 'Reprise';
      default:
        return 'Événement';
    }
  };

  const getDayLoad = (date: Date) => {
    const events = getRequestsForDate(date);
    const totalEvents = events.length;
    if (totalEvents === 0) return 'empty';
    if (totalEvents <= 3) return 'light';
    if (totalEvents <= 6) return 'medium';
    return 'heavy';
  };

  const getLoadColor = (load: string) => {
    switch (load) {
      case 'light': return 'bg-green-50 border-green-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'heavy': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const LoadIndicator = ({ date }: { date: Date }) => {
    const load = getDayLoad(date);
    if (load === 'empty') return null;
    
    return (
      <div className="flex items-center gap-1 mt-1">
        <div className={`w-2 h-2 rounded-full ${
          load === 'light' ? 'bg-green-400' :
          load === 'medium' ? 'bg-yellow-400' :
          'bg-red-400'
        }`} />
        <span className="text-xs text-gray-500">
          {load === 'light' ? 'Léger' :
           load === 'medium' ? 'Modéré' :
           'Chargé'}
        </span>
      </div>
    );
  };

  const renderEventItem = (event: any) => (
    <div
      key={`${event.id}-${event.type}`}
      onClick={(e) => {
        e.stopPropagation();
        handleRequestClick(event);
      }}
      className={`${getEventStyle(event.type, event.status)} ${isCompact ? 'py-1' : 'py-2'}`}
      title={`${getEventLabel(event.type)} - ${event.first_name} ${event.last_name} - ${getStatusLabel(event.status)}`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {event.type === 'delivery' && <Truck className="w-4 h-4 flex-shrink-0" />}
        {event.type === 'pickup' && <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />}
        {event.type === 'event' && <Calendar className="w-4 h-4 flex-shrink-0" />}
        <div className="flex flex-col min-w-0">
          <span className="font-medium truncate">
            {event.first_name} {event.last_name}
          </span>
          {!isCompact && (
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-75 truncate">
                {getEventLabel(event.type)}
              </span>
              <span className="text-xs opacity-75">•</span>
              <span className={`text-xs ${getStatusColor(event.status)}`}>
                {getStatusLabel(event.status)}
              </span>
            </div>
          )}
        </div>
      </div>
      <span className="text-xs font-medium bg-white/50 px-2 py-1 rounded">
        {event.displayTime}
      </span>
    </div>
  );

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedRequests(getRequestsForDate(date));
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentMonth(newDate);
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

  const handleRequestClick = (request: QuoteRequest) => {
    setSelectedRequestDetails(request);
    setIsDetailsModalOpen(true);
  };

  const renderRequestDetailsModal = () => {
    if (!selectedRequestDetails) return null;

    return (
      <div className="fixed  inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-12xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Détails de la demande de devis
              </h2>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations client */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations client</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Users className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Nom complet</p>
                        <p className="font-medium text-gray-900">
                          {selectedRequestDetails.first_name} {selectedRequestDetails.last_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{selectedRequestDetails.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="font-medium text-gray-900">{selectedRequestDetails.phone || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Détails de l'événement */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails de l'événement</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Date de l'événement</p>
                        <p className="font-medium text-gray-900">
                          {selectedRequestDetails.event_date ? formatDate(selectedRequestDetails.event_date.toString()) : 'Non renseignée'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Lieu</p>
                        <p className="font-medium text-gray-900">{selectedRequestDetails.event_location || 'Non renseigné'}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <ClockIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Durée</p>
                        <p className="font-medium text-gray-900">{selectedRequestDetails.event_duration || 'Non renseignée'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails de la demande */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails de la demande</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Statut</p>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedRequestDetails.status || 'pending')}`}>
                        {getStatusLabel(selectedRequestDetails.status || 'pending')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Type de client</p>
                      <p className="font-medium text-gray-900">{selectedRequestDetails.customer_type || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Type de livraison</p>
                      <p className="font-medium text-gray-900">{selectedRequestDetails.delivery_type || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>

                {/* Articles demandés */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Articles demandés</h3>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix unitaire</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedRequestDetails.items && selectedRequestDetails.items.length > 0 ? (
                          selectedRequestDetails.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.name}
                                {item.color && (
                                  <span className="ml-2 text-xs text-gray-500">({item.color})</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.price?.toFixed(2)}€</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {((item.quantity || 0) * (item.price || 0)).toFixed(2)}€
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                              Aucun article demandé
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                            Total
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {selectedRequestDetails.items?.reduce((sum, item) => 
                              sum + ((item.quantity || 0) * (item.price || 0)), 0
                            ).toFixed(2)}€
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Informations de livraison */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex items-center">
                      <Truck className="w-5 h-5 text-indigo-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">Informations de livraison</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {/* Détails principaux */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start">
                            <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Date et créneau</p>
                              <div className="mt-1 space-y-1">
                                <p className="text-sm text-gray-600">
                                  {selectedRequestDetails.delivery_date ? formatDate(selectedRequestDetails.delivery_date) : 'Non spécifiée'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {selectedRequestDetails.delivery_time_slot || 'Créneau non spécifié'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start">
                            <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Adresse de livraison</p>
                              <div className="mt-1">
                                {selectedRequestDetails.delivery_address ? (
                                  <div className="text-sm text-gray-600">
                                    <p>{selectedRequestDetails.delivery_address}</p>
                                    <p>{selectedRequestDetails.delivery_postal_code} {selectedRequestDetails.delivery_city}</p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-600">Non spécifiée</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Type de livraison */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <Package className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Type de livraison</p>
                            <p className="mt-1 text-sm text-gray-600">{selectedRequestDetails.delivery_type || 'Non spécifié'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Informations d'accès */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <DoorOpen className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Informations d'accès</p>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500">Accès extérieur</p>
                                <p className="mt-1 text-sm text-gray-600">{selectedRequestDetails.exterior_access || 'Non spécifié'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Accès intérieur</p>
                                <p className="mt-1 text-sm text-gray-600">{selectedRequestDetails.interior_access || 'Non spécifié'}</p>
                              </div>
                            </div>
                            {selectedRequestDetails.elevator_width && (
                              <div className="mt-4">
                                <p className="text-xs text-gray-500 mb-2">Dimensions de l'ascenseur</p>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="bg-white rounded p-2 text-center">
                                    <p className="text-xs text-gray-500">Largeur</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedRequestDetails.elevator_width} cm</p>
                                  </div>
                                  <div className="bg-white rounded p-2 text-center">
                                    <p className="text-xs text-gray-500">Hauteur</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedRequestDetails.elevator_height} cm</p>
                                  </div>
                                  <div className="bg-white rounded p-2 text-center">
                                    <p className="text-xs text-gray-500">Profondeur</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedRequestDetails.elevator_depth} cm</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations de reprise */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                  <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex items-center">
                      <ArrowLeftRight className="w-5 h-5 text-indigo-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">Informations de reprise</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Date de reprise</p>
                            <p className="mt-1 text-sm text-gray-600">
                              {selectedRequestDetails.pickup_return_date ? formatDate(selectedRequestDetails.pickup_return_date) : 'Non spécifiée'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <Clock className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Créneau horaire</p>
                            <p className="mt-1 text-sm text-gray-600">
                              {selectedRequestDetails.pickup_return_start_time && selectedRequestDetails.pickup_return_end_time ? (
                                `${selectedRequestDetails.pickup_return_start_time} - ${selectedRequestDetails.pickup_return_end_time}`
                              ) : (
                                'Non spécifié'
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commentaires */}
                {selectedRequestDetails.comments && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                      <div className="flex items-center">
                        <MessageSquare className="w-5 h-5 text-indigo-600 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">Commentaires</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {selectedRequestDetails.comments}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  // TODO: Implémenter l'action d'édition
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}h${minutes !== '00' ? minutes : ''}`;
  };

  // Fonction pour calculer la position optimale du tooltip
  const calculateTooltipPosition = (e: React.MouseEvent, date: Date) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const tooltipHeight = 400; // Hauteur approximative du tooltip
    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Position horizontale
    let left = rect.left;
    if (left + 400 > window.innerWidth) { // 400px est la largeur approximative du tooltip
      left = window.innerWidth - 420; // 20px de marge
    }

    // Position verticale
    let top;
    if (spaceBelow >= tooltipHeight || spaceBelow > spaceAbove) {
      // Afficher en dessous si il y a assez d'espace ou si il y a plus d'espace en dessous
      top = rect.bottom + 10;
    } else {
      // Afficher au-dessus
      top = rect.top - tooltipHeight - 10;
    }

    return { x: left, y: top };
  };

  // Composant pour le tooltip de récapitulatif
  const DayTooltip = ({ date, events }: { date: Date; events: any[] }) => {
    const formattedDate = formatDate(date.toISOString());
    const eventsByType = {
      event: events.filter(e => e.type === 'event'),
      delivery: events.filter(e => e.type === 'delivery'),
      pickup: events.filter(e => e.type === 'pickup')
    };

    return (
      <div className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[300px] max-w-[400px] max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 pb-2 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{formattedDate}</h3>
          <p className="text-sm text-gray-500">
            {events.length} événement{events.length > 1 ? 's' : ''} au total
          </p>
        </div>

        <div className="space-y-4">
          {/* Événements */}
          {eventsByType.event.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-medium text-gray-900">Événements</h4>
              </div>
              <div className="space-y-2">
                {eventsByType.event.map(event => (
                  <div key={`${event.id}-event`} className="bg-green-50 rounded p-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {event.first_name} {event.last_name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {event.event_location || 'Lieu non spécifié'}
                        </p>
                      </div>
                      <span className="text-xs font-medium bg-white/50 px-2 py-1 rounded">
                        {formatTime(event.displayTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Livraisons */}
          {eventsByType.delivery.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-medium text-gray-900">Livraisons</h4>
              </div>
              <div className="space-y-2">
                {eventsByType.delivery.map(event => (
                  <div key={`${event.id}-delivery`} className="bg-blue-50 rounded p-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {event.first_name} {event.last_name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {event.delivery_address || 'Adresse non spécifiée'}
                        </p>
                      </div>
                      <span className="text-xs font-medium bg-white/50 px-2 py-1 rounded">
                        {formatTime(event.displayTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reprises */}
          {eventsByType.pickup.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowLeftRight className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-medium text-gray-900">Reprises</h4>
              </div>
              <div className="space-y-2">
                {eventsByType.pickup.map(event => (
                  <div key={`${event.id}-pickup`} className="bg-purple-50 rounded p-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {event.first_name} {event.last_name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {event.delivery_address || 'Adresse non spécifiée'}
                        </p>
                      </div>
                      <span className="text-xs font-medium bg-white/50 px-2 py-1 rounded">
                        {formatTime(event.displayTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth);
    const days = [];
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className={`border border-gray-200 bg-gray-50 ${isFullscreen ? 'h-48' : 'h-40'}`}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const eventsForDay = getRequestsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isHovered = hoveredDate?.toDateString() === date.toDateString();
      const load = getDayLoad(date);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          onMouseEnter={(e) => {
            setHoveredDate(date);
            setTooltipPosition(calculateTooltipPosition(e, date));
            setShowTooltip(true);
          }}
          onMouseLeave={() => {
            setHoveredDate(null);
            setShowTooltip(false);
          }}
          className={`border border-gray-200 p-2 cursor-pointer transition-all duration-200 ${
            isSelected ? 'bg-indigo-50 border-indigo-500' :
            isHovered ? 'bg-gray-50' : ''
          } ${isFullscreen ? 'h-48' : 'h-40'} ${getLoadColor(load)}`}
        >
          <div className="flex justify-between items-center mb-2">
            <div className={`text-sm font-medium ${isToday ? 'text-indigo-600' : 'text-gray-900'}`}>
              {day}
            </div>
            <div className="flex items-center gap-2">
              {isToday && (
                <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                  Aujourd'hui
                </span>
              )}
              {showEventCount && eventsForDay.length > 0 && (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  {eventsForDay.length} événement{eventsForDay.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          {!isCompact && <LoadIndicator date={date} />}
          <div className={`space-y-1.5 overflow-y-auto ${isCompact ? 'max-h-[calc(100%-1.5rem)]' : 'max-h-[calc(100%-3rem)]'}`}>
            {eventsForDay.map(renderEventItem)}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsCompact(!isCompact)}
              className="p-2 rounded-lg hover:bg-white transition-colors"
              title={isCompact ? "Vue normale" : "Vue compacte"}
            >
              {isCompact ? <Grid className="w-5 h-5 text-gray-600" /> : <List className="w-5 h-5 text-gray-600" />}
            </button>
            <button
              onClick={() => setShowEventCount(!showEventCount)}
              className="p-2 rounded-lg hover:bg-white transition-colors"
              title={showEventCount ? "Masquer le nombre d'événements" : "Afficher le nombre d'événements"}
            >
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-white transition-colors"
              title={isFullscreen ? "Réduire" : "Plein écran"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5 text-gray-600" /> : <Maximize2 className="w-5 h-5 text-gray-600" />}
            </button>
            <button
              onClick={() => handleMonthChange('prev')}
              className="p-2 rounded-lg hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => handleMonthChange('next')}
              className="p-2 rounded-lg hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-900">
              {day}
            </div>
          ))}
          {days}
        </div>
        {showTooltip && hoveredDate && (
          <div
            style={{
              position: 'fixed',
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              zIndex: 1000
            }}
          >
            <DayTooltip date={hoveredDate} events={getRequestsForDate(hoveredDate)} />
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentMonth);
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">
            Semaine du {formatDate(weekDates[0].toISOString())} au {formatDate(weekDates[6].toISOString())}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-white transition-colors"
              title={isFullscreen ? "Réduire" : "Plein écran"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5 text-gray-600" /> : <Maximize2 className="w-5 h-5 text-gray-600" />}
            </button>
            <button
              onClick={() => handleWeekChange('prev')}
              className="p-2 rounded-lg hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => handleWeekChange('next')}
              className="p-2 rounded-lg hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekDates.map((date, index) => {
            const eventsForDay = getRequestsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();

            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`border border-gray-200 p-2 cursor-pointer transition-all duration-200 ${
                  isSelected ? 'bg-indigo-50 border-indigo-500' : 'hover:bg-gray-50'
                } ${isFullscreen ? 'min-h-[500px]' : 'min-h-[300px]'}`}
              >
                <div className="flex flex-col mb-2">
                  <div className={`text-sm font-medium ${isToday ? 'text-indigo-600' : 'text-gray-900'}`}>
                    {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][index]}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {date.getDate()} {monthNames[date.getMonth()]}
                    </div>
                    {isToday && (
                      <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                        Aujourd'hui
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5 overflow-y-auto max-h-[calc(100%-3rem)]">
                  {eventsForDay.map(renderEventItem)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getDayHours = () => {
    const hours = [];
    for (let i = 5; i <= 23; i++) {
      hours.push(i.toString().padStart(2, '0') + ':00');
    }
    return hours;
  };

  const getEventsForHour = (date: Date, hour: string) => {
    const events = getRequestsForDate(date);
    return events.filter(event => {
      const eventHour = event.displayTime?.split(':')[0] || '00';
      return eventHour === hour.split(':')[0];
    }).map(event => ({
      ...event,
      displayTime: event.displayTime || '00:00'
    })) as CalendarEvent[];
  };

  const renderDayView = () => {
    const selectedDate = currentMonth;
    const hours = getDayHours();
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsCompact(!isCompact)}
              className="p-2 rounded-lg hover:bg-white transition-colors"
              title={isCompact ? "Vue normale" : "Vue compacte"}
            >
              {isCompact ? <Grid className="w-5 h-5 text-gray-600" /> : <List className="w-5 h-5 text-gray-600" />}
            </button>
            <button
              onClick={() => setShowEventCount(!showEventCount)}
              className="p-2 rounded-lg hover:bg-white transition-colors"
              title={showEventCount ? "Masquer le nombre d'événements" : "Afficher le nombre d'événements"}
            >
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-white transition-colors"
              title={isFullscreen ? "Réduire" : "Plein écran"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5 text-gray-600" /> : <Maximize2 className="w-5 h-5 text-gray-600" />}
            </button>
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() - 1);
                setCurrentMonth(newDate);
              }}
              className="p-2 rounded-lg hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() + 1);
                setCurrentMonth(newDate);
              }}
              className="p-2 rounded-lg hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[100px_1fr] divide-x divide-gray-200">
          {/* En-tête des heures */}
          <div className="bg-gray-50">
            <div className="h-12 border-b border-gray-200"></div>
            {hours.map(hour => (
              <div key={hour} className="h-24 border-b border-gray-200 p-2 text-sm text-gray-500">
                {hour}
              </div>
            ))}
          </div>

          {/* Contenu des événements */}
          <div className="relative">
            <div className="h-12 border-b border-gray-200"></div>
            {hours.map(hour => {
              const events = getEventsForHour(selectedDate, hour);
              return (
                <div key={hour} className="h-24 border-b border-gray-200 p-2 relative">
                  {events.map(event => (
                    <div
                      key={`${event.id}-${event.type}`}
                      onClick={() => handleRequestClick(event)}
                      className={`absolute left-2 right-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${getEventStyle(event.type, event.status || 'pending')}`}
                      style={{
                        top: `${(parseInt(event.displayTime.split(':')[1]) / 60) * 100}%`,
                        height: 'calc(100% - 8px)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {event.type === 'delivery' && <Truck className="w-4 h-4 flex-shrink-0" />}
                        {event.type === 'pickup' && <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />}
                        {event.type === 'event' && <Calendar className="w-4 h-4 flex-shrink-0" />}
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">
                            {event.first_name} {event.last_name}
                          </span>
                          <span className="text-xs opacity-75 truncate">
                            {getEventLabel(event.type)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const Legend = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Légende</h3>
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="text-gray-400 hover:text-gray-600"
        >
          {showLegend ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {showLegend && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div>
            <span className="text-xs text-gray-600">Événement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div>
            <span className="text-xs text-gray-600">Livraison</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-100 border border-purple-200"></div>
            <span className="text-xs text-gray-600">Reprise</span>
          </div>
        </div>
      )}
    </div>
  );

  const AdvancedFilters = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Filtres avancés</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Période</label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Toute la journée</option>
            <option value="morning">Matin (5h-12h)</option>
            <option value="afternoon">Après-midi (12h-18h)</option>
            <option value="evening">Soirée (18h-5h)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Type d'événement</label>
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value as EventTypeFilter)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tous les types</option>
            <option value="event">Événements</option>
            <option value="delivery">Livraisons</option>
            <option value="pickup">Reprises</option>
          </select>
        </div>
      </div>
    </div>
  );

  const stats = getStats();

  return (
    <AdminLayout>
      <AdminHeader />
      <div className={`max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isFullscreen ? 'fixed inset-0 bg-white z-50 overflow-auto' : ''}`}>
        <div className="space-y-6">
          <CalendarHeader
            viewMode={viewMode}
            setViewMode={setViewMode}
            showDeliveries={showDeliveries}
            setShowDeliveries={setShowDeliveries}
            showPickups={showPickups}
            setShowPickups={setShowPickups}
          />

          <StatsSection stats={stats} />

          <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'} gap-6`}>
            <div className={isFullscreen ? 'w-full' : 'lg:col-span-3'}>
              <div className="space-y-6">
                <FiltersSection
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                />
                {viewMode === 'month' ? renderMonthView() :
                 viewMode === 'week' ? renderWeekView() :
                 renderDayView()}
              </div>
            </div>
            {!isFullscreen && (
              <div className="space-y-4">
                <AdvancedFilters />
                <Legend />
              </div>
            )}
          </div>
        </div>
      </div>
      {isDetailsModalOpen && renderRequestDetailsModal()}
    </AdminLayout>
  );
};

export default QuoteRequestCalendar; 