import React from 'react';
import { X } from 'lucide-react';
import { Realization } from '../../services/realizationService';

interface RealizationDetailsProps {
  realization: Realization;
  onClose: () => void;
}

const RealizationDetails: React.FC<RealizationDetailsProps> = ({ realization, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Header avec bouton de fermeture */}
          <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{realization.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Fermer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Galerie d'images */}
            {realization.images && realization.images.length > 0 && (
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {realization.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${realization.title} - Image ${index + 1}`}
                      className="rounded-lg object-cover w-full h-64"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Lieu</h3>
                <p className="text-gray-700">{realization.location}</p>
              </div>
              
              {realization.category && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Catégorie</h3>
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-violet-100 text-violet-800 rounded-full">
                    {realization.category}
                  </span>
                </div>
              )}
              
              {realization.event_date && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Date de l'événement</h3>
                  <p className="text-gray-700">{new Date(realization.event_date).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
            </div>

            {/* Objectif */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Objectif</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{realization.objective}</p>
              </div>
            </div>

            {/* Mission */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Notre mission</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{realization.mission}</p>
              </div>
            </div>

            {/* Témoignage client */}
            {realization.testimonial && (
              <div className="mb-8 bg-violet-50 p-6 rounded-lg border-l-4 border-violet-500">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Témoignage client</h3>
                <p className="text-gray-700 italic text-lg">« {realization.testimonial} »</p>
              </div>
            )}

            {/* Bouton de fermeture en bas */}
            <div className="flex justify-end mt-8">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealizationDetails;