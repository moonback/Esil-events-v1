import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, FileText, Video, Tag, ArrowRight, AlertCircle, Scale, Filter } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { DEFAULT_PRODUCT_IMAGE } from '../constants/images';
import SEO from '../components/SEO';

const ComparePage: React.FC = () => {
  const { comparisonProducts, removeFromComparison, clearComparison } = useComparison();
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleDescription = (productId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const comparisonAttributes = [
    { key: 'name', label: 'Nom', icon: <Tag className="h-4 w-4" />, category: 'general' },
    { key: 'reference', label: 'Référence', icon: <Tag className="h-4 w-4" />, category: 'general' },
    { key: 'priceTTC', label: 'Prix TTC/jour', icon: <Tag className="h-4 w-4" />, category: 'pricing' },
    { key: 'priceHT', label: 'Prix HT/jour', icon: <Tag className="h-4 w-4" />, category: 'pricing' },
    { key: 'description', label: 'Description', icon: <Tag className="h-4 w-4" />, category: 'general' },
    { key: 'colors', label: 'Couleurs disponibles', icon: <Tag className="h-4 w-4" />, category: 'specifications' },
    { key: 'technicalSpecs', label: 'Spécifications techniques', icon: <Tag className="h-4 w-4" />, category: 'specifications' },
    { key: 'technicalDocUrl', label: 'Documentation technique', icon: <FileText className="h-4 w-4" />, category: 'documents' },
    { key: 'videoUrl', label: 'Vidéo', icon: <Video className="h-4 w-4" />, category: 'documents' },
  ];

  const categories = [
    { id: 'general', label: 'Général' },
    { id: 'pricing', label: 'Prix' },
    { id: 'specifications', label: 'Spécifications' },
    { id: 'documents', label: 'Documents' },
  ];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const toggleCategory = (category: string) => {
    const categoryFilters = comparisonAttributes
      .filter(attr => attr.category === category)
      .map(attr => attr.key);

    setSelectedFilters(prev => {
      const allSelected = categoryFilters.every(filter => prev.includes(filter));
      if (allSelected) {
        return prev.filter(f => !categoryFilters.includes(f));
      } else {
        return [...new Set([...prev, ...categoryFilters])];
      }
    });
  };

  const filteredAttributes = selectedFilters.length > 0
    ? comparisonAttributes.filter(attr => selectedFilters.includes(attr.key))
    : comparisonAttributes;

  if (comparisonProducts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="bg-violet-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-violet-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Aucun produit à comparer</h1>
          <p className="text-gray-600 mb-8">Ajoutez des produits à votre comparaison pour les comparer côte à côte.</p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-700 transition-colors shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Parcourir les produits
          </Link>
        </div>
      </div>
    );
  }

  const renderAttributeValue = (product: any, attribute: { key: string; label: string }) => {
    const value = product[attribute.key];

    switch (attribute.key) {
      case 'priceTTC':
      case 'priceHT':
        return (
          <div className="flex items-center justify-center">
            <span className="text-lg font-semibold text-violet-600 bg-violet-50 px-4 py-2 rounded-lg">
              {value.toFixed(2)}€
            </span>
          </div>
        );

      case 'isAvailable':
        return (
          <div className="flex justify-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {value ? 'Disponible' : 'Indisponible'}
            </span>
          </div>
        );

      case 'stock':
        return (
          <div className="flex justify-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              value > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {value > 0 ? `${value} en stock` : 'Rupture de stock'}
            </span>
          </div>
        );

      case 'colors':
        return value && value.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2">
            {value.map((color: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
              >
                <div 
                  className="h-3 w-3 mr-2 rounded-full" 
                  style={{ backgroundColor: color.toLowerCase() }}
                />
                {color}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-500">Non spécifié</span>
        );

      case 'technicalSpecs':
        return value && Object.keys(value).length > 0 ? (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {Object.entries(value).map(([key, val]) => (
              <div key={key} className="text-sm flex justify-between">
                <span className="font-medium text-gray-700">{key}:</span>{' '}
                <span className="text-gray-600 ml-2">{val as string}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-500">Non spécifié</span>
        );

      case 'technicalDocUrl':
        return value ? (
          <div className="flex justify-center">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              Documentation
            </a>
          </div>
        ) : (
          <span className="text-gray-500">Non disponible</span>
        );

      case 'videoUrl':
        return value ? (
          <div className="flex justify-center">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <Video className="h-4 w-4 mr-2" />
              Voir la vidéo
            </a>
          </div>
        ) : (
          <span className="text-gray-500">Non disponible</span>
        );

      case 'description':
        return (
          <div className="prose prose-sm max-w-none">
            {value ? (
              <div>
                <p className={`text-gray-700 ${!expandedDescriptions[product.id] ? 'line-clamp-3' : ''}`}>
                  {value}
                </p>
                {value.length > 100 && (
                  <button 
                    onClick={() => toggleDescription(product.id)}
                    className="text-violet-600 text-sm font-medium hover:text-violet-700 mt-1"
                  >
                    {expandedDescriptions[product.id] ? 'Voir moins' : 'Voir plus'}
                  </button>
                )}
              </div>
            ) : (
              <span className="text-gray-500">Non spécifié</span>
            )}
          </div>
        );

      default:
        return <span className="text-gray-900">{value || 'Non spécifié'}</span>;
    }
  };

  return (
    <>
      <SEO 
        title="Comparaison de produits"
        description="Comparez nos produits côte à côte pour faire le meilleur choix"
      />
      <div className="pt-60">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-8 w-8 text-violet-600" />
            <h1 className="text-3xl font-bold text-gray-900">Comparaison de produits</h1>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">
              Comparez les caractéristiques de vos produits sélectionnés pour faire le meilleur choix
            </p>
            <p className="text-sm text-gray-500">
              Vous pouvez comparer jusqu'à 3 produits simultanément. Utilisez les filtres ci-dessous pour afficher les caractéristiques qui vous intéressent.
            </p>
          </div>
        </div>
      </div>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-gray-100 py-12 mt-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
            <div className="flex gap-4">
              <Link
                to="/products"
                className="inline-flex items-center px-4 py-2 border border-violet-600 text-sm font-medium rounded-lg text-violet-600 bg-white hover:bg-violet-50 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux produits
              </Link>
              <button
                onClick={clearComparison}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <X className="mr-2 h-4 w-4" />
                Effacer tout
              </button>
            </div>

            {/* Filtres */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtres
                {selectedFilters.length > 0 && (
                  <span className="ml-2 bg-violet-100 text-violet-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {selectedFilters.length}
                  </span>
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
                  <div className="space-y-4">
                    {categories.map(category => (
                      <div key={category.id} className="space-y-2">
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="w-full text-left text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors"
                        >
                          {category.label}
                        </button>
                        <div className="space-y-1 pl-4">
                          {comparisonAttributes
                            .filter(attr => attr.category === category.id)
                            .map(attr => (
                              <label
                                key={attr.key}
                                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedFilters.includes(attr.key)}
                                  onChange={() => toggleFilter(attr.key)}
                                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                />
                                <span>{attr.label}</span>
                              </label>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* En-têtes des produits */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-200">
              <div className="col-span-1 flex items-center justify-center md:justify-start">
                <span className="text-lg font-semibold text-gray-700">Produits</span>
              </div>
              {comparisonProducts.map((product) => (
                <div key={product.id} className="col-span-1 relative">
                  <button
                    onClick={() => removeFromComparison(product.id)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors z-10"
                    aria-label="Supprimer de la comparaison"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                  <div className="h-48 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={product.images && product.images.length > 0 
                        ? (product.mainImageIndex !== undefined && product.images[product.mainImageIndex] 
                          ? product.images[product.mainImageIndex] 
                          : product.images[0])
                        : DEFAULT_PRODUCT_IMAGE}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="mt-4 text-center md:text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">Réf: {product.reference}</p>
                    <div className="mt-3">
                      <Link
                        to={`/products/${product.id}`}
                        className="inline-flex items-center text-sm text-violet-600 hover:text-violet-700"
                      >
                        Voir le produit
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tableau de comparaison */}
            <div>
              {filteredAttributes.map((attribute, index) => (
                <div 
                  key={attribute.key} 
                  className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-6 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } border-b border-gray-200 last:border-b-0`}
                >
                  <div className="col-span-1 flex items-center md:justify-start">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-violet-100 rounded-lg">
                        {attribute.icon}
                      </div>
                      <span className="font-medium text-gray-800">{attribute.label}</span>
                    </div>
                  </div>
                  {comparisonProducts.map((product) => (
                    <div key={product.id} className="col-span-1 py-2">
                      {renderAttributeValue(product, attribute)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-700 transition-colors shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComparePage;