import React from 'react';
import { Calendar, Eye, Search, Trash2, Users } from 'lucide-react';
import { QuoteRequest } from '../../../services/quoteRequestService';
import { formatDate, getStatusColor, getStatusLabel } from './QuoteRequestUtils';

interface QuoteRequestListProps {
  currentItems: QuoteRequest[];
  selectedRequest: QuoteRequest | null;
  setSelectedRequest: (request: QuoteRequest) => void;
  setSuggestedResponse: (response: string) => void;
  setFeedbackMessage: (message: { type: 'success' | 'error', text: string } | null) => void;
  handleDeleteRequest: (id: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  filteredRequestsLength: number;
}

const QuoteRequestList: React.FC<QuoteRequestListProps> = ({
  currentItems,
  selectedRequest,
  setSelectedRequest,
  setSuggestedResponse,
  setFeedbackMessage,
  handleDeleteRequest,
  currentPage,
  setCurrentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  filteredRequestsLength
}) => {
  return (
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
                        Affichage de <span className="font-bold">{Math.max(indexOfFirstItem + 1, 1)}</span> à <span className="font-bold">{Math.min(indexOfLastItem, filteredRequestsLength)}</span> sur <span className="font-bold">{filteredRequestsLength}</span> résultats
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50"
                        >
                            <span className="sr-only">Première page</span>
                            <span className="text-xs">«</span>
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-3 py-2 border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50"
                        >
                            <span className="sr-only">Précédent</span>
                            <span className="text-xs">‹</span>
                        </button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Logic to show pages around current page
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${currentPage === pageNum ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 font-bold' : 'bg-white border-indigo-300 text-indigo-500 hover:bg-indigo-50'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        
                        <button
                            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-3 py-2 border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50"
                        >
                            <span className="sr-only">Suivant</span>
                            <span className="text-xs">›</span>
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50"
                        >
                            <span className="sr-only">Dernière page</span>
                            <span className="text-xs">»</span>
                        </button>
                    </nav>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { QuoteRequestList };