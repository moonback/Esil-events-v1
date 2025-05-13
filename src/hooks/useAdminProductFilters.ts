import { useState, useMemo } from 'react';
import { Product } from '../types/Product';

interface UseAdminProductFiltersResult {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
  availabilityFilter: 'all' | 'available' | 'unavailable';
  setAvailabilityFilter: (availability: 'all' | 'available' | 'unavailable') => void;
  stockFilter: 'all' | 'inStock' | 'lowStock' | 'outOfStock';
  setStockFilter: (stock: 'all' | 'inStock' | 'lowStock' | 'outOfStock') => void;
  sortField: string;
  setSortField: (field: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
  resetFilters: () => void;
  filteredProducts: Product[];
  isFilterOpen: boolean;
  toggleFilter: () => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  totalPages: number;
  currentItems: Product[];
  indexOfFirstItem: number;
  indexOfLastItem: number;
}

export const useAdminProductFilters = (products: Product[]): UseAdminProductFiltersResult => {
  // Déterminer les valeurs min et max pour le prix
  const minPrice = useMemo(() => Math.min(...products.map(p => p.priceHT), 0), [products]);
  const maxPrice = useMemo(() => Math.max(...products.map(p => p.priceHT), 1000), [products]);

  // États des filtres
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock'>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Filtres cachés par défaut
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const resetFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedColors([]);
    setAvailabilityFilter('all');
    setStockFilter('all');
    setSortField('name');
    setSortDirection('asc');
    setCurrentPage(1);
  };

  // Appliquer les filtres et le tri aux produits
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Filtre par recherche
        const matchesSearch = searchTerm === '' || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.reference.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;
        
        // Filtre par catégorie
        const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
        if (!matchesCategory) return false;
        
        // Filtre par prix
        if (product.priceHT < priceRange[0] || product.priceHT > priceRange[1]) {
          return false;
        }
        
        // Filtre par disponibilité
        if (availabilityFilter === 'available' && !product.isAvailable) {
          return false;
        }
        if (availabilityFilter === 'unavailable' && product.isAvailable) {
          return false;
        }
        
        // Filtre par stock
        if (stockFilter === 'inStock' && product.stock <= 0) {
          return false;
        }
        if (stockFilter === 'lowStock' && (product.stock <= 0 || product.stock >= 5)) {
          return false;
        }
        if (stockFilter === 'outOfStock' && product.stock > 0) {
          return false;
        }
        
        // Filtre par couleurs
        if (selectedColors.length > 0 && (!product.colors || !product.colors.some(color => selectedColors.includes(color)))) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Trier les produits
        let comparison = 0;
        
        if (sortField === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortField === 'price') {
          comparison = a.priceHT - b.priceHT;
        } else if (sortField === 'stock') {
          comparison = a.stock - b.stock;
        } else if (sortField === 'category') {
          comparison = Array.isArray(a.category) 
            ? (a.category[0] || '').localeCompare(Array.isArray(b.category) ? b.category[0] || '' : b.category)
            : a.category.localeCompare(Array.isArray(b.category) ? b.category[0] || '' : b.category);
        } else if (sortField === 'slug') {
          // Gérer le cas où le slug peut être undefined
          if (!a.slug && !b.slug) comparison = 0;
          else if (!a.slug) comparison = 1; // Les produits sans slug apparaissent en dernier
          else if (!b.slug) comparison = -1; // Les produits avec slug apparaissent en premier
          else comparison = a.slug.localeCompare(b.slug);
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [products, searchTerm, selectedCategory, priceRange, availabilityFilter, stockFilter, selectedColors, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return {
    priceRange,
    setPriceRange,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedColors,
    setSelectedColors,
    availabilityFilter,
    setAvailabilityFilter,
    stockFilter,
    setStockFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    resetFilters,
    filteredProducts,
    isFilterOpen,
    toggleFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    currentItems,
    indexOfFirstItem,
    indexOfLastItem
  };
};