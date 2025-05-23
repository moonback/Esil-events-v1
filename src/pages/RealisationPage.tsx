import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getAllRealizations, Realization } from '../services/realizationService';
import { useRealizationFilters } from '../hooks/useRealizationFilters';
import { useSearchParams } from 'react-router-dom';
import {
  RealizationGrid,
  RealizationFilters,
  FilterButton,
  RealizationDetails
} from '../components/realization';
import { motion } from 'framer-motion';

const RealisationPage: React.FC = () => {
  const [realizations, setRealizations] = useState<Realization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRealization, setSelectedRealization] = useState<Realization | null>(null);
  const [searchParams] = useSearchParams();

  // Utiliser le hook de filtrage
  const {
    selectedCategory,
    setSelectedCategory,
    dateFilter,
    setDateFilter,
    sortBy,
    setSortBy,
    resetFilters,
    filteredRealizations,
    isFilterOpen,
    toggleFilter
  } = useRealizationFilters(realizations);

  // Charger les réalisations au chargement de la page
  useEffect(() => {
    const fetchRealizations = async () => {
      try {
        setLoading(true);
        const data = await getAllRealizations();
        setRealizations(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des réalisations:', err);
        setError('Impossible de charger les réalisations. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchRealizations();
  }, []);

  // Appliquer le filtre de catégorie depuis l'URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams, setSelectedCategory]);

  // Filtrer les réalisations en fonction du terme de recherche
  const searchFilteredRealizations = filteredRealizations.filter(realization =>
    realization.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    realization.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (realization.category && realization.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Gérer l'affichage des détails d'une réalisation
  const handleViewDetails = (realization: Realization) => {
    setSelectedRealization(realization);
  };

  // Fermer la modal de détails
  const handleCloseDetails = () => {
    setSelectedRealization(null);
  };

  return (
    <div className="pt-28 pb-20 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Hero Section avec background animé */}
      <motion.div 
        className="bg-gradient-to-br from-violet-900 via-black to-indigo-900 text-white py-20 mb-16 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Cercles décoratifs animés */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <motion.div 
            className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500 opacity-10"
            animate={{ 
              x: [0, 20, 0], 
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 10,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-indigo-500 opacity-10"
            animate={{ 
              x: [0, -30, 0], 
              y: [0, 20, 0],
              scale: [1, 1.15, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 12,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-40 right-1/4 w-40 h-40 rounded-full bg-violet-400 opacity-10"
            animate={{ 
              x: [0, 40, 0], 
              y: [0, 30, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 8,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <motion.div 
          className="container mx-auto px-6 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Nos Réalisations
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Découvrez nos projets d'événements réalisés pour nos clients. Des mariages aux séminaires d'entreprise, 
            en passant par les lancements de produits et les festivals, explorez notre savoir-faire et notre créativité.
          </motion.p>
        </motion.div>
      </motion.div>
      

      {/* Barre de recherche et bouton de filtre */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher une réalisation..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="lg:hidden w-full sm:w-auto">
          <FilterButton isFilterOpen={isFilterOpen} toggleFilter={toggleFilter} />
        </div>
      </div>

      {/* Contenu principal avec filtres et grille */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filtres */}
        <RealizationFilters
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          resetFilters={resetFilters}
          realizations={realizations}
          isFilterOpen={isFilterOpen}
        />

        {/* Grille de réalisations */}
        <div className="lg:w-3/4 w-full">
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
            </div>
          ) : (
            <RealizationGrid
              realizations={searchFilteredRealizations}
              error={error}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      </div>

      {/* Modal de détails */}
      {selectedRealization && (
        <RealizationDetails
          realization={selectedRealization}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default RealisationPage;
