import React, { useState, useEffect, useRef } from 'react';
import { Clipboard, Send, Save } from 'lucide-react';

interface ResponseEditorProps {
  response: string;
  requestId: string;
  onResponseChange: (newResponse: string) => void;
  onCopy?: () => void;
  email?: string;
  company?: string;
  firstName?: string;
}

const ResponseEditor: React.FC<ResponseEditorProps> = ({
  response,
  requestId,
  onResponseChange,
  onCopy,
  email,
  company,
  firstName,
}) => {
  const [editorContent, setEditorContent] = useState<string>(response);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const storageKey = `draftResponse_${requestId}`;

  // Initialiser l'éditeur avec la réponse ou un brouillon sauvegardé
  useEffect(() => {
    // Vérifier s'il y a un brouillon sauvegardé
    const savedDraft = localStorage.getItem(storageKey);
    
    if (savedDraft && savedDraft !== response) {
      // Utiliser le brouillon sauvegardé
      setEditorContent(savedDraft);
      setSaveStatus('Brouillon restauré');
      setUnsavedChanges(true);
    } else {
      // Utiliser la réponse fournie
      setEditorContent(response);
      setSaveStatus('');
      setUnsavedChanges(false);
    }
  }, [response, requestId, storageKey]);

  // Mettre à jour le contenu de l'éditeur lorsque la réponse change
  useEffect(() => {
    if (response !== editorContent && !unsavedChanges) {
      setEditorContent(response);
    }
  }, [response]);

  // Fonction pour sauvegarder automatiquement
  const autoSave = () => {
    if (unsavedChanges && editorContent !== response) {
      localStorage.setItem(storageKey, editorContent);
      setSaveStatus('Brouillon enregistré localement');
      console.log('Draft saved to localStorage');
      
      // Notifier le parent du changement
      onResponseChange(editorContent);
    }
  };

  // Gérer les changements dans l'éditeur
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    setUnsavedChanges(true);
    setSaveStatus('Modifications non enregistrées...');
    
    // Annuler le timeout précédent et en créer un nouveau
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Sauvegarder après 1.5 secondes d'inactivité
    saveTimeoutRef.current = setTimeout(autoSave, 1500);
  };

  // Copier le contenu dans le presse-papiers
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editorContent);
      setIsCopied(true);
      if (onCopy) onCopy();
      
      // Réinitialiser l'état après 2 secondes
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie dans le presse-papiers:', err);
      setSaveStatus('Erreur lors de la copie dans le presse-papiers');
    }
  };

  // Sauvegarder manuellement
  const saveManually = () => {
    autoSave();
    setSaveStatus('Sauvegardé avec succès');
    setUnsavedChanges(false);
    
    // Réinitialiser le statut après 2 secondes
    setTimeout(() => {
      setSaveStatus('');
    }, 2000);
  };

  // Nettoyer le timeout lors du démontage du composant
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Sauvegarde finale lors du démontage si nécessaire
        if (unsavedChanges) {
          localStorage.setItem(storageKey, editorContent);
        }
      }
    };
  }, [editorContent, unsavedChanges, storageKey]);

  return (
    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 transition-all response-editor-enter">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Send className="w-5 h-5 text-indigo-600" />
          Réponse Suggérée
        </h3>
        <div className="text-xs text-gray-500">
          {saveStatus && (
            <span className={unsavedChanges ? 'save-pulse' : ''}>{saveStatus}</span>
          )}
        </div>
      </div>

      {/* Éditeur de texte */}
      <textarea
        ref={textareaRef}
        value={editorContent}
        onChange={handleChange}
        className="w-full p-4 rounded-md border border-gray-200 bg-gray-50 whitespace-pre-wrap max-h-[400px] min-h-[200px] overflow-y-auto text-gray-800 text-sm leading-relaxed shadow-inner mb-4 font-mono resize-vertical focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        spellCheck="true"
      />

      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-3">
        <button
          onClick={copyToClipboard}
          className={`px-3 py-1.5 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 transition-colors shadow-sm flex items-center text-xs font-medium ${isCopied ? 'clipboard-pulse' : ''}`}
          title="Copier la réponse"
        >
          <Clipboard className="h-3.5 w-3.5 mr-1.5" />
          {isCopied ? 'Copié !' : 'Copier'}
        </button>
        
        <button
          onClick={saveManually}
          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors shadow-sm flex items-center text-xs font-medium"
          title="Sauvegarder manuellement"
        >
          <Save className="h-3.5 w-3.5 mr-1.5" />
          Sauvegarder
        </button>
        
        {email && (
          <a
            href={`mailto:${email}?subject=${encodeURIComponent(`Votre demande de devis ESIL Events - ${company || firstName || ''}`)}&body=${encodeURIComponent(editorContent)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors shadow-sm flex items-center text-xs font-medium"
            title="Ouvrir dans votre client email"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Envoyer Email
          </a>
        )}
      </div>
    </div>
  );
};

export default ResponseEditor;