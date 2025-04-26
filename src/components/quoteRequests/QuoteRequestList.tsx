import React from 'react';
import { Search, Users } from 'lucide-react';
import { QuoteRequest } from '../../services/quoteRequestService';
import { formatDate, getStatusColor, getStatusLabel } from '../../utils/formatters';

interface QuoteRequestListProps {
  currentItems: QuoteRequest[];
  selectedRequest: QuoteRequest | null;
  setSelectedRequest: (request: QuoteRequest) => void;
  setSuggestedResponse: (response: string) => void;
  setFeedbackMessage: (message: { type: 'success' | 'error', text: string } | null) => void;
}

const QuoteRequestList: React.FC<QuoteRequestListProps> = ({
  currentItems,
  selectedRequest,
  setSelectedRequest,
  setSuggestedResponse,
  setFeedbackMessage
}) => {
  return (
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
                  onClick={() => {setSelectedRequest(request); setSuggestedResponse(''); setFeedbackMessage(null);}}
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
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
                      <Search className="h-5 w-5" />
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
    </div>
  );
};

export default QuoteRequestList;