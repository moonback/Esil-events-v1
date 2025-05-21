import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/Product';
import { Category } from '../../services/categoryService';
import { motion } from 'framer-motion';
import CategoriesSidebar from './CategoriesSidebar';

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
  setIsFilterOpen: (isOpen: boolean) => void;
  categories: Category[];
  currentCategory?: string;
  currentSubcategory?: string;
  currentSubsubcategory?: string;
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
  isFilterOpen,
  setIsFilterOpen,
  categories,
  currentCategory,
  currentSubcategory,
  currentSubsubcategory
}) => {
  // Calculate min and max prices from actual products
  const [minMaxPrice, setMinMaxPrice] = useState<[number, number]>([0, 1000]);
  
  // Handle mobile filter panel
  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  
  // Extract unique colors from products with memoization
  const availableColors = useMemo(() => {
    if (!products || products.length === 0) return [];
    return Array.from(new Set(products.flatMap(product => product.colors || [])))
      .sort((a, b) => a.localeCompare(b));
  }, [products]);
  
  // Calculate min and max prices from products
  useEffect(() => {
    if (products && products.length > 0) {
      const prices = products.map(product => product.priceTTC);
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setMinMaxPrice([min, max]);
      
      // Reset price range if outside the new bounds
      if (priceRange[0] < min || priceRange[1] > max) {
        setPriceRange([min, max]);
      }
    }
  }, [products]);
  
  const handlePriceRangeChange = (index: number, value: number) => {
    const newRange = [...priceRange] as [number, number];
    newRange[index] = value;
    
    // Ensure min <= max
    if (index === 0 && value > newRange[1]) {
      newRange[1] = value;
    } else if (index === 1 && value < newRange[0]) {
      newRange[0] = value;
    }
    
    setPriceRange(newRange);
    if (window.innerWidth < 1024) { // Seulement sur mobile
      setIsFilterOpen(false);
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    if (window.innerWidth < 1024) { // Seulement sur mobile
      setIsFilterOpen(false);
    }
  };
  
  const handleColorToggle = (color: string) => {
    setSelectedColors(
      selectedColors.includes(color)
        ? selectedColors.filter(c => c !== color)
        : [...selectedColors, color]
    );
    if (window.innerWidth < 1024) { // Seulement sur mobile
      setIsFilterOpen(false);
    }
  };
  
  const handleAvailabilityChange = (value: 'all' | 'available' | 'unavailable') => {
    setAvailability(value);
    if (window.innerWidth < 1024) { // Seulement sur mobile
      setIsFilterOpen(false);
    }
  };
  
  // Category rendering helper function for cleaner JSX
  const renderCategory = (category: Category, isActive: boolean) => (
    <Link
      to={`/products/${category.slug}`}
      onClick={() => {
        if (window.innerWidth < 1024) { // Seulement sur mobile
          setIsFilterOpen(false);
        }
      }}
      className={`flex items-center justify-between w-full text-left text-sm px-2 py-1.5 rounded hover:bg-violet-50 transition-colors ${
        isActive ? 'font-medium text-violet-700 bg-violet-50' : 'text-gray-600 hover:text-violet-700'
      }`}
    >
      <span>{category.name}</span>
      {category.subcategories && category.subcategories.length > 0 && (
        <svg 
          className={`w-3 h-3 transition-transform duration-200 ${isActive ? 'rotate-90 text-violet-700' : 'text-gray-400'}`}
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
      )}
    </Link>
  );

  return (
    <div className="lg:w-1/5 relative">
      {/* Mobile filter toggle button */}
      <motion.button
        onClick={toggleFilterPanel}
        className="lg:hidden fixed bottom-4 right-4 z-10 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label="Toggle filters"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </motion.button>
      
      {/* Filter panel */}
      <div className={`
        lg:block
        ${isFilterOpen ? 'block fixed inset-0 z-50 lg:relative bg-white/95 backdrop-blur-md lg:bg-transparent overflow-auto pb-20 lg:pb-0' : 'hidden'}
      `}>
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-200/20 dark:border-gray-700/20">
          {/* Mobile header with close button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-500">Filtres</h2>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={resetFilters}
                className="text-sm text-violet-600 hover:text-violet-800 transition-colors duration-300"
                aria-label="Réinitialiser les filtres"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Réinitialiser
              </motion.button>
              <motion.button 
                onClick={toggleFilterPanel}
                className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors duration-300"
                aria-label="Fermer les filtres"
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>
          
          {/* Categories */}
          <CategoriesSidebar
            categories={categories}
            currentCategory={currentCategory}
            currentSubcategory={currentSubcategory}
            currentSubsubcategory={currentSubsubcategory}
            setIsFilterOpen={setIsFilterOpen}
            Link={Link}
          />
          
          {/* Price Range Filter */}
          {/* <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full mr-2"></span>
              Prix
              <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full ml-2"></span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-2/5">
                  <label htmlFor="min-price" className="sr-only">Prix minimum</label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                    <input
                      type="number"
                      id="min-price"
                      min={minMaxPrice[0]}
                      max={minMaxPrice[1]}
                      value={priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value) || minMaxPrice[0])}
                      className="focus:ring-violet-500 focus:border-violet-500 block w-full pl-7 pr-3 py-2 sm:text-sm border-gray-300 rounded-lg bg-white/50 backdrop-blur-sm"
                      placeholder="Min"
                    />
                  </div>
                </div>
                <div className="text-gray-500">-</div>
                <div className="w-2/5">
                  <label htmlFor="max-price" className="sr-only">Prix maximum</label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                    <input
                      type="number"
                      id="max-price"
                      min={minMaxPrice[0]}
                      max={minMaxPrice[1]}
                      value={priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value) || minMaxPrice[1])}
                      className="focus:ring-violet-500 focus:border-violet-500 block w-full pl-7 pr-3 py-2 sm:text-sm border-gray-300 rounded-lg bg-white/50 backdrop-blur-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Colors */}
          {availableColors.length > 0 && (
            <div className="mb-8">
              <h4 className="font-medium mb-3 text-gray-900 flex items-center">
                <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full mr-2"></span>
                Couleurs
                <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full ml-2"></span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableColors.map(color => (
                  <motion.button
                    key={color}
                    onClick={() => handleColorToggle(color)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all duration-300 ${
                      selectedColors.includes(color)
                        ? 'bg-gradient-to-r from-violet-100 to-indigo-100 border-violet-500 text-violet-700'
                        : 'border-gray-200 hover:border-violet-300 text-gray-700 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-indigo-50/50'
                    }`}
                    aria-pressed={selectedColors.includes(color)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {color}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Sort By */}
          {/* <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full mr-2"></span>
              Trier par
              <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full ml-2"></span>
            </h3>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm bg-white/50 backdrop-blur-sm"
              aria-label="Trier par"
            >
              <option value="name-asc">Nom (A-Z)</option>
              <option value="name-desc">Nom (Z-A)</option>
              <option value="price-asc">Prix (croissant)</option>
              <option value="price-desc">Prix (décroissant)</option>
              <option value="popularity">Popularité</option>
              <option value="newest">Nouveautés</option>
            </select>
          </div> */}

          {/* Availability Filter */}
          {/* <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full mr-2"></span>
              Disponibilité
              <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full ml-2"></span>
            </h3>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'Tous' },
                { value: 'available', label: 'Disponible' },
                { value: 'unavailable', label: 'Non disponible' }
              ].map((option) => (
                <motion.label 
                  key={option.value} 
                  className="flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    type="radio"
                    checked={availability === option.value}
                    onChange={() => handleAvailabilityChange(option.value as 'all' | 'available' | 'unavailable')}
                    className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                    aria-label={option.label}
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </motion.label>
              ))}
            </div>
          </div> */}
          
          {/* Applied filters summary */}
          {(selectedColors.length > 0 || availability !== 'all' || priceRange[0] > minMaxPrice[0] || priceRange[1] < minMaxPrice[1]) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full mr-2"></span>
                Filtres appliqués
                <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full ml-2"></span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {priceRange[0] > minMaxPrice[0] && (
                  <motion.div 
                    className="bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 text-xs px-2 py-1 rounded-full flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Prix min: {priceRange[0]}€
                    <motion.button 
                      onClick={() => handlePriceRangeChange(0, minMaxPrice[0])}
                      className="ml-1 text-violet-500 hover:text-violet-700"
                      aria-label="Supprimer le filtre de prix minimum"
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </motion.div>
                )}
                
                {priceRange[1] < minMaxPrice[1] && (
                  <motion.div 
                    className="bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 text-xs px-2 py-1 rounded-full flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Prix max: {priceRange[1]}€
                    <motion.button 
                      onClick={() => handlePriceRangeChange(1, minMaxPrice[1])}
                      className="ml-1 text-violet-500 hover:text-violet-700"
                      aria-label="Supprimer le filtre de prix maximum"
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </motion.div>
                )}
                
                {availability !== 'all' && (
                  <motion.div 
                    className="bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 text-xs px-2 py-1 rounded-full flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {availability === 'available' ? 'Disponible' : 'Non disponible'}
                    <motion.button 
                      onClick={() => setAvailability('all')}
                      className="ml-1 text-violet-500 hover:text-violet-700"
                      aria-label="Supprimer le filtre de disponibilité"
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </motion.div>
                )}
                
                {selectedColors.map(color => (
                  <motion.div 
                    key={color} 
                    className="bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 text-xs px-2 py-1 rounded-full flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {color}
                    <motion.button 
                      onClick={() => handleColorToggle(color)}
                      className="ml-1 text-violet-500 hover:text-violet-700"
                      aria-label={`Supprimer le filtre de couleur ${color}`}
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </motion.div>
                ))}
                
                {(selectedColors.length > 0 || availability !== 'all' || priceRange[0] > minMaxPrice[0] || priceRange[1] < minMaxPrice[1]) && (
                  <motion.button
                    onClick={resetFilters}
                    className="text-xs text-violet-700 underline hover:text-violet-900 mt-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Tout effacer
                  </motion.button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isFilterOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 lg:hidden" 
          onClick={toggleFilterPanel}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        ></motion.div>
      )}
    </div>
  );
};

// Add custom scrollbar style to your global CSS
// .custom-scrollbar::-webkit-scrollbar {
//   width: 4px;
// }
// .custom-scrollbar::-webkit-scrollbar-track {
//   background: #f1f1f1;
// }
// .custom-scrollbar::-webkit-scrollbar-thumb {
//   background: #d1d5db;
//   border-radius: 10px;
// }
// .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//   background: #a1a1aa;
// }

export default ProductFilters;