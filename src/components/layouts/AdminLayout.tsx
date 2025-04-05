import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, FileText, Users, Grid, LayoutDashboard, Settings, Bell, Music, Tag, LogOut } from 'lucide-react';
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
    }
    
  ];

  const NavItem = ({ item }: { item: MenuItem }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-blue-600 text-white shadow-md'
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
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg z-10">
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
              <NavItem key={item.path} item={item} />
            ))}
          </nav>

          
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64 w-full">
        <main className="min-h-screen p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
