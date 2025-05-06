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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-2">
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
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onViewDetails(realization)}
    >
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        <img
          src={realization.images && realization.images.length > 0 
            ? realization.images[0]
            : "/images/default-product.svg"}
          alt={realization.title}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-in-out"
        />
        {realization.category && (
          <span className="absolute top-3 right-3 px-3 py-1 text-xs font-medium bg-violet-600 text-white rounded-full shadow-md">
            {realization.category}
          </span>
        )}
      </div>
      <div className="p-5 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors line-clamp-1">
          {realization.title}
        </h3>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <p className="truncate">{realization.location}</p>
        </div>
        {realization.event_date && (
          <div className="flex items-center text-xs text-gray-400">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            {new Date(realization.event_date).toLocaleDateString('fr-FR')}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealizationGrid;