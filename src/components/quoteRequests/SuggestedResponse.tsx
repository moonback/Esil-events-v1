import React, { useEffect, useState } from 'react';
import { Send, Clipboard, Edit, Check, MessageSquare } from 'lucide-react';
import { QuoteRequest } from '../../services/quoteRequestService';

interface SuggestedResponseProps {
  suggestedResponse: string;
  selectedRequest: QuoteRequest | null;
  setFeedbackMessage: (message: { type: 'success' | 'error', text: string } | null) => void;
}

const SuggestedResponse: React.FC<SuggestedResponseProps> = ({
  suggestedResponse: initialSuggestedResponse,
  selectedRequest,
  setFeedbackMessage
}) => {
  const [suggestedResponse, setSuggestedResponse] = useState(initialSuggestedResponse);
  const [isCopied, setIsCopied] = useState(false);
  
  useEffect(() => {
    setSuggestedResponse(initialSuggestedResponse);
  }, [initialSuggestedResponse]);

  // Listen for messages from the editor window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'SAVE_RESPONSE' && event.data?.requestId === selectedRequest?.id) {
        setSuggestedResponse(event.data.response);
        setFeedbackMessage({
          type: 'success',
          text: 'Réponse mise à jour avec succès.'
        });
        setTimeout(() => setFeedbackMessage(null), 2500);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedRequest, setFeedbackMessage]);

  if (!suggestedResponse || !selectedRequest) return null;

  // Fonction pour copier la réponse dans le presse-papiers
  const handleCopy = () => {
    navigator.clipboard.writeText(suggestedResponse);
    setIsCopied(true);
    setFeedbackMessage({
      type: 'success',
      text: 'Réponse copiée dans le presse-papiers.'
    });
    setTimeout(() => {
      setIsCopied(false);
      setFeedbackMessage(null);
    }, 2500);
  };

  // Fonction pour ouvrir l'éditeur de réponse
  const handleOpenEditor = () => {
    const editorWindow = window.open('', `_blank`, 'width=900,height=700,scrollbars=yes,resizable=yes');
    if (editorWindow) {
      // Escape backticks and dollars for template literal embedding
      const escapedResponse = suggestedResponse
        .replace(/\\/g, '\\\\') // Escape backslashes first
        .replace(/`/g, '\\`')  // Escape backticks
        .replace(/\$/g, '\\$'); // Escape dollar signs

      editorWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Éditer la réponse - ${selectedRequest?.first_name} ${selectedRequest?.last_name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { font-family: Inter, sans-serif; }
                /* Add custom scrollbar styles if desired */
                 ::-webkit-scrollbar { width: 8px; height: 8px; }
                 ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                 ::-webkit-scrollbar-thumb { background: #a8a8a8; border-radius: 10px; }
                 ::-webkit-scrollbar-thumb:hover { background: #888; }
            </style>
          </head>
          <body class="bg-gray-100 p-4 md:p-6">
            <div class="container mx-auto bg-white rounded-lg shadow-lg p-6 flex flex-col h-[calc(100vh-3rem)]">
              <div class="flex justify-between items-center mb-4 pb-3 border-b">
                <h2 class="text-xl font-semibold text-gray-800">Éditer la réponse</h2>
                <div class="text-sm text-gray-500">Pour: ${selectedRequest?.first_name} ${selectedRequest?.last_name}</div>
              </div>

              <textarea
                  id="responseText"
                  spellcheck="true"
                  class="flex-grow w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-indigo-500 focus:border-indigo-500 text-sm leading-relaxed mb-4 font-mono"
                  oninput="handleInput()"
              >${escapedResponse}</textarea>
              <div class="flex justify-between items-center mb-4">
                <div class="text-xs text-gray-500" id="charCount"></div>
                <div class="text-xs text-gray-500 text-right" id="saveStatus"></div>
              </div>

              <div class="flex justify-end items-center gap-3">
                 <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium" onclick="window.close()">
                     Annuler
                 </button>
                 <button class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium" onclick="saveAndClose()">
                     Enregistrer & Fermer
                 </button>
              </div>
            </div>

            <script>
              const textarea = document.getElementById('responseText');
              const saveStatus = document.getElementById('saveStatus');
              const charCount = document.getElementById('charCount');
              const requestId = '${selectedRequest?.id || ''}';
              const storageKey = \`draftResponse_\${requestId}\`;
              let saveTimeout;
              let unsavedChanges = false;

              // Update character count
              function updateCharCount() {
                const count = textarea.value.length;
                charCount.textContent = \`\${count} caractères\`;
              }
              
              // Initial character count
              updateCharCount();

              // Load draft on init
              document.addEventListener('DOMContentLoaded', () => {
                const savedDraft = localStorage.getItem(storageKey);
                // Only restore if the draft is different from the initial text passed in
                if (savedDraft && savedDraft !== textarea.value) {
                  if (confirm('Un brouillon non enregistré a été trouvé pour cette demande. Voulez-vous le restaurer ?')) {
                    textarea.value = savedDraft;
                    updateCharCount();
                  } else {
                     // If user refuses, clear the draft to avoid asking again
                     localStorage.removeItem(storageKey);
                  }
                }
                updateSaveStatus(); // Initial status check
              });

              function handleInput() {
                unsavedChanges = true;
                updateSaveStatus('Modifications non enregistrées...');
                updateCharCount();
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(autoSave, 1500); // Auto-save after 1.5s of inactivity
              }

              function autoSave() {
                if (!unsavedChanges) return;
                localStorage.setItem(storageKey, textarea.value);
                unsavedChanges = false;
                updateSaveStatus('Brouillon enregistré localement');
                console.log('Draft saved to localStorage');
              }

              function updateSaveStatus(message = '') {
                 if (message) {
                    saveStatus.textContent = message;
                 } else {
                     const savedDraft = localStorage.getItem(storageKey);
                     if (savedDraft === textarea.value) {
                        saveStatus.textContent = 'Modifications enregistrées localement';
                     } else {
                        saveStatus.textContent = 'Modifications non enregistrées';
                     }
                 }
              }

              function saveAndClose() {
                const currentResponse = textarea.value;
                console.log('Sending SAVE_RESPONSE message', { requestId, response: currentResponse });
                // Send message to parent window
                if (window.opener && !window.opener.closed) {
                  window.opener.postMessage({
                    type: 'SAVE_RESPONSE',
                    requestId: requestId,
                    response: currentResponse
                  }, window.location.origin); // Be specific about origin if possible
                } else {
                  console.error("Opener window not found or closed.");
                  alert("Impossible de communiquer avec la fenêtre principale. Veuillez copier votre texte manuellement.");
                  return; // Don't close if communication failed
                }

                // Clear the draft from storage after successful save message
                localStorage.removeItem(storageKey);
                unsavedChanges = false; // Mark as saved
                window.close(); // Close the popup
              }

              // Warn before closing if there are unsaved changes
              window.addEventListener('beforeunload', (event) => {
                  autoSave(); // Try one last auto-save
                  if (unsavedChanges) {
                      // Standard way to trigger the browser's confirmation dialog
                      event.preventDefault();
                      event.returnValue = ''; // Required for Chrome
                      return ''; // Required for older browsers
                  }
              });
            </script>
          </body>
        </html>
      `);
      editorWindow.document.close(); // Important to finalize document writing
    } else {
      alert("Impossible d'ouvrir la fenêtre d'édition. Vérifiez les paramètres de votre navigateur (bloqueur de popups).");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 transition-all hover:shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Réponse Suggérée par IA
        </h3>
        <div className="text-xs text-gray-500">
          {suggestedResponse.length} caractères
        </div>
      </div>

      {/* Response content */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap max-h-[400px] overflow-y-auto text-gray-800 text-sm leading-relaxed shadow-inner mb-4 font-mono text-xs">
        {suggestedResponse}
      </div>

      {/* Response Actions */}
      <div className="flex flex-wrap justify-end gap-3">
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 ${isCopied ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-700'} 
            border rounded-md hover:bg-gray-200 transition-all duration-300 shadow-sm flex items-center text-xs font-medium`}
          title="Copier la réponse"
        >
          {isCopied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
              Copié
            </>
          ) : (
            <>
              <Clipboard className="h-3.5 w-3.5 mr-1.5" />
              Copier
            </>
          )}
        </button>
        <button
          onClick={handleOpenEditor}
          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors shadow-sm flex items-center text-xs font-medium"
          title="Éditer la réponse dans une nouvelle fenêtre"
        >
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Éditer
        </button>
        <a
          href={`mailto:${selectedRequest?.email}?subject=${encodeURIComponent(`Votre demande de devis ESIL Events - ${selectedRequest?.company || selectedRequest?.first_name || ''}`)}&body=${encodeURIComponent(suggestedResponse)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-indigo-600 text-white border border-indigo-700 rounded-md hover:bg-indigo-700 transition-colors shadow-sm flex items-center text-xs font-medium"
          title="Ouvrir dans votre client email"
        >
          <Send className="h-3.5 w-3.5 mr-1.5" />
          Envoyer Email
        </a>
      </div>
    </div>
  );
};

export default SuggestedResponse;