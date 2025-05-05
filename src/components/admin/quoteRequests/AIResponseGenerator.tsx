import React, { useState, useEffect } from 'react';
import { Send, Clipboard, Check, Edit, Mail, ExternalLink, Sparkles, Save, History, Trash2, Download, MessageSquare, X } from 'lucide-react';
import { QuoteRequest } from '../../../services/quoteRequestService';
import { formatDate, formatItemsDetails, calculateTotalAmount, getDeliveryTypeLabel, getTimeSlotLabel } from './QuoteRequestUtils';

interface AIResponseGeneratorProps {
  selectedRequest: QuoteRequest | null;
  suggestedResponse: string;
  generatingResponse: boolean;
  onGenerateResponse: (options?: ResponseOptions) => void;
  onCopyResponse: () => void;
}

interface ResponseOptions {
  tone?: 'formal' | 'friendly' | 'persuasive';
  includePromotion?: boolean;
  focusOnDetails?: boolean;
  responseLength?: 'concise' | 'standard' | 'detailed';
}

interface SavedResponse {
  id: string;
  requestId: string;
  content: string;
  timestamp: number;
  label?: string;
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
  const [responseOptions] = useState<ResponseOptions>({
    tone: 'formal',
    includePromotion: true,
    focusOnDetails: true,
    responseLength: 'standard'
  });
  const [savedResponses, setSavedResponses] = useState<SavedResponse[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedResponse, setEditedResponse] = useState('');
  
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

  // Charger les réponses sauvegardées depuis le localStorage
  useEffect(() => {
    if (selectedRequest?.id) {
      const savedResponsesStr = localStorage.getItem('aiSavedResponses');
      if (savedResponsesStr) {
        const allResponses = JSON.parse(savedResponsesStr) as SavedResponse[];
        const filteredResponses = allResponses.filter(r => r.requestId === selectedRequest.id);
        setSavedResponses(filteredResponses);
      }
    }
  }, [selectedRequest?.id]);

  // Initialiser le mode d'édition avec la réponse suggérée
  useEffect(() => {
    setEditedResponse(suggestedResponse);
  }, [suggestedResponse]);

  const handleGenerateResponse = () => {
    onGenerateResponse(responseOptions);
  };
  
  const saveResponse = () => {
    if (!selectedRequest?.id || !suggestedResponse) return;
    
    const newResponse: SavedResponse = {
      id: Date.now().toString(),
      requestId: selectedRequest.id,
      content: suggestedResponse,
      timestamp: Date.now(),
      label: `Version ${savedResponses.length + 1}`
    };
    
    const savedResponsesStr = localStorage.getItem('aiSavedResponses');
    let allResponses: SavedResponse[] = [];
    
    if (savedResponsesStr) {
      allResponses = JSON.parse(savedResponsesStr);
    }
    
    allResponses.push(newResponse);
    localStorage.setItem('aiSavedResponses', JSON.stringify(allResponses));
    
    setSavedResponses(prev => [...prev, newResponse]);
  };
  
  const loadSavedResponse = (response: SavedResponse) => {
    setEditedResponse(response.content);
    setEditMode(true);
    setShowHistory(false);
  };
  
  const deleteSavedResponse = (id: string) => {
    const savedResponsesStr = localStorage.getItem('aiSavedResponses');
    if (savedResponsesStr) {
      let allResponses = JSON.parse(savedResponsesStr) as SavedResponse[];
      allResponses = allResponses.filter(r => r.id !== id);
      localStorage.setItem('aiSavedResponses', JSON.stringify(allResponses));
      setSavedResponses(prev => prev.filter(r => r.id !== id));
    }
  };
  
  const applyEditedResponse = () => {
    // Ici, vous pourriez implémenter une logique pour sauvegarder la réponse éditée
    // dans le state de l'application parent si nécessaire
    setEditMode(false);
  };
  
  const downloadResponse = () => {
    if (!suggestedResponse) return;
    
    const element = document.createElement('a');
    const file = new Blob([suggestedResponse], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `reponse-devis-${selectedRequest?.id?.substring(0, 8) || 'esil'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" /> Réponse IA
        </h3>
        <div className="flex space-x-2">
          {suggestedResponse && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
            >
              <History className="h-4 w-4 mr-1" />
              Historique
            </button>
          )}
          
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
            {selectedRequest.event_date ? formatDate(selectedRequest.event_date.toString()).split(' ')[0] : '-'}
          </div>
          <div>
            <span className="text-gray-500">Livraison:</span>{' '}
            {getDeliveryTypeLabel(selectedRequest.delivery_type || undefined)}
          </div>
          <div>
            <span className="text-gray-500">Créneau:</span>{' '}
            {getTimeSlotLabel(selectedRequest.delivery_time_slot || undefined)}
          </div>
          <div>
            <span className="text-gray-500">Articles:</span>{' '}
            {selectedRequest.items?.length || 0}
          </div>
          
        </div>
      </div>

      
      

      {/* Historique des réponses */}
      {showHistory && savedResponses.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-inner">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-800 flex items-center">
              <History className="h-4 w-4 mr-1 text-indigo-500" />
              Historique des réponses
            </h4>
            <button 
              onClick={() => setShowHistory(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Fermer
            </button>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {savedResponses.map((response) => (
              <div key={response.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 text-xs">
                <div>
                  <div className="font-medium">{response.label || 'Version sauvegardée'}</div>
                  <div className="text-gray-500">{new Date(response.timestamp).toLocaleString('fr-FR')}</div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => loadSavedResponse(response)}
                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                    title="Charger cette version"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteSavedResponse(response.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Supprimer cette version"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Mode édition */}
      {editMode && suggestedResponse ? (
        <div className="relative">
          <textarea
            value={editedResponse}
            onChange={(e) => setEditedResponse(e.target.value)}
            className="w-full h-[400px] p-4 rounded-lg border border-gray-300 text-sm text-gray-800 font-mono resize-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="flex justify-between mt-4">
            <div className="text-xs text-gray-500">
              {editedResponse.length} caractères • {editedResponse.split(/\s+/).length} mots
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Annuler
              </button>
              <button
                onClick={applyEditedResponse}
                className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-1" />
                Appliquer
              </button>
            </div>
          </div>
        </div>
      ) : suggestedResponse ? (
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
            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveResponse}
                className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                title="Sauvegarder cette réponse"
              >
                <Save className="h-4 w-4 mr-1" />
                Sauvegarder
              </button>
              
              <button
                onClick={downloadResponse}
                className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                title="Télécharger en fichier texte"
              >
                <Download className="h-4 w-4 mr-1" />
                Télécharger
              </button>
              
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
              >
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </button>
              
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
                Cela peut prendre quelques secondes
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
            <li>Utilisez le bouton "Modifier" pour personnaliser la réponse</li>
            <li>Sauvegardez différentes versions pour les comparer ultérieurement</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export { AIResponseGenerator };