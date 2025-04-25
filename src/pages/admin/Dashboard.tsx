import React, { useState, useEffect } from 'react';
import { Package, FileText, Users, BarChart2, TrendingUp, ShoppingCart, Download, ClipboardList } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { getAllProducts } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { getQuoteRequests } from '../../services/quoteRequestService';

const AdminDashboard: React.FC = () => {
  const [productsCount, setProductsCount] = useState<number>(0);
  const [categoriesCount, setCategoriesCount] = useState<number>(0);
  const [quoteRequestsCount, setQuoteRequestsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

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

  const stats = [
    {
      title: 'Produits',
      value: loading ? '...' : productsCount.toString(),
      icon: <Package className="w-6 h-6 text-gray-700" />,
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Catégories principales', // Fixed French plural
      value: loading ? '...' : categoriesCount.toString(),
      icon: <FileText className="w-6 h-6 text-green-700" />,
      bgColor: 'bg-green-100'
    },
    {
      title: 'Demandes de devis',
      value: loading ? '...' : quoteRequestsCount.toString(),
      icon: <ClipboardList className="w-6 h-6 text-purple-700" />,
      bgColor: 'bg-purple-100'
    },
  ];

  const [error, setError] = useState<string | null>(null);


  
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

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="pt-24">
        <div className="flex items-center justify-between mb-8 px-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className={`${stat.bgColor} p-3 rounded-lg transition-transform group-hover:scale-105`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
