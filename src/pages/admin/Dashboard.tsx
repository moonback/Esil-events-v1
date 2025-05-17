import React, { useState, useEffect } from 'react';
import { 
  Package, 
  FileText, 
  Download, 
  ClipboardList, 
  Search, 
  RefreshCw, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight,
  Filter,
  Bell,
  Users,
  DollarSign,
  AlertCircle,
  BarChart2,
  Clock,
  FileCheck,
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Phone,
  MapPin,
  TruckIcon,
  RotateCcwIcon,
  Eye,
  Edit
} from 'lucide-react';
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
  pendingQuoteRequests: number;
  approvedQuoteRequests: number;
  revenueEstimate: number;
  monthlyTrend: number;
}

interface QuoteRequest {
  id: string;
  status: string;
  created_at: string;
  total_amount?: number;
  // ... autres propriétés existantes
}

// Composant de chargement
const StatCardSkeleton: React.FC = () => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 animate-pulse shadow-lg">
    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
);

// Graphique minimaliste pour les tendances
const TrendChart: React.FC<{ data: number[], color: string }> = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  return (
    <div className="flex items-end h-12 gap-1 mt-2">
      {data.map((value, index) => {
        const height = range === 0 ? 50 : ((value - min) / range) * 100;
        return (
          <div 
            key={index}
            className={`${color} opacity-80 hover:opacity-100 transition-all rounded-sm`}
            style={{ height: `${Math.max(10, height)}%`, width: '8px' }}
            title={`Valeur: ${value}`}
          ></div>
        );
      })}
    </div>
  );
};

// Indicateur de tendance
const TrendIndicator: React.FC<{ value: number, showValue?: boolean }> = ({ value, showValue = true }) => {
  const isPositive = value >= 0;
  
  return (
    <div className={`flex items-center ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
      <div className={`p-1 rounded-full ${isPositive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'} mr-2`}>
        <ArrowUpRight className={`w-3 h-3 ${!isPositive && 'transform rotate-90'}`} />
      </div>
      {showValue && (
        <span className="text-xs font-medium">
          {isPositive ? '+' : ''}{value}%
        </span>
      )}
    </div>
  );
};

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
    recentQuoteRequests: [],
    pendingQuoteRequests: 0,
    approvedQuoteRequests: 0,
    revenueEstimate: 0,
    monthlyTrend: 0,
  });

  // Données de tendances fictives pour la démo
  const [trends] = useState({
    products: [8, 12, 10, 14, 16, 18, 20],
    quotes: [5, 8, 15, 12, 18, 22, 20],
    revenue: [1200, 1500, 1300, 1800, 2200, 2500, 2800],
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeNotifications, setActiveNotifications] = useState<number>(3);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [products, categories, quoteRequests] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
        getQuoteRequests()
      ]);

      // Get only the most recent quote requests
      const recentQuotes = quoteRequests.data?.slice(0, 5) || [];
      
      // Calculer statistiques supplémentaires
      const pendingQuotes = quoteRequests.data?.filter(q => q.status === 'pending').length || 0;
      const approvedQuotes = quoteRequests.data?.filter(q => q.status === 'approved').length || 0;
      
      // Calcul des revenus réels basé sur les devis approuvés
      const revenueEstimate = quoteRequests.data
        ?.filter(q => q.status === 'approved')
        .reduce((total, quote) => {
          const quoteTotal = quote.items?.reduce((sum, item) => 
            sum + ((item.quantity || 0) * (item.price || 0)), 0) || 0;
          return total + quoteTotal;
        }, 0) || 0;
      
      // Calcul de la tendance mensuelle réelle
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const currentYear = new Date().getFullYear();
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthQuotes = quoteRequests.data?.filter(q => {
        const quoteDate = new Date(q.created_at || '');
        return quoteDate.getMonth() === currentMonth && quoteDate.getFullYear() === currentYear;
      }) || [];

      const lastMonthQuotes = quoteRequests.data?.filter(q => {
        const quoteDate = new Date(q.created_at || '');
        return quoteDate.getMonth() === lastMonth && quoteDate.getFullYear() === lastMonthYear;
      }) || [];

      const currentMonthRevenue = currentMonthQuotes
        .filter(q => q.status === 'approved')
        .reduce((total, quote) => {
          const quoteTotal = quote.items?.reduce((sum, item) => 
            sum + ((item.quantity || 0) * (item.price || 0)), 0) || 0;
          return total + quoteTotal;
        }, 0);

      const lastMonthRevenue = lastMonthQuotes
        .filter(q => q.status === 'approved')
        .reduce((total, quote) => {
          const quoteTotal = quote.items?.reduce((sum, item) => 
            sum + ((item.quantity || 0) * (item.price || 0)), 0) || 0;
          return total + quoteTotal;
        }, 0);

      const monthlyTrend = lastMonthRevenue === 0 
        ? 100 
        : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

      setStats({
        productsCount: products.length,
        categoriesCount: categories.length,
        quoteRequestsCount: quoteRequests.data?.length || 0,
        recentQuoteRequests: recentQuotes,
        pendingQuoteRequests: pendingQuotes,
        approvedQuoteRequests: approvedQuotes,
        revenueEstimate: revenueEstimate,
        monthlyTrend: Math.round(monthlyTrend * 10) / 10, // Arrondir à 1 décimale
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

  // Filtrer les devis selon le statut sélectionné
  const filteredQuotes = React.useMemo(() => {
    if (statusFilter === 'all') return stats.recentQuoteRequests;
    return stats.recentQuoteRequests.filter(quote => quote.status === statusFilter);
  }, [stats.recentQuoteRequests, statusFilter]);

  // Les actions rapides ont été déplacées vers le header
  // Voir AdminHeader.tsx pour plus de détails

  if (error) {
    return (
      <AdminLayout>
        <AdminHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 dark:text-red-400 font-medium text-lg">{error}</p>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Une erreur s'est produite lors du chargement des données du tableau de bord.
            </p>
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
          {/* Section d'accueil avec design moderne */}
          <div className="mb-8 relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-3xl border border-indigo-500 shadow-xl">
            {/* Formes décoratives en arrière-plan */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute top-10 right-10 w-16 h-16 bg-purple-300/20 rounded-full blur-xl"></div>
            <div className="absolute -top-8 -left-8 w-40 h-40 bg-indigo-300/10 rotate-45 rounded-xl blur-xl"></div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Bonjour, Admin 👋
                </h1>
                <p className="text-indigo-100 opacity-90 max-w-xl">
                  Bienvenue sur votre tableau de bord. Vous avez <span className="font-semibold">{activeNotifications} notifications</span> et <span className="font-semibold">{stats.pendingQuoteRequests} devis</span> en attente aujourd'hui.
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="p-3 rounded-xl bg-white/20 hover:bg-white/30
                    transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 group"
                  title="Actualiser les données"
                >
                  <RefreshCw className={`w-6 h-6 text-white ${loading ? 'animate-spin' : ''} group-hover:scale-110 transition-transform`} />
                </button>
                
                <div className="bg-white/20 p-4 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20">
                  <div className="text-sm font-medium text-white">
                    {new Date().toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs text-indigo-100 mt-1 opacity-80">
                    Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
                  </div>
                </div>
                
                <button className="relative p-3 rounded-xl bg-white/20 hover:bg-white/30
                  transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20">
                  <Bell className="w-6 h-6 text-white" />
                  {activeNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {activeNotifications}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Grille des statistiques améliorée */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Produits</div>
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stats.productsCount}
                        </div>
                        <div className="flex items-center mt-2 text-sm">
                          <TrendIndicator value={7.2} />
                          <span className="text-gray-500 dark:text-gray-400 ml-2">vs mois dernier</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-4">
                    <TrendChart data={trends.products} color="bg-blue-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Devis en attente</div>
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <ClipboardList className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stats.pendingQuoteRequests}
                        </div>
                        <div className="flex items-center mt-2 text-sm">
                          <TrendIndicator value={12.8} />
                          <span className="text-gray-500 dark:text-gray-400 ml-2">vs mois dernier</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-4">
                    <TrendChart data={trends.quotes} color="bg-amber-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Devis approuvés</div>
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stats.approvedQuoteRequests}
                        </div>
                        <div className="flex items-center mt-2 text-sm">
                          <TrendIndicator value={5.4} />
                          <span className="text-gray-500 dark:text-gray-400 ml-2">vs mois dernier</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-4">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full" 
                        style={{ width: `${(stats.approvedQuoteRequests / (stats.quoteRequestsCount || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <div>Taux de conversion</div>
                      <div className="font-medium">{Math.round((stats.approvedQuoteRequests / (stats.quoteRequestsCount || 1)) * 100)}%</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenus estimés</div>
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(stats.revenueEstimate)}
                        </div>
                        <div className="flex items-center mt-2 text-sm">
                          <TrendIndicator value={stats.monthlyTrend} />
                          <span className="text-gray-500 dark:text-gray-400 ml-2">vs mois dernier</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-4">
                    <TrendChart data={trends.revenue} color="bg-purple-500" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Grille principale */}
          <div className="grid grid-cols-1 gap-8 mb-8">
            {/* Section des demandes de devis améliorée */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dernières demandes de devis</h2>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none pl-8 pr-10 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="pending">En attente</option>
                      <option value="approved">Approuvés</option>
                      <option value="processing">En cours</option>
                    </select>
                    <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <button
                    onClick={() => navigate('/admin/quote-requests')}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                  >
                    Voir tout
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="p-8 animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredQuotes.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                    <ClipboardList className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune demande de devis</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Il n'y a actuellement aucune demande de devis correspondant à vos critères.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Événement</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Livraison & Reprise</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                        {/* <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th> */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredQuotes.map((quote) => (
                        <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900 dark:text-white">{`${quote.first_name} ${quote.last_name}`}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {quote.company && quote.company !== 'Particulier' ? quote.company : 'Particulier'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {quote.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                                {new Date(quote.event_date).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <MapPin className="w-3 h-3 mr-1" />
                                {quote.event_location || 'Non spécifié'}
                              </div>
                              <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Users className="w-3 h-3 mr-1" />
                                {quote.guest_count ? `${quote.guest_count} personnes` : 'Nombre non spécifié'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-3 text-xs text-gray-500 dark:text-gray-400">
                              {/* Livraison */}
                              <div className="flex items-start">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 mt-0.5">
                                  <TruckIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-700 dark:text-gray-300">Livraison</div>
                                  <div>
                                    {quote.delivery_date ? new Date(quote.delivery_date).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short'
                                    }) : 'Non spécifiée'}
                                    {quote.delivery_time_slot && ` • ${quote.delivery_time_slot}`}
                                  </div>
                                  {quote.delivery_address && (
                                    <div className="text-xs italic mt-1 line-clamp-1">
                                      {`${quote.delivery_address}, ${quote.delivery_postal_code} ${quote.delivery_city}`}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Reprise */}
                              <div className="flex items-start">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-2 mt-0.5">
                                  <RotateCcwIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-700 dark:text-gray-300">Reprise</div>
                                  <div>
                                    {quote.pickup_return_date ? new Date(quote.pickup_return_date).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short'
                                    }) : 'Non spécifiée'}
                                    {quote.pickup_return_start_time && quote.pickup_return_end_time && 
                                      ` • ${quote.pickup_return_start_time} - ${quote.pickup_return_end_time}`}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col items-start">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 
                                quote.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 
                                'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                                {quote.status === 'pending' ? 'En attente' : 
                                 quote.status === 'approved' ? 'Approuvé' : 'En cours'}
                              </span>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Il y a {Math.floor(Math.random() * 24) + 1}h
                              </div>
                            </div>
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button 
                                onClick={() => navigate(`/admin/quote-requests/${quote.id}`)}
                                className="p-1 rounded-md text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <Eye className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => navigate(`/admin/quote-requests/${quote.id}/edit`)}
                                className="p-1 rounded-md text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <Edit className="w-5 h-5" />
                              </button>
                            </div>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Affichage de <span className="font-medium">{filteredQuotes.length}</span> devis sur <span className="font-medium">{stats.quoteRequestsCount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => navigate('/admin/quote-requests')}
                    className="p-2 border border-gray-200 dark:border-gray-600 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="px-3 py-1 text-sm font-medium">1</div>
                  <button 
                    onClick={() => navigate('/admin/quote-requests')}
                    className="p-2 border border-gray-200 dark:border-gray-600 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendrier des événements */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Événements à venir</h2>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <CalendarIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {stats.recentQuoteRequests.slice(0, 3).map((quote, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-4">
                        <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Événement {quote.company ? `- ${quote.company}` : ''}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(quote.event_date).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'long'
                          })} • {quote.event_location || 'Lieu non spécifié'}
                        </div>
                        <div className="flex items-center mt-2">
                          <Clock className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.floor(Math.random() * 10) + 1} jours restants
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 text-center">
                <button 
                  onClick={() => navigate('/admin/events')}
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                  Voir tous les événements
                </button>
              </div>
            </div>
          </div>

          {/* Section d'analyse supplémentaire */}
          <div className="grid grid-cols-1 gap-8 mb-8">
            {/* Graphique de performance */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Activité mensuelle</h2>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-2"
                  >
                    <option value="2025-05">Mai 2025</option>
                    <option value="2025-04">Avril 2025</option>
                    <option value="2025-03">Mars 2025</option>
                  </select>
                </div>
              </div>
              <div className="p-4">
                <div className="w-full h-60 flex justify-center items-center">
                  <BarChart2 className="w-24 h-24 text-gray-300 dark:text-gray-600" />
                  <div className="text-center ml-4">
                    <p className="text-gray-500 dark:text-gray-400">Chargez des données de performance mensuelle pour voir les statistiques.</p>
                    <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                      Charger les données
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;