import React from 'react';
import { Filter, X } from 'lucide-react';
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
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-6 h-6 text-violet-500" />
          <h2 className="text-xl font-bold text-gray-800">Filtres</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </button>
          <button
            onClick={toggleFilter}
            className="flex items-center gap-2 text-sm font-medium bg-violet-50 px-3 py-2 rounded-lg hover:bg-violet-100 transition-colors duration-200"
          >
            {isFilterOpen ? 'Fermer' : 'Filtrer'}
          </button>
        </div>
      </div>

      <div className={`${isFilterOpen ? 'block' : 'hidden'} space-y-6 transition-all duration-300 ease-in-out`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Recherche
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom, référence..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filtre par catégorie */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Catégorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
            >
              {categories.map((category, index) => (
                <option key={index} value={category === 'Tous' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par disponibilité */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Disponibilité
            </label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as 'all' | 'available' | 'unavailable')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">Tous</option>
              <option value="available">Disponible</option>
              <option value="unavailable">Indisponible</option>
            </select>
          </div>

          {/* Filtre par stock */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Stock
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as 'all' | 'inStock' | 'lowStock' | 'outOfStock')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">Tous</option>
              <option value="inStock">En stock</option>
              <option value="lowStock">Stock faible</option>
              <option value="outOfStock">Rupture de stock</option>
            </select>
          </div>
        </div>

        {/* Filtre par prix */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Prix (HT)</h3>
          <div className="space-y-6">
            <div>
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                step="10"
                value={priceRange[0]}
                onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Min: {priceRange[0]}€</span>
              </div>
            </div>
            <div>
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                step="10"
                value={priceRange[1]}
                onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Max: {priceRange[1]}€</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtre par couleurs */}
        {uniqueColors.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Couleurs</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueColors.map(color => (
                <button
                  key={color}
                  onClick={() => handleColorToggle(color)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                    selectedColors.includes(color)
                      ? 'bg-violet-100 border-violet-500 text-violet-700'
                      : 'border-gray-200 hover:border-violet-300 text-gray-700 hover:bg-violet-50'
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