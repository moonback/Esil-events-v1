import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/Product';

interface ProductFiltersProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
  availability: 'all' | 'available' | 'unavailable';
  setAvailability: (availability: 'all' | 'available' | 'unavailable') => void;
  resetFilters: () => void;
  products: Product[];
  isFilterOpen: boolean;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  selectedColors,
  setSelectedColors,
  availability,
  setAvailability,
  resetFilters,
  products,
  isFilterOpen
}) => {
  const handlePriceRangeChange = (index: number, value: number) => {
    const newRange = [...priceRange] as [number, number];
    newRange[index] = value;
    setPriceRange(newRange);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  return (
    <div className={`lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Filtres</h2>
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser
          </button>
        </div>
{/* Categories */}
        <div className="mb-6">
          <h4 className="font-medium mb-3 text-gray-900">Catégories</h4>
          <div className="space-y-1">
            {Array.from(new Set(products.map(product => product.category))).map(category => (
              <div key={category} className="space-y-1">
                <Link
                  to={`/products/${category}`}
                  className="flex items-center justify-between w-full text-left text-sm text-gray-700 hover:text-violet-700 px-2 py-1 rounded hover:bg-violet-50 transition-colors"
                >
                  <span className="font-medium">{category}</span>
                  <svg 
                    className="w-3 h-3 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeWidth="2" 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </Link>
                <div className="ml-3 space-y-1 border-l border-gray-200 pl-2">
                  {Array.from(new Set(products
                    .filter(product => product.category === category)
                    .map(product => product.subCategory)))
                    .map(subcategory => (
                      <div key={subcategory} className="space-y-1">
                        <Link
                          to={`/products/${category}/${subcategory}`}
                          className="flex items-center justify-between w-full text-left text-sm text-gray-600 hover:text-violet-700 px-2 py-1 rounded hover:bg-violet-50 transition-colors"
                        >
                          <span>{subcategory}</span>
                          <svg 
                            className="w-3 h-3 text-gray-400" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeWidth="2" 
                              d="M9 5l7 7-7 7" 
                            />
                          </svg>
                        </Link>
                        <div className="ml-3 space-y-1 border-l border-gray-200 pl-2">
                          {Array.from(new Set(products
                            .filter(product => 
                              product.category === category && 
                              product.subCategory === subcategory)
                            .map(product => product.subSubCategory)))
                            .map(subsubcategory => (
                              <Link
                                key={subsubcategory}
                                to={`/products/${category}/${subcategory}/${subsubcategory}`}
                                className="flex items-center w-full text-left text-sm text-gray-500 hover:text-violet-700 px-2 py-1 rounded hover:bg-violet-50 transition-colors"
                              >
                                <span>{subsubcategory}</span>
                              </Link>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Price Range Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Prix</h3>
          <div className="space-y-4">
            <div>
              <input
                type="range"
                min="0"
                max="1000"
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
                min="0"
                max="1000"
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

        {/* Colors */}
        {/* <div className="mb-8">
          <h4 className="font-medium mb-4 text-gray-900">Couleurs</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(products.flatMap(product => product.colors || []))).map(color => (
              <button
                key={color}
                onClick={() => setSelectedColors((prev: string[]) =>
                  prev.includes(color)
                    ? prev.filter(c => c !== color)
                    : [...prev, color]
                )}
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
        </div> */}
        

        {/* Sort By */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Trier par</h3>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="name-asc">Nom (A-Z)</option>
            <option value="name-desc">Nom (Z-A)</option>
            <option value="price-asc">Prix (croissant)</option>
            <option value="price-desc">Prix (décroissant)</option>
          </select>
        </div>

        {/* Availability Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Disponibilité</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                checked={availability === 'all'}
                onChange={() => setAvailability('all')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Tous</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={availability === 'available'}
                onChange={() => setAvailability('available')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Disponible</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={availability === 'unavailable'}
                onChange={() => setAvailability('unavailable')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Non disponible</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;