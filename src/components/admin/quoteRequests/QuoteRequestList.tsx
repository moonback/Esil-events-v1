import React from 'react';
import { Calendar, Eye, Search, Trash2, Users, Mail, Phone, Building } from 'lucide-react';
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
    <div className="w-full ">
      {/* List Header */}
      <div className="bg-white p-4 rounded-t-xl shadow-md border border-gray-200 border-b-0">
        <h2 className="text-lg font-bold text-gray-800">Liste des demandes</h2>
        <p className="text-sm text-gray-500">
          {filteredRequestsLength} demande{filteredRequestsLength !== 1 ? 's' : ''} trouvée{filteredRequestsLength !== 1 ? 's' : ''}
        </p>
      </div>
      
      {/* Request Cards - Modern card-based approach instead of table */}
      <div className="bg-white rounded-b-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-200">
        {currentItems.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {currentItems.map((request) => (
              <div
                key={request.id}
                className={`p-4 hover:bg-indigo-50 cursor-pointer transition-all duration-200 ${
                  selectedRequest?.id === request.id ? 'bg-indigo-100 border-l-4 border-indigo-500' : ''
                }`}
                onClick={() => {setSelectedRequest(request); setSuggestedResponse(''); setFeedbackMessage(null);}}
              >
                <div className="flex items-start">
                  {/* Avatar/Initial */}
                  <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md mr-4">
                    {request.first_name ? request.first_name[0].toUpperCase() : <Users size={24} />}
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {request.first_name} {request.last_name}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                          {request.email && (
                            <span className="flex items-center">
                              <Mail size={12} className="mr-1 text-indigo-400" />
                              <span className="truncate max-w-[150px]">{request.email}</span>
                            </span>
                          )}
                          {request.phone && (
                            <span className="flex items-center">
                              <Phone size={12} className="mr-1 text-indigo-400" />
                              {request.phone}
                            </span>
                          )}
                          {request.company && (
                            <span className="flex items-center">
                              <Building size={12} className="mr-1 text-indigo-400" />
                              <span className="truncate max-w-[150px]">{request.company}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border shadow-sm ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                    </div>
                    
                    {/* Dates */}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <div className="flex items-center text-gray-700">
                        <Calendar size={12} className="mr-1 text-indigo-400" />
                        <span>Demande: {formatDate(request.created_at)}</span>
                      </div>
                      {request.event_date && (
                        <div className="flex items-center text-gray-700">
                          <Calendar size={12} className="mr-1 text-indigo-400" />
                          <span>Événement: {formatDate(request.event_date.toString()).split(' ')[0]}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(request);
                          setSuggestedResponse('');
                          setFeedbackMessage(null);
                        }}
                        className="p-1.5 rounded-md text-indigo-600 hover:bg-indigo-100 transition-all duration-200"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequest(request.id || '');
                        }}
                        className="p-1.5 rounded-md text-red-600 hover:bg-red-100 transition-all duration-200"
                        title="Supprimer la demande"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <Search className="h-12 w-12 text-indigo-300" />
              </div>
              <p className="font-semibold text-lg text-gray-700">Aucune demande trouvée</p>
              <p className="text-sm mt-1 text-gray-500">Vérifiez vos filtres ou le terme de recherche.</p>
            </div>
          </div>
        )}

        {/* Pagination - Simplified and more modern */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
            <div className="flex-1 flex justify-between items-center">
              <span className="text-sm text-gray-700">
                <span className="font-medium">{Math.max(indexOfFirstItem + 1, 1)}-{Math.min(indexOfLastItem, filteredRequestsLength)}</span> sur <span className="font-medium">{filteredRequestsLength}</span>
              </span>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { QuoteRequestList };