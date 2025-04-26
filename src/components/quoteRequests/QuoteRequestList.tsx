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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date Demande</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((request) => (
                <tr
                  key={request.id}
                  className={`hover:bg-indigo-50 cursor-pointer transition-all duration-200 ease-in-out ${
                    selectedRequest?.id === request.id ? 'bg-indigo-100 border-l-4 border-indigo-500 shadow-sm' : ''
                  }`}
                  onClick={() => {setSelectedRequest(request); setSuggestedResponse(''); setFeedbackMessage(null);}}
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center text-indigo-600 shadow-sm">
                        {request.first_name ? request.first_name[0].toUpperCase() : <Users size={20} />}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs hover:text-indigo-600 transition-colors">
                          {request.first_name} {request.last_name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {request.email || request.company || '-'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatDate(request.created_at)}</div>
                    <div className="text-xs text-gray-500">Événement: {request.event_date ? formatDate(request.event_date).split(' ')[0] : '-'}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full border shadow-sm ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(request);
                        setSuggestedResponse('');
                        setFeedbackMessage(null);
                      }}
                      className="p-2.5 rounded-md text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
                    <Search className="h-12 w-12 text-gray-300 mb-4 animate-pulse" />
                    <p className="font-semibold text-lg text-gray-700">Aucune demande trouvée</p>
                    <p className="text-sm mt-1 text-gray-500">Vérifiez vos filtres ou le terme de recherche.</p>
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