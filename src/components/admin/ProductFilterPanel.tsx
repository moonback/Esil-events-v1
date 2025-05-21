import React from 'react';
import { Filter, X, Search, Package, Tag, ShoppingCart, Layers, Eye, ArrowUpDown, Copy, BarChart, Hash, FileText, RefreshCw, DollarSign, Box, CheckCircle } from 'lucide-react';
import { Product } from '../../types/Product';

interface ProductFilterPanelProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  availabilityFilter: 'all' | 'available' | 'unavailable';
  setAvailabilityFilter: (value: 'all' | 'available' | 'unavailable') => void;
  stockFilter: 'all' | 'inStock' | 'lowStock' | 'outOfStock';
  setStockFilter: (value: 'all' | 'inStock' | 'lowStock' | 'outOfStock') => void;
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
  products: Product[];
  onReset: () => void;
  isFilterOpen: boolean;
  toggleFilter: () => void;
}

const ProductFilterPanel: React.FC<ProductFilterPanelProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  availabilityFilter,
  setAvailabilityFilter,
  stockFilter,
  setStockFilter,
  selectedColors,
  setSelectedColors,
  products,
  onReset,
  isFilterOpen,
  toggleFilter,
}) => {
  // Obtenir les catégories uniques
  const categories = ['Tous', ...Array.from(new Set(products.map(p => p.category)))];
  
  // Obtenir les couleurs uniques
  const uniqueColors = Array.from(new Set(products.flatMap(product => product.colors || [])));

  // Calculer le prix minimum et maximum pour les sliders
  const minPrice = Math.min(...products.map(p => p.priceHT), 0);
  const maxPrice = Math.max(...products.map(p => p.priceHT), 1000);

  const handlePriceRangeChange = (index: number, value: number) => {
    const newRange = [...priceRange] as [number, number];
    newRange[index] = value;
    setPriceRange(newRange);
  };

  const handleColorToggle = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-violet-500" />
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Filtres</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-violet-600 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </button>
          <button
            onClick={toggleFilter}
            className="flex items-center gap-1 text-sm font-medium bg-violet-50 px-2 py-1.5 rounded-md hover:bg-violet-100 transition-colors duration-200"
          >
            {isFilterOpen ? 'Fermer' : 'Filtrer'}
          </button>
        </div>
      </div>

      <div className={`${isFilterOpen ? 'block' : 'hidden'} space-y-4 transition-all duration-300 ease-in-out overflow-hidden`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Recherche */}
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>

          {/* Filtre par catégorie */}
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Package className="w-4 h-4" />
            <span>Catégorie</span>
          </div>

          {/* Filtre par disponibilité */}
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <CheckCircle className="w-4 h-4" />
            <span>Disponibilité</span>
          </div>

          {/* Filtre par stock */}
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Box className="w-4 h-4" />
            <span>Stock</span>
          </div>
        </div>

        {/* Filtre par prix */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Prix (HT)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Minimum: {priceRange[0]}€</span>
              </div>
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                step="10"
                value={priceRange[0]}
                onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Maximum: {priceRange[1]}€</span>
              </div>
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                step="10"
                value={priceRange[1]}
                onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Filtre par couleurs */}
        {uniqueColors.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-1">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Couleurs</h3>
            <div className="flex flex-wrap gap-1.5">
              {uniqueColors.map(color => (
                <button
                  key={color}
                  onClick={() => handleColorToggle(color)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-200 ${
                    selectedColors.includes(color)
                      ? 'bg-violet-100 border-violet-500 text-violet-700 dark:bg-violet-900 dark:text-violet-200'
                      : 'border-gray-200 hover:border-violet-300 text-gray-700 hover:bg-violet-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-violet-700'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilterPanel;