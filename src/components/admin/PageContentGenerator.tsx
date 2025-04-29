import React, { useState } from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { PageFormData } from '../../services/pageService';
import { generatePageContent } from '../../services/pageContentService';

interface PageContentGeneratorProps {
  pageData: Partial<PageFormData>;
  onContentGenerated: (content: string) => void;
  onPromptChange?: (prompt: string) => void;
}

const PageContentGenerator: React.FC<PageContentGeneratorProps> = ({
  pageData,
  onContentGenerated,
  onPromptChange
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPromptField, setShowPromptField] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(pageData.custom_prompt || '');

  const handleGenerateContent = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generatePageContent(pageData);
      
      if (result.error) {
        setError(result.error);
      } else if (result.content) {
        onContentGenerated(result.content);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la génération du contenu');
      console.error('Erreur lors de la génération du contenu:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCustomPrompt(value);
    if (onPromptChange) {
      onPromptChange(value);
    }
  };

  const togglePromptField = () => {
    setShowPromptField(!showPromptField);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={handleGenerateContent}
          disabled={isGenerating}
          className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="h-4 w-4 mr-1" />
          {isGenerating ? 'Génération...' : 'Générer du contenu avec IA'}
        </button>
        
        <button
          type="button"
          onClick={togglePromptField}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          {showPromptField ? 'Masquer le prompt' : 'Personnaliser le prompt'}
        </button>
        
        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
      
      {showPromptField && (
        <div className="mt-2">
          <label htmlFor="custom_prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Instructions personnalisées pour l'IA
          </label>
          <textarea
            id="custom_prompt"
            value={customPrompt}
            onChange={handlePromptChange}
            rows={4}
            placeholder="Entrez des instructions spécifiques pour la génération de contenu..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Ces instructions seront utilisées pour guider l'IA dans la génération du contenu de votre page.
          </p>
        </div>
      )}
    </div>
  );
};

export default PageContentGenerator;