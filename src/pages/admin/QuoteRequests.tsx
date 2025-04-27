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
  FeedbackMessage,
  QuoteRequestActions
} from '../../components/admin/quoteRequests';
import { useQuoteRequestFilters } from '../../hooks/useQuoteRequestFilters';
import { usePagination } from '../../hooks/usePagination';
import { useQuoteRequestActions } from '../../hooks/useQuoteRequestActions';


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

         {/* Feedback Message Display */}
                <FeedbackMessage 
          message={feedbackMessage}
          setMessage={setFeedbackMessage}
          autoHideDuration={3000}
        />

        {/* Loading State or Main Content */}
        {loading && !quoteRequests.length ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Chargement des demandes...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start"> {/* Use items-start */}

            {/* Requests List */}
                        {/* Requests List */}
            <QuoteRequestList
              currentItems={currentItems}
              selectedRequest={selectedRequest}
              setSelectedRequest={setSelectedRequest}
              setSuggestedResponse={setSuggestedResponse}
              setFeedbackMessage={setFeedbackMessage}
              handleDeleteRequest={handleDeleteRequest}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              filteredRequestsLength={filteredRequests.length}
            />
            {/* Selected Request Details Panel */}
            <div className="w-full lg:w-2/5 xl:w-1/2 lg:sticky lg:top-24 self-start space-y-6">
              {selectedRequest ? (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 transition-all max-h-[calc(100vh-8rem)] overflow-y-auto"> {/* Scrollable container */}
                  {/* Details Content */}
                  <QuoteRequestDetails
                    selectedRequest={selectedRequest}
                    handleUpdateStatus={handleUpdateStatus}
                    handleExportPDF={handleExportPDF}
                    handlePrint={handlePrint}
                    handleGenerateResponse={handleGenerateResponse}
                    generatingResponse={generatingResponse}
                    loading={loading}
                  />
                      
                  <QuoteRequestActions 
                    selectedRequest={selectedRequest}
                    handleUpdateStatus={handleUpdateStatus}
                    handleExportPDF={handleExportPDF}
                    handlePrint={handlePrint}
                    handleGenerateResponse={handleGenerateResponse}
                    generatingResponse={generatingResponse}
                    loading={loading}
                  />
                  
                </div>
              ) : (
                // Placeholder when no request is selected
                <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 flex flex-col items-center justify-center text-center h-96">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Aucune demande sélectionnée</h3>
                  <p className="text-gray-500 text-sm max-w-xs">Sélectionnez une demande dans la liste de gauche pour voir les détails et effectuer des actions.</p>
                </div>
              )}
              {/* AI Response Generator */}
              {selectedRequest && (
                <AIResponseGenerator
                  selectedRequest={selectedRequest}
                  suggestedResponse={suggestedResponse}
                  generatingResponse={generatingResponse}
                  onGenerateResponse={handleGenerateResponse}
                  onCopyResponse={() => {
                    navigator.clipboard.writeText(suggestedResponse);
                    setFeedbackMessage({
                      type: 'success',
                      text: 'Réponse copiée dans le presse-papiers.'
                    });
                    setTimeout(() => setFeedbackMessage(null), 2500);
                  }}
                />
              )}
              
            </div> {/* End Details Panel */}
          </div> // End Main Content Flex Container
        )}
      </div> {/* End Page Container */}
    </AdminLayout>
  );
}
export default QuoteRequestsAdmin;
