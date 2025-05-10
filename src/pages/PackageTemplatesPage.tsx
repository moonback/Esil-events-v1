import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, DollarSign, ChevronRight, ShoppingCart } from 'lucide-react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { getAllPackageTemplates } from '../services/packageTemplateService';
import { PackageTemplate } from '../types/PackageTemplate';

const PackageTemplatesPage: React.FC = () => {
  const [packageTemplates, setPackageTemplates] = useState<PackageTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string>('');

  useEffect(() => {
    const fetchPackageTemplates = async () => {
      try {
        setLoading(true);
        const templates = await getAllPackageTemplates();
        // Filtrer uniquement les templates actifs
        const activeTemplates = templates.filter(template => template.is_active);
        setPackageTemplates(activeTemplates);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des modèles de packages:', err);
        setError('Erreur lors du chargement des modèles de packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackageTemplates();
  }, []);

  // Obtenir les types d'événements uniques pour le filtre
  const eventTypes = [
    ...new Set(
      packageTemplates
        .filter(template => template.target_event_type)
        .map(template => template.target_event_type)
    ),
  ];

  // Filtrer les templates par type d'événement si un filtre est sélectionné
  const filteredTemplates = selectedEventType
    ? packageTemplates.filter(template => template.target_event_type === selectedEventType)
    : packageTemplates;

  return (
    <Layout>
      <SEO
        title="Packages Événementiels Pré-configurés | ESIL Events"
        description="Découvrez nos packages événementiels pré-configurés pour vos séminaires, soirées d'entreprise, mariages et autres événements. Personnalisez-les selon vos besoins."
        keywords="packages événementiels, modèles événements, séminaire, soirée entreprise, mariage, événementiel"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">Packages Événementiels</span>
            <span className="block text-indigo-600 dark:text-indigo-400">Pré-configurés</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Sélectionnez un package pré-configuré et personnalisez-le selon vos besoins pour obtenir une estimation de prix en temps réel.
          </p>
        </div>

        {/* Filtres */}
        {eventTypes.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedEventType('')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${!selectedEventType ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
            >
              Tous
            </button>
            {eventTypes.map((type) => (
              <button
                key={type as string}
                onClick={() => setSelectedEventType(type as string)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${selectedEventType === type ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
              >
                {type as string}
              </button>
            ))}
          </div>
        )}

        {/* Affichage du chargement */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Affichage de l'erreur */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Aucun package trouvé */}
        {!loading && !error && filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              Aucun package disponible
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {selectedEventType
                ? `Aucun package disponible pour le type d'événement "${selectedEventType}".`
                : 'Aucun package n\'est disponible pour le moment.'}
            </p>
            {selectedEventType && (
              <button
                onClick={() => setSelectedEventType('')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Voir tous les packages
              </button>
            )}
          </div>
        )}

        {/* Liste des packages */}
        {!loading && !error && filteredTemplates.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg transition-all hover:shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Image du package */}
                <div className="h-48 w-full overflow-hidden">
                  {template.image_url ? (
                    <img
                      src={template.image_url}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Contenu du package */}
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    {template.target_event_type && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Calendar className="-ml-0.5 mr-1.5 h-3 w-3" />
                        {template.target_event_type}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-3">
                    {template.description || 'Aucune description disponible.'}
                  </p>

                  {template.base_price && (
                    <div className="mt-4 flex items-center text-gray-900 dark:text-white">
                      <DollarSign className="h-5 w-5 text-indigo-500" />
                      <span className="text-xl font-bold">
                        À partir de {template.base_price.toFixed(2)} €
                      </span>
                    </div>
                  )}

                  <div className="mt-6">
                    <Link
                      to={`/package/${template.slug}`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Personnaliser
                      <ChevronRight className="ml-2 -mr-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section d'appel à l'action */}
        <div className="mt-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Besoin d'un package sur mesure ?
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Nos packages pré-configurés ne correspondent pas exactement à vos besoins ? Contactez-nous pour une solution entièrement personnalisée.
          </p>
          <div className="mt-6">
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PackageTemplatesPage;