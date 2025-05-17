import React, { useState, ReactNode, useEffect, useRef } from 'react';
import { Search, Bell, Settings, User, LogOut, Menu, X, Home, ChevronDown, Moon, Sun, Package, FileText, Download, ClipboardList, TrendingUp, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  title?: string;
  icon?: ReactNode;
  onToggleSidebar?: () => void;
}

interface QuickAction {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  bgColor: string;
  textColor: string;
  hoverBg: string;
  description?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, icon, onToggleSidebar }) => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New user registration', time: '2 min ago', read: false },
    { id: 2, text: 'Server update completed', time: '1 hour ago', read: false },
    { id: 3, text: 'Weekly report available', time: 'Yesterday', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  const quickActions: QuickAction[] = [
    {
      title: 'Ajouter un produit',
      icon: <Package className="w-7 h-7" />,
      onClick: () => navigate('/admin/products?action=new'),
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-white',
      hoverBg: 'hover:from-blue-600 hover:to-blue-700',
      description: 'Créer un nouveau produit'
    },
    {
      title: 'Nouvelle catégorie',
      icon: <FileText className="w-7 h-7" />,
      onClick: () => navigate('/admin/categories?action=new'),
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      textColor: 'text-white',
      hoverBg: 'hover:from-emerald-600 hover:to-emerald-700',
      description: 'Ajouter une nouvelle catégorie'
    },
    {
      title: 'Voir les devis',
      icon: <ClipboardList className="w-7 h-7" />,
      onClick: () => navigate('/admin/quote-requests'),
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-white',
      hoverBg: 'hover:from-purple-600 hover:to-purple-700',
      description: 'Gérer les demandes de devis'
    },
    {
      title: 'Exporter les données',
      icon: <Download className="w-7 h-7" />,
      onClick: handleExportData,
      bgColor: 'bg-gradient-to-br from-gray-600 to-gray-700',
      textColor: 'text-white',
      hoverBg: 'hover:from-gray-700 hover:to-gray-800',
      description: 'Télécharger toutes les données'
    },
    {
      title: 'Suivi SEO',
      icon: <TrendingUp className="w-7 h-7" />,
      onClick: () => navigate('/admin/keyword-rankings'),
      bgColor: 'bg-gradient-to-br from-teal-500 to-teal-600',
      textColor: 'text-white',
      hoverBg: 'hover:from-teal-600 hover:to-teal-700',
      description: 'Surveiller le classement des mots-clés'
    }
  ];

  async function handleExportData() {
    try {
      setExportLoading(true);
      // Logique d'exportation ici
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
    } finally {
      setExportLoading(false);
    }
  }

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="mb-6">
      {/* Page Title Bar - visible below header */}
      {(title || icon) && (
        <div className="flex items-center pt-20 pb-4 px-4 md:px-6">
          {icon && <span className="text-primary-600 mr-3 flex-shrink-0">{icon}</span>}
          {title && <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>}
        </div>
      )}
      
      <header className="fixed top-0 right-0 md:left-64 left-0 h-16 bg-white/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 z-30 shadow-sm backdrop-blur-md transition-all duration-300">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              onClick={onToggleSidebar}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Breadcrumb - Hidden on mobile */}
            
          </div>

          {/* Center - Quick Actions */}
          <div className="hidden md:flex items-center space-x-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={exportLoading && action.title === 'Exporter les données'}
                className={`${action.bgColor} ${action.hoverBg} ${action.textColor} px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:shadow-md group relative`}
                title={action.description}
              >
                <div className="transform group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <span className="text-xs font-medium">{action.title}</span>
                {exportLoading && action.title === 'Exporter les données' && (
                  <div className="ml-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  </div>
                )}
                <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Settings */}
            <button 
              onClick={() => window.location.href = '/'}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-md"
            >
              <Home className="w-4 h-4" />
              <span className="text-xs font-medium">Voir le site</span>
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-medium">
                    {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    {user?.email?.split('@')[0] || 'User'}
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${showUserMenu ? 'transform rotate-180' : ''}`} />
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Administrateur
                  </span>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-1 border border-gray-200 dark:border-gray-700 transform origin-top-right transition-all duration-200 animate-in fade-in slide-in-from-top-2">
                  <div className="md:hidden px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Administrateur
                    </p>
                  </div>
                  <div className="py-1">
                    {/* <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <User className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                      Mon profil
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Settings className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                      Paramètres
                    </button> */}
                  </div>
                  <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-16 bg-white/95 dark:bg-gray-800/95 md:hidden z-20 backdrop-blur-sm">
            <div className="p-4 space-y-4">
              <nav className="space-y-1">
                <button className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105">
                  <Home className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  Tableau de bord
                </button>
                {/* Add more menu items here */}
              </nav>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                {/* <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  {darkMode ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
                  {darkMode ? 'Mode clair' : 'Mode sombre'}
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105">
                  <Settings className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  Paramètres
                </button> */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default AdminHeader;