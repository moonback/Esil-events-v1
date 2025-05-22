import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/Product';
import { Category } from '../../services/categoryService';
import CategoryModal from './CategoryModal';

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
  const [minMaxPrice, setMinMaxPrice] = useState<[number, number]>([0, 1000]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
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
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };
  
  const handleColorToggle = (color: string) => {
    setSelectedColors(
      selectedColors.includes(color)
        ? selectedColors.filter(c => c !== color)
        : [...selectedColors, color]
    );
  };
  
  const handleAvailabilityChange = (value: 'all' | 'available' | 'unavailable') => {
    setAvailability(value);
  };
  
  // Category rendering helper function for cleaner JSX
  const renderCategory = (category: Category, isActive: boolean) => (
    <Link
      to={`/products/${category.slug}`}
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
    <div className="">
      {/* Floating category button */}
      <button
        onClick={() => setIsCategoryModalOpen(true)}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 bg-violet-600 text-white p-3 rounded-full shadow-lg hover:bg-violet-700 transition-colors"
        aria-label="Afficher les catégories"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        currentCategory={currentCategory}
        currentSubcategory={currentSubcategory}
        currentSubsubcategory={currentSubsubcategory}
      />

      
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