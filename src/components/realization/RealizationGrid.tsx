import React, { useState, useMemo } from 'react';
import { Realization } from '../../services/realizationService';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, Calendar, MapPin, Tag, ArrowUpDown, Eye } from 'lucide-react';

interface RealizationGridProps {
  realizations: Realization[];
  error: string | null;
  onViewDetails: (realization: Realization) => void;
  animationVariants?: any;
}

const RealizationGrid: React.FC<RealizationGridProps> = ({ realizations, error, onViewDetails, animationVariants }) => {
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [filters, setFilters] = useState<{
    category: string | null;
    searchTerm: string;
  }>({
    category: null,
    searchTerm: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extract unique categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    realizations.forEach(r => {
      if (r.category) uniqueCategories.add(r.category);
    });
    return Array.from(uniqueCategories);
  }, [realizations]);

  // Apply filters and sorting
  const filteredRealizations = useMemo(() => {
    return realizations
      .filter(r => {
        // Apply category filter
        if (filters.category && r.category !== filters.category) {
          return false;
        }
        
        // Apply search term filter
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          return r.title.toLowerCase().includes(searchLower) || 
                 r.location.toLowerCase().includes(searchLower) ||
                 (r.category && r.category.toLowerCase().includes(searchLower));
        }
        
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.event_date || 0).getTime() - new Date(a.event_date || 0).getTime();
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  }, [realizations, filters, sortBy]);

  const resetFilters = () => {
    setFilters({ category: null, searchTerm: '' });
    setSortBy('date');
  };

  // Animation variants for items
  const defaultVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const variants = animationVariants || defaultVariants;

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6" role="alert">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and sort controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <select
            value={filters.category || ''}
            onChange={(e) => setFilters({...filters, category: e.target.value || null})}
            className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-3">
          {/* View mode toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 flex items-center ${viewMode === 'grid' ? 'bg-violet-100 text-violet-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              aria-label="Vue en grille"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 flex items-center ${viewMode === 'list' ? 'bg-violet-100 text-violet-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              aria-label="Vue en liste"
            >
              <List size={18} />
            </button>
          </div>
          
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
            className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          >
            <option value="date">Trier par date</option>
            <option value="title">Trier par titre</option>
          </select>
          
          <button 
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-violet-500 focus:outline-none transition-colors duration-200"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-gray-600">
        {filteredRealizations.length} {filteredRealizations.length === 1 ? 'réalisation trouvée' : 'réalisations trouvées'}
      </div>

      {/* Empty state */}
      {filteredRealizations.length === 0 && (
        <motion.div 
          className="bg-white p-12 rounded-xl shadow-lg text-center border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <svg 
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 21a9 9 0 110-18 9 9 0 010 18z" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Aucune réalisation trouvée</h3>
          <p className="text-gray-600 text-base max-w-md mx-auto">
            Nous n'avons trouvé aucune réalisation correspondant à vos critères. Essayez d'ajuster vos filtres ou revenez plus tard.
          </p>
          <button 
            onClick={resetFilters} 
            className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200"
          >
            Réinitialiser les filtres
          </button>
        </motion.div>
      )}

      {/* Grid or List view of cards */}
      {filteredRealizations.length > 0 && (
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div 
              key="grid-view"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredRealizations.map((realization) => (
                <motion.div 
                  key={realization.id}
                  variants={variants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <RealizationCard 
                    realization={realization} 
                    onViewDetails={onViewDetails}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredRealizations.map((realization) => (
                <motion.div 
                  key={realization.id}
                  variants={variants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <RealizationListItem 
                    realization={realization} 
                    onViewDetails={onViewDetails}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

interface RealizationCardProps {
  realization: Realization;
  onViewDetails: (realization: Realization) => void;
}

const RealizationCard: React.FC<RealizationCardProps> = ({ realization, onViewDetails }) => {
  // Format date in French locale
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <motion.div 
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onViewDetails(realization)}
      data-testid={`realization-card-${realization.id}`}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {realization.images && realization.images.length > 0 ? (
          <img
            src={realization.images[0]}
            alt={`Image de ${realization.title}`}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-in-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <svg className="w-16 h-16 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {realization.category && (
          <span className="absolute top-3 right-3 px-3 py-1 text-xs font-medium bg-violet-600 text-white rounded-full shadow-md">
            {realization.category}
          </span>
        )}
      </div>
      <div className="p-5 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors line-clamp-2">
          {realization.title}
        </h3>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <svg className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <p className="truncate">{realization.location}</p>
        </div>
        {realization.event_date && (
          <div className="flex items-center text-xs text-gray-400">
            <svg className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            {formatDate(realization.event_date)}
          </div>
        )}
      </div>
      <div className="bg-violet-50 px-5 py-3 border-t border-gray-100">
        <button
          className="w-full flex items-center justify-center text-sm font-medium text-violet-700 hover:text-violet-900 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(realization);
          }}
        >
          Voir les détails
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

// New component for list view
const RealizationListItem: React.FC<RealizationCardProps> = ({ realization, onViewDetails }) => {
  // Format date in French locale
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <motion.div 
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300"
      whileHover={{ y: -2, boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.05)" }}
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 h-40 md:h-auto relative overflow-hidden bg-gray-100">
          {realization.images && realization.images.length > 0 ? (
            <img
              src={realization.images[0]}
              alt={`Image de ${realization.title}`}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-in-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <svg className="w-12 h-12 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {realization.category && (
            <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium bg-violet-600 text-white rounded-md shadow-sm">
              {realization.category}
            </span>
          )}
        </div>
        
        <div className="md:w-3/4 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
              {realization.title}
            </h3>
            
            <div className="flex flex-wrap gap-3 mb-3">
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-4 h-4 mr-1 text-violet-500" />
                <span>{realization.location}</span>
              </div>
              
              {realization.event_date && (
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1 text-violet-500" />
                  <span>{formatDate(realization.event_date)}</span>
                </div>
              )}
            </div>
            
            {realization.objective && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {realization.objective}
              </p>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => onViewDetails(realization)}
              className="flex items-center px-4 py-2 text-sm font-medium text-violet-700 hover:text-violet-900 hover:bg-violet-50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4 mr-1" />
              Voir les détails
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RealizationGrid;