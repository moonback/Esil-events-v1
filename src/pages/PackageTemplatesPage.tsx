import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, DollarSign, ChevronRight, ShoppingCart, ArrowUpDown } from 'lucide-react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { getAllPackageTemplates } from '../services/packageTemplateService';
import { PackageTemplate } from '../types/PackageTemplate';
import { useNotification } from '../components/AdminNotification';
import { motion, AnimatePresence } from 'framer-motion';

type SortField = 'name' | 'base_price' | 'order_index';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 9;

const PackageTemplatesPage: React.FC = () => {
  const [packageTemplates, setPackageTemplates] = useState<PackageTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('order_index');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { showNotification } = useNotification();

  // Fetch packages with error handling and retry logic
  const fetchPackageTemplates = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      const templates = await getAllPackageTemplates();
      const activeTemplates = templates.filter(template => template.is_active);
      setPackageTemplates(activeTemplates);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des modèles de packages:', err);
      if (retryCount < 3) {
        setTimeout(() => fetchPackageTemplates(retryCount + 1), 1000 * (retryCount + 1));
      } else {
        setError('Erreur lors du chargement des modèles de packages');
        showNotification('Erreur lors du chargement des modèles de packages', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchPackageTemplates();
  }, [fetchPackageTemplates]);

  // Memoized event types
  const eventTypes = useMemo(() => [
    ...new Set(
      packageTemplates
        .filter(template => template.target_event_type)
        .map(template => template.target_event_type)
    ),
  ], [packageTemplates]);

  // Memoized filtered and sorted templates
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = selectedEventType
      ? packageTemplates.filter(template => template.target_event_type === selectedEventType)
      : packageTemplates;

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      return 0;
    });
  }, [packageTemplates, selectedEventType, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTemplates.length / ITEMS_PER_PAGE);
  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTemplates.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedTemplates, currentPage]);

  // Sort handler
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-b-lg">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Layout>
      <SEO
        title="Packages Événementiels Pré-configurés | ESIL Events"
        description="Découvrez nos packages événementiels pré-configurés pour vos séminaires, soirées d'entreprise, mariages et autres événements. Personnalisez-les selon vos besoins."
        keywords="packages événementiels, modèles événements, séminaire, soirée entreprise, mariage, événementiel"
      />

      <div className="max-w-7xl pt-40 mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section avec animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Packages Événementiels
            </span>
            <span className="block text-indigo-600 dark:text-indigo-400 mt-2">Pré-configurés</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Sélectionnez un package pré-configuré et personnalisez-le selon vos besoins pour obtenir une estimation de prix en temps réel.
          </p>
        </motion.div>

        {/* Filtres et Tri avec animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8 space-y-4"
        >
          {/* Filtres par type d'événement */}
          {eventTypes.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedEventType('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  !selectedEventType 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Tous
              </button>
              {eventTypes.map((type) => (
                <button
                  key={type as string}
                  onClick={() => setSelectedEventType(type as string)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedEventType === type 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {type as string}
                </button>
              ))}
            </div>
          )}

          {/* Options de tri */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => handleSort('name')}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Nom
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </button>
            <button
              onClick={() => handleSort('base_price')}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Prix
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Affichage du chargement */}
        {loading && <LoadingSkeleton />}

        {/* Affichage de l'erreur */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
            <button
              onClick={() => fetchPackageTemplates()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Aucun package trouvé */}
        {!loading && !error && filteredAndSortedTemplates.length === 0 && (
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

        {/* Liste des packages avec animation */}
        {!loading && !error && filteredAndSortedTemplates.length > 0 && (
          <AnimatePresence>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl rounded-xl transition-all duration-300 hover:shadow-2xl border border-gray-200 dark:border-gray-700 transform hover:-translate-y-2"
                >
                  {/* Image du package */}
                  <div className="h-56 w-full overflow-hidden relative group">
                    {template.image_url ? (
                      <img
                        src={template.image_url}
                        alt={template.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Package className="h-16 w-16 text-white opacity-75" />
                      </div>
                    )}
                    {template.target_event_type && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/90 dark:bg-gray-800/90 text-indigo-600 dark:text-indigo-400 shadow-lg">
                          <Calendar className="-ml-0.5 mr-1.5 h-4 w-4" />
                          {template.target_event_type}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenu du package */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {template.name}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                      {template.description || 'Aucune description disponible.'}
                    </p>

                    {template.base_price && (
                      <div className="flex items-center text-gray-900 dark:text-white mb-6">
                        <DollarSign className="h-5 w-5 text-indigo-500" />
                        <span className="text-2xl font-bold ml-1">
                          À partir de {template.base_price.toFixed(2)} €
                        </span>
                      </div>
                    )}

                    <Link
                      to={`/package/${template.slug}`}
                      className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
                    >
                      Personnaliser
                      <ChevronRight className="ml-2 -mr-1 h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Pagination avec animation */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex justify-center space-x-2"
          >
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Précédent
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md ${
                  currentPage === index + 1
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Suivant
            </button>
          </motion.div>
        )}

        {/* Section d'appel à l'action avec animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 text-center shadow-xl"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Besoin d'un package sur mesure ?
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Nos packages pré-configurés ne correspondent pas exactement à vos besoins ? Contactez-nous pour une solution entièrement personnalisée.
          </p>
          <div className="mt-6">
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
            >
              Demander un devis
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PackageTemplatesPage;