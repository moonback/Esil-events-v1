import React, { useState, useEffect } from 'react';
import { FileText, ArrowDownUp, RefreshCw, Search, Filter, Users, Calendar, Eye, Trash2, X, Check, Package, Truck, MapPin, Clock, Send, Clipboard, Edit, Printer, FileDown } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { getQuoteRequests, QuoteRequest } from '../../services/quoteRequestService';
import { 
  QuoteRequestList, 
  QuoteRequestDetails, 
  AIResponseGenerator, 
  FilterPanel,
  FeedbackMessage
} from '../../components/admin/quoteRequests';
import { useQuoteRequestFilters } from '../../hooks/useQuoteRequestFilters';
import { usePagination } from '../../hooks/usePagination';
import { useQuoteRequestActions } from '../../hooks/useQuoteRequestActions';

// Add utility functions for formatting and display
const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusLabel = (status?: string) => {
  switch(status) {
    case 'pending': return 'En attente';
    case 'approved': return 'Approuvé';
    case 'rejected': return 'Rejeté';
    case 'completed': return 'Terminé';
    default: return 'Nouveau';
  }
};

const getStatusColor = (status?: string) => {
  switch(status) {
    case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    case 'approved': return 'bg-green-50 text-green-800 border-green-200';
    case 'rejected': return 'bg-red-50 text-red-800 border-red-200';
    case 'completed': return 'bg-blue-50 text-blue-800 border-blue-200';
    default: return 'bg-indigo-50 text-indigo-800 border-indigo-200';
  }
};

const getDeliveryTypeLabel = (type?: string) => {
  switch(type) {
    case 'delivery': return 'Livraison';
    case 'pickup': return 'Retrait';
    default: return 'Non spécifié';
  }
};

const getTimeSlotLabel = (slot?: string) => {
  switch(slot) {
    case 'morning': return 'Matin (8h-12h)';
    case 'afternoon': return 'Après-midi (12h-18h)';
    case 'evening': return 'Soir (18h-22h)';
    default: return 'Non spécifié';
  }
};

const getAccessLabel = (access?: string) => {
  switch(access) {
    case 'ground_floor': return 'Rez-de-chaussée';
    case 'stairs': return 'Escaliers';
    case 'elevator': return 'Ascenseur';
    default: return 'Non spécifié';
  }
};

const QuoteRequestsAdmin: React.FC = () => {
  // État principal
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Utilisation des hooks personnalisés pour le filtrage et la pagination
  const {
    filteredRequests,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    customerTypeFilter,
    setCustomerTypeFilter,
    deliveryTypeFilter,
    setDeliveryTypeFilter,
    dateFilter,
    setDateFilter,
    resetFilters
  } = useQuoteRequestFilters(quoteRequests);
  
  const {
    currentItems,
    currentPage,
    setCurrentPage,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem
  } = usePagination(filteredRequests);
  
  // Utilisation du hook pour les actions sur les demandes
  const {
    handleUpdateStatus,
    handleDeleteRequest,
    handleGenerateResponse,
    handleExportPDF,
    handlePrint,
    generatingResponse,
    suggestedResponse,
    setSuggestedResponse,
    feedbackMessage,
    setFeedbackMessage,
    error
  } = useQuoteRequestActions(quoteRequests, setQuoteRequests, selectedRequest, setSelectedRequest);

  // --- Chargement des données ---
  const loadQuoteRequests = async () => {
    try {
      setLoading(true);
      setFeedbackMessage(null); // Effacer les messages de feedback lors du rechargement
      const { data, error: fetchError } = await getQuoteRequests();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const sortedData = data ? [...data].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }) : [];

      setQuoteRequests(sortedData);
    } catch (err: any) {
      const errorMessage = `Erreur lors du chargement des demandes de devis: ${err.message}`;
      setFeedbackMessage({ type: 'error', text: errorMessage });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuoteRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]); // Recharger lorsque l'ordre de tri change

  // Les fonctions de gestion des actions sont maintenant gérées par le hook useQuoteRequestActions
  // Les fonctions de pagination sont gérées par le hook usePagination
  // Les fonctions utilitaires sont importées depuis QuoteRequestUtils

  // --- Editor Popup Message Handling ---
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Basic security check for origin if needed:
      // if (event.origin !== window.location.origin) { return; }

      if (event.data && event.data.type === 'SAVE_RESPONSE') {
        console.log("Message 'SAVE_RESPONSE' reçu:", event.data);
        // Check if the message is for the currently selected request
        if (selectedRequest && event.data.requestId === selectedRequest.id) {
          setSuggestedResponse(event.data.response);
          setFeedbackMessage({
            type: 'success',
            text: 'Réponse mise à jour depuis l\'éditeur.'
          });
          // Clear message after a few seconds
          setTimeout(() => setFeedbackMessage(null), 3000);
        } else {
            console.warn("ID de requête du message ne correspond pas à la sélection actuelle ou aucune sélection.");
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [selectedRequest]); // Re-run if selectedRequest changes to ensure correct ID check

 

  // --- Render ---
  return (
    <AdminLayout>
      <AdminHeader />
      <FilterPanel
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        customerTypeFilter={customerTypeFilter}
        setCustomerTypeFilter={setCustomerTypeFilter}
        deliveryTypeFilter={deliveryTypeFilter}
        setDeliveryTypeFilter={setDeliveryTypeFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        onReset={resetFilters}
      />
      <div className="space-y-8 mt-12 max-w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12"> {/* Use max-w-full or adjust as needed */}
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-lg shadow-md border-l-4 border-indigo-600 gap-4">
          <div className="flex items-center space-x-4">
            <FileText className="h-8 w-8 text-indigo-600" /> {/* Icon for context */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Demandes de devis</h1>
                <p className="text-sm text-gray-500">Gestion des demandes entrantes</p>
            </div>
            <span className="self-start sm:self-center inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              {quoteRequests.length} Total
            </span>
          </div>
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm font-medium text-sm"
              title={sortOrder === 'desc' ? 'Trier par date: Plus ancien d\'abord' : 'Trier par date: Plus récent d\'abord'}
            >
              <ArrowDownUp className="w-4 h-4 mr-2" />
              {sortOrder === 'desc' ? 'Plus récent' : 'Plus ancien'}
            </button>
            <button
              onClick={loadQuoteRequests}
              disabled={loading}
              className="flex items-center px-4 py-2.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Rafraîchir
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom, email, société, ID..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-shrink-0">
              <div className="flex items-center h-full border border-gray-200 rounded-md p-2">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvé</option>
                  <option value="rejected">Rejeté</option>
                  <option value="completed">Terminé</option>
                  {/* Add 'new' if it's a distinct status */}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {filteredRequests.length} résultat{filteredRequests.length !== 1 ? 's' : ''} trouvé{filteredRequests.length !== 1 ? 's' : ''}
            </div>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* Main Error Display */}
        {error && !feedbackMessage && ( // Show main error only if no specific feedback is active
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 shadow-sm flex items-start gap-3">
            <X className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Erreur système</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Feedback Message Display (used for status updates, AI generation status, copy confirmation etc) */}
        {feedbackMessage && (
            <div className={`p-4 rounded-md border ${feedbackMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} shadow-sm`}>
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                {feedbackMessage.type === 'success' ? (
                    <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
                ) : (
                    <X className="h-5 w-5 text-red-500" aria-hidden="true" />
                )}
                </div>
                <p className="text-sm font-medium">{feedbackMessage.text}</p>
            </div>
            </div>
        )}

        {/* Loading State or Main Content */}
        {loading && !quoteRequests.length ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Chargement des demandes...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start"> {/* Use items-start */}

            {/* Requests List */}
            <div className="w-full lg:w-3/5 xl:w-1/2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-xl">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider">Client</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider">Date Demande</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider">Statut</th>
                        <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-indigo-600 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.length > 0 ? (
                        currentItems.map((request) => (
                          <tr
                            key={request.id}
                            className={`hover:bg-indigo-50 cursor-pointer transition-all duration-200 ${selectedRequest?.id === request.id ? 'bg-indigo-100 border-l-4 border-indigo-500 shadow-inner' : ''}`}
                            onClick={() => {setSelectedRequest(request); setSuggestedResponse(''); setFeedbackMessage(null);}}
                          >
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                                  {request.first_name ? request.first_name[0].toUpperCase() : <Users size={24} />}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900 truncate max-w-xs">
                                    {request.first_name} {request.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-400"></span>
                                    {request.email || request.company || '-'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{formatDate(request.created_at)}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Calendar size={12} className="text-indigo-400" />
                                  Événement: {request.event_date ? formatDate(request.event_date).split(' ')[0] : '-'}
                                </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <span className={`px-4 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full border shadow-sm ${getStatusColor(request.status)}`}>
                                {getStatusLabel(request.status)}
                              </span>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-center">
                              <div className="flex space-x-2 justify-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRequest(request);
                                    setSuggestedResponse('');
                                    setFeedbackMessage(null);
                                  }}
                                  className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-all duration-200 hover:shadow-md"
                                  title="Voir les détails"
                                >
                                  <Eye className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRequest(request.id || '');
                                  }}
                                  className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-all duration-200 hover:shadow-md"
                                  title="Supprimer la demande"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <div className="p-4 bg-gray-50 rounded-full mb-4">
                                <Search className="h-12 w-12 text-indigo-300" />
                              </div>
                              <p className="font-semibold text-lg text-gray-700">Aucune demande trouvée</p>
                              <p className="text-sm mt-1 text-gray-500">Vérifiez vos filtres ou le terme de recherche.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50 shadow-sm"
                        > Précédent </button>
                        <span className="text-sm font-medium text-indigo-700 my-auto"> Page {currentPage} sur {totalPages} </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50 shadow-sm"
                        > Suivant </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-indigo-700 font-medium">
                                Affichage de <span className="font-bold">{Math.max(indexOfFirstItem + 1, 1)}</span> à <span className="font-bold">{Math.min(indexOfLastItem, filteredRequests.length)}</span> sur <span className="font-bold">{filteredRequests.length}</span> résultats
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-lg shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-indigo-300 bg-white text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50"
                                > <span className="sr-only">Précédent</span>{'<'} </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        aria-current={currentPage === page ? 'page' : undefined}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${currentPage === page ? 'z-10 bg-indigo-100 border-indigo-500 text-indigo-600 font-bold' : 'bg-white border-indigo-300 text-indigo-600 hover:bg-indigo-50'}`}
                                    > {page} </button>
                                ))}
                                {/* <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-indigo-300 bg-white text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50"
                                > <span className="sr-only">Suivant</span>{'>'} </button> */}
                            </nav>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Request Details Panel */}
            <div className="w-full lg:w-2/5 xl:w-1/2 lg:sticky lg:top-24 self-start space-y-6">
              {selectedRequest ? (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 transition-all max-h-[calc(100vh-8rem)] overflow-y-auto"> {/* Scrollable container */}
                  {/* Details Header */}
                  <div className="p-5 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-1">
                        <h2 className="text-lg font-semibold text-gray-900">Détails de la demande</h2>
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(selectedRequest.status)}`}>
                        {getStatusLabel(selectedRequest.status)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">ID: {selectedRequest.id?.substring(0,8).toUpperCase() || 'N/A'} • Reçu le: {formatDate(selectedRequest.created_at)}</p>
                  </div>

                  {/* Details Content */}
                  <div className="p-6 space-y-6">
                     {/* --- Sections: Client, Event, Items, Delivery, Access, Pickup Return, Comments --- */}
                     {/* Client Info */}
                    <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-indigo-600" /> Informations client
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Nom</span> <span className="font-medium text-gray-900">{selectedRequest.first_name} {selectedRequest.last_name}</span></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Type</span> <span className="font-medium text-gray-900">{selectedRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</span></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Société</span> <span className="font-medium text-gray-900">{selectedRequest.company || '-'}</span></div>
                            <div className="p-3 bg-gray-50 rounded-lg truncate"><span className="text-gray-600 block mb-1">Email</span> <span className="font-medium text-gray-900">{selectedRequest.email || '-'}</span></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Téléphone</span> <span className="font-medium text-gray-900">{selectedRequest.phone || '-'}</span></div>
                            <div className="p-3 bg-gray-50 rounded-lg sm:col-span-2"><span className="text-gray-600 block mb-1">Facturation</span> <span className="font-medium text-gray-900">{[selectedRequest.billing_address, selectedRequest.postal_code, selectedRequest.city].filter(Boolean).join(', ') || '-'}</span></div>
                        </div>
                    </div>

                    {/* Event Info */}
                    <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-indigo-600" /> Détails de l'événement
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Date</span> <span className="font-medium text-gray-900">{selectedRequest.event_date ? formatDate(selectedRequest.event_date).split(' ')[0] : '-'}</span></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Durée</span> <span className="font-medium text-gray-900">{selectedRequest.event_duration || '-'}</span></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Début</span> <span className="font-medium text-gray-900">{selectedRequest.event_start_time || '-'}</span></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Fin</span> <span className="font-medium text-gray-900">{selectedRequest.event_end_time || '-'}</span></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Invités</span> <span className="font-medium text-gray-900">{selectedRequest.guest_count || '-'}</span></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Lieu</span> <span className="font-medium text-gray-900">{selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</span></div>
                        </div>
                        {selectedRequest.description && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                            <p className="text-sm text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">{selectedRequest.description}</p>
                        </div>
                        )}
                    </div>

                    {/* Items */}
                    <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5 text-indigo-600" /> Articles demandés
                      </h3>
                      {selectedRequest.items && selectedRequest.items.length > 0 ? (
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200 bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Article</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Qté</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Prix U.</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {selectedRequest.items.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{item.name || 'N/A'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-800 text-center">{item.quantity || 0}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-800 text-right">{(item.price || 0).toFixed(2)}€</td>
                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 text-right">{((item.quantity || 0) * (item.price || 0)).toFixed(2)}€</td>
                                </tr>
                                ))}
                                <tr className="bg-indigo-50">
                                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">Total TTC Indicatif</td>
                                    <td className="px-4 py-3 text-sm font-bold text-indigo-700 text-right">
                                        {(selectedRequest.items.reduce((total, item) => total + ((item.quantity || 0) * (item.price || 0)), 0)).toFixed(2)}€
                                    </td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                        ) : (
                            <div className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-200">
                              Aucun article spécifique listé dans cette demande.
                            </div>
                        )}
                    </div>

                    {/* Delivery / Pickup */}
                    <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Truck className="h-5 w-5 text-indigo-600" /> Livraison / Retrait
                        </h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Type</span> <span className="font-medium text-gray-900">{getDeliveryTypeLabel(selectedRequest.delivery_type)}</span></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Date</span> <span className="font-medium text-gray-900">{selectedRequest.delivery_date ? formatDate(selectedRequest.delivery_date).split(' ')[0] : '-'}</span></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Créneau</span> <span className="font-medium text-gray-900">{getTimeSlotLabel(selectedRequest.delivery_time_slot)}</span></div>
                            <div className="p-3 bg-gray-50 rounded-lg sm:col-span-2"><span className="text-gray-600 block mb-1">Adresse Livraison</span> <span className="font-medium text-gray-900">{[selectedRequest.delivery_address, selectedRequest.delivery_postal_code, selectedRequest.delivery_city].filter(Boolean).join(', ') || '-'}</span></div>
                         </div>
                    </div>

                     {/* Access Info */}
                     {(selectedRequest.exterior_access || selectedRequest.interior_access) && (
                        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-indigo-600" /> Accès
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Extérieur</span> <span className="font-medium text-gray-900">{getAccessLabel(selectedRequest.exterior_access)}</span></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Intérieur</span> <span className="font-medium text-gray-900">{getAccessLabel(selectedRequest.interior_access)}</span></div>
                                {selectedRequest.interior_access === 'elevator' && (
                                <>
                                    <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Ascenseur Largeur</span> <span className="font-medium text-gray-900">{selectedRequest.elevator_width ? `${selectedRequest.elevator_width} cm` : '-'}</span></div>
                                    <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Ascenseur Profondeur</span> <span className="font-medium text-gray-900">{selectedRequest.elevator_depth ? `${selectedRequest.elevator_depth} cm` : '-'}</span></div>
                                    <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Ascenseur Hauteur</span> <span className="font-medium text-gray-900">{selectedRequest.elevator_height ? `${selectedRequest.elevator_height} cm` : '-'}</span></div>
                                </>
                                )}
                            </div>
                        </div>
                     )}

                     {/* Pickup Return */}
                     {(selectedRequest.pickup_return_date || selectedRequest.pickup_return_start_time) && (
                        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-indigo-600" /> Détails reprise
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Date</span> <span className="font-medium text-gray-900">{selectedRequest.pickup_return_date ? formatDate(selectedRequest.pickup_return_date).split(' ')[0] : '-'}</span></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Début</span> <span className="font-medium text-gray-900">{selectedRequest.pickup_return_start_time || '-'}</span></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Fin</span> <span className="font-medium text-gray-900">{selectedRequest.pickup_return_end_time || '-'}</span></div>
                            </div>
                        </div>
                     )}

                    {/* Comments */}
                    {selectedRequest.comments && (
                      <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-indigo-600" /> Commentaires client
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap">
                          {selectedRequest.comments}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sticky Actions Footer */}
                  <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 border-t border-gray-200 mt-auto"> {/* Ensure it sticks */}
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions rapides</h3>
                      <div className="flex flex-col space-y-3">
                        {/* Status Change Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            {['approved', 'rejected', 'completed', 'pending'] // Define possible target statuses
                                .filter(status => status !== selectedRequest.status) // Don't show button for current status
                                .filter(status => // Logic for allowed transitions
                                    (status === 'approved' && !['rejected', 'completed'].includes(selectedRequest.status ?? '')) ||
                                    (status === 'rejected' && !['approved', 'completed'].includes(selectedRequest.status ?? '')) ||
                                    (status === 'completed' && selectedRequest.status === 'approved') ||
                                    (status === 'pending' && ['rejected', 'completed'].includes(selectedRequest.status ?? ''))
                                )
                                .map(targetStatus => {
                                    let label = ''; let Icon = Check; let colorClass = '';
                                    switch(targetStatus) {
                                        case 'approved': label = 'Approuver'; Icon = Check; colorClass = 'bg-green-600 hover:bg-green-700'; break;
                                        case 'rejected': label = 'Rejeter'; Icon = X; colorClass = 'bg-red-600 hover:bg-red-700'; break;
                                        case 'completed': label = 'Terminer'; Icon = Check; colorClass = 'bg-blue-600 hover:bg-blue-700'; break;
                                        case 'pending': label = 'Réouvrir'; Icon = RefreshCw; colorClass = 'bg-yellow-500 hover:bg-yellow-600'; break;
                                    }
                                    return (
                                    <button
                                        key={targetStatus}
                                        onClick={() => selectedRequest.id && handleUpdateStatus(selectedRequest.id, targetStatus)}
                                        disabled={!selectedRequest.id || loading} // Disable during global load too
                                        className={`flex items-center justify-center px-4 py-2 ${colorClass} text-white rounded-lg transition-colors shadow-sm font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <Icon className="w-4 h-4 mr-2" /> {label}
                                    </button>
                                    );
                                })
                            }
                        </div>

                        {/* Export PDF and Print Buttons */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <button
                            onClick={handleExportPDF}
                            disabled={!selectedRequest}
                            className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Exporter en PDF"
                          >
                            <FileDown className="w-4 h-4 mr-2" />
                            Exporter PDF
                          </button>
                          <button
                            onClick={handlePrint}
                            disabled={!selectedRequest}
                            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Imprimer la demande"
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimer
                          </button>
                        </div>

                        {/* AI Response Button */}
                        <button
                          onClick={handleGenerateResponse}
                          disabled={generatingResponse || loading || !selectedRequest}
                          className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingResponse ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Génération Réponse IA...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" /> {/* Using Send for generation */}
                              Générer Réponse Suggérée (IA)
                            </>
                          )}
                        </button>
                      </div>
                  </div>
                </div>
              ) : (
                // Placeholder when no request is selected
                <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 flex flex-col items-center justify-center text-center h-96">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Aucune demande sélectionnée</h3>
                  <p className="text-gray-500 text-sm max-w-xs">Sélectionnez une demande dans la liste de gauche pour voir les détails et effectuer des actions.</p>
                </div>
              )}

              {/* Suggested Response Display Area */}
              {suggestedResponse && selectedRequest && (
                <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 transition-all">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Send className="w-5 h-5 text-indigo-600" /> {/* Icon for response */}
                      Réponse Suggérée par IA
                    </h3>
                    {/* Optional: Add quality indicator or tags */}
                  </div>

                  {/* Response content */}
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap max-h-[400px] overflow-y-auto text-gray-800 text-sm leading-relaxed shadow-inner mb-4 font-mono text-xs"> {/* Added font-mono and text-xs */}
                    {suggestedResponse}
                  </div>

                  {/* Response Actions */}
                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(suggestedResponse);
                        setFeedbackMessage({
                          type: 'success',
                          text: 'Réponse copiée dans le presse-papiers.'
                        });
                        setTimeout(() => setFeedbackMessage(null), 2500);
                      }}
                      className="px-3 py-1.5 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 transition-colors shadow-sm flex items-center text-xs font-medium"
                      title="Copier la réponse"
                    >
                      <Clipboard className="h-3.5 w-3.5 mr-1.5" />
                      Copier
                    </button>
                    <button
                      onClick={() => {
                        const editorWindow = window.open('', `_blank`, 'width=900,height=700,scrollbars=yes,resizable=yes');
                        if (editorWindow) {
                           // Escape backticks and dollars for template literal embedding
                           const escapedResponse = suggestedResponse
                                .replace(/\\/g, '\\\\') // Escape backslashes first
                                .replace(/`/g, '\\`')  // Escape backticks
                                .replace(/\$/g, '\\$'); // Escape dollar signs

                          editorWindow.document.write(`
                            <!DOCTYPE html>
                            <html lang="fr">
                              <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Éditer la réponse - ${selectedRequest?.first_name} ${selectedRequest?.last_name}</title>
                                <script src="https://cdn.tailwindcss.com"></script>
                                <style>
                                    body { font-family: Inter, sans-serif; }
                                    /* Add custom scrollbar styles if desired */
                                     ::-webkit-scrollbar { width: 8px; height: 8px; }
                                     ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                                     ::-webkit-scrollbar-thumb { background: #a8a8a8; border-radius: 10px; }
                                     ::-webkit-scrollbar-thumb:hover { background: #888; }
                                </style>
                              </head>
                              <body class="bg-gray-100 p-4 md:p-6">
                                <div class="container mx-auto bg-white rounded-lg shadow-lg p-6 flex flex-col h-[calc(100vh-3rem)]">
                                  <div class="flex justify-between items-center mb-4 pb-3 border-b">
                                    <h2 class="text-xl font-semibold text-gray-800">Éditer la réponse</h2>
                                    <div class="text-sm text-gray-500">Pour: ${selectedRequest?.first_name} ${selectedRequest?.last_name}</div>
                                  </div>

                                  <textarea
                                      id="responseText"
                                      spellcheck="true"
                                      class="flex-grow w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-indigo-500 focus:border-indigo-500 text-sm leading-relaxed mb-4 font-mono"
                                      oninput="handleInput()"
                                  >${escapedResponse}</textarea>
                                  <div class="text-xs text-gray-500 mb-4 text-right" id="saveStatus"></div>

                                  <div class="flex justify-end items-center gap-3">
                                     <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium" onclick="window.close()">
                                         Annuler
                                     </button>
                                     <button class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium" onclick="saveAndClose()">
                                         Enregistrer & Fermer
                                     </button>
                                  </div>
                                </div>

                                <script>
                                  const textarea = document.getElementById('responseText');
                                  const saveStatus = document.getElementById('saveStatus');
                                  const requestId = '${selectedRequest?.id || ''}';
                                  const storageKey = \`draftResponse_\${requestId}\`;
                                  let saveTimeout;
                                  let unsavedChanges = false;

                                  // Load draft on init
                                  document.addEventListener('DOMContentLoaded', () => {
                                    const savedDraft = localStorage.getItem(storageKey);
                                    // Only restore if the draft is different from the initial text passed in
                                    if (savedDraft && savedDraft !== textarea.value) {
                                      if (confirm('Un brouillon non enregistré a été trouvé pour cette demande. Voulez-vous le restaurer ?')) {
                                        textarea.value = savedDraft;
                                      } else {
                                         // If user refuses, clear the draft to avoid asking again
                                         localStorage.removeItem(storageKey);
                                      }
                                    }
                                    updateSaveStatus(); // Initial status check
                                  });

                                  function handleInput() {
                                    unsavedChanges = true;
                                    updateSaveStatus('Modifications non enregistrées...');
                                    clearTimeout(saveTimeout);
                                    saveTimeout = setTimeout(autoSave, 1500); // Auto-save after 1.5s of inactivity
                                  }

                                  function autoSave() {
                                    if (!unsavedChanges) return;
                                    localStorage.setItem(storageKey, textarea.value);
                                    unsavedChanges = false;
                                    updateSaveStatus('Brouillon enregistré localement');
                                    console.log('Draft saved to localStorage');
                                  }

                                  function updateSaveStatus(message = '') {
                                     if (message) {
                                        saveStatus.textContent = message;
                                     } else {
                                         const savedDraft = localStorage.getItem(storageKey);
                                         if (savedDraft === textarea.value) {
                                            saveStatus.textContent = 'Modifications enregistrées localement';
                                         } else {
                                            saveStatus.textContent = 'Modifications non enregistrées';
                                         }
                                     }
                                  }

                                  function saveAndClose() {
                                    const currentResponse = textarea.value;
                                    console.log('Sending SAVE_RESPONSE message', { requestId, response: currentResponse });
                                    // Send message to parent window
                                    if (window.opener && !window.opener.closed) {
                                      window.opener.postMessage({
                                        type: 'SAVE_RESPONSE',
                                        requestId: requestId,
                                        response: currentResponse
                                      }, window.location.origin); // Be specific about origin if possible
                                    } else {
                                      console.error("Opener window not found or closed.");
                                      alert("Impossible de communiquer avec la fenêtre principale. Veuillez copier votre texte manuellement.");
                                      return; // Don't close if communication failed
                                    }

                                    // Clear the draft from storage after successful save message
                                    localStorage.removeItem(storageKey);
                                    unsavedChanges = false; // Mark as saved
                                    window.close(); // Close the popup
                                  }

                                  // Warn before closing if there are unsaved changes
                                  window.addEventListener('beforeunload', (event) => {
                                      autoSave(); // Try one last auto-save
                                      if (unsavedChanges) {
                                          // Standard way to trigger the browser's confirmation dialog
                                          event.preventDefault();
                                          event.returnValue = ''; // Required for Chrome
                                          return ''; // Required for older browsers
                                      }
                                  });
                                </script>
                              </body>
                            </html>
                          `);
                          editorWindow.document.close(); // Important to finalize document writing
                        } else {
                           alert("Impossible d'ouvrir la fenêtre d'édition. Vérifiez les paramètres de votre navigateur (bloqueur de popups).");
                        }
                      }}
                      className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors shadow-sm flex items-center text-xs font-medium"
                      title="Éditer la réponse dans une nouvelle fenêtre"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Éditer
                    </button>
                    <a
                      href={`mailto:${selectedRequest?.email}?subject=${encodeURIComponent(`Votre demande de devis ESIL Events - ${selectedRequest?.company || selectedRequest?.first_name || ''}`)}&body=${encodeURIComponent(suggestedResponse)}`}
                      target="_blank" // Open in new tab/client
                      rel="noopener noreferrer" // Security best practice
                      className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors shadow-sm flex items-center text-xs font-medium"
                      title="Ouvrir dans votre client email"
                    >
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      Envoyer Email
                    </a>
                  </div>
                </div>
              )}
            </div> {/* End Details Panel */}
          </div> // End Main Content Flex Container
        )}
      </div> {/* End Page Container */}
    </AdminLayout>
  );
}
export default QuoteRequestsAdmin;
