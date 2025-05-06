import { useState, useMemo } from 'react';
import { Realization } from '../services/realizationService';

interface UseRealizationFiltersResult {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  resetFilters: () => void;
  filteredRealizations: Realization[];
  isFilterOpen: boolean;
  toggleFilter: () => void;
}

export const useRealizationFilters = (realizations: Realization[]): UseRealizationFiltersResult => {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setDateFilter('all');
    setSortBy('date-desc');
  };

  // Apply filters and sorting to realizations
  const filteredRealizations = useMemo(() => {
    return realizations
      .filter(realization => {
        // Filter by category
        if (selectedCategory && realization.category !== selectedCategory) {
          return false;
        }
        
        // Filter by date
        if (dateFilter !== 'all') {
          const today = new Date();
          const realizationDate = realization.event_date ? new Date(realization.event_date) : null;
          
          if (dateFilter === 'past' && (!realizationDate || realizationDate >= today)) {
            return false;
          }
          
          if (dateFilter === 'upcoming' && (!realizationDate || realizationDate < today)) {
            return false;
          }
          
          if (dateFilter === 'thisMonth') {
            if (!realizationDate) return false;
            
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            const realizationMonth = realizationDate.getMonth();
            const realizationYear = realizationDate.getFullYear();
            
            if (realizationMonth !== currentMonth || realizationYear !== currentYear) {
              return false;
            }
          }
          
          if (dateFilter === 'thisYear') {
            if (!realizationDate) return false;
            
            const currentYear = today.getFullYear();
            const realizationYear = realizationDate.getFullYear();
            
            if (realizationYear !== currentYear) {
              return false;
            }
          }
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort realizations
        switch (sortBy) {
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'title-desc':
            return b.title.localeCompare(a.title);
          case 'date-asc':
            const dateA = a.event_date ? new Date(a.event_date) : new Date(0);
            const dateB = b.event_date ? new Date(b.event_date) : new Date(0);
            return dateA.getTime() - dateB.getTime();
          case 'date-desc':
            const dateC = a.event_date ? new Date(a.event_date) : new Date(0);
            const dateD = b.event_date ? new Date(b.event_date) : new Date(0);
            return dateD.getTime() - dateC.getTime();
          default:
            return 0;
        }
      });
  }, [realizations, selectedCategory, dateFilter, sortBy]);

  return {
    selectedCategory,
    setSelectedCategory,
    dateFilter,
    setDateFilter,
    sortBy,
    setSortBy,
    resetFilters,
    filteredRealizations,
    isFilterOpen,
    toggleFilter,
  };
};