import React, { useState, useEffect } from 'react';
import { FileText, Eye, Check, X, RefreshCw, Send, Users, Package, Calendar, Clock, MapPin, Truck, Search, Filter, ArrowDownUp } from 'lucide-react';
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
      const { data, error } = await getQuoteRequests();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Trier les demandes par date de création (les plus récentes d'abord)
      const sortedData = data ? [...data].sort((a, b) => {
        const dateA = new Date(a.created_at || '').getTime();
        const dateB = new Date(b.created_at || '').getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }) : [];
      
      setQuoteRequests(sortedData);
      setFilteredRequests(sortedData);
    } catch (err) {
      setError('Erreur lors du chargement des demandes de devis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuoteRequests();
  }, [sortOrder]);
  
  // Filtrer les demandes en fonction des critères de recherche et de filtre
  useEffect(() => {
    if (!quoteRequests.length) return;
    
    let filtered = [...quoteRequests];
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        request.first_name?.toLowerCase().includes(term) ||
        request.last_name?.toLowerCase().includes(term) ||
        request.email?.toLowerCase().includes(term) ||
        request.company?.toLowerCase().includes(term) ||
        request.phone?.includes(term) ||
        request.id?.toLowerCase().includes(term)
      );
    }
    
    // Filtrer par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }
    
    setFilteredRequests(filtered);
    setCurrentPage(1); // Réinitialiser la pagination lors du filtrage
  }, [searchTerm, statusFilter, quoteRequests]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await updateQuoteRequestStatus(id, status);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Mettre à jour l'état local
      setQuoteRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === id ? { ...req, status } : req
        )
      );

      // Si la demande sélectionnée est celle qui vient d'être mise à jour
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({ ...selectedRequest, status });
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
      console.error(err);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Obtenir la classe de couleur en fonction du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir le libellé du statut en français
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      case 'completed':
        return 'Terminé';
      default:
        return 'Nouveau';
    }
  };
  
  // Obtenir le libellé du type de livraison
  const getDeliveryTypeLabel = (type?: string) => {
    switch (type) {
      case 'pickup':
        return 'Retrait sur place';
      case 'eco':
        return 'Livraison standard';
      case 'premium':
        return 'Livraison premium';
      default:
        return 'Non spécifié';
    }
  };
  
  // Obtenir le libellé du créneau horaire
  const getTimeSlotLabel = (slot?: string) => {
    switch (slot) {
      case 'before9':
        return 'Avant 9h';
      case '9to13':
        return '9h - 13h';
      case '13to19':
        return '13h - 19h';
      default:
        return 'Non spécifié';
    }
  };
  
  // Obtenir le libellé du type d'accès
  const getAccessLabel = (access?: string) => {
    switch (access) {
      case 'parking':
        return 'Parking';
      case 'street':
        return 'Rue';
      case 'stairs':
        return 'Escaliers';
      case 'flat':
        return 'Plain-pied';
      case 'elevator':
        return 'Ascenseur';
      default:
        return 'Non spécifié';
    }
  };

  const handleGenerateResponse = async () => {
    if (!selectedRequest) return;
    
    try {
      console.log("Début de la génération de réponse...");
      setGeneratingResponse(true);
      setResponseMessage(null);
      setSuggestedResponse('');
      
      // Format the data for DeepSeek API
      const messages = [
        {
          role: "system",
          content: "Tu es un expert en gestion commerciale pour ESIL Events, une entreprise premium de location de mobilier événementiel. Ta mission est de générer des devis professionnels, personnalisés et convaincants. Utilise un ton formel mais chaleureux, mets en valeur notre expertise et notre engagement envers la satisfaction client. Inclus notre slogan 'L'élégance pour chaque événement' dans ta signature."
        },
        {
          role: "user",
          content: `Voici les détails de la demande de devis #${selectedRequest.id?.substring(0, 8).toUpperCase()}:
          
INFORMATIONS CLIENT:
• Nom complet: ${selectedRequest.first_name} ${selectedRequest.last_name}
• Email: ${selectedRequest.email}
• Téléphone: ${selectedRequest.phone}
• Société: ${selectedRequest.company || 'N/A'}
• Catégorie: ${selectedRequest.customer_type === 'professional' ? 'Client Professionnel' : 'Client Particulier'}
• Adresse: ${selectedRequest.billing_address || 'N/A'}
• Code postal: ${selectedRequest.postal_code || 'N/A'}
• Ville: ${selectedRequest.city || 'N/A'}

DÉTAILS DE L'ÉVÉNEMENT:
• Date: ${selectedRequest.event_date}
• Durée: ${selectedRequest.event_duration}
• Heure de début: ${selectedRequest.event_start_time || 'Non spécifiée'}
• Heure de fin: ${selectedRequest.event_end_time || 'Non spécifiée'}
• Nombre de participants: ${selectedRequest.guest_count}
• Type d'espace: ${selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}
• Description: ${selectedRequest.description}

ARTICLES SÉLECTIONNÉS:
${selectedRequest.items.map(item => `• ${item.name} (${item.quantity} unité${item.quantity > 1 ? 's' : ''} × ${item.price.toFixed(2)}€) - Sous-total: ${(item.quantity * item.price).toFixed(2)}€`).join('\n')}

MONTANT TOTAL: ${selectedRequest.items.reduce((total, item) => total + (item.quantity * item.price), 0).toFixed(2)}€ TTC

COMMENTAIRES SPÉCIFIQUES: ${selectedRequest.comments || 'Aucun commentaire additionnel'}

Génère une réponse de devis professionnelle qui inclut:
1. Une salutation personnalisée et chaleureuse
2. Une introduction présentant brièvement ESIL Events et notre expertise
3. Un résumé détaillé de leur projet événementiel
4. Une confirmation précise des articles sélectionnés et du prix total
5. Les conditions de réservation (acompte de 30% pour confirmer)
6. Les prochaines étapes pour finaliser la commande
7. Une proposition de rendez-vous téléphonique pour discuter des détails
8. Une formule de politesse élégante avec signature professionnelle
9. Nos coordonnées complètes et réseaux sociaux`
        }
      ];
      
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      console.log("API Key disponible:", apiKey ? "Oui" : "Non");
      
      const requestBody = {
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      };
      
      console.log("Envoi de la requête à l'API DeepSeek...");
      console.log("URL:", 'https://api.deepseek.com/v1/chat/completions');
      
      // Appel à l'API DeepSeek
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
        const errorData = await response.json().catch(e => ({ error: { message: "Impossible de parser la réponse d'erreur" } }));
        console.error("Erreur API détaillée:", errorData);
        throw new Error(`Erreur API (${response.status}): ${errorData.error?.message || 'Erreur inconnue'}`);
      }
      
      const data = await response.json();
      console.log("Réponse API reçue:", data);
      
      // Extraire la réponse générée
      const generatedResponse = data.choices[0].message.content;
      console.log("Réponse générée:", generatedResponse);
      setSuggestedResponse(generatedResponse);
      
      // Afficher un message de succès
      setResponseMessage({
        type: 'success',
        text: 'Réponse générée avec succès.'
      });
      
    } catch (err: any) {
      console.error('Erreur lors de la génération de la réponse:', err);
      setResponseMessage({
        type: 'error',
        text: `Erreur: ${err.message || 'Erreur lors de la génération de la réponse automatique'}`
      });
    } finally {
      setGeneratingResponse(false);
      console.log("Fin de la génération de réponse");
    }
  };

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="space-y-6 mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex justify-between items-center bg-white p-5 rounded-lg shadow-md border-l-4 border-indigo-600">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">Demandes de devis</h1>
            <span className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              {quoteRequests.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
              }}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm font-medium"
              title={sortOrder === 'desc' ? 'Plus ancien d\'abord' : 'Plus récent d\'abord'}
            >
              <ArrowDownUp className="w-4 h-4 mr-2" />
              {sortOrder === 'desc' ? 'Plus récent' : 'Plus ancien'}
            </button>
            <button
              onClick={() => loadQuoteRequests()}
              className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="relative inline-block">
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
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-5 rounded-lg border-l-4 border-red-500 shadow-sm flex items-start">
            <X className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Chargement des demandes...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Liste des demandes */}
            <div className="w-full lg:w-3/5">
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Client
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Statut
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.length > 0 ? (
                        currentItems.map((request) => (
                          <tr key={request.id} className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedRequest?.id === request.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`} onClick={() => setSelectedRequest(request)}>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {request.first_name} {request.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {request.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{request.event_date}</div>
                              <div className="text-sm text-gray-500">{request.created_at && formatDate(request.created_at)}</div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status || 'pending')}`}>
                                {getStatusLabel(request.status || 'pending')}
                              </span>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
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
                          <td colSpan={4} className="px-6 py-10 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <FileText className="h-12 w-12 text-gray-400 mb-3" />
                              <p className="text-gray-500 font-medium">Aucune demande de devis trouvée</p>
                              <p className="text-gray-400 text-sm mt-1">Les nouvelles demandes apparaîtront ici</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
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
                          Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à <span className="font-medium">{Math.min(indexOfLastItem, quoteRequests.length)}</span> sur <span className="font-medium">{quoteRequests.length}</span> résultats
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Précédent</span>
                            &lsaquo;
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border ${currentPage === page ? 'bg-indigo-600 text-white border-indigo-600 z-10' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'} text-sm font-medium`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Suivant</span>
                            &rsaquo;
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Détails de la demande sélectionnée */}
            <div className="w-full lg:w-2/5 space-y-5">
              {selectedRequest ? (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all">
                  <div className="flex justify-between items-start mb-5 pb-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Détails de la demande</h2>
                    <span className={`px-3 py-1.5 text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedRequest.status || 'pending')}`}>
                      {getStatusLabel(selectedRequest.status || 'pending')}
                    </span>
                  </div>
                  
                  <div className="space-y-5">
                    {/* Informations client */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-indigo-500" />
                        Informations client
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Nom</p>
                          <p className="font-medium text-gray-800">{selectedRequest.first_name} {selectedRequest.last_name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Type de client</p>
                          <p className="font-medium text-gray-800">{selectedRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Société</p>
                          <p className="font-medium text-gray-800">{selectedRequest.company || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Email</p>
                          <p className="font-medium text-gray-800 truncate">{selectedRequest.email}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Téléphone</p>
                          <p className="font-medium text-gray-800">{selectedRequest.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Adresse de facturation</p>
                          <p className="font-medium text-gray-800 truncate">{selectedRequest.billing_address || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Code postal</p>
                          <p className="font-medium text-gray-800">{selectedRequest.postal_code || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Ville</p>
                          <p className="font-medium text-gray-800">{selectedRequest.city || '-'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Informations événement */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                        Détails de l'événement
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Date</p>
                          <p className="font-medium text-gray-800">{selectedRequest.event_date}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Durée</p>
                          <p className="font-medium text-gray-800">{selectedRequest.event_duration}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Heure de début</p>
                          <p className="font-medium text-gray-800">{selectedRequest.event_start_time || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Heure de fin</p>
                          <p className="font-medium text-gray-800">{selectedRequest.event_end_time || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Nombre d'invités</p>
                          <p className="font-medium text-gray-800">{selectedRequest.guest_count}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Lieu</p>
                          <p className="font-medium text-gray-800">{selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-500">Description</p>
                        <p className="text-sm mt-1 text-gray-800 bg-white p-2 rounded border border-gray-200">{selectedRequest.description || '-'}</p>
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
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                              <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qté</th>
                              <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Prix</th>
                              <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedRequest.items.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-800">{item.name}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800 text-center">{item.quantity}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800 text-right">{item.price.toFixed(2)}€</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-800 text-right">{(item.quantity * item.price).toFixed(2)}€</td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50">
                              <td colSpan={3} className="px-3 py-2 text-sm font-semibold text-gray-800 text-right">Total TTC</td>
                              <td className="px-3 py-2 text-sm font-bold text-indigo-700 text-right">
                                {selectedRequest.items.reduce((total, item) => total + (item.quantity * item.price), 0).toFixed(2)}€
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Informations de livraison */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <Truck className="h-4 w-4 mr-2 text-indigo-500" />
                        Informations de livraison
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Type de livraison</p>
                          <p className="font-medium text-gray-800">{getDeliveryTypeLabel(selectedRequest.delivery_type)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Date de livraison</p>
                          <p className="font-medium text-gray-800">{selectedRequest.delivery_date || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Créneau horaire</p>
                          <p className="font-medium text-gray-800">{getTimeSlotLabel(selectedRequest.delivery_time_slot)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Date de retrait</p>
                          <p className="font-medium text-gray-800">{selectedRequest.pickup_date || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Adresse de livraison</p>
                          <p className="font-medium text-gray-800 truncate">{selectedRequest.delivery_address || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Ville de livraison</p>
                          <p className="font-medium text-gray-800">{selectedRequest.delivery_city || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Code postal de livraison</p>
                          <p className="font-medium text-gray-800">{selectedRequest.delivery_postal_code || '-'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Informations d'accès */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                        Informations d'accès
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Accès extérieur</p>
                          <p className="font-medium text-gray-800">{getAccessLabel(selectedRequest.exterior_access)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Accès intérieur</p>
                          <p className="font-medium text-gray-800">{getAccessLabel(selectedRequest.interior_access)}</p>
                        </div>
                        {selectedRequest.interior_access === 'elevator' && (
                          <>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Dimensions ascenseur (L)</p>
                              <p className="font-medium text-gray-800">{selectedRequest.elevator_width ? `${selectedRequest.elevator_width} cm` : '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Dimensions ascenseur (H)</p>
                              <p className="font-medium text-gray-800">{selectedRequest.elevator_height ? `${selectedRequest.elevator_height} cm` : '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Dimensions ascenseur (P)</p>
                              <p className="font-medium text-gray-800">{selectedRequest.elevator_depth ? `${selectedRequest.elevator_depth} cm` : '-'}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Informations de reprise */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                        Informations de reprise
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Date de reprise</p>
                          <p className="font-medium text-gray-800">{selectedRequest.pickup_return_date || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Heure de début</p>
                          <p className="font-medium text-gray-800">{selectedRequest.pickup_return_start_time || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Heure de fin</p>
                          <p className="font-medium text-gray-800">{selectedRequest.pickup_return_end_time || '-'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Commentaires */}
                    {selectedRequest.comments && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                          Commentaires
                        </h3>
                        <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm text-gray-800">
                          {selectedRequest.comments}
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex flex-col space-y-4 mt-6 sticky bottom-0 bg-white p-4 rounded-lg border border-gray-200 shadow-md">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-700">Actions</h3>
                        <div className="h-px flex-1 bg-gray-200 ml-3"></div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        {selectedRequest.status === 'pending' && (
                          <>
                            <button
onClick={() => selectedRequest.id && handleUpdateStatus(selectedRequest.id, 'approved')}
                              className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approuver
                            </button>
                            <button
onClick={() => selectedRequest.id && handleUpdateStatus(selectedRequest.id, 'rejected')}
                              className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Rejeter
                            </button>
                          </>
                        )}
                        
                        {selectedRequest.status === 'approved' && (
                          <button
onClick={() => selectedRequest.id && handleUpdateStatus(selectedRequest.id, 'completed')}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Marquer comme terminé
                          </button>
                        )}
                        
                        <button
                          onClick={handleGenerateResponse}
                          disabled={generatingResponse}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingResponse ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Génération...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Générer une réponse
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center h-64">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Sélectionnez une demande pour voir les détails</p>
                  </div>
                </div>
              )}

              {/* Affichage de la réponse suggérée */}
              {selectedRequest && suggestedResponse && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 transition-all">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                    <Send className="w-5 h-5 mr-2 text-indigo-600" />
                    Réponse suggérée
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap max-h-96 overflow-y-auto text-gray-700">
                    {suggestedResponse}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(suggestedResponse);
                        setResponseMessage({
                          type: 'success',
                          text: 'Réponse copiée dans le presse-papier'
                        });
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copier la réponse
                    </button>
                  </div>
                </div>
              )}

              {/* Affichage des messages de réponse */}
              {responseMessage && (
                <div className={`p-4 rounded-md border ${responseMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} shadow-sm`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {responseMessage.type === 'success' ? (
                        <Check className="h-5 w-5 text-green-400" />
                      ) : (
                        <X className="h-5 w-5 text-red-400" />
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
              
              {/* Fallback when no request is selected */}
              {!selectedRequest && (
                <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 flex flex-col items-center justify-center text-center h-64">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Aucune demande sélectionnée</h3>
                  <p className="text-gray-500 text-sm max-w-xs">Cliquez sur une demande dans la liste pour afficher ses détails ici.</p>
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
