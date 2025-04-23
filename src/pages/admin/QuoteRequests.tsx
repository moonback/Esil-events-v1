import React, { useState, useEffect } from 'react';
import { FileText, Eye, Check, X, RefreshCw, Send } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { getQuoteRequests, updateQuoteRequestStatus, QuoteRequest } from '../../services/quoteRequestService';

const QuoteRequestsAdmin: React.FC = () => {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [suggestedResponse, setSuggestedResponse] = useState<string>('');

  const loadQuoteRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await getQuoteRequests();
      
      if (error) {
        throw new Error(error.message);
      }
      
      setQuoteRequests(data || []);
    } catch (err) {
      setError('Erreur lors du chargement des demandes de devis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuoteRequests();
  }, []);

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
  const currentItems = quoteRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(quoteRequests.length / itemsPerPage);

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
          content: "Tu es un assistant spécialisé dans la génération de devis pour une entreprise de location de mobilier événementiel. Génère une réponse professionnelle et détaillée pour le client en français, en te basant sur les informations fournies."
        },
        {
          role: "user",
          content: `Voici les détails de la demande de devis:
          
Client: ${selectedRequest.first_name} ${selectedRequest.last_name}
Email: ${selectedRequest.email}
Téléphone: ${selectedRequest.phone}
Société: ${selectedRequest.company || 'N/A'}
Type de client: ${selectedRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}

Détails de l'événement:
- Date: ${selectedRequest.event_date}
- Durée: ${selectedRequest.event_duration}
- Nombre d'invités: ${selectedRequest.guest_count}
- Lieu: ${selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}
- Description: ${selectedRequest.description}

Articles demandés:
${selectedRequest.items.map(item => `- ${item.name} (${item.quantity} x ${item.price}€) - Total: ${(item.quantity * item.price).toFixed(2)}€`).join('\n')}

Total estimé: ${selectedRequest.items.reduce((total, item) => total + (item.quantity * item.price), 0).toFixed(2)}€

Commentaires additionnels: ${selectedRequest.comments || 'Aucun'}

Génère une réponse de devis professionnelle qui inclut:
1. Une salutation personnalisée
2. Un résumé de leur demande
3. Une confirmation des articles et du prix total
4. Les prochaines étapes pour finaliser la commande
5. Une formule de politesse`
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
      <div className="space-y-6 mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Demandes de devis</h1>
          <button
            onClick={() => loadQuoteRequests()}
            className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200 shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Liste des demandes */}
            <div className="w-full lg:w-3/5">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.length > 0 ? (
                        currentItems.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedRequest(request)}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-gray-500" />
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{request.event_date}</div>
                              <div className="text-sm text-gray-500">{request.created_at && formatDate(request.created_at)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status || 'pending')}`}>
                                {getStatusLabel(request.status || 'pending')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRequest(request);
                                }}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                            Aucune demande de devis trouvée
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
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
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Précédent</span>
                            &lsaquo;
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border ${currentPage === page ? 'bg-black text-white border-black z-10' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'} text-sm font-medium`}
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
            <div className="w-full lg:w-2/5 space-y-4">
              {selectedRequest ? (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Détails de la demande</h2>
                    <span className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedRequest.status || 'pending')}`}>
                      {getStatusLabel(selectedRequest.status || 'pending')}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Informations client */}
                    <div className="p-3 bg-gray-50 rounded-md">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Informations client</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Nom</p>
                          <p className="font-medium">{selectedRequest.first_name} {selectedRequest.last_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Type de client</p>
                          <p className="font-medium">{selectedRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Société</p>
                          <p className="font-medium">{selectedRequest.company}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium">{selectedRequest.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Téléphone</p>
                          <p className="font-medium">{selectedRequest.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Adresse de facturation</p>
                          <p className="font-medium">{selectedRequest.billing_address}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Code postal</p>
                          <p className="font-medium">{selectedRequest.postal_code}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Ville</p>
                          <p className="font-medium">{selectedRequest.city}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Informations événement */}
                    <div className="p-3 bg-gray-50 rounded-md">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Détails de l'événement</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="font-medium">{selectedRequest.event_date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Durée</p>
                          <p className="font-medium">{selectedRequest.event_duration}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Heure de début</p>
                          <p className="font-medium">{selectedRequest.event_start_time}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Heure de fin</p>
                          <p className="font-medium">{selectedRequest.event_end_time}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Nombre d'invités</p>
                          <p className="font-medium">{selectedRequest.guest_count}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Lieu</p>
                          <p className="font-medium">{selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Description</p>
                        <p className="text-sm mt-1">{selectedRequest.description}</p>
                      </div>
                    </div>
                    
                    {/* Informations livraison */}
                    <div className="p-3 bg-gray-50 rounded-md">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Détails de livraison</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Type de livraison</p>
                          <p className="font-medium">
                            {selectedRequest.delivery_type === 'pickup' ? 'Retrait' : 
                             selectedRequest.delivery_type === 'eco' ? 'Livraison éco' : 
                             selectedRequest.delivery_type === 'premium' ? 'Livraison premium' : '-'}
                          </p>
                        </div>
                        {selectedRequest.delivery_type !== 'pickup' && (
                          <>
                            <div>
                              <p className="text-xs text-gray-500">Date livraison</p>
                              <p className="font-medium">{selectedRequest.delivery_date && formatDate(selectedRequest.delivery_date)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Créneau horaire</p>
                              <p className="font-medium">
                                {selectedRequest.delivery_time_slot === 'before9' ? 'Avant 9h' : 
                                 selectedRequest.delivery_time_slot === '9to13' ? '9h-13h' : 
                                 selectedRequest.delivery_time_slot === '13to19' ? '13h-19h' : '-'}
                              </p>
                            </div>
                          </>
                        )}
                        {selectedRequest.delivery_type === 'pickup' && (
                          <div>
                            <p className="text-xs text-gray-500">Date de retrait</p>
                            <p className="font-medium">{selectedRequest.pickup_date && formatDate(selectedRequest.pickup_date)}</p>
                          </div>
                        )}
                      </div>

                      {selectedRequest.delivery_type !== 'pickup' && (
                        <>
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Adresse de livraison</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-500">Adresse</p>
                                <p className="font-medium">{selectedRequest.delivery_address || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Code postal</p>
                                <p className="font-medium">{selectedRequest.delivery_postal_code || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Ville</p>
                                <p className="font-medium">{selectedRequest.delivery_city || '-'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Conditions d'accès</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-500">Accès extérieur</p>
                                <p className="font-medium">
                                  {selectedRequest.exterior_access === 'parking' ? 'Parking' : 
                                   selectedRequest.exterior_access === 'street' ? 'Rue' : '-'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Accès intérieur</p>
                                <p className="font-medium">
                                  {selectedRequest.interior_access === 'stairs' ? 'Escaliers' : 
                                   selectedRequest.interior_access === 'flat' ? 'Plain-pied' : 
                                   selectedRequest.interior_access === 'elevator' ? 'Ascenseur' : '-'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {selectedRequest.interior_access === 'elevator' && (
                            <div className="mt-2 bg-white p-2 rounded border border-gray-200">
                              <h4 className="text-xs font-medium text-gray-700 mb-2">Dimensions de l'ascenseur</h4>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <p className="text-xs text-gray-500">Largeur</p>
                                  <p className="font-medium">{selectedRequest.elevator_width ? `${selectedRequest.elevator_width} cm` : '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Hauteur</p>
                                  <p className="font-medium">{selectedRequest.elevator_height ? `${selectedRequest.elevator_height} cm` : '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Profondeur</p>
                                  <p className="font-medium">{selectedRequest.elevator_depth ? `${selectedRequest.elevator_depth} cm` : '-'}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {selectedRequest.delivery_notes && (
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500">Notes de livraison</p>
                          <p className="text-sm mt-1">{selectedRequest.delivery_notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Informations reprise */}
                    <div className="p-3 bg-gray-50 rounded-md">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Détails de reprise</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Date de reprise</p>
                          <p className="font-medium">{selectedRequest.pickup_return_date || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Plage horaire</p>
                          <p className="font-medium">
                            {selectedRequest.pickup_return_start_time && selectedRequest.pickup_return_end_time
                              ? `${selectedRequest.pickup_return_start_time} - ${selectedRequest.pickup_return_end_time}`
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Articles commandés */}
                    <div className="p-3 bg-gray-50 rounded-md">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Articles réservés</h3>
                      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                        {selectedRequest.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                {item.color && `Couleur: ${item.color}`}
                                {item.size && <span>{item.color ? ' | ' : ''}Taille: {item.size}</span>}
                                {item.material && <span>{item.color || item.size ? ' | ' : ''}Matériau: {item.material}</span>}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{item.quantity} x {item.price}€</p>
                              <p className="text-xs text-gray-500">Total: {(item.quantity * item.price).toFixed(2)}€</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Total du devis */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">Total TTC</p>
                          <p className="font-bold text-lg">
                            {selectedRequest.items.reduce((total, item) => total + (item.quantity * item.price), 0).toFixed(2)}€
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Commentaires */}
                    {selectedRequest.comments && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Commentaires du client</h3>
                        <p className="text-sm">{selectedRequest.comments}</p>
                      </div>
                    )}
                    
                    {/* Date de création */}
                    <div className="text-xs text-gray-500 text-right">
                      Demande créée le: {selectedRequest.created_at && formatDate(selectedRequest.created_at)}
                      {selectedRequest.updated_at && selectedRequest.updated_at !== selectedRequest.created_at && 
                        ` (Mise à jour: ${formatDate(selectedRequest.updated_at)})`}
                    </div>
                    
                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Actions</h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleUpdateStatus(selectedRequest.id!, 'approved')}
                          disabled={selectedRequest.status === 'approved'}
                          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approuver
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedRequest.id!, 'rejected')}
                          disabled={selectedRequest.status === 'rejected'}
                          className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeter
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedRequest.id!, 'completed')}
                          disabled={selectedRequest.status === 'completed'}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Terminer
                        </button>
                        <button
                          onClick={handleGenerateResponse}
                          disabled={generatingResponse}
                          className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          {generatingResponse ? 'Génération...' : 'Générer réponse'}
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
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
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
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default QuoteRequestsAdmin;