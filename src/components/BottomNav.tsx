import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Calendar, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BottomNav: React.FC = () => {
  const { items } = useCart();
  const totalItems = items.length;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        <Link to="/" className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-600">
          <Home size={24} />
          <span className="text-xs mt-1">Accueil</span>
        </Link>
        
        <Link to="/products" className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-600">
          <Calendar size={24} />
          <span className="text-xs mt-1">Produits</span>
        </Link>
        
        <Link to="/cart" className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-600 relative">
          <ShoppingCart size={24} />
          <span className="text-xs mt-1">Devis</span>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
        
        <Link to="/contact" className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-600">
          <User size={24} />
          <span className="text-xs mt-1">Contact</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav; 