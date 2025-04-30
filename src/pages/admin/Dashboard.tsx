import React, { useState, useEffect } from 'react';
import { Package, FileText, Download, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import StatCard from '../../components/admin/StatCard';
import { NotificationContainer } from '../../components/admin/AdminNotification';
import { getAllProducts } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { getQuoteRequests } from '../../services/quoteRequestService';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [productsCount, setProductsCount] = useState<number>(0);
  const [categoriesCount, setCategoriesCount] = useState<number>(0);
  const [quoteRequestsCount, setQuoteRequestsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les produits
        const products = await getAllProducts();
        setProductsCount(products.length);
        
        // Récupérer les catégories
        const categories = await getAllCategories();
        setCategoriesCount(categories.length);
        
        // Récupérer les demandes de devis
        const { data: quoteRequests } = await getQuoteRequests();
        setQuoteRequestsCount(quoteRequests ? quoteRequests.length : 0);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Afficher un indicateur de chargement pendant le chargement des données
  if (loading) {
    return (
      <AdminLayout>
        <AdminHeader />
        <div className="pt-24">
          <div className="flex items-center justify-between mb-8 px-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
          </div>
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
              <p className="text-gray-600 dark:text-gray-400">Chargement des données...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <AdminHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Quick actions handlers
  const quickActions = [
    {
      title: 'Ajouter un produit',
      icon: <Package className="w-5 h-5 text-blue-600" />,
      onClick: () => navigate('/admin/products?action=new'),
      bgHover: 'hover:bg-blue-50'
    },
    {
      title: 'Nouvelle catégorie',
      icon: <FileText className="w-5 h-5 text-emerald-600" />,
      onClick: () => navigate('/admin/categories?action=new'),
      bgHover: 'hover:bg-emerald-50'
    },
    {
      title: 'Voir les devis',
      icon: <ClipboardList className="w-5 h-5 text-purple-600" />,
      onClick: () => navigate('/admin/quote-requests'),
      bgHover: 'hover:bg-purple-50'
    },
    {
      title: 'Exporter les données',
      icon: <Download className="w-5 h-5 text-gray-600" />,
      onClick: () => handleExportData(),
      bgHover: 'hover:bg-gray-50'
    }
  ];

  // Handle data export
  const handleExportData = async () => {
    try {
      const products = await getAllProducts();
      const categories = await getAllCategories();
      const { data: quotes } = await getQuoteRequests();

      const exportData = {
        products,
        categories,
        quotes,
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
      console.error('Export failed:', error);
      setError('Erreur lors de l\'exportation des données');
    }
  };

  // Update the return JSX for Quick Actions and Recent Activity
  return (
    <AdminLayout>
      <AdminHeader />
      <NotificationContainer />
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Welcome Section */}
          <div className="mb-8 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 p-6 rounded-2xl border border-violet-100 dark:border-violet-900/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bonjour, Admin 👋</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Voici un aperçu de votre activité aujourd'hui</p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Total Produits"
              value={loading ? '...' : productsCount.toString()}
              icon={<Package className="w-6 h-6" />}
              bgColor="bg-blue-50"
              // trend="+12%"
              // trendUp={true}
              colorScheme="blue"
              description="Nombre total de produits disponibles"
            />
            <StatCard 
              title="Catégories"
              value={loading ? '...' : categoriesCount.toString()}
              icon={<FileText className="w-6 h-6" />}
              bgColor="bg-emerald-50"
              // trend="+5%"
              // trendUp={true}
              colorScheme="green"
              description="Nombre total de catégories"
            />
            <StatCard 
              title="Demandes de devis"
              value={loading ? '...' : quoteRequestsCount.toString()}
              icon={<ClipboardList className="w-6 h-6" />}
              bgColor="bg-purple-50"
              // trend="+18%"
              // trendUp={true}
              colorScheme="purple"
              description="Nombre total de demandes de devis"
            />
          </div>

          {/* Quick Actions */}
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
                  className={`p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 flex items-center space-x-3 ${action.bgHover}`}
                >
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    {action.icon}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{action.title}</span>
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
