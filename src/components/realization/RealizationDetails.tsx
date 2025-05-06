import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Tag, Quote, ArrowLeft, Heart } from 'lucide-react';
import { Realization } from '../../services/realizationService';

interface RealizationDetailsProps {
  realization: Realization;
  onClose: () => void;
}

const RealizationDetails: React.FC<RealizationDetailsProps> = ({ realization, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    realization.images && realization.images.length > 0 ? realization.images[0] : null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    // Simuler un temps de chargement pour l'animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const formattedDate = realization.event_date 
    ? new Date(realization.event_date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col transition-all duration-500 ${
          isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Header avec bouton de fermeture */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm">
          <button
            onClick={onClose}
            className="flex items-center text-gray-500 hover:text-violet-600 transition-colors font-medium group"
            aria-label="Retour"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:translate-x-[-2px] transition-transform" />
            Retour
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                liked 
                  ? 'bg-pink-100 text-pink-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-pink-600' : ''}`} />
              <span>{liked ? 'Aimé' : 'J\'aime'}</span>
            </button>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content area with scrolling */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Hero avec image principale et titre */}
          <div className="relative bg-gradient-to-b from-violet-50 to-white pt-6 pb-8 px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{realization.title}</h2>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {realization.category && (
                <div className="flex items-center text-gray-600">
                  <Tag className="h-4 w-4 mr-1.5 text-violet-600" />
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-violet-100 text-violet-800 rounded-full">
                    {realization.category}
                  </span>
                </div>
              )}
              
              {realization.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1.5 text-violet-600" />
                  <span>{realization.location}</span>
                </div>
              )}
              
              {formattedDate && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-1.5 text-violet-600" />
                  <span>{formattedDate}</span>
                </div>
              )}
            </div>
          </div>

          <div className="px-8 py-6">
            {/* Galerie d'images */}
            {realization.images && realization.images.length > 0 && (
              <div className="mb-10">
                {/* Image principale */}
                <div className="mb-4 relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
                  <img
                    src={selectedImage || realization.images[0]}
                    alt={`${realization.title} - Image principale`}
                    className="object-cover w-full h-full transition-all duration-500"
                  />
                </div>
                
                {/* Vignettes */}
                {realization.images.length > 1 && (
                  <div className="flex overflow-x-auto space-x-3 pb-2 custom-scrollbar">
                    {realization.images.map((img, index) => (
                      <div 
                        key={index}
                        className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === img ? 'border-violet-500 shadow-md' : 'border-transparent hover:border-violet-300'
                        }`}
                        onClick={() => setSelectedImage(img)}
                      >
                        <img
                          src={img}
                          alt={`${realization.title} - Vignette ${index + 1}`}
                          className="h-20 w-32 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contenu principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Colonne gauche: Informations principales */}
              <div className="lg:col-span-2 space-y-8">
                {/* Objectif */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="flex items-center text-xl font-bold mb-4 text-gray-900">
                    <div className="bg-violet-100 text-violet-700 p-2 rounded-lg mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    Objectif
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{realization.objective}</p>
                </div>

                {/* Mission */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="flex items-center text-xl font-bold mb-4 text-gray-900">
                    <div className="bg-violet-100 text-violet-700 p-2 rounded-lg mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    Notre mission
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{realization.mission}</p>
                </div>
              </div>

              {/* Colonne droite: Témoignage et détails */}
              <div className="space-y-6">
                {/* Témoignage client */}
                {realization.testimonial && (
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-xl border border-violet-100 shadow-sm">
                    <div className="flex items-center mb-4">
                      <Quote className="h-6 w-6 text-violet-500 mr-2" />
                      <h3 className="text-xl font-bold text-gray-900">Témoignage client</h3>
                    </div>
                    <p className="text-gray-700 italic text-lg leading-relaxed">« {realization.testimonial} »</p>
                  </div>
                )}
                
                {/* Carte d'infos additionelles */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Détails du projet</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="bg-violet-100 p-1 rounded text-violet-700 mr-3">
                        <Calendar className="h-4 w-4" />
                      </span>
                      <div>
                        <span className="text-sm text-gray-500 block">Date</span>
                        <span className="font-medium">{formattedDate || 'Non spécifiée'}</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-violet-100 p-1 rounded text-violet-700 mr-3">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <div>
                        <span className="text-sm text-gray-500 block">Lieu</span>
                        <span className="font-medium">{realization.location || 'Non spécifié'}</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-violet-100 p-1 rounded text-violet-700 mr-3">
                        <Tag className="h-4 w-4" />
                      </span>
                      <div>
                        <span className="text-sm text-gray-500 block">Catégorie</span>
                        <span className="font-medium">{realization.category || 'Non spécifiée'}</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de fermeture en bas */}
          <div className="sticky bottom-0 bg-white px-8 py-6 border-t border-gray-100">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-violet-600 text-white rounded-full font-medium hover:bg-violet-700 transition-colors shadow-sm hover:shadow flex items-center"
              >
                Fermer
                <X className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealizationDetails;