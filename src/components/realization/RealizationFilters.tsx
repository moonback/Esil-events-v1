import React from 'react';
import { Realization } from '../../services/realizationService';

interface RealizationFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  resetFilters: () => void;
  realizations: Realization[];
  isFilterOpen: boolean;
}

const RealizationFilters: React.FC<RealizationFiltersProps> = ({
  selectedCategory,
  setSelectedCategory,
  dateFilter,
  setDateFilter,
  sortBy,
  setSortBy,
  resetFilters,
  realizations,
  isFilterOpen
}) => {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  // Obtenir les catégories uniques
  const uniqueCategories = Array.from(
    new Set(realizations.map(realization => realization.category).filter(Boolean))
  ) as string[];

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

        {/* Catégories */}
        <div className="mb-6">
          <h4 className="font-medium mb-3 text-gray-900">Catégories</h4>
          <div className="space-y-2">
            <div
              className={`px-3 py-2 rounded-md cursor-pointer ${selectedCategory === '' 
                ? 'bg-violet-100 text-violet-700' 
                : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setSelectedCategory('')}
            >
              Toutes les catégories
            </div>
            {uniqueCategories.map(category => (
              <div
                key={category}
                className={`px-3 py-2 rounded-md cursor-pointer ${selectedCategory === category 
                  ? 'bg-violet-100 text-violet-700' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </div>
            ))}
          </div>
        </div>

        {/* Filtre par date */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Période</h3>
          <div className="space-y-2">
            <div
              className={`px-3 py-2 rounded-md cursor-pointer ${dateFilter === 'all' 
                ? 'bg-violet-100 text-violet-700' 
                : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setDateFilter('all')}
            >
              Toutes les périodes
            </div>
            <div
              className={`px-3 py-2 rounded-md cursor-pointer ${dateFilter === 'upcoming' 
                ? 'bg-violet-100 text-violet-700' 
                : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setDateFilter('upcoming')}
            >
              À venir
            </div>
            <div
              className={`px-3 py-2 rounded-md cursor-pointer ${dateFilter === 'past' 
                ? 'bg-violet-100 text-violet-700' 
                : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setDateFilter('past')}
            >
              Passés
            </div>
            <div
              className={`px-3 py-2 rounded-md cursor-pointer ${dateFilter === 'thisMonth' 
                ? 'bg-violet-100 text-violet-700' 
                : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setDateFilter('thisMonth')}
            >
              Ce mois-ci
            </div>
            <div
              className={`px-3 py-2 rounded-md cursor-pointer ${dateFilter === 'thisYear' 
                ? 'bg-violet-100 text-violet-700' 
                : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setDateFilter('thisYear')}
            >
              Cette année
            </div>
          </div>
        </div>

        {/* Tri */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Trier par</h3>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="date-desc">Date (récent à ancien)</option>
            <option value="date-asc">Date (ancien à récent)</option>
            <option value="title-asc">Titre (A-Z)</option>
            <option value="title-desc">Titre (Z-A)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default RealizationFilters;