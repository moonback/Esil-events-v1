import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getAllRealizations, Realization } from '../services/realizationService';
import { useRealizationFilters } from '../hooks/useRealizationFilters';
import {
  RealizationGrid,
  RealizationFilters,
  FilterButton,
  RealizationDetails
} from '../components/realization';

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

  return (
    <div className="max-w-10xl mx-auto px-4 py-8 pt-52">
      {/* En-tête de la page */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Nos Réalisations
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          Découvrez nos projets d'événements réalisés pour nos clients. Des mariages aux séminaires d'entreprise, 
          en passant par les lancements de produits et les festivals, explorez notre savoir-faire et notre créativité.
        </p>
      </div>

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
