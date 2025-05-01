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
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-700">Filtres</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </button>
          <button
            onClick={toggleFilter}
            className="md:hidden flex items-center gap-1 text-sm bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
          >
            {isFilterOpen ? 'Fermer' : 'Filtrer'}
          </button>
        </div>
      </div>

      <div className={`${isFilterOpen ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recherche
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom, référence..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Filtre par catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disponibilité
            </label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as 'all' | 'available' | 'unavailable')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">Tous</option>
              <option value="available">Disponible</option>
              <option value="unavailable">Indisponible</option>
            </select>
          </div>

          {/* Filtre par stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as 'all' | 'inStock' | 'lowStock' | 'outOfStock')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">Tous</option>
              <option value="inStock">En stock</option>
              <option value="lowStock">Stock faible</option>
              <option value="outOfStock">Rupture de stock</option>
            </select>
          </div>
        </div>

        {/* Filtre par prix */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Prix (HT)</h3>
          <div className="space-y-4">
            <div>
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                step="10"
                value={priceRange[0]}
                onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
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
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Max: {priceRange[1]}€</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtre par couleurs */}
        {uniqueColors.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Couleurs</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueColors.map(color => (
                <button
                  key={color}
                  onClick={() => handleColorToggle(color)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all duration-200 ${
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