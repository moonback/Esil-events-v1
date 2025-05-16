import React from 'react';
import { Calendar, Eye, Search, Trash2, Users, Mail, Phone, Building, Clock, MapPin, Tag, MessageSquare } from 'lucide-react';
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
    <div className="w-full">
      {/* List Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-white p-5 rounded-t-xl shadow-md border border-gray-200 border-b-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Liste des demandes</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredRequestsLength} demande{filteredRequestsLength !== 1 ? 's' : ''} trouvée{filteredRequestsLength !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              Page {currentPage} sur {totalPages}
            </span>
          </div>
        </div>
      </div>
      
      {/* Request Cards */}
      <div className="bg-white rounded-b-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-200">
        {currentItems.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {currentItems.map((request) => (
              <div
                key={request.id}
                className={`p-5 hover:bg-indigo-50/50 cursor-pointer transition-all duration-200 ${
                  selectedRequest?.id === request.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                }`}
                onClick={() => {setSelectedRequest(request); setSuggestedResponse(''); setFeedbackMessage(null);}}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar/Initial */}
                  <div className="flex-shrink-0 h-14 w-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                    {request.first_name ? request.first_name[0].toUpperCase() : <Users size={28} />}
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {request.first_name} {request.last_name}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                          {request.email && (
                            <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                              <Mail size={14} className="mr-2 text-indigo-500" />
                              <span className="truncate max-w-[200px]">{request.email}</span>
                            </span>
                          )}
                          {request.phone && (
                            <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                              <Phone size={14} className="mr-2 text-indigo-500" />
                              {request.phone}
                            </span>
                          )}
                          {request.company && (
                            <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                              <Building size={14} className="mr-2 text-indigo-500" />
                              <span className="truncate max-w-[200px]">{request.company}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full border shadow-sm ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                    </div>
                    
                    {/* Additional Information */}
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      {/* Dates Section */}
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                          <Clock size={14} className="mr-2 text-indigo-500" />
                          <span className="text-sm">Demande: {formatDate(request.created_at)}</span>
                        </div>
                        {request.event_date && (
                          <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                            <Calendar size={14} className="mr-2 text-indigo-500" />
                            <span className="text-sm">Événement: {formatDate(request.event_date.toString()).split(' ')[0]}</span>
                          </div>
                        )}
                      </div>

                      {/* Location and Type Section */}
                      <div className="space-y-2">
                        {request.event_location && (
                          <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                            <MapPin size={14} className="mr-2 text-indigo-500" />
                            <span className="text-sm truncate">{request.event_location}</span>
                          </div>
                        )}
                        {request.delivery_type && (
                          <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                            <Tag size={14} className="mr-2 text-indigo-500" />
                            <span className="text-sm">{request.delivery_type}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description Preview */}
                    {request.description && (
                      <div className="mt-3 flex items-start bg-gray-50 px-3 py-2 rounded-lg">
                        <MessageSquare size={14} className="mr-2 text-indigo-500 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(request);
                          setSuggestedResponse('');
                          setFeedbackMessage(null);
                        }}
                        className="px-3 py-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-all duration-200 flex items-center gap-1.5"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">Détails</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequest(request.id || '');
                        }}
                        className="px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-100 transition-all duration-200 flex items-center gap-1.5"
                        title="Supprimer la demande"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Supprimer</span>
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
              <div className="p-4 bg-indigo-50 rounded-full mb-4">
                <Search className="h-12 w-12 text-indigo-400" />
              </div>
              <p className="font-semibold text-lg text-gray-700">Aucune demande trouvée</p>
              <p className="text-sm mt-1 text-gray-500">Vérifiez vos filtres ou le terme de recherche.</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex-1 flex justify-between items-center">
              <span className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{Math.max(indexOfFirstItem + 1, 1)}</span> à <span className="font-medium">{Math.min(indexOfLastItem, filteredRequestsLength)}</span> sur <span className="font-medium">{filteredRequestsLength}</span> demandes
              </span>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
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