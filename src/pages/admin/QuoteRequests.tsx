import React, { useState, useEffect } from 'react';
import { Send, Download, Printer, Settings } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { QuoteRequest, getQuoteRequests, updateQuoteRequestStatus } from '../../services/quoteRequestService';
import QuoteRequestFilters from '../../components/quoteRequests/QuoteRequestFilters';
import QuoteRequestList from '../../components/quoteRequests/QuoteRequestList';
import QuoteRequestDetails from '../../components/quoteRequests/QuoteRequestDetails';
import QuoteRequestActions from '../../components/quoteRequests/QuoteRequestActions';
import EmailConfigPanel from '../../components/admin/EmailConfigPanel';

const QuoteRequests: React.FC = () => {
  // États pour les demandes de devis
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  
  // États pour les fonctionnalités supplémentaires
  const [suggestedResponse, setSuggestedResponse] = useState<string>('');
  const [generatingResponse, setGeneratingResponse] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showEmailConfig, setShowEmailConfig] = useState<boolean>(false);

  // Charger les demandes de devis
  const loadQuoteRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await getQuoteRequests();
      
      if (error) throw new Error(error.message);
      
      if (data) {
        setQuoteRequests(data);
        // Sélectionner la première demande par défaut si aucune n'est sélectionnée
        if (data.length > 0 && !selectedRequest) {
          setSelectedRequest(data[0]);
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des demandes de devis:', err);
      setError('Erreur lors du chargement des demandes de devis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuoteRequests();
  }, []);

  // Filtrer les demandes de devis
  const filteredRequests = quoteRequests.filter(request => {
    // Filtre par terme de recherche
    const searchMatch = 
      !searchTerm || 
      request.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre par statut
    const statusMatch = statusFilter === 'all' || request.status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Mettre à jour le statut d'une demande
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setLoading(true);
      await updateQuoteRequestStatus(id, newStatus);
      
      // Mettre à jour la liste locale
      const updatedRequests = quoteRequests.map(req => 
        req.id === id ? { ...req, status: newStatus } : req
      );
      setQuoteRequests(updatedRequests);
      
      // Mettre à jour la demande sélectionnée si c'est celle qui a été modifiée
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
      
      setFeedbackMessage({ 
        type: 'success', 
        text: `Le statut a été mis à jour avec succès en "${newStatus === 'approved' ? 'Approuvé' : 
          newStatus === 'rejected' ? 'Rejeté' : 
          newStatus === 'completed' ? 'Terminé' : 'En attente'}"`
      });
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setFeedbackMessage({ type: 'error', text: 'Erreur lors de la mise à jour du statut' });
    } finally {
      setLoading(false);
    }
  };

  // Exporter en PDF
  const handleExportPDF = async (): Promise<void> => {
    if (!selectedRequest) return;
    
    try {
      setLoading(true);
      // Importer dynamiquement l'utilitaire d'exportation PDF
      const { generateQuoteRequestPDF } = await import('../../utils/pdfExport');
      await generateQuoteRequestPDF(selectedRequest);
      setFeedbackMessage({ type: 'success', text: 'Le PDF a été généré avec succès' });
    } catch (err) {
      console.error('Erreur lors de la génération du PDF:', err);
      setFeedbackMessage({ type: 'error', text: 'Erreur lors de la génération du PDF' });
    } finally {
      setLoading(false);
    }
  };

  // Imprimer la demande
  const handlePrint = async () => {
    if (!selectedRequest) return;
    
    try {
      setLoading(true);
      // Importer dynamiquement l'utilitaire d'impression
      const { printQuoteRequest } = await import('../../utils/pdfExport');
      await printQuoteRequest(selectedRequest);
      setFeedbackMessage({ type: 'success', text: 'La page d\'impression a été générée' });
    } catch (err) {
      console.error('Erreur lors de la préparation de l\'impression:', err);
      setFeedbackMessage({ type: 'error', text: 'Erreur lors de la préparation de l\'impression' });
    } finally {
      setLoading(false);
    }
  };

  // Générer une réponse avec l'IA
  const handleGenerateResponse = async () => {
    if (!selectedRequest) return;
    
    try {
      setGeneratingResponse(true);
      // Simulation d'appel à une API d'IA
      setTimeout(() => {
        const response = `Bonjour ${selectedRequest.first_name} ${selectedRequest.last_name},\n\nNous vous remercions pour votre demande de devis concernant votre événement prévu le ${selectedRequest.event_date ? new Date(selectedRequest.event_date).toLocaleDateString('fr-FR') : '[date]'}.\n\nNous avons bien pris en compte tous les détails que vous nous avez fournis et nous sommes ravis de pouvoir vous accompagner dans l'organisation de cet événement.\n\nNotre équipe est en train de préparer une offre personnalisée qui répondra parfaitement à vos besoins. Vous recevrez votre devis détaillé dans les 48 heures.\n\nN'hésitez pas à nous contacter si vous avez des questions ou des précisions à apporter.\n\nCordialement,\nL'équipe ESIL Events`;
        setSuggestedResponse(response);
        setGeneratingResponse(false);
        setFeedbackMessage({ type: 'success', text: 'Réponse générée avec succès' });
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la génération de la réponse:', err);
      setFeedbackMessage({ type: 'error', text: 'Erreur lors de la génération de la réponse' });
      setGeneratingResponse(false);
    }
  };

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="space-y-6 mt-12">
        <div className="flex items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-gray-900">Demandes de devis</h1>
          <button
            onClick={() => setShowEmailConfig(!showEmailConfig)}
            className="flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-sm font-medium"
            title="Configurer l'envoi automatique d'emails"
          >
            <Settings className="w-4 h-4 mr-1.5" />
            Config Email
          </button>
        </div>
        
        {/* Panneau de configuration des emails */}
        {showEmailConfig && (
          <div className="px-6">
            <EmailConfigPanel onClose={() => setShowEmailConfig(false)} />
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mx-6 animate-fade-in">
            {error}
            <button 
              onClick={loadQuoteRequests}
              className="ml-4 underline text-red-700 hover:text-red-800"
            >
              Réessayer
            </button>
          </div>
        )}

        {feedbackMessage && (
          <div className={`p-4 rounded-md mx-6 animate-fade-in ${feedbackMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {feedbackMessage.text}
            <button 
              onClick={() => setFeedbackMessage(null)}
              className="ml-4 underline hover:opacity-80"
            >
              Fermer
            </button>
          </div>
        )}

        <div className="px-6">
          <QuoteRequestFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            filteredCount={filteredRequests.length}
            resetFilters={resetFilters}
          />
        </div>

        <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des demandes */}
          <div className="lg:col-span-1">
            <QuoteRequestList 
              currentItems={currentItems}
              selectedRequest={selectedRequest || {} as QuoteRequest}
              setSelectedRequest={setSelectedRequest}
              setSuggestedResponse={setSuggestedResponse}
              setFeedbackMessage={setFeedbackMessage}
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-100 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-100 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>

          {/* Détails de la demande */}
          <div className="lg:col-span-2">
            {selectedRequest ? (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col h-full">
                <div className="p-5 overflow-y-auto flex-grow">
                  <QuoteRequestDetails selectedRequest={selectedRequest} />
                  
                  {/* Réponse suggérée par l'IA */}
                  {suggestedResponse && (
                    <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                      <h3 className="text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                        <Send className="h-4 w-4" /> Réponse suggérée (IA)
                      </h3>
                      <div className="bg-white p-3 rounded border border-indigo-100 text-sm text-gray-800 whitespace-pre-wrap">
                        {suggestedResponse}
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(suggestedResponse);
                            setFeedbackMessage({ type: 'success', text: 'Réponse copiée dans le presse-papier' });
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                        >
                          Copier le texte
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
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
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium mb-2">Sélectionnez une demande pour voir les détails</p>
                  <p className="text-sm">Ou utilisez les filtres pour trouver une demande spécifique</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default QuoteRequests;
