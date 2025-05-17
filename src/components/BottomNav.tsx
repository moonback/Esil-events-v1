import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BottomNav: React.FC = () => {
  const { items } = useCart();
  const totalItems = items.length;
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  // Fonction pour déterminer si un onglet est actif
  const isActive = (path: string) => {
    if (path === '/' && activeTab === '/') return true;
    if (path !== '/' && activeTab.startsWith(path)) return true;
    return false;
  };

  return (
    <div 
      className="md:hidden fixed right-0 top-1/2 -translate-y-1/5 z-50"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`flex flex-col space-y-4 bg-white/80 backdrop-blur-md rounded-l-2xl p-2 shadow-lg border border-gray-100 transition-all duration-300 ${
        isExpanded ? 'translate-x-0' : 'translate-x-[calc(100%-48px)]'
      }`}>
        <Link 
          to="/" 
          className={`relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
            isActive('/') ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-violet-50'
          }`}
        >
          <Home size={24} />
          {isActive('/') && (
            <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-600 rounded-full"></span>
          )}
          <span className={`absolute right-full mr-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ${
            isExpanded ? 'opacity-100' : ''
          }`}>
            Accueil
          </span>
        </Link>
        
        <Link 
          to="/products" 
          className={`relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
            isActive('/products') ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-violet-50'
          }`}
        >
          <Package size={24} />
          {isActive('/products') && (
            <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-600 rounded-full"></span>
          )}
          <span className={`absolute right-full mr-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ${
            isExpanded ? 'opacity-100' : ''
          }`}>
            Produits
          </span>
        </Link>
        
        <Link 
          to="/cart" 
          className={`relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
            isActive('/cart') ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-violet-50'
          }`}
        >
          <div className="relative">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-violet-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </div>
          {isActive('/cart') && (
            <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-600 rounded-full"></span>
          )}
          <span className={`absolute right-full mr-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ${
            isExpanded ? 'opacity-100' : ''
          }`}>
            Devis
          </span>
        </Link>
        
        <Link 
          to="/contact" 
          className={`relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
            isActive('/contact') ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-violet-50'
          }`}
        >
          <User size={24} />
          {isActive('/contact') && (
            <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-600 rounded-full"></span>
          )}
          <span className={`absolute right-full mr-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ${
            isExpanded ? 'opacity-100' : ''
          }`}>
            Contact
          </span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;