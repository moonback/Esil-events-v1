import React from 'react';
import { Realization } from '../../services/realizationService';

interface RealizationGridProps {
  realizations: Realization[];
  error: string | null;
  onViewDetails: (realization: Realization) => void;
}

const RealizationGrid: React.FC<RealizationGridProps> = ({ realizations, error, onViewDetails }) => {
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (realizations.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl shadow-lg text-center border border-gray-100">
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
          onClick={() => window.location.reload()} 
          className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200"
        >
          Réinitialiser les filtres
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {realizations.map((realization) => (
        <RealizationCard 
          key={realization.id} 
          realization={realization} 
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

interface RealizationCardProps {
  realization: Realization;
  onViewDetails: (realization: Realization) => void;
}

const RealizationCard: React.FC<RealizationCardProps> = ({ realization, onViewDetails }) => {
  return (
    <div 
      className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onViewDetails(realization)}
    >
      <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden bg-gray-100">
        <img
          src={realization.images && realization.images.length > 0 
            ? realization.images[0]
            : "/images/default-product.svg"}
          alt={realization.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        {realization.category && (
          <span className="inline-block px-2 py-1 text-xs font-medium bg-violet-100 text-violet-800 rounded-full mb-2">
            {realization.category}
          </span>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors">
          {realization.title}
        </h3>
        <p className="text-sm text-gray-500 mb-2">{realization.location}</p>
        {realization.event_date && (
          <p className="text-xs text-gray-400">
            {new Date(realization.event_date).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>
    </div>
  );
};

export default RealizationGrid;