import React, { useState, useEffect } from 'react';
import {
  FileText, Eye, Check, X, RefreshCw, Send, Users, Package, Calendar,
  Clock, MapPin, Truck, Search, Filter, ArrowDownUp, Clipboard,
  Edit // Keep Clipboard and Edit icons
} from 'lucide-react';
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
  // Consolidated message state for feedback (status updates, copy, generation)
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [suggestedResponse, setSuggestedResponse] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // --- Data Loading ---
  const loadQuoteRequests = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      setFeedbackMessage(null); // Clear feedback messages on reload
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
      // Filtering happens in the dedicated useEffect
    } catch (err: any) {
      const errorMessage = `Erreur lors du chargement des demandes de devis: ${err.message}`;
      setError(errorMessage);
      setFeedbackMessage({ type: 'error', text: errorMessage });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuoteRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]); // Reload when sort order changes

  // --- Filtering Logic ---
  useEffect(() => {
    let filtered = [...quoteRequests];

    // Filter by search term (if term exists and is not just whitespace)
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      filtered = filtered.filter(request =>
        request.first_name?.toLowerCase().includes(term) ||
        request.last_name?.toLowerCase().includes(term) ||
        request.email?.toLowerCase().includes(term) ||
        request.company?.toLowerCase().includes(term) ||
        request.phone?.includes(term) ||
        request.id?.toLowerCase().includes(term) // Assuming ID is string and searchable
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset pagination when filters or source data change
  }, [searchTerm, statusFilter, quoteRequests]);

  // --- Status Update ---
  const handleUpdateStatus = async (id: string, status: string) => {
    setFeedbackMessage(null); // Clear previous messages
    setError('');
    try {
      const { error: updateError } = await updateQuoteRequestStatus(id, status);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Update local state immediately for better UX
      setQuoteRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === id ? { ...req, status } : req
        )
      );

      // Update selected request if it's the one being modified
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, status } : null);
      }

      setFeedbackMessage({ type: 'success', text: 'Statut mis à jour avec succès.' });
      // Optionally clear message after a few seconds
      setTimeout(() => setFeedbackMessage(null), 3000);

    } catch (err: any) {
      const errorMessage = `Erreur lors de la mise à jour du statut: ${err.message}`;
      setError(errorMessage); // Set main error as well if needed
      setFeedbackMessage({ type: 'error', text: errorMessage });
      console.error(err);
    }
  };

  // --- Pagination ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // --- Utility Functions ---
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide'; // Check for invalid date object
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Date invalide';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      case 'completed': return 'Terminé';
      default: return 'Nouveau';
    }
  };

  const getDeliveryTypeLabel = (type?: string) => { /* ... unchanged ... */
    switch (type) {
        case 'pickup': return 'Retrait sur place';
        case 'eco': return 'Livraison standard';
        case 'premium': return 'Livraison premium';
        default: return 'Non spécifié';
      }
  };
  const getTimeSlotLabel = (slot?: string) => { /* ... unchanged ... */
    switch (slot) {
        case 'before9': return 'Avant 9h';
        case '9to13': return '9h - 13h';
        case '13to19': return '13h - 19h';
        default: return 'Non spécifié';
      }
  };
  const getAccessLabel = (access?: string) => { /* ... unchanged ... */
    switch (access) {
        case 'parking': return 'Parking';
        case 'street': return 'Rue';
        case 'stairs': return 'Escaliers';
        case 'flat': return 'Plain-pied';
        case 'elevator': return 'Ascenseur';
        default: return 'Non spécifié';
      }
  };

  // --- AI Response Generation ---
  const handleGenerateResponse = async () => {
    if (!selectedRequest) {
      setFeedbackMessage({ type: 'error', text: 'Aucune demande sélectionnée.' });
      return;
    }

    console.log("Début de la génération de réponse AI...");
    setGeneratingResponse(true);
    setFeedbackMessage(null);
    setSuggestedResponse('');
    setError('');

    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    console.log("Clé API DeepSeek disponible:", apiKey ? "Oui" : "Non (Vérifiez VITE_DEEPSEEK_API_KEY dans .env)");


    if (!apiKey) {
      const errorMsg = 'Erreur de configuration: Clé API DeepSeek manquante (VITE_DEEPSEEK_API_KEY).';
      console.error(errorMsg);
      setFeedbackMessage({ type: 'error', text: errorMsg });
      setError(errorMsg);
      setGeneratingResponse(false);
      return;
    }

    try {
        const itemsDetails = selectedRequest.items && selectedRequest.items.length > 0
        ? selectedRequest.items.map(item =>
            `• ${item.name || 'Article inconnu'} (${item.quantity || 0} unité${(item.quantity || 0) > 1 ? 's' : ''} × ${(item.price || 0).toFixed(2)}€) - Sous-total: ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}€`
          ).join('\n')
        : 'Aucun article spécifique listé dans la demande.';

      const totalAmount = (selectedRequest.items?.reduce((total, item) => total + ((item.quantity || 0) * (item.price || 0)), 0) || 0).toFixed(2);

      // Updated and slightly refined prompt
      const messages = [
        {
          role: "system",
          content: "Tu es un expert commercial pour ESIL Events, spécialiste de la location de mobilier événementiel premium. Génère des réponses de devis personnalisées, professionnelles et persuasives pour maximiser la conversion. Principes clés : Ton formel mais chaleureux, créer un sentiment d'urgence (disponibilité, offre limitée), souligner l'exclusivité et l'expertise d'ESIL Events, utiliser la preuve sociale, mettre en avant la garantie de satisfaction et le service client. Structure : Accroche personnalisée, présentation valorisante d'ESIL, description de l'impact du mobilier sur l'événement, détail des articles (si fournis) avec caractéristiques premium, offre spéciale (ex: -5% si confirmation sous 7j), conditions claires (acompte 30%), appel à l'action (RDV tel, showroom), signature pro ('L'élégance pour chaque événement'), coordonnées complètes, lien portfolio/réseaux sociaux. Intègre un témoignage générique si pertinent et mentionne nos services (conseil, installation, livraison premium)."
        },
        {
          role: "user",
          content: `Génère une réponse de devis pour la demande #${selectedRequest.id?.substring(0, 8).toUpperCase() || 'N/A'}.

CLIENT:
• Nom: ${selectedRequest.first_name || ''} ${selectedRequest.last_name || ''}
• Email: ${selectedRequest.email || 'N/A'}
• Tél: ${selectedRequest.phone || 'N/A'}
• Société: ${selectedRequest.company || 'N/A'}
• Type: ${selectedRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}
• Adresse Facturation: ${[selectedRequest.billing_address, selectedRequest.postal_code, selectedRequest.city].filter(Boolean).join(', ') || 'Non fournie'}

ÉVÉNEMENT:
• Date: ${selectedRequest.event_date ? formatDate(selectedRequest.event_date) : 'Non spécifiée'}
• Durée: ${selectedRequest.event_duration || 'Non spécifiée'}
• Heures: ${selectedRequest.event_start_time || '?'} - ${selectedRequest.event_end_time || '?'}
• Invités: ${selectedRequest.guest_count || 'Non spécifié'}
• Lieu: ${selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}
• Description: ${selectedRequest.description || 'Aucune description fournie'}

ARTICLES & MONTANT (Indicatif):
${itemsDetails}
• Total TTC Indicatif: ${totalAmount}€

LIVRAISON/RETRAIT:
• Type: ${getDeliveryTypeLabel(selectedRequest.delivery_type)}
• Date: ${selectedRequest.delivery_date ? formatDate(selectedRequest.delivery_date) : '-'}
• Créneau: ${getTimeSlotLabel(selectedRequest.delivery_time_slot)}
• Adresse: ${[selectedRequest.delivery_address, selectedRequest.delivery_postal_code, selectedRequest.delivery_city].filter(Boolean).join(', ') || 'Non fournie ou identique facturation'}

COMMENTAIRES CLIENT: ${selectedRequest.comments || 'Aucun'}

INSTRUCTIONS SPÉCIFIQUES POUR L'IA :
1.  Commence par une salutation personnalisée (Ex: "Cher Monsieur/Chère Madame [Nom de famille],", ou "Bonjour [Prénom]," si approprié).
2.  Accroche : Remercie pour la demande et fais référence à l'événement spécifique (date, type si possible).
3.  Valorise ESIL Events : Mentionne brièvement l'expertise et le positionnement premium.
4.  Confirme la bonne compréhension des besoins (mobilier, date, lieu).
5.  Si des articles sont listés, commente brièvement leur pertinence ou qualité. Sinon, propose d'aider à la sélection.
6.  Intègre subtilement l'offre spéciale (-5% pour confirmation rapide) et l'urgence (disponibilité).
7.  Précise les prochaines étapes : envoi du devis détaillé formel, discussion téléphonique.
8.  Inclue un appel à l'action clair pour planifier un échange.
9.  Termine par une formule de politesse professionnelle et la signature complète d'ESIL Events (incluant slogan, tel, email, site web).
10. Adapte le ton légèrement si c'est un client particulier ou professionnel.
11. N'invente pas de détails non fournis, reste factuel sur les informations de la demande.
12. Fournis la réponse uniquement, sans phrases comme "Voici la réponse suggérée :".`
        }
      ];

      const requestBody = {
        model: "deepseek-chat", // Verify model name if needed
        messages: messages,
        temperature: 0.7, // Slightly lower for more predictable professional tone
        max_tokens: 1024, // Adjust as needed
        top_p: 0.95,
        // stream: false, // Assuming non-streaming for this use case
      };

      console.log("Envoi de la requête à l'API DeepSeek...", requestBody);

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Statut de la réponse API:", response.status, response.statusText);

      if (!response.ok) {
        let errorData;
        try {
            const errorText = await response.text();
            console.error("Erreur API brute:", errorText);
            errorData = JSON.parse(errorText); // Try to parse as JSON
        } catch (parseError) {
            console.error("Impossible de parser la réponse d'erreur JSON:", parseError);
            errorData = { error: { message: `Erreur ${response.status}: ${response.statusText}. Réponse non JSON.` } };
        }
        throw new Error(`Erreur API (${response.status}): ${errorData?.error?.message || response.statusText || 'Erreur inconnue'}`);
      }

      const data = await response.json();
      console.log("Réponse API reçue:", data);

      const generatedContent = data.choices?.[0]?.message?.content?.trim();

      if (!generatedContent) {
        throw new Error("La réponse de l'API est vide ou mal structurée.");
      }

      console.log("Réponse générée:", generatedContent);
      setSuggestedResponse(generatedContent);
      setFeedbackMessage({ type: 'success', text: 'Réponse IA générée avec succès.' });

    } catch (err: any) {
      console.error('Erreur détaillée lors de la génération de la réponse IA:', err);
      const errorMessage = `Erreur lors de la génération IA: ${err.message}`;
      setFeedbackMessage({ type: 'error', text: errorMessage });
      setError(errorMessage); // Optionally set main error state too
    } finally {
      setGeneratingResponse(false);
      console.log("Fin de la génération de réponse AI.");
    }
  };

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
              className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Chargement...' : 'Actualiser'}
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
              <div className="flex items-center h-full">
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
            <div className="w-full lg:w-3/5 xl:w-2/3"> {/* Adjust width */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Demande</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.length > 0 ? (
                        currentItems.map((request) => (
                          <tr
                            key={request.id}
                            className={`hover:bg-indigo-50/50 cursor-pointer transition-colors duration-150 ${selectedRequest?.id === request.id ? 'bg-indigo-100 border-l-4 border-indigo-500' : ''}`}
                            onClick={() => {setSelectedRequest(request); setSuggestedResponse(''); setFeedbackMessage(null);}} // Select, clear response/feedback
                          >
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                                  {/* Simple initial or icon */}
                                  {request.first_name ? request.first_name[0].toUpperCase() : <Users size={20} />}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                    {request.first_name} {request.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {request.email || request.company || '-'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(request.created_at)}</div>
                                <div className="text-xs text-gray-500">Événement: {request.event_date ? formatDate(request.event_date).split(' ')[0] : '-'}</div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                                {getStatusLabel(request.status)}
                              </span>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click from double-triggering
                                  setSelectedRequest(request);
                                  setSuggestedResponse('');
                                  setFeedbackMessage(null);
                                }}
                                className="p-2 rounded-md text-indigo-600 hover:bg-indigo-100 transition-colors"
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
                              <Search className="h-12 w-12 text-gray-300 mb-4" />
                              <p className="font-semibold text-lg text-gray-700">Aucune demande trouvée</p>
                              <p className="text-sm mt-1">Vérifiez vos filtres ou le terme de recherche.</p>
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
                    {/* Mobile Pagination */}
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        > Précédent </button>
                        <span className="text-sm text-gray-700 my-auto"> Page {currentPage} sur {totalPages} </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        > Suivant </button>
                    </div>
                    {/* Desktop Pagination */}
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Affichage de <span className="font-medium">{Math.max(indexOfFirstItem + 1, 1)}</span> à <span className="font-medium">{Math.min(indexOfLastItem, filteredRequests.length)}</span> sur <span className="font-medium">{filteredRequests.length}</span> résultats
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                > <span className="sr-only">Précédent</span>{'<'} </button>
                                {/* Consider implementing truncated pagination for many pages */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        aria-current={currentPage === page ? 'page' : undefined}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${ currentPage === page ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-100'}`}
                                    > {page} </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                > <span className="sr-only">Suivant</span>{'>'} </button>
                            </nav>
                        </div>
                    </div>
                 </div>
                )}
              </div>
            </div>

            {/* Selected Request Details Panel */}
            <div className="w-full lg:w-2/5 xl:w-1/3 lg:sticky lg:top-24 self-start space-y-6">
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
                  <div className="p-5 space-y-5">
                     {/* --- Sections: Client, Event, Items, Delivery, Access, Pickup Return, Comments --- */}
                     {/* Client Info */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-indigo-500" /> Informations client
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div><span className="text-gray-500">Nom:</span> <span className="font-medium text-gray-800">{selectedRequest.first_name} {selectedRequest.last_name}</span></div>
                            <div><span className="text-gray-500">Type:</span> <span className="font-medium text-gray-800">{selectedRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</span></div>
                            <div><span className="text-gray-500">Société:</span> <span className="font-medium text-gray-800">{selectedRequest.company || '-'}</span></div>
                            <div className="truncate"><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-800">{selectedRequest.email || '-'}</span></div>
                            <div><span className="text-gray-500">Téléphone:</span> <span className="font-medium text-gray-800">{selectedRequest.phone || '-'}</span></div>
                            <div className="sm:col-span-2 truncate"><span className="text-gray-500">Facturation:</span> <span className="font-medium text-gray-800">{[selectedRequest.billing_address, selectedRequest.postal_code, selectedRequest.city].filter(Boolean).join(', ') || '-'}</span></div>
                        </div>
                    </div>

                    {/* Event Info */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-indigo-500" /> Détails de l'événement
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-800">{selectedRequest.event_date ? formatDate(selectedRequest.event_date).split(' ')[0] : '-'}</span></div>
                            <div><span className="text-gray-500">Durée:</span> <span className="font-medium text-gray-800">{selectedRequest.event_duration || '-'}</span></div>
                            <div><span className="text-gray-500">Début:</span> <span className="font-medium text-gray-800">{selectedRequest.event_start_time || '-'}</span></div>
                            <div><span className="text-gray-500">Fin:</span> <span className="font-medium text-gray-800">{selectedRequest.event_end_time || '-'}</span></div>
                            <div><span className="text-gray-500">Invités:</span> <span className="font-medium text-gray-800">{selectedRequest.guest_count || '-'}</span></div>
                            <div><span className="text-gray-500">Lieu:</span> <span className="font-medium text-gray-800">{selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</span></div>
                        </div>
                        {selectedRequest.description && (
                        <div className="mt-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Description:</p>
                            <p className="text-sm text-gray-800 bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap">{selectedRequest.description}</p>
                        </div>
                        )}
                    </div>

                    {/* Items */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4 text-indigo-500" /> Articles demandés
                      </h3>
                      {selectedRequest.items && selectedRequest.items.length > 0 ? (
                        <div className="overflow-hidden rounded-md border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200 bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qté</th>
                                <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Prix U.</th>
                                <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {selectedRequest.items.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-800">{item.name || 'N/A'}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-800 text-center">{item.quantity || 0}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-800 text-right">{(item.price || 0).toFixed(2)}€</td>
                                    <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-800 text-right">{((item.quantity || 0) * (item.price || 0)).toFixed(2)}€</td>
                                </tr>
                                ))}
                                <tr className="bg-gray-100 font-semibold">
                                    <td colSpan={3} className="px-3 py-2 text-sm text-gray-800 text-right">Total TTC Indicatif</td>
                                    <td className="px-3 py-2 text-sm font-bold text-indigo-700 text-right">
                                        {(selectedRequest.items.reduce((total, item) => total + ((item.quantity || 0) * (item.price || 0)), 0)).toFixed(2)}€
                                    </td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Aucun article spécifique listé dans cette demande.</p>
                        )}
                    </div>

                    {/* Delivery / Pickup */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Truck className="h-4 w-4 text-indigo-500" /> Livraison / Retrait
                        </h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div><span className="text-gray-500">Type:</span> <span className="font-medium text-gray-800">{getDeliveryTypeLabel(selectedRequest.delivery_type)}</span></div>
                            <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-800">{selectedRequest.delivery_date ? formatDate(selectedRequest.delivery_date).split(' ')[0] : '-'}</span></div>
                            <div><span className="text-gray-500">Créneau:</span> <span className="font-medium text-gray-800">{getTimeSlotLabel(selectedRequest.delivery_time_slot)}</span></div>
                            <div><span className="text-gray-500">Date Reprise:</span> <span className="font-medium text-gray-800">{selectedRequest.pickup_date ? formatDate(selectedRequest.pickup_date).split(' ')[0] : '-'}</span></div>
                             <div className="sm:col-span-2 truncate"><span className="text-gray-500">Adresse Livr.:</span> <span className="font-medium text-gray-800">{[selectedRequest.delivery_address, selectedRequest.delivery_postal_code, selectedRequest.delivery_city].filter(Boolean).join(', ') || '-'}</span></div>
                         </div>
                    </div>

                     {/* Access Info */}
                     {(selectedRequest.exterior_access || selectedRequest.interior_access) && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-indigo-500" /> Accès
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
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
                     )}

                     {/* Pickup Return */}
                     {(selectedRequest.pickup_return_date || selectedRequest.pickup_return_start_time) && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-indigo-500" /> Détails retour (si retrait)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-800">{selectedRequest.pickup_return_date ? formatDate(selectedRequest.pickup_return_date).split(' ')[0] : '-'}</span></div>
                                <div><span className="text-gray-500">Début:</span> <span className="font-medium text-gray-800">{selectedRequest.pickup_return_start_time || '-'}</span></div>
                                <div><span className="text-gray-500">Fin:</span> <span className="font-medium text-gray-800">{selectedRequest.pickup_return_end_time || '-'}</span></div>
                            </div>
                        </div>
                     )}

                    {/* Comments */}
                    {selectedRequest.comments && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-500" /> Commentaires client
                        </h3>
                        <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap">
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
