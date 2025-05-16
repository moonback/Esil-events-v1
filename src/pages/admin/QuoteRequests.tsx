import React, { useState, useEffect } from 'react';
import { FileText, ArrowDownUp, RefreshCw, Search, Filter, X, SlidersHorizontal, Calendar } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { getQuoteRequests, QuoteRequest } from '../../services/quoteRequestService';
import { 
  QuoteRequestList, 
  QuoteRequestDetails, 
  AIResponseGenerator, 
  FilterPanel,
  FeedbackMessage,
} from '../../components/admin/quoteRequests';
import { useQuoteRequestFilters } from '../../hooks/useQuoteRequestFilters';
import { usePagination } from '../../hooks/usePagination';
import { useQuoteRequestActions } from '../../hooks/useQuoteRequestActions';
import { Link } from 'react-router-dom';

const QuoteRequestsAdmin: React.FC = () => {
  // État principal
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Gestionnaire pour ouvrir le modal
  const handleOpenModal = (request: QuoteRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  // Gestionnaire pour fermer le modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

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
      <div className="container mx-auto ">
        
        
        {/* Header Section */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
            <AdminHeader title="Demandes de devis" />
              <p className="mt-2 text-sm text-gray-500">
                Gérez les demandes de devis et répondez aux clients
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/admin/quote-requests/calendar"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Voir l'agenda
              </Link>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="mt-8">
          {/* Filters and search */}
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

          {/* Quote requests list */}
          <div className="mt-6">
            <QuoteRequestList
              currentItems={currentItems}
              selectedRequest={selectedRequest}
              setSelectedRequest={handleOpenModal}
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
          </div>

          {/* Modal for quote request details */}
          {selectedRequest && (
            <QuoteRequestDetails
              selectedRequest={selectedRequest}
              handleUpdateStatus={handleUpdateStatus}
              handleExportPDF={handleExportPDF}
              handlePrint={handlePrint}
              handleGenerateResponse={handleGenerateResponse}
              generatingResponse={generatingResponse}
              loading={loading}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
            />
          )}

          {/* Feedback message */}
          {feedbackMessage && (
            <FeedbackMessage
              message={feedbackMessage}
              setMessage={setFeedbackMessage}
              autoHideDuration={3000}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default QuoteRequestsAdmin;
