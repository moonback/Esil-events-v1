import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronRight, Calendar, Tag, MapPin } from 'lucide-react';
import { getAllRealizations, Realization } from '../services/realizationService';
import { useRealizationFilters } from '../hooks/useRealizationFilters';
import {
  RealizationGrid,
  RealizationFilters,
  FilterButton,
  RealizationDetails
} from '../components/realization';
import { motion, AnimatePresence } from 'framer-motion';

const RealisationPage: React.FC = () => {
  const [realizations, setRealizations] = useState<Realization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRealization, setSelectedRealization] = useState<Realization | null>(null);

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="pt-24 pb-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Hero Section avec background animé */}
      <motion.div 
        className="bg-gradient-to-br from-violet-800 via-purple-900 to-indigo-800 text-white py-20 mb-16 relative overflow-hidden rounded-b-3xl shadow-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Particules animées */}
        <div className="absolute inset-0 overflow-hidden z-0">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white opacity-10"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{ 
                x: [0, Math.random() * 50 - 25, 0], 
                y: [0, Math.random() * 50 - 25, 0],
                scale: [1, Math.random() * 0.3 + 1, 1],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: Math.random() * 10 + 10,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        <motion.div 
          className="container mx-auto px-6 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.div
            className="mb-8 flex justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          >
            <div className="h-2 w-20 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full" />
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Nos Réalisations
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto font-light text-purple-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Découvrez nos projets d'événements réalisés pour nos clients. Des mariages aux séminaires d'entreprise, 
            en passant par les lancements de produits et les festivals, explorez notre savoir-faire et notre créativité.
          </motion.p>
          
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <div className="flex flex-wrap gap-4 justify-center">
              {['Mariages', 'Entreprise', 'Festivals', 'Lancements'].map((cat, idx) => (
                <motion.button
                  key={cat}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.toLowerCase() 
                      ? 'bg-white text-violet-800 shadow-lg' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(selectedCategory === cat.toLowerCase() ? '' : cat.toLowerCase())}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + idx * 0.1, duration: 0.5 }}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="container mx-auto px-4">
        {/* Barre de recherche stylisée */}
        <motion.div 
          className="relative max-w-4xl mx-auto -mt-10 mb-12 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-stretch gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-violet-500" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une réalisation..."
                className="pl-12 pr-4 py-4 border-0 rounded-xl w-full shadow-lg focus:ring-2 focus:ring-violet-500 transition-all dark:bg-gray-800 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                </button>
              )}
            </div>
            <div className="lg:hidden">
              <button 
                className={`px-6 py-4 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto font-medium transition-all shadow-lg ${
                  isFilterOpen 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-white text-violet-700 dark:bg-gray-800 dark:text-violet-400'
                }`}
                onClick={toggleFilter}
              >
                <Filter size={18} />
                Filtres
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats ou informations */}
        <motion.div 
          className="mb-12 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Calendar, label: 'Projets', value: `${realizations.length || 0}` },
              { icon: Tag, label: 'Catégories', value: '4+' },
              { icon: MapPin, label: 'Lieux', value: '25+' },
              { icon: ChevronRight, label: 'Satisfaction', value: '98%' }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center justify-center text-center"
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-3">
                  <stat.icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contenu principal avec filtres et grille */}
        <div className="flex flex-col lg:flex-row gap-8">
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
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-violet-600 mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Chargement de nos réalisations...</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {searchFilteredRealizations.length > 0 ? (
                  <div className="mb-4 flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">{searchFilteredRealizations.length}</span> réalisations trouvées
                    </p>
                    {(selectedCategory || dateFilter || searchTerm) && (
                      <button 
                        className="text-violet-600 dark:text-violet-400 text-sm font-medium flex items-center gap-1 hover:text-violet-800 dark:hover:text-violet-300 transition-colors"
                        onClick={resetFilters}
                      >
                        <X size={14} />
                        Effacer les filtres
                      </button>
                    )}
                  </div>
                ) : null}
                
                <RealizationGrid
                  realizations={searchFilteredRealizations}
                  error={error}
                  onViewDetails={handleViewDetails}
                  // animationVariants={itemVariants}
                />
              </motion.div>
            )}
            
            {/* Message si aucun résultat */}
            {!loading && searchFilteredRealizations.length === 0 && (
              <motion.div 
                className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">Aucune réalisation trouvée</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Nous n'avons trouvé aucune réalisation correspondant à vos critères. Essayez d'ajuster vos filtres ou votre recherche.
                </p>
                <button 
                  className="mt-6 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                  onClick={resetFilters}
                >
                  Réinitialiser les filtres
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de détails améliorée */}
      <AnimatePresence>
        {selectedRealization && (
          <RealizationDetails
            realization={selectedRealization}
            onClose={handleCloseDetails}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealisationPage;