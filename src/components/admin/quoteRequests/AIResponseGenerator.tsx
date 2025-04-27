import React, { useState } from 'react';
import { Send, Clipboard, Check, Edit, Mail, ExternalLink, Sparkles, Brain } from 'lucide-react';
import { QuoteRequest } from '../../../services/quoteRequestService';
import { formatDate, formatItemsDetails, calculateTotalAmount, getDeliveryTypeLabel, getTimeSlotLabel } from './QuoteRequestUtils';

interface AIResponseGeneratorProps {
  selectedRequest: QuoteRequest | null;
  suggestedResponse: string;
  generatingResponse: boolean;
  onGenerateResponse: (useReasoner?: boolean) => void;
  onCopyResponse: () => void;
}

const AIResponseGenerator: React.FC<AIResponseGeneratorProps> = ({
  selectedRequest,
  suggestedResponse,
  generatingResponse,
  onGenerateResponse,
  onCopyResponse
}) => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [useReasoner, setUseReasoner] = useState(false);
  
  if (!selectedRequest) return null;

  const handleCopy = () => {
    onCopyResponse();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const openEmailClient = () => {
    if (!selectedRequest.email) return;
    
    const subject = encodeURIComponent(`Votre demande de devis ESIL Events #${selectedRequest.id?.substring(0, 8).toUpperCase() || 'N/A'}`);
    const body = encodeURIComponent(suggestedResponse);
    window.open(`mailto:${selectedRequest.email}?subject=${subject}&body=${body}`);
  };

  const handleGenerateResponse = () => {
    onGenerateResponse(useReasoner);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" /> Réponse IA
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            disabled={!suggestedResponse}
            className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showPreview ? (
              <>
                <Edit className="h-4 w-4 mr-1" />
                Éditer
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-1" />
                Aperçu
              </>
            )}
          </button>
          
          <button
            onClick={handleGenerateResponse}
            disabled={generatingResponse}
            className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4 mr-1" />
            {generatingResponse ? 'Génération...' : 'Générer'}
          </button>
        </div>
      </div>

      {/* Quote Request Summary - Using the imported utility functions */}
      <div className="bg-gray-50 p-3 rounded-md text-xs border border-gray-200 mb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Résumé de la demande</span>
          <span className="text-indigo-600 font-medium">
            Total: {calculateTotalAmount(selectedRequest)}€
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-gray-500">Date événement:</span>{' '}
            {selectedRequest.event_date ? formatDate(selectedRequest.event_date).split(' ')[0] : '-'}
          </div>
          <div>
            <span className="text-gray-500">Livraison:</span>{' '}
            {getDeliveryTypeLabel(selectedRequest.delivery_type)}
          </div>
          <div>
            <span className="text-gray-500">Créneau:</span>{' '}
            {getTimeSlotLabel(selectedRequest.delivery_time_slot)}
          </div>
          <div>
            <span className="text-gray-500">Articles:</span>{' '}
            {selectedRequest.items?.length || 0}
          </div>
          
        </div>
      </div>

      {/* Reasoner toggle */}
      <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={useReasoner}
            onChange={() => setUseReasoner(!useReasoner)}
            className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
            disabled={generatingResponse}
          />
          <span className="ml-2 text-sm text-gray-700 flex items-center">
            <Brain className="h-4 w-4 mr-1 text-indigo-500" />
            Utiliser le raisonnement avancé
          </span>
        </label>
        <div className="text-xs text-gray-500 italic">
          {useReasoner ? "Génère des réponses plus réfléchies (peut prendre plus de temps)" : "Mode standard"}
        </div>
      </div>

      {suggestedResponse ? (
        <div className="relative">
          {showPreview ? (
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto shadow-inner">
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: suggestedResponse.replace(/\n/g, '<br/>') }} />
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto font-mono">
              {suggestedResponse}
            </div>
          )}
          
          <div className="flex justify-between mt-4">
            <div className="text-xs text-gray-500">
              {suggestedResponse.length} caractères • {suggestedResponse.split(/\s+/).length} mots
            </div>
            <div className="flex space-x-2">
              {selectedRequest.email && (
                <button
                  onClick={openEmailClient}
                  className="flex items-center px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 transition-colors"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Envoyer par email
                </button>
              )}
              <button
                onClick={handleCopy}
                className={`flex items-center px-3 py-1.5 ${copied ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'} text-sm rounded-md hover:bg-gray-200 transition-colors`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copié!
                  </>
                ) : (
                  <>
                    <Clipboard className="h-4 w-4 mr-1" />
                    Copier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-500 italic">
          {generatingResponse ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
              <p className="font-medium">Génération de la réponse en cours...</p>
              <p className="text-xs mt-2">
                {useReasoner ? "Raisonnement avancé activé - cela peut prendre plus de temps" : "Cela peut prendre quelques secondes"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Sparkles className="h-10 w-10 text-indigo-300 mb-3" />
              <p>Cliquez sur 'Générer' pour créer une réponse personnalisée basée sur les détails de cette demande.</p>
              <p className="text-xs mt-3">La réponse sera adaptée au profil du client et aux spécificités de l'événement.</p>
            </div>
          )}
        </div>
      )}
      
      {suggestedResponse && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-700">
          <p className="font-medium mb-1">Conseils d'utilisation:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Personnalisez davantage la réponse si nécessaire avant de l'envoyer</li>
            <li>Vérifiez les détails spécifiques comme les dates et les prix</li>
            <li>Ajoutez des informations complémentaires sur les produits si pertinent</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export { AIResponseGenerator };