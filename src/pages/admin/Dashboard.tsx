import React, { useState, useEffect } from 'react';
import { Package, FileText, Download, ClipboardList, Search, RefreshCw } from 'lucide-react';
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
  const [stats, setStats] = useState<DashboardStats>({
    productsCount: 0,
    categoriesCount: 0,
    quoteRequestsCount: 0
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

      setStats({
        productsCount: products.length,
        categoriesCount: categories.length,
        quoteRequestsCount: quoteRequests.data?.length || 0
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
  }, []);

  const quickActions: QuickAction[] = [
    {
      title: 'Ajouter un produit',
      icon: <Package className="w-5 h-5 text-blue-600" />,
      onClick: () => navigate('/admin/products?action=new'),
      bgHover: 'hover:bg-blue-50',
      description: 'Créer un nouveau produit'
    },
    {
      title: 'Nouvelle catégorie',
      icon: <FileText className="w-5 h-5 text-emerald-600" />,
      onClick: () => navigate('/admin/categories?action=new'),
      bgHover: 'hover:bg-emerald-50',
      description: 'Ajouter une nouvelle catégorie'
    },
    {
      title: 'Voir les devis',
      icon: <ClipboardList className="w-5 h-5 text-purple-600" />,
      onClick: () => navigate('/admin/quote-requests'),
      bgHover: 'hover:bg-purple-50',
      description: 'Gérer les demandes de devis'
    },
    {
      title: 'Exporter les données',
      icon: <Download className="w-5 h-5 text-gray-600" />,
      onClick: handleExportData,
      bgHover: 'hover:bg-gray-50',
      description: 'Télécharger toutes les données'
    },
    {
      title: 'Suivi SEO',
      icon: <Search className="w-5 h-5 text-teal-600" />,
      onClick: () => navigate('/admin/keyword-rankings'),
      bgHover: 'hover:bg-teal-50',
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

          {/* Actions rapides */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Actions rapides</h2>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700 mx-4"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={exportLoading && action.title === 'Exporter les données'}
                  aria-label={action.description || action.title}
                  className={`group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 
                    hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 
                    transform hover:-translate-y-1 transition-all duration-300 ease-in-out
                    flex items-center space-x-3 ${action.bgHover} 
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 
                    group-hover:scale-110 transition-transform duration-300">
                    {action.icon}
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-gray-700 dark:text-gray-300 font-medium block 
                      group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {action.title}
                    </span>
                    {action.description && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 
                        group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                        {action.description}
                      </span>
                    )}
                  </div>
                  {exportLoading && action.title === 'Exporter les données' && (
                    <div className="ml-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-violet-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
