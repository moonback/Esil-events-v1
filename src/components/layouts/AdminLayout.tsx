import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Grid, LayoutDashboard, Music, Tag, LogOut, Menu, X, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Define a temporary logout function
  const logout = () => {
    console.log('Logout functionality not implemented yet');
    // You can redirect to login page or implement actual logout later
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Tableau de bord',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/admin'
    },
    {
      title: 'Produits',
      icon: <Package className="w-5 h-5" />,
      path: '/admin/products'
    },
    {
      title: 'Catégories',
      icon: <Grid className="w-5 h-5" />,
      path: '/admin/categories'
    },
    {
      title: 'Catégories d\'artistes',
      icon: <Tag className="w-5 h-5" />,
      path: '/admin/artist-categories'
    },
    {
      title: 'Artistes',
      icon: <Music className="w-5 h-5" />,
      path: '/admin/artists'
    },
    {
      title: 'Demandes de devis',
      icon: <FileText className="w-5 h-5" />,
      path: '/admin/quote-requests'
    }
    
  ];

  const NavItem = ({ item, onClick }: { item: MenuItem; onClick?: () => void }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClick}
        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-violet-600 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        {item.icon}
        <span className="ml-3">{item.title}</span>
      </Link>
    );
  };

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

      {/* Sidebar - Modified for responsiveness */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg z-10 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
              ESIL Events
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavItem 
                key={item.path} 
                item={item} 
                onClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </button>
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

      {/* Main Content - Modified for responsiveness */}
      <div className="w-full md:pl-64 transition-all duration-300">
        <main className="min-h-screen p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
