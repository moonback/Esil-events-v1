import React from 'react';
import { Check, X, RefreshCw, FileDown, Printer, Send } from 'lucide-react';
import { QuoteRequest } from '../../services/quoteRequestService';

interface QuoteRequestActionsProps {
  selectedRequest: QuoteRequest;
  handleUpdateStatus: (id: string, status: string) => Promise<void>;
  handleExportPDF: () => Promise<void>;
  handlePrint: () => void;
  handleGenerateResponse: () => Promise<void>;
  generatingResponse: boolean;
  loading: boolean;
}

const QuoteRequestActions: React.FC<QuoteRequestActionsProps> = ({
  selectedRequest,
  handleUpdateStatus,
  handleExportPDF,
  handlePrint,
  handleGenerateResponse,
  generatingResponse,
  loading
}) => {
  return (
    <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-6 border-t border-gray-200 mt-auto shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Actions rapides</h3>
      <div className="flex flex-col space-y-4">
        {/* Status Change Buttons */}
        <div className="grid grid-cols-2 gap-4">
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
                case 'approved': label = 'Approuver'; Icon = Check; colorClass = 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'; break;
                case 'rejected': label = 'Rejeter'; Icon = X; colorClass = 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'; break;
                case 'completed': label = 'Terminer'; Icon = Check; colorClass = 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'; break;
                case 'pending': label = 'Réouvrir'; Icon = RefreshCw; colorClass = 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600'; break;
              }
              return (
                <button
                  key={targetStatus}
                  onClick={() => selectedRequest.id && handleUpdateStatus(selectedRequest.id, targetStatus)}
                  disabled={!selectedRequest.id || loading}
                  className={`flex items-center justify-center px-6 py-3 ${colorClass} text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  <Icon className="w-5 h-5 mr-2" /> {label}
                </button>
              );
            })
          }
        </div>

        {/* Export PDF and Print Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={handleExportPDF}
            disabled={!selectedRequest}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            title="Exporter en PDF"
          >
            <FileDown className="w-5 h-5 mr-2" />
            Exporter PDF
          </button>
          <button
            onClick={handlePrint}
            disabled={!selectedRequest}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            title="Imprimer la demande"
          >
            <Printer className="w-5 h-5 mr-2" />
            Imprimer
          </button>
        </div>

        {/* AI Response Button */}
        <button
          onClick={handleGenerateResponse}
          disabled={generatingResponse || loading || !selectedRequest}
          className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {generatingResponse ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Génération Réponse IA...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Générer Réponse Suggérée (IA)
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuoteRequestActions;