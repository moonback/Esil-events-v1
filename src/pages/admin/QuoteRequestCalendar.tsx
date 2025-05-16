import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Search, Filter, BarChart2, Clock, Users, Tag, X, FileText, Mail, Phone, MapPin, Clock as ClockIcon, Truck, Package, DoorOpen, ArrowLeftRight, MessageSquare, ChevronUp, ChevronDown, Maximize2, Minimize2, Grid, List, MoreHorizontal } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { QuoteRequest } from '../../services/quoteRequestService';
import { getQuoteRequests } from '../../services/quoteRequestService';
import { formatDate, getStatusColor, getStatusLabel } from '../../components/admin/quoteRequests/QuoteRequestUtils';
import { useCalendar } from '../../hooks/useCalendar';
import { MonthView, WeekView, DayView } from '../../components/calendar/CalendarViews';
import { CalendarStats } from '../../types/calendar';

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

const StatsSection: React.FC<{ stats: CalendarStats }> = ({ stats }) => (
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
  const {
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
  } = useCalendar();

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewState.currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    updateViewState({ currentMonth: newDate });
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewState.currentMonth);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    updateViewState({ currentMonth: newDate });
  };

  const handleDateClick = (date: Date) => {
    updateViewState({ selectedDate: date });
  };

  const renderRequestDetailsModal = () => {
    if (!selectedRequestDetails) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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

  const stats = getStats();

  return (
    <AdminLayout>
      <AdminHeader />
      <div className={`max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${viewState.isFullscreen ? 'fixed inset-0 bg-white z-50 overflow-auto' : ''}`}>
        <div className="space-y-6">
          <CalendarHeader
            viewMode={viewState.viewMode}
            setViewMode={(mode) => updateViewState({ viewMode: mode })}
            showDeliveries={filters.showDeliveries}
            setShowDeliveries={(show) => updateFilters({ showDeliveries: show })}
            showPickups={filters.showPickups}
            setShowPickups={(show) => updateFilters({ showPickups: show })}
          />

          <StatsSection stats={stats} />

          <div className={`grid ${viewState.isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'} gap-6`}>
            <div className={viewState.isFullscreen ? 'w-full' : 'lg:col-span-3'}>
              <div className="space-y-6">
                {/* <FiltersSection
                  searchTerm={filters.searchTerm}
                  setSearchTerm={(term) => updateFilters({ searchTerm: term })}
                  statusFilter={filters.statusFilter}
                  setStatusFilter={(status) => updateFilters({ statusFilter: status })}
                /> */}
                {viewState.viewMode === 'month' ? (
                  <MonthView
                    viewMode={viewState.viewMode}
                    currentMonth={viewState.currentMonth}
                    selectedDate={viewState.selectedDate}
                    isFullscreen={viewState.isFullscreen}
                    isCompact={viewState.isCompact}
                    showEventCount={viewState.showEventCount}
                    getRequestsForDate={getRequestsForDate}
                    handleRequestClick={handleRequestClick}
                    handleMonthChange={handleMonthChange}
                    handleWeekChange={handleWeekChange}
                    handleDateClick={handleDateClick}
                    setIsCompact={(isCompact) => updateViewState({ isCompact })}
                    setShowEventCount={(show) => updateViewState({ showEventCount: show })}
                    setIsFullscreen={(isFullscreen) => updateViewState({ isFullscreen })}
                  />
                ) : viewState.viewMode === 'week' ? (
                  <WeekView
                    viewMode={viewState.viewMode}
                    currentMonth={viewState.currentMonth}
                    selectedDate={viewState.selectedDate}
                    isFullscreen={viewState.isFullscreen}
                    isCompact={viewState.isCompact}
                    showEventCount={viewState.showEventCount}
                    getRequestsForDate={getRequestsForDate}
                    handleRequestClick={handleRequestClick}
                    handleMonthChange={handleMonthChange}
                    handleWeekChange={handleWeekChange}
                    handleDateClick={handleDateClick}
                    setIsCompact={(isCompact) => updateViewState({ isCompact })}
                    setShowEventCount={(show) => updateViewState({ showEventCount: show })}
                    setIsFullscreen={(isFullscreen) => updateViewState({ isFullscreen })}
                  />
                ) : (
                  <DayView
                    viewMode={viewState.viewMode}
                    currentMonth={viewState.currentMonth}
                    selectedDate={viewState.selectedDate}
                    isFullscreen={viewState.isFullscreen}
                    isCompact={viewState.isCompact}
                    showEventCount={viewState.showEventCount}
                    getRequestsForDate={getRequestsForDate}
                    handleRequestClick={handleRequestClick}
                    handleMonthChange={handleMonthChange}
                    handleWeekChange={handleWeekChange}
                    handleDateClick={handleDateClick}
                    setIsCompact={(isCompact) => updateViewState({ isCompact })}
                    setShowEventCount={(show) => updateViewState({ showEventCount: show })}
                    setIsFullscreen={(isFullscreen) => updateViewState({ isFullscreen })}
                  />
                )}
              </div>
            </div>
            {!viewState.isFullscreen && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Filtres avancés</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Période</label>
                      <select
                        value={filters.timeFilter}
                        onChange={(e) => updateFilters({ timeFilter: e.target.value as any })}
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
                        value={filters.eventTypeFilter}
                        onChange={(e) => updateFilters({ eventTypeFilter: e.target.value as any })}
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
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Légende</h3>
                    <button
                      onClick={() => updateViewState({ showLegend: !viewState.showLegend })}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {viewState.showLegend ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  {viewState.showLegend && (
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