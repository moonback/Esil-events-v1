import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Scale, ChevronUp, ChevronDown, Trash2, AlertCircle } from 'lucide-react';
import { useComparison } from '../../context/ComparisonContext';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/images';

const ComparisonBar: React.FC = () => {
  const { comparisonProducts, removeFromComparison, clearComparison } = useComparison();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Réduire automatiquement la barre après un certain temps d'inactivité
  useEffect(() => {
    if (comparisonProducts.length === 0) return;
    
    const timer = setTimeout(() => {
      if (isExpanded) {
        setIsExpanded(false);
      }
    }, 5000); // 5 secondes
    
    return () => clearTimeout(timer);
  }, [comparisonProducts, isExpanded]);

  if (comparisonProducts.length === 0) {
    return null;
  }

  // Animation classes pour l'expansion et la minimization
  const containerClasses = `fixed transition-all duration-300 ease-in-out z-50 ${
    isMinimized 
      ? 'right-0 bottom-20 left-auto' 
      : 'bottom-0 left-0 right-0'
  }`;

  return (
    <div className={containerClasses}>
      {isMinimized ? (
        // Version minimisée - bouton flottant
        <div 
          className="bg-violet-600 text-white rounded-l-lg shadow-lg p-3 cursor-pointer flex items-center hover:bg-violet-700 transition-colors"
          onClick={() => setIsMinimized(false)}
        >
          <div className="relative">
            <Scale className="h-5 w-5 mr-2" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {comparisonProducts.length}
            </span>
          </div>
          <span className="font-medium">Comparer</span>
        </div>
      ) : (
        // Version normale
        <div className="bg-white border-t border-gray-200 shadow-lg backdrop-blur-sm bg-white/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Bouton pour minimiser */}
              <button 
                onClick={() => setIsMinimized(true)}
                className="absolute -top-3 right-0 bg-violet-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-violet-700 transition-colors"
                aria-label="Minimiser la barre de comparaison"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              
              <div className="py-3 flex flex-col space-y-3">
                {/* En-tête avec le compteur et bouton d'expansion */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-violet-100 p-2 rounded-full">
                      <Scale className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">
                        {comparisonProducts.length} produit{comparisonProducts.length > 1 ? 's' : ''} à comparer
                      </span>
                      <p className="text-sm text-gray-500">
                        {comparisonProducts.length < 3 
                          ? `Ajoutez jusqu'à ${3 - comparisonProducts.length} produit${3 - comparisonProducts.length > 1 ? 's' : ''} de plus`
                          : 'Nombre maximum de produits atteint'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-violet-600 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <span>Réduire</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>Voir les produits</span>
                        <ChevronUp className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Liste des produits et actions */}
                {isExpanded && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-3 overflow-x-auto py-2 max-w-3xl scrollbar-hide">
                      {comparisonProducts.map((product) => (
                        <div key={product.id} className="relative group flex-shrink-0">
                          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group-hover:border-violet-300 transition-all duration-200 bg-white">
                            <img
                              src={product.images && product.images.length > 0 
                                ? (product.mainImageIndex !== undefined && product.images[product.mainImageIndex] 
                                  ? product.images[product.mainImageIndex] 
                                  : product.images[0])
                                : DEFAULT_PRODUCT_IMAGE}
                              alt={product.name}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                          <button
                            onClick={() => removeFromComparison(product.id)}
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                            aria-label={`Retirer ${product.name} de la comparaison`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white text-xs font-medium text-gray-800 px-2 py-1 rounded-full border border-gray-200 shadow-sm whitespace-nowrap max-w-full overflow-hidden truncate">
                            {product.name.length > 15 ? `${product.name.substring(0, 15)}...` : product.name}
                          </div>
                        </div>
                      ))}
                      {comparisonProducts.length < 3 && (
                        <div className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                          <div className="text-center">
                            <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                            <span className="text-xs text-gray-500">Ajouter</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={clearComparison}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Effacer tout</span>
                      </button>
                      <Link
                        to="/compare"
                        className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors shadow-sm hover:shadow-md flex items-center"
                      >
                        <Scale className="h-4 w-4 mr-2" />
                        Comparer
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Ajouter cette classe CSS dans un fichier séparé ou à l'intérieur d'un style global
// pour masquer la barre de défilement tout en permettant le défilement
const scrollbarStyle = `
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
`;

export default ComparisonBar;