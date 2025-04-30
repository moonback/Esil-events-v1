import { useState, useMemo } from 'react';
import { Product } from '../types/Product';

interface UseProductFiltersResult {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  availability: 'all' | 'available' | 'unavailable';
  setAvailability: (availability: 'all' | 'available' | 'unavailable') => void;
  resetFilters: () => void;
  filteredProducts: Product[];
  isFilterOpen: boolean;
  toggleFilter: () => void;
}

export const useProductFilters = (products: Product[], category?: string): UseProductFiltersResult => {
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availability, setAvailability] = useState<'all' | 'available' | 'unavailable'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const resetFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedColors([]);
    setSelectedCategories([]);
    setAvailability('all');
    setSortBy('name-asc');
  };

  // Apply filters and sorting to products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Filter by price
        if (product.priceTTC < priceRange[0] || product.priceTTC > priceRange[1]) {
          return false;
        }
        
        // Filter by availability
        if (availability === 'available' && !product.isAvailable) {
          return false;
        }
        if (availability === 'unavailable' && product.isAvailable) {
          return false;
        }
        
        // Filter by colors
        if (selectedColors.length > 0 && (!product.colors || !product.colors.some(color => selectedColors.includes(color)))) {
          return false;
        }
        
        // Filter by selected categories (if on main page)
        if (!category && selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort products
        switch (sortBy) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'price-asc':
            return a.priceTTC - b.priceTTC;
          case 'price-desc':
            return b.priceTTC - a.priceTTC;
          default:
            return 0;
        }
      });
  }, [products, priceRange, availability, selectedColors, selectedCategories, sortBy, category]);

  return {
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    selectedColors,
    setSelectedColors,
    selectedCategories,
    setSelectedCategories,
    availability,
    setAvailability,
    resetFilters,
    filteredProducts,
    isFilterOpen,
    toggleFilter
  };
};