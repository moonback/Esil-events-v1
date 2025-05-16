import React, { useState, useEffect } from 'react';
import { Package, FileText, Download, ClipboardList, Search, RefreshCw, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import StatCard from '../../components/admin/StatCard';
import { NotificationContainer } from '../../components/admin/AdminNotification';
import { getAllProducts } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { getQuoteRequests } from '../../services/quoteRequestService';

// Types
interface DashboardStats {
  productsCount: number;
  categoriesCount: number;
  quoteRequestsCount: number;
  recentQuoteRequests: any[];
}

interface QuickAction {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  bgHover: string;
  description?: string;
}

// Composant de chargement
const StatCardSkeleton: React.FC = () => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 animate-pulse">
    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [stats, setStats] = useState<DashboardStats>({
    productsCount: 0,
    categoriesCount: 0,
    quoteRequestsCount: 0,
    recentQuoteRequests: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [products, categories, quoteRequests] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
        getQuoteRequests()
      ]);

      // Get only the 5 most recent quote requests
      const recentQuotes = quoteRequests.data?.slice(0, 5) || [];

      setStats({
        productsCount: products.length,
        categoriesCount: categories.length,
        quoteRequestsCount: quoteRequests.data?.length || 0,
        recentQuoteRequests: recentQuotes
      });
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Remove selectedMonth dependency

  const quickActions: QuickAction[] = [
    {
      title: 'Ajouter un produit',
      icon: <Package className="w-6 h-6 text-blue-600" />,
      onClick: () => navigate('/admin/products?action=new'),
      bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
      description: 'Créer un nouveau produit'
    },
    {
      title: 'Nouvelle catégorie',
      icon: <FileText className="w-6 h-6 text-emerald-600" />,
      onClick: () => navigate('/admin/categories?action=new'),
      bgHover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
      description: 'Ajouter une nouvelle catégorie'
    },
    {
      title: 'Voir les devis',
      icon: <ClipboardList className="w-6 h-6 text-purple-600" />,
      onClick: () => navigate('/admin/quote-requests'),
      bgHover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
      description: 'Gérer les demandes de devis'
    },
    {
      title: 'Exporter les données',
      icon: <Download className="w-6 h-6 text-gray-600" />,
      onClick: handleExportData,
      bgHover: 'hover:bg-gray-50 dark:hover:bg-gray-900/20',
      description: 'Télécharger toutes les données'
    },
    {
      title: 'Suivi SEO',
      icon: <Search className="w-6 h-6 text-teal-600" />,
      onClick: () => navigate('/admin/keyword-rankings'),
      bgHover: 'hover:bg-teal-50 dark:hover:bg-teal-900/20',
      description: 'Surveiller le classement des mots-clés'
    }
  ];

  async function handleExportData() {
    try {
      setExportLoading(true);
      const [products, categories, quotes] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
        getQuoteRequests()
      ]);

      const exportData = {
        products,
        categories,
        quotes: quotes.data,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
      setError('Erreur lors de l\'exportation des données. Veuillez réessayer.');
    } finally {
      setExportLoading(false);
    }
  }

  if (error) {
    return (
      <AdminLayout>
        <AdminHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminHeader />
      <NotificationContainer />
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Section d'accueil */}
          <div className="mb-8 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 p-6 rounded-2xl border border-violet-100 dark:border-violet-900/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bonjour, Admin 👋</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Voici un aperçu de votre activité aujourd'hui</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  title="Actualiser les données"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <div className="hidden md:block">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date().toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grille des statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard 
                  title="Total Produits"
                  value={stats.productsCount.toString()}
                  icon={<Package className="w-6 h-6" />}
                  bgColor="bg-blue-50"
                  colorScheme="blue"
                  description="Produits disponibles"
                />
                <StatCard 
                  title="Catégories"
                  value={stats.categoriesCount.toString()}
                  icon={<FileText className="w-6 h-6" />}
                  bgColor="bg-emerald-50"
                  colorScheme="green"
                  description="Catégories disponibles"
                />
                <StatCard 
                  title="Demandes de devis"
                  value={stats.quoteRequestsCount.toString()}
                  icon={<ClipboardList className="w-6 h-6" />}
                  bgColor="bg-purple-50"
                  colorScheme="purple"
                  description="Devis en attente"
                />
              </>
            )}
          </div>

          {/* Actions rapides améliorées */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Actions rapides</h2>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700 mx-4"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={exportLoading && action.title === 'Exporter les données'}
                  aria-label={action.description || action.title}
                  className={`group relative p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 
                    hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 
                    transform hover:-translate-y-1 transition-all duration-300 ease-in-out
                    flex flex-col items-center text-center ${action.bgHover} 
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 
                    group-hover:scale-110 transition-transform duration-300 mb-4">
                    {action.icon}
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-900 dark:text-white font-medium block 
                      group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {action.title}
                    </span>
                    {action.description && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 
                        group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                        {action.description}
                      </span>
                    )}
                  </div>
                  {exportLoading && action.title === 'Exporter les données' && (
                    <div className="absolute top-2 right-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-violet-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section des dernières demandes de devis */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dernières demandes de devis</h2>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700 mx-4"></div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              {loading ? (
                <div className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ) : stats.recentQuoteRequests.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  Aucune demande de devis récente
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Événement</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Livraison & Reprise</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {stats.recentQuoteRequests.map((quote: any) => (
                        <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            <div className="font-medium">{`${quote.first_name} ${quote.last_name}`}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {quote.company && quote.company !== 'Particulier' ? quote.company : 'Particulier'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {quote.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            <div className="font-medium">
                              {new Date(quote.event_date).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {quote.event_location || 'Non spécifié'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {quote.guest_count ? `${quote.guest_count} personnes` : 'Nombre de personnes non spécifié'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            <div className="space-y-2">
                              {/* Livraison */}
                              <div>
                                <div className="font-medium text-xs text-gray-500 dark:text-gray-400">Livraison</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {quote.delivery_date ? new Date(quote.delivery_date).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {quote.delivery_time_slot || 'Créneau non spécifié'}
                                </div>
                                {quote.delivery_address && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {`${quote.delivery_address}, ${quote.delivery_postal_code} ${quote.delivery_city}`}
                                  </div>
                                )}
                              </div>
                              {/* Reprise */}
                              <div>
                                <div className="font-medium text-xs text-gray-500 dark:text-gray-400">Reprise</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {quote.pickup_return_date ? new Date(quote.pickup_return_date).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {quote.pickup_return_start_time && quote.pickup_return_end_time ? 
                                    `${quote.pickup_return_start_time} - ${quote.pickup_return_end_time}` : 
                                    'Créneau non spécifié'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                quote.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`}>
                              {quote.status === 'pending' ? 'En attente' : 
                               quote.status === 'approved' ? 'Approuvé' : 'En cours'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
