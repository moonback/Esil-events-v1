import React, { useState, useEffect } from 'react';
import { FileText, Eye, Check, X, RefreshCw } from 'lucide-react';
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

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="space-y-6 mt-12">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Demandes de devis</h1>
          <button
            onClick={() => loadQuoteRequests()}
            className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Liste des demandes */}
            <div className="w-full md:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
            <div className="w-full md:w-1/3">
              {selectedRequest ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold">Détails de la demande</h2>
                    <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedRequest.status || 'pending')}`}>
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
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center h-64">
                  <p className="text-gray-500">Sélectionnez une demande pour voir les détails</p>
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