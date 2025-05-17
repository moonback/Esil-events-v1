import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Scale } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';

const BottomNav: React.FC = () => {
  const { items } = useCart();
  const { comparisonProducts } = useComparison();
  const totalItems = items.length;
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/');

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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-300 ${
            isActive('/') ? 'text-violet-600' : 'text-gray-500'
          }`}
        >
          <div className="relative">
            <Home size={22} />
            {isActive('/') && (
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-violet-600 rounded-full"></span>
            )}
          </div>
          <span className={`text-xs mt-1 font-medium ${isActive('/') ? 'text-violet-600' : 'text-gray-500'}`}>Accueil</span>
        </Link>
        
        <Link 
          to="/products" 
          className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-300 ${
            isActive('/products') ? 'text-violet-600' : 'text-gray-500'
          }`}
        >
          <div className="relative">
            <Package size={22} />
            {isActive('/products') && (
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-violet-600 rounded-full"></span>
            )}
          </div>
          <span className={`text-xs mt-1 font-medium ${isActive('/products') ? 'text-violet-600' : 'text-gray-500'}`}>Produits</span>
        </Link>
        
        <Link 
          to="/cart" 
          className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-300 ${
            isActive('/cart') ? 'text-violet-600' : 'text-gray-500'
          }`}
        >
          <div className="relative">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-violet-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
            {isActive('/cart') && (
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-violet-600 rounded-full"></span>
            )}
          </div>
          <span className={`text-xs mt-1 font-medium ${isActive('/cart') ? 'text-violet-600' : 'text-gray-500'}`}>Devis</span>
        </Link>
        
        <Link 
          to="/compare" 
          className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-300 ${
            isActive('/compare') ? 'text-violet-600' : 'text-gray-500'
          }`}
        >
          <div className="relative">
            <Scale size={22} />
            {comparisonProducts.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-violet-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {comparisonProducts.length}
              </span>
            )}
            {isActive('/compare') && (
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-violet-600 rounded-full"></span>
            )}
          </div>
          <span className={`text-xs mt-1 font-medium ${isActive('/compare') ? 'text-violet-600' : 'text-gray-500'}`}>Comparer</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;