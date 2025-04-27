import React from 'react';
import { Check, X, RefreshCw, FileDown, Printer, Send } from 'lucide-react';
import { QuoteRequest } from '../../../services/quoteRequestService';
import { getStatusLabel } from './QuoteRequestUtils';

interface QuoteRequestActionsProps {
  selectedRequest: QuoteRequest;
  handleUpdateStatus: (id: string, status: string) => Promise<void>;
  handleExportPDF: () => void;
  handlePrint: () => void;
  handleGenerateResponse: () => void;
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
    <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-5 border-t border-gray-200 mt-auto shadow-md">
      <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
        <span className="w-1.5 h-5 bg-indigo-500 rounded-sm mr-2"></span>
        <p className="text-sm text-gray-600">Statut: <span className="font-bold">{getStatusLabel(selectedRequest.status)}</span></p>

        
      </h3>
      <div className="flex flex-col space-y-4">
        
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
              let label = ''; let Icon = Check; let colorClass = ''; let hoverEffect = '';
              switch(targetStatus) {
                case 'approved': 
                  label = 'Approuver'; 
                  Icon = Check; 
                  colorClass = 'bg-gradient-to-r from-green-500 to-green-600 border border-green-600'; 
                  hoverEffect = 'hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:shadow-green-100';
                  break;
                case 'rejected': 
                  label = 'Rejeter'; 
                  Icon = X; 
                  colorClass = 'bg-gradient-to-r from-red-500 to-red-600 border border-red-600'; 
                  hoverEffect = 'hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-100';
                  break;
                case 'completed': 
                  label = 'Terminer'; 
                  Icon = Check; 
                  colorClass = 'bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-600'; 
                  hoverEffect = 'hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-100';
                  break;
                case 'pending': 
                  label = 'Réouvrir'; 
                  Icon = RefreshCw; 
                  colorClass = 'bg-gradient-to-r from-amber-400 to-amber-500 border border-amber-500'; 
                  hoverEffect = 'hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-100';
                  break;
              }
              return (
                <button
                  key={targetStatus}
                  onClick={() => selectedRequest.id && handleUpdateStatus(selectedRequest.id, targetStatus)}
                  disabled={!selectedRequest.id || loading}
                  className={`flex items-center justify-center px-4 py-2.5 ${colorClass} ${hoverEffect} text-white rounded-lg transition-all duration-200 shadow-sm font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5`}
                >
                  <Icon className="w-4 h-4 mr-2" /> {label}
                </button>
              );
            })
          }
        </div>

        {/* Export PDF and Print Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExportPDF}
            disabled={!selectedRequest}
            className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-emerald-100 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            title="Exporter en PDF"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Exporter PDF
          </button>
          <button
            onClick={handlePrint}
            disabled={!selectedRequest}
            className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-blue-100 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            title="Imprimer la demande"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </button>
        </div>

        {/* Generate Response Button */}
        {/* <button
          onClick={handleGenerateResponse}
          disabled={!selectedRequest || generatingResponse}
          className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 border border-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-indigo-100 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
        >
          <Send className="w-4 h-4 mr-2" />
          {generatingResponse ? 'Génération en cours...' : 'Générer une réponse'}
        </button> */}
      </div>
      
    </div>
  );
};

export { QuoteRequestActions };