import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Search, Filter, BarChart2, Clock, Users, Tag } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { QuoteRequest } from '../../services/quoteRequestService';
import { getQuoteRequests } from '../../services/quoteRequestService';
import { formatDate, getStatusColor, getStatusLabel } from '../../components/admin/quoteRequests/QuoteRequestUtils';

type ViewMode = 'month' | 'week';

const QuoteRequestCalendar: React.FC = () => {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<QuoteRequest[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  const getRequestsForDate = (date: Date) => {
    return quoteRequests.filter(request => {
      if (!request.event_date) return false;
      const eventDate = new Date(request.event_date);
      const matchesDate = eventDate.toDateString() === date.toDateString();
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesSearch = !searchTerm || 
        request.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesStatus && matchesSearch;
    });
  };

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

  const renderMonthView = () => {
    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth);
    const days = [];
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-gray-200 bg-gray-50"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const requestsForDay = getRequestsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-32 border border-gray-200 p-2 cursor-pointer transition-all duration-200 ${
            isSelected ? 'bg-indigo-50 border-indigo-500' : 'hover:bg-gray-50'
          }`}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-indigo-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {requestsForDay.map(request => (
              <div
                key={request.id}
                className={`text-xs p-1 rounded truncate ${getStatusColor(request.status)}`}
                title={`${request.first_name} ${request.last_name} - ${getStatusLabel(request.status)}`}
              >
                {request.first_name} {request.last_name}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => handleMonthChange('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => handleMonthChange('next')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentMonth);
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Semaine du {formatDate(weekDates[0].toISOString())} au {formatDate(weekDates[6].toISOString())}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => handleWeekChange('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => handleWeekChange('next')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekDates.map((date, index) => {
            const requestsForDay = getRequestsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();

            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`min-h-[200px] border border-gray-200 p-2 cursor-pointer transition-all duration-200 ${
                  isSelected ? 'bg-indigo-50 border-indigo-500' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col">
                  <div className={`text-sm font-medium ${isToday ? 'text-indigo-600' : 'text-gray-900'}`}>
                    {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][index]}
                  </div>
                  <div className="text-xs text-gray-500">
                    {date.getDate()} {monthNames[date.getMonth()]}
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  {requestsForDay.map(request => (
                    <div
                      key={request.id}
                      className={`text-xs p-1 rounded truncate ${getStatusColor(request.status)}`}
                      title={`${request.first_name} ${request.last_name} - ${getStatusLabel(request.status)}`}
                    >
                      {request.first_name} {request.last_name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const stats = getStats();

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Agenda des demandes de devis</h1>
                <p className="mt-2 text-sm text-gray-500">
                  Visualisez et gérez les demandes de devis par date d'événement
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'month'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mois
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'week'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semaine
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
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
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
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
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
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

          {/* Filters Section */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {viewMode === 'month' ? renderMonthView() : renderWeekView()}
            </div>
            
            {/* Selected Date Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedDate ? formatDate(selectedDate.toISOString()) : 'Sélectionnez une date'}
              </h3>
              
              {selectedRequests.length > 0 ? (
                <div className="space-y-4">
                  {selectedRequests.map(request => (
                    <div
                      key={request.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {request.first_name} {request.last_name}
                          </h4>
                          <p className="text-sm text-gray-500">{request.email}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </div>
                      {request.event_date && (
                        <p className="mt-2 text-sm text-gray-600">
                          Événement prévu le {formatDate(request.event_date.toString())}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {selectedDate ? 'Aucune demande pour cette date' : 'Sélectionnez une date pour voir les demandes'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default QuoteRequestCalendar; 