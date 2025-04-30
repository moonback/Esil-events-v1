import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Category, Subcategory, SubSubcategory } from '../services/categoryService';
import { generateSeoContent, SeoGenerationOptions } from '../services/seoContentService';

interface SeoContentGeneratorProps {
  item: Partial<Category | Subcategory | SubSubcategory>;
  itemType: 'category' | 'subcategory' | 'subsubcategory';
  onContentGenerated: (seoContent: { seo_title: string; seo_description: string; seo_keywords: string }) => void;
  options?: SeoGenerationOptions;
}

const SeoContentGenerator: React.FC<SeoContentGeneratorProps> = ({
  item,
  itemType,
  onContentGenerated,
  options
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSeoContent = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateSeoContent(item, itemType, options);
      
      if (result.error) {
        setError(result.error);
      } else if (result.seoContent) {
        onContentGenerated(result.seoContent);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la génération du contenu SEO');
      console.error('Erreur lors de la génération du contenu SEO:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 mt-1">
      <button
        type="button"
        onClick={handleGenerateSeoContent}
        disabled={isGenerating}
        className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="h-4 w-4 mr-1" />
        {isGenerating ? 'Génération en cours...' : 'Générer SEO'}
      </button>
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default SeoContentGenerator;