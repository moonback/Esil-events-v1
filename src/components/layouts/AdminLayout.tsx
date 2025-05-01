import React, { useState, useCallback, memo } from 'react';
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
  LogOut
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

// Composant NavItem extrait et mémorisé pour éviter les re-rendus inutiles
const NavItem: React.FC<NavItemProps> = memo(({ item, onClick, collapsed, isActive }) => {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`group flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <div className={`${isActive ? '' : 'text-gray-500 dark:text-gray-400'} ${collapsed ? 'mx-auto' : ''}`}>
        {item.icon}
      </div>
      {!collapsed && <span className="ml-3">{item.label}</span>}
      
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-6 -translate-y-1/2 top-1/2 px-2 py-1.5 bg-gray-800 text-xs font-medium text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          {item.label}
        </div>
      )}
    </Link>
  );
});

// Logo component
const Logo: React.FC<{collapsed: boolean}> = memo(({ collapsed }) => (
  <Link to="/" className={`${collapsed ? 'justify-center w-full' : ''} flex items-center`}>
    <span className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white p-1.5 rounded-lg mr-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </span>
    {!collapsed && <span className="text-xl font-bold text-gray-900 dark:text-white">ESIL Events</span>}
  </Link>
));

// UserWelcome component
const UserWelcome: React.FC<{user: any, collapsed: boolean}> = memo(({ user, collapsed }) => (
  <div className="mb-4 px-3">
    <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-3">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-violet-100 dark:bg-violet-800/30 rounded-lg">
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
  
  // Toggle sidebar collapse state - mémorisé pour éviter les re-rendus inutiles
  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  const menuItems: MenuItem[] = [
    {
      label: 'Tableau de bord',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/admin'
    },
    {
      label: 'Produits',
      icon: <Package className="w-5 h-5" />,
      path: '/admin/products'
    },
    {
      label: 'Catégories',
      icon: <Grid className="w-5 h-5" />,
      path: '/admin/categories'
    },
    {
      label: 'Catégories d\'artistes',
      icon: <Tag className="w-5 h-5" />,
      path: '/admin/artist-categories'
    },
    {
      label: 'Artistes',
      icon: <Music className="w-5 h-5" />,
      path: '/admin/artists'
    },
    // {
    //   label: 'Pages',
    //   icon: <FileText className="w-5 h-5" />,
    //   path: '/admin/pages'
    // },
    // {
    //   label: 'Clients',
    //   icon: <Users className="w-5 h-5" />,
    //   path: '/admin/customers'
    // },
    {
      label: 'Annonces',
      icon: <MessageSquare className="w-5 h-5" />,
      path: '/admin/announcements'
    },
    {
      label: 'Demandes de devis',
      icon: <FileText className="w-5 h-5" />,
      path: '/admin/quote-requests'
    },
    {
      label: 'Configuration Email',
      icon: <Mail className="w-5 h-5" />,
      path: '/admin/email-config'
    },
    {
      label: 'Sitemap',
      icon: <Globe className="w-5 h-5" />,
      path: '/admin/sitemap'
    }
  ];

  // Fonction pour déterminer si un élément de menu est actif
  const isMenuItemActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Sidebar - Modified for responsiveness and collapsible */}
      <aside 
        className={`fixed inset-y-0 left-0 ${collapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg z-10 transform transition-all duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <Logo collapsed={collapsed} />
            <button 
              onClick={toggleSidebar}
              className="hidden md:flex p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {collapsed ? 
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /> :
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                }
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <UserWelcome user={user} collapsed={collapsed} />
            
            {menuItems.map((item) => (
              <NavItem 
                key={item.path} 
                item={item} 
                onClick={() => setIsMobileMenuOpen(false)}
                collapsed={collapsed}
                isActive={isMenuItemActive(item.path)}
              />
            ))}
          </nav>

          {/* Bottom Section - Déconnexion */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
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
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Déconnexion
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
                className="flex justify-center w-full p-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group relative"
              >
                <LogOut className="w-5 h-5" />
                <div className="absolute left-full ml-6 -translate-y-1/2 top-1/2 px-2 py-1.5 bg-gray-800 text-xs font-medium text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                  Déconnexion
                </div>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[5] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content - Modified for responsiveness and collapsible sidebar */}
      <div className={`w-full ${collapsed ? 'md:pl-20' : 'md:pl-64'} transition-all duration-300`}>
        <main className="min-h-screen p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
