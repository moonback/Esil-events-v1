import React, { useState, useEffect } from 'react';
import { 
  FileText, Eye, Check, X, RefreshCw, Send, Users, Package, Calendar, 
  Clock, MapPin, Truck, Search, Filter, ArrowDownUp, Clipboard 
} from 'lucide-react'; // Added Clipboard
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { getQuoteRequests, updateQuoteRequestStatus, QuoteRequest } from '../../services/quoteRequestService';

const QuoteRequestsAdmin: React.FC = () => {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [suggestedResponse, setSuggestedResponse] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadQuoteRequests = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const { data, error: fetchError } = await getQuoteRequests(); // Renamed error variable to avoid conflict

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Sort requests by creation date based on sortOrder
      const sortedData = data ? [...data].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime(); // Use 0 as fallback for invalid dates
        const dateB = new Date(b.created_at || 0).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }) : [];

      setQuoteRequests(sortedData);
      // Filtering will be handled by the useEffect below
    } catch (err: any) { // Use any for error type flexibility
      setError(`Erreur lors du chargement des demandes de devis: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuoteRequests();
    // Intentionally excluding loadQuoteRequests from deps to avoid loop if it modifies state that triggers useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]);

  // Filter requests based on search term and status filter
  useEffect(() => {
    // No need to check quoteRequests.length here, filter works fine on empty array
    let filtered = [...quoteRequests];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      if (term) { // Only filter if term is not empty space
          filtered = filtered.filter(request =>
          request.first_name?.toLowerCase().includes(term) ||
          request.last_name?.toLowerCase().includes(term) ||
          request.email?.toLowerCase().includes(term) ||
          request.company?.toLowerCase().includes(term) ||
          request.phone?.includes(term) ||
          request.id?.toLowerCase().includes(term) // Assuming ID is string
        );
      }
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset pagination when filters change
  }, [searchTerm, statusFilter, quoteRequests]); // quoteRequests dependency ensures filtering runs after data load/sort

  const handleUpdateStatus = async (id: string, status: string) => {
    // Clear previous messages
    setResponseMessage(null);
    setError('');
    try {
      const { error: updateError } = await updateQuoteRequestStatus(id, status); // Renamed error variable

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Update local state optimistically or after refetch
      // For simplicity, update local state directly
      setQuoteRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === id ? { ...req, status } : req
        )
      );

      // Update selected request if it's the one being modified
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, status } : null);
      }

      setResponseMessage({ type: 'success', text: 'Statut mis à jour avec succès.' });

    } catch (err: any) {
      setError(`Erreur lors de la mise à jour du statut: ${err.message}`);
      setResponseMessage({ type: 'error', text: `Erreur lors de la mise à jour: ${err.message}` });
      console.error(err);
    }
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Format date utility
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return 'Date invalide'; // Handle potential parsing errors
    }
  };

  // Status color utility
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200'; // Default or 'new'/'null' status
    }
  };

  // Status label utility
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      case 'completed': return 'Terminé';
      default: return 'Nouveau'; // Default or 'new'/'null' status
    }
  };

  // Delivery type label utility
  const getDeliveryTypeLabel = (type?: string) => {
    switch (type) {
      case 'pickup': return 'Retrait sur place';
      case 'eco': return 'Livraison standard';
      case 'premium': return 'Livraison premium';
      default: return 'Non spécifié';
    }
  };

  // Time slot label utility
  const getTimeSlotLabel = (slot?: string) => {
    switch (slot) {
      case 'before9': return 'Avant 9h';
      case '9to13': return '9h - 13h';
      case '13to19': return '13h - 19h';
      default: return 'Non spécifié';
    }
  };

  // Access label utility
  const getAccessLabel = (access?: string) => {
    switch (access) {
      case 'parking': return 'Parking';
      case 'street': return 'Rue';
      case 'stairs': return 'Escaliers';
      case 'flat': return 'Plain-pied';
      case 'elevator': return 'Ascenseur';
      default: return 'Non spécifié';
    }
  };

  const handleGenerateResponse = async () => {
    if (!selectedRequest) {
        setResponseMessage({ type: 'error', text: 'Aucune demande sélectionnée.' });
        return;
    }

    console.log("Début de la génération de réponse...");
    setGeneratingResponse(true);
    setResponseMessage(null); // Clear previous messages
    setSuggestedResponse(''); // Clear previous response
    setError(''); // Clear previous errors

    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

    if (!apiKey) {
      console.error("Clé API DeepSeek manquante.");
      setResponseMessage({ type: 'error', text: 'Erreur de configuration: Clé API DeepSeek manquante.' });
      setGeneratingResponse(false);
      return;
    }
    console.log("API Key disponible:", apiKey ? "Oui" : "Non");


    try {
      // Format the data for DeepSeek API
      const messages = [
        {
          role: "system",
          content: "Tu es un expert en gestion commerciale pour ESIL Events, une entreprise premium de location de mobilier événementiel avec plus de 10 ans d'expérience. Ta mission est de générer des devis professionnels, personnalisés et hautement persuasifs pour maximiser le taux de conversion. ADOPTE CES PRINCIPES DE VENTE EFFICACES: - Utilise un ton formel mais chaleureux et enthousiaste - Crée un sentiment d'urgence (disponibilité limitée, période de réservation qui se termine bientôt) - Mentionne la rareté de nos produits premium et notre expertise unique - Inclus des preuves sociales (témoignages de clients satisfaits, événements prestigieux) - Souligne notre garantie de satisfaction et notre service client exceptionnel - Mets en avant nos avantages exclusifs (livraison premium, installation par des experts) - Propose des options de personnalisation pour valoriser le client - Utilise des formulations positives et orientées bénéfices. STRUCTURE TON MESSAGE POUR MAXIMISER L'IMPACT: - Accroche personnalisée qui fait référence à leur événement spécifique - Présentation valorisante d'ESIL Events comme partenaire idéal - Description vivante de comment nos produits transformeront leur événement - Détail des articles avec mise en valeur de leurs caractéristiques premium - Offre d'une remise de 5% pour toute confirmation dans les 7 jours - Conditions de réservation claires avec acompte de 30% - Call-to-action fort pour un rendez-vous téléphonique - Signature professionnelle avec notre slogan 'L'élégance pour chaque événement'. N'oublie pas d'inclure nos coordonnées complètes, réseaux sociaux et un lien vers notre portfolio d'événements réussis."
        },
        {
          role: "user",
          content: `Voici les détails de la demande de devis #${selectedRequest.id?.substring(0, 8).toUpperCase() || 'N/A'}:

INFORMATIONS CLIENT:
• Nom complet: ${selectedRequest.first_name || ''} ${selectedRequest.last_name || ''}
• Email: ${selectedRequest.email || 'N/A'}
• Téléphone: ${selectedRequest.phone || 'N/A'}
• Société: ${selectedRequest.company || 'N/A'}
• Catégorie: ${selectedRequest.customer_type === 'professional' ? 'Client Professionnel' : 'Client Particulier'}
• Adresse: ${selectedRequest.billing_address || 'N/A'}
• Code postal: ${selectedRequest.postal_code || 'N/A'}
• Ville: ${selectedRequest.city || 'N/A'}

DÉTAILS DE L'ÉVÉNEMENT:
• Date: ${selectedRequest.event_date || 'Non spécifiée'}
• Durée: ${selectedRequest.event_duration || 'Non spécifiée'}
• Heure de début: ${selectedRequest.event_start_time || 'Non spécifiée'}
• Heure de fin: ${selectedRequest.event_end_time || 'Non spécifiée'}
• Nombre de participants: ${selectedRequest.guest_count || 'Non spécifié'}
• Type d'espace: ${selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}
• Description: ${selectedRequest.description || 'Aucune description fournie'}

ARTICLES SÉLECTIONNÉS:
${selectedRequest.items && selectedRequest.items.length > 0 ? selectedRequest.items.map(item => `• ${item.name || 'Article inconnu'} (${item.quantity || 0} unité${(item.quantity || 0) > 1 ? 's' : ''} × ${(item.price || 0).toFixed(2)}€) - Sous-total: ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}€`).join('\n') : 'Aucun article sélectionné'}

MONTANT TOTAL: ${(selectedRequest.items?.reduce((total, item) => total + ((item.quantity || 0) * (item.price || 0)), 0) || 0).toFixed(2)}€ TTC

COMMENTAIRES SPÉCIFIQUES: ${selectedRequest.comments || 'Aucun commentaire additionnel'}

Génère une réponse de devis professionnelle et persuasive qui inclut: 1. Une accroche personnalisée qui fait référence à leur événement spécifique et crée une connexion émotionnelle immédiate 2. Une présentation valorisante d'ESIL Events comme le partenaire idéal pour leur événement, en mentionnant: - Notre expertise de plus de 10 ans dans l'industrie événementielle - Notre portfolio de clients prestigieux (grands hôtels, marques de luxe, événements médiatisés) - Notre engagement envers l'excellence et la satisfaction client 3. Une description vivante et immersive de comment nos produits transformeront leur événement: - Utilise un langage évocateur qui leur permet de visualiser leur événement réussi - Mentionne l'impact positif sur leurs invités/participants - Souligne l'harmonie esthétique et fonctionnelle de nos produits 4. Une confirmation détaillée des articles sélectionnés avec: - Mise en valeur des caractéristiques premium de chaque article - Mention de la qualité exceptionnelle des matériaux - Explication de pourquoi ces choix sont parfaits pour leur événement spécifique 5. Une offre spéciale limitée dans le temps: - Remise de 5% pour toute confirmation dans les 7 jours - Mention de la disponibilité limitée de certains articles premium - Service de conseil en design d'intérieur offert pour les commandes confirmées rapidement 6. Les conditions de réservation claires: - Acompte de 30% pour confirmer la réservation - Options de paiement flexibles - Garantie de satisfaction et politique d'annulation 7. Un call-to-action fort pour un rendez-vous téléphonique ou une visite de notre showroom 8. Une formule de politesse élégante avec signature professionnelle incluant notre slogan 'L'élégance pour chaque événement' 9. Nos coordonnées complètes, réseaux sociaux et un lien vers notre portfolio d'événements réussis. INCLUS ÉGALEMENT CES ÉLÉMENTS PERSUASIFS: • Témoignage client: "ESIL Events a transformé notre gala d'entreprise en un événement inoubliable. Le mobilier était exactement ce que nous recherchions." - Marie D., Directrice Marketing • Garantie: "Nous garantissons la qualité irréprochable de nos produits et un service de livraison ponctuel." • Conseil d'expert: "Notre équipe de designers est à votre disposition pour vous conseiller sur les meilleures configurations pour votre espace." • Services additionnels: Installation professionnelle, assistance sur site, et service de récupération flexible.`
        }
      ];

      const requestBody = {
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.8,
        max_tokens: 1500,
        top_p: 0.95,
        presence_penalty: 0.1,
        frequency_penalty: 0.2
      };

      console.log("Envoi de la requête à l'API DeepSeek...");
      console.log("URL:", 'https://api.deepseek.com/v1/chat/completions');

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Statut de la réponse:", response.status);

      if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
            console.error("Erreur API détaillée:", errorData);
        } catch (parseError) {
            errorData = { error: { message: "Impossible de parser la réponse d'erreur de l'API." } };
            console.error("Erreur API brute:", await response.text());
        }
        throw new Error(`Erreur API (${response.status}): ${errorData?.error?.message || response.statusText || 'Erreur inconnue'}`);
      }

      const data = await response.json();
      console.log("Réponse API reçue:", data);

      const generatedResponse = data.choices?.[0]?.message?.content;

      if (!generatedResponse) {
        throw new Error("La réponse de l'API est vide ou mal formée.");
      }

      console.log("Réponse générée:", generatedResponse);
      setSuggestedResponse(generatedResponse);

      setResponseMessage({
        type: 'success',
        text: 'Réponse générée avec succès.'
      });

    } catch (err: any) {
      console.error('Erreur lors de la génération de la réponse:', err);
      setResponseMessage({
        type: 'error',
        text: `Erreur lors de la génération: ${err.message}`
      });
      setError(`Erreur lors de la génération: ${err.message}`); // Optionally set main error state too
    } finally {
      setGeneratingResponse(false);
      console.log("Fin de la génération de réponse");
    }
  };

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="space-y-8 mt-12 max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-lg shadow-md border-l-4 border-indigo-600 gap-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">Demandes de devis</h1>
            <span className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              {quoteRequests.length} {/* Use full count before filtering */}
            </span>
          </div>
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm font-medium text-sm"
              title={sortOrder === 'desc' ? 'Trier: Plus ancien d\'abord' : 'Trier: Plus récent d\'abord'}
            >
              <ArrowDownUp className="w-4 h-4 mr-2" />
              {sortOrder === 'desc' ? 'Plus récent' : 'Plus ancien'}
            </button>
            <button
              onClick={loadQuoteRequests} // Directly call loadQuoteRequests
              disabled={loading}
              className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Chargement...' : 'Actualiser'}
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone, ID..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvé</option>
                  <option value="rejected">Rejeté</option>
                  <option value="completed">Terminé</option>
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
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* Main Error Display */}
        {error && (
          <div className="bg-red-50 text-red-600 p-5 rounded-lg border-l-4 border-red-500 shadow-sm flex items-start">
            <X className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !quoteRequests.length ? ( // Show loading only if data hasn't been loaded yet
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Chargement des demandes...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Requests List */}
            <div className="w-full lg:w-3/5">
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Demande</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.length > 0 ? (
                        currentItems.map((request) => (
                          <tr
                            key={request.id}
                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedRequest?.id === request.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                            onClick={() => setSelectedRequest(request)}
                          >
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                    {request.first_name} {request.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {request.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(request.created_at)}</div>
                                <div className="text-xs text-gray-500">Événement: {request.event_date || '-'}</div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                                {getStatusLabel(request.status)}
                              </span>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click
                                  setSelectedRequest(request);
                                }}
                                className="p-2 rounded-full text-indigo-600 hover:text-white hover:bg-indigo-600 transition-colors"
                                title="Voir les détails"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <Search className="h-10 w-10 text-gray-400 mb-3" />
                              <p className="font-medium">Aucune demande correspondante</p>
                              <p className="text-sm mt-1">Essayez d'ajuster vos filtres ou votre recherche.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                   <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                        Précédent
                        </button>
                        <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                        Suivant
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                        <p className="text-sm text-gray-700">
                            Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à <span className="font-medium">{Math.min(indexOfLastItem, filteredRequests.length)}</span> sur <span className="font-medium">{filteredRequests.length}</span> résultats
                        </p>
                        </div>
                        <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                            <span className="sr-only">Précédent</span>
                            ‹ {/* Left arrow */}
                            </button>
                            {/* Consider generating only a subset of page numbers for large totalPages */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                aria-current={currentPage === page ? 'page' : undefined}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                            ))}
                            <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                            <span className="sr-only">Suivant</span>
                            › {/* Right arrow */}
                            </button>
                        </nav>
                        </div>
                    </div>
                    </div>
                )}
              </div>
            </div>

            {/* Selected Request Details */}
            <div className="w-full lg:w-2/5 lg:sticky lg:top-24 self-start space-y-5">
              {selectedRequest ? (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all max-h-[calc(100vh-8rem)] overflow-y-auto"> {/* Added scroll */}
                  <div className="flex justify-between items-start mb-5 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Détails (ID: {selectedRequest.id?.substring(0,8).toUpperCase() || 'N/A'})</h2>
                        <p className="text-sm text-gray-500">Reçu le: {formatDate(selectedRequest.created_at)}</p>
                    </div>
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusLabel(selectedRequest.status)}
                    </span>
                  </div>

                  {/* Display response/error messages related to actions */}
                  {responseMessage && (
                    <div className={`mb-4 p-4 rounded-md border ${responseMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} shadow-sm`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                        {responseMessage.type === 'success' ? (
                            <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
                        ) : (
                            <X className="h-5 w-5 text-red-400" aria-hidden="true" />
                        )}
                        </div>
                        <div className="ml-3">
                        <p className="text-sm font-medium">
                            {responseMessage.text}
                        </p>
                        </div>
                    </div>
                    </div>
                  )}

                  <div className="space-y-5">
                    {/* Informations client */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <Users className="h-4 w-4 mr-2 text-indigo-500" /> Informations client
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                            <div><span className="text-gray-500">Nom:</span> <span className="font-medium text-gray-800">{selectedRequest.first_name} {selectedRequest.last_name}</span></div>
                            <div><span className="text-gray-500">Type:</span> <span className="font-medium text-gray-800">{selectedRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</span></div>
                            <div><span className="text-gray-500">Société:</span> <span className="font-medium text-gray-800">{selectedRequest.company || '-'}</span></div>
                            <div className="truncate"><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-800">{selectedRequest.email || '-'}</span></div>
                            <div><span className="text-gray-500">Téléphone:</span> <span className="font-medium text-gray-800">{selectedRequest.phone || '-'}</span></div>
                            <div className="sm:col-span-2 truncate"><span className="text-gray-500">Facturation:</span> <span className="font-medium text-gray-800">{[selectedRequest.billing_address, selectedRequest.postal_code, selectedRequest.city].filter(Boolean).join(', ') || '-'}</span></div>
                        </div>
                    </div>

                    {/* Informations événement */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-indigo-500" /> Détails de l'événement
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                            <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-800">{selectedRequest.event_date || '-'}</span></div>
                            <div><span className="text-gray-500">Durée:</span> <span className="font-medium text-gray-800">{selectedRequest.event_duration || '-'}</span></div>
                            <div><span className="text-gray-500">Début:</span> <span className="font-medium text-gray-800">{selectedRequest.event_start_time || '-'}</span></div>
                            <div><span className="text-gray-500">Fin:</span> <span className="font-medium text-gray-800">{selectedRequest.event_end_time || '-'}</span></div>
                            <div><span className="text-gray-500">Invités:</span> <span className="font-medium text-gray-800">{selectedRequest.guest_count || '-'}</span></div>
                            <div><span className="text-gray-500">Lieu:</span> <span className="font-medium text-gray-800">{selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</span></div>
                        </div>
                        <div className="mt-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Description:</p>
                            <p className="text-sm text-gray-800 bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap">{selectedRequest.description || '-'}</p>
                        </div>
                    </div>

                    {/* Articles commandés */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <Package className="h-4 w-4 mr-2 text-indigo-500" />
                        Articles commandés
                      </h3>
                      <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 bg-white">
                          <thead className="bg-gray-100">
                            <tr>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                              <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qté</th>
                              <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Prix U.</th>
                              <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedRequest.items && selectedRequest.items.length > 0 ? selectedRequest.items.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-800">{item.name || 'N/A'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800 text-center">{item.quantity || 0}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800 text-right">{(item.price || 0).toFixed(2)}€</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-800 text-right">{((item.quantity || 0) * (item.price || 0)).toFixed(2)}€</td>
                              </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center text-sm text-gray-500 py-4">Aucun article</td></tr>
                            )}
                            {selectedRequest.items && selectedRequest.items.length > 0 && (
                                <tr className="bg-gray-100 font-semibold">
                                <td colSpan={3} className="px-3 py-2 text-sm text-gray-800 text-right">Total TTC</td>
                                <td className="px-3 py-2 text-sm font-bold text-indigo-700 text-right">
                                    {(selectedRequest.items.reduce((total, item) => total + ((item.quantity || 0) * (item.price || 0)), 0)).toFixed(2)}€
                                </td>
                                </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Informations de livraison */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <Truck className="h-4 w-4 mr-2 text-indigo-500" /> Informations Livraison / Retrait
                        </h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                            <div><span className="text-gray-500">Type:</span> <span className="font-medium text-gray-800">{getDeliveryTypeLabel(selectedRequest.delivery_type)}</span></div>
                            <div><span className="text-gray-500">Date Livr./Retrait:</span> <span className="font-medium text-gray-800">{selectedRequest.delivery_date || '-'}</span></div>
                            <div><span className="text-gray-500">Créneau:</span> <span className="font-medium text-gray-800">{getTimeSlotLabel(selectedRequest.delivery_time_slot)}</span></div>
                            <div><span className="text-gray-500">Date Reprise:</span> <span className="font-medium text-gray-800">{selectedRequest.pickup_date || '-'}</span></div>
                             <div className="sm:col-span-2 truncate"><span className="text-gray-500">Adresse Livr.:</span> <span className="font-medium text-gray-800">{[selectedRequest.delivery_address, selectedRequest.delivery_postal_code, selectedRequest.delivery_city].filter(Boolean).join(', ') || '-'}</span></div>
                         </div>
                    </div>

                     {/* Informations d'accès */}
                     <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-indigo-500" /> Informations d'accès
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                            <div><span className="text-gray-500">Extérieur:</span> <span className="font-medium text-gray-800">{getAccessLabel(selectedRequest.exterior_access)}</span></div>
                            <div><span className="text-gray-500">Intérieur:</span> <span className="font-medium text-gray-800">{getAccessLabel(selectedRequest.interior_access)}</span></div>
                            {selectedRequest.interior_access === 'elevator' && (
                            <>
                                <div><span className="text-gray-500">Asc. L:</span> <span className="font-medium text-gray-800">{selectedRequest.elevator_width ? `${selectedRequest.elevator_width} cm` : '-'}</span></div>
                                <div><span className="text-gray-500">Asc. P:</span> <span className="font-medium text-gray-800">{selectedRequest.elevator_depth ? `${selectedRequest.elevator_depth} cm` : '-'}</span></div>
                                <div><span className="text-gray-500">Asc. H:</span> <span className="font-medium text-gray-800">{selectedRequest.elevator_height ? `${selectedRequest.elevator_height} cm` : '-'}</span></div>
                            </>
                            )}
                        </div>
                    </div>

                     {/* Informations de reprise (pickup return details) */}
                     <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-indigo-500" /> Détails reprise (si applicable)
                        </h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                            <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-800">{selectedRequest.pickup_return_date || '-'}</span></div>
                            <div><span className="text-gray-500">Début:</span> <span className="font-medium text-gray-800">{selectedRequest.pickup_return_start_time || '-'}</span></div>
                            <div><span className="text-gray-500">Fin:</span> <span className="font-medium text-gray-800">{selectedRequest.pickup_return_end_time || '-'}</span></div>
                         </div>
                    </div>

                    {/* Commentaires */}
                    {selectedRequest.comments && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-indigo-500" /> Commentaires client
                        </h3>
                        <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap">
                          {selectedRequest.comments}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm p-4 -m-6 mt-6 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">Actions</h3>
                        <div className="h-px flex-1 bg-gray-200 ml-3"></div>
                      </div>

                      <div className="flex flex-col space-y-3">
                        {/* Status Change Buttons */}
                        <div className="flex flex-wrap gap-3">
                            {selectedRequest.status !== 'approved' && selectedRequest.status !== 'completed' && (
                            <button
                                onClick={() => selectedRequest.id && handleUpdateStatus(selectedRequest.id, 'approved')}
                                disabled={!selectedRequest.id}
                                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium text-sm disabled:opacity-50"
                            >
                                <Check className="w-4 h-4 mr-2" /> Approuver
                            </button>
                            )}
                            {selectedRequest.status !== 'rejected' && selectedRequest.status !== 'completed' && (
                            <button
                                onClick={() => selectedRequest.id && handleUpdateStatus(selectedRequest.id, 'rejected')}
                                disabled={!selectedRequest.id}
                                className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium text-sm disabled:opacity-50"
                            >
                                <X className="w-4 h-4 mr-2" /> Rejeter
                            </button>
                            )}
                            {selectedRequest.status === 'approved' && (
                            <button
                                onClick={() => selectedRequest.id && handleUpdateStatus(selectedRequest.id, 'completed')}
                                disabled={!selectedRequest.id}
                                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm disabled:opacity-50"
                            >
                                <Check className="w-4 h-4 mr-2" /> Marquer Terminé
                            </button>
                            )}
                            {selectedRequest.status === 'rejected' || selectedRequest.status === 'completed' ? (
                                <button
                                onClick={() => selectedRequest.id && handleUpdateStatus(selectedRequest.id, 'pending')}
                                disabled={!selectedRequest.id}
                                className="flex-1 flex items-center justify-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm font-medium text-sm disabled:opacity-50"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" /> Réouvrir (Attente)
                            </button>
                            ) : null}
                        </div>

                        {/* AI Response Button */}
                        <button
                          onClick={handleGenerateResponse}
                          disabled={generatingResponse || !selectedRequest}
                          className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingResponse ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Génération IA...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Générer Réponse Devis (IA)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Placeholder when no request is selected
                <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 flex flex-col items-center justify-center text-center h-96">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Aucune demande sélectionnée</h3>
                  <p className="text-gray-500 text-sm max-w-xs">Cliquez sur une demande dans la liste de gauche pour afficher ses détails et les actions disponibles ici.</p>
                </div>
              )}

               {/* Suggested Response Display */}
              {suggestedResponse && selectedRequest && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 transition-all mt-5">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                    <Send className="w-5 h-5 mr-2 text-indigo-600" />
                    Réponse suggérée par IA
                  </h3>
                   {/* Optional: Add message about AI generation status here if needed */}
                   <div className="bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap max-h-96 overflow-y-auto text-gray-700 text-sm font-mono">
                    {suggestedResponse}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(suggestedResponse);
                        setResponseMessage({ // Show temporary feedback
                          type: 'success',
                          text: 'Réponse copiée dans le presse-papier.'
                        });
                        // Optionally clear message after a few seconds
                        setTimeout(() => setResponseMessage(null), 3000);
                      }}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors shadow-sm flex items-center text-sm font-medium"
                      title="Copier la réponse"
                    >
                      <Clipboard className="h-4 w-4 mr-2" />
                      Copier la réponse
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default QuoteRequestsAdmin;
