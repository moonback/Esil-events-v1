import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ProductFormData } from '../types/Product';
import { generateProductDescription } from '../services/productDescriptionService';

interface ProductDescriptionGeneratorProps {
  productData: Partial<ProductFormData>;
  onDescriptionGenerated: (description: string) => void;
}

const ProductDescriptionGenerator: React.FC<ProductDescriptionGeneratorProps> = ({
  productData,
  onDescriptionGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateDescription = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateProductDescription(productData);
      
      if (result.error) {
        setError(result.error);
      } else if (result.description) {
        onDescriptionGenerated(result.description);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la génération de la description');
      console.error('Erreur lors de la génération de la description:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 mt-1">
      <button
        type="button"
        onClick={handleGenerateDescription}
        disabled={isGenerating}
        className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="h-4 w-4 mr-1" />
        {isGenerating ? 'Génération...' : 'Générer une description'}
      </button>
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProductDescriptionGenerator;