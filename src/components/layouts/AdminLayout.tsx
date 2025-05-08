import React, { useState, useCallback, memo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  FileText, 
  Grid, 
  LayoutDashboard, 
  Music, 
  Tag, 
  Menu, 
  X, 
  MessageSquare,
  Mail,
  Globe,
  LogOut,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../services/authService';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface NavItemProps {
  item: MenuItem;
  onClick?: () => void;
  collapsed?: boolean;
  isActive: boolean;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Composant NavItem amélioré avec des animations et effets visuels
const NavItem: React.FC<NavItemProps> = memo(({ item, onClick, collapsed, isActive }) => {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`group flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-gray-700/90 hover:scale-[1.02] hover:shadow-sm'
      }`}
    >
      <div className={`${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'} ${collapsed ? 'mx-auto' : ''} transition-all duration-300`}>
        {item.icon}
      </div>
      {!collapsed && (
        <span className={`ml-3 transition-all duration-300 ${isActive ? 'font-semibold' : ''}`}>
          {item.label}
        </span>
      )}
      
      {/* Tooltip for collapsed state - improved with animation */}
      {collapsed && (
        <div className="absolute left-full ml-4 -translate-y-1/2 top-1/2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-xs font-medium text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 shadow-lg pointer-events-none z-50 whitespace-nowrap">
          {item.label}
        </div>
      )}
    </Link>
  );
});

// Logo component with enhanced styling
const Logo: React.FC<{collapsed: boolean}> = memo(({ collapsed }) => (
  <Link to="/" className={`${collapsed ? 'justify-center w-full' : ''} flex items-center group`}>
    <div className="relative overflow-hidden">
      <span className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white p-2 rounded-xl mr-3 shadow-md shadow-violet-200/50 dark:shadow-violet-900/20 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-violet-300/50 dark:hover:shadow-violet-800/30 group-hover:scale-105">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
    </div>
    {!collapsed && (
      <span className="text-xl font-bold bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent transition-all duration-300 group-hover:translate-x-0.5">
        ESIL Events
      </span>
    )}
  </Link>
));

// UserWelcome component with enhanced styling
const UserWelcome: React.FC<{user: any, collapsed: boolean}> = memo(({ user, collapsed }) => (
  <div className="mb-6 px-3">
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/10 dark:to-indigo-900/10 rounded-xl p-4 shadow-sm border border-violet-100/50 dark:border-violet-800/20 transition-all duration-300 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-700/30">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-800/20 dark:to-indigo-800/20 rounded-xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600 dark:text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <p className="text-xs font-medium text-violet-800 dark:text-violet-300">Bienvenue</p>
            <p className="text-sm font-semibold text-violet-900 dark:text-violet-200 truncate">
              {user?.email?.split('@')[0] || 'Admin'}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
));

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Effect to handle initial animation
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Toggle sidebar collapse state - mémorisé pour éviter les re-rendus inutiles
  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  const menuItems: MenuItem[] = [
    { label: 'Tableau de bord', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin' },
    { label: 'Produits', icon: <Package className="w-5 h-5" />, path: '/admin/products' },
    { label: 'Catégories', icon: <Tag className="w-5 h-5" />, path: '/admin/categories' },
    { label: 'Demandes de devis', icon: <MessageSquare className="w-5 h-5" />, path: '/admin/quote-requests' },
    { label: 'Artistes', icon: <Music className="w-5 h-5" />, path: '/admin/artists' },
    { label: 'Catégories d\'artistes', icon: <Grid className="w-5 h-5" />, path: '/admin/artist-categories' },
    { label: 'Réalisations', icon: <FileText className="w-5 h-5" />, path: '/admin/realizations' },
    { label: 'Annonces', icon: <AlertCircle className="w-5 h-5" />, path: '/admin/announcements' },
    { label: 'Newsletter', icon: <Mail className="w-5 h-5" />, path: '/admin/newsletter' },
    // { label: 'Clients', icon: <Users className="w-5 h-5" />, path: '/admin/customers' },
    // { label: 'Pages', icon: <FileText className="w-5 h-5" />, path: '/admin/pages' },
    { label: 'Emails', icon: <Mail className="w-5 h-5" />, path: '/admin/email-config' },
    { label: 'Sitemap', icon: <Globe className="w-5 h-5" />, path: '/admin/sitemap' },
    { label: 'Mots-clés', icon: <FileText className="w-5 h-5" />, path: '/admin/keyword-rankings' },
  ];

  // Fonction pour déterminer si un élément de menu est actif
  const isMenuItemActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Mobile Menu Button - Enhanced with animations */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-20 p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md active:scale-95"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Sidebar - Enhanced with glass morphism effect and animations */}
      <aside 
        className={`fixed inset-y-0 left-0 ${collapsed ? 'w-20' : 'w-64'} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-r border-gray-200/80 dark:border-gray-700/80 shadow-xl z-10 transform transition-all duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle - Enhanced with better spacing and animations */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200/80 dark:border-gray-700/80">
            <Logo collapsed={collapsed} />
            <button 
              onClick={toggleSidebar}
              className="hidden md:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-all duration-300 hover:text-gray-700 dark:hover:text-gray-300 active:scale-95"
              aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
            >
              {collapsed ? 
                <ChevronRight className="w-5 h-5" /> :
                <ChevronLeft className="w-5 h-5" />
              }
            </button>
          </div>

          {/* Navigation - Enhanced with better spacing and scrollbar styling */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <UserWelcome user={user} collapsed={collapsed} />
            
            <div className="space-y-1.5">
              {menuItems.map((item) => (
                <NavItem 
                  key={item.path} 
                  item={item} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  collapsed={collapsed}
                  isActive={isMenuItemActive(item.path)}
                />
              ))}
            </div>
          </nav>

          {/* Bottom Section - Enhanced with better styling */}
          <div className="p-4 border-t border-gray-200/80 dark:border-gray-700/80">
            {!collapsed ? (
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    window.location.href = '/login';
                  } catch (error) {
                    console.error('Erreur lors de la déconnexion:', error);
                  }
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 hover:shadow-sm active:scale-98"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="font-medium">Déconnexion</span>
              </button>
            ) : (
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    window.location.href = '/login';
                  } catch (error) {
                    console.error('Erreur lors de la déconnexion:', error);
                  }
                }}
                className="flex justify-center w-full p-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 hover:shadow-sm active:scale-98 group relative"
              >
                <LogOut className="w-5 h-5" />
                <div className="absolute left-full ml-4 -translate-y-1/2 top-1/2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-xs font-medium text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 shadow-lg pointer-events-none z-50 whitespace-nowrap">
                  Déconnexion
                </div>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile - Enhanced with better blur effect */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[5] md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content - Enhanced with better transitions and padding */}
      <div className={`w-full ${collapsed ? 'md:pl-20' : 'md:pl-64'} transition-all duration-300 ease-in-out`}>
        <main className="min-h-screen p-4 md:p-8 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
