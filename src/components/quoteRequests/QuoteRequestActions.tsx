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
    <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 border-t border-gray-200 mt-auto">
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

        {/* Export PDF and Print Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={handleExportPDF}
            disabled={!selectedRequest}
            className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exporter en PDF"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Exporter PDF
          </button>
          <button
            onClick={handlePrint}
            disabled={!selectedRequest}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Imprimer la demande"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </button>
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
              <Send className="w-4 h-4 mr-2" />
              Générer Réponse Suggérée (IA)
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuoteRequestActions;