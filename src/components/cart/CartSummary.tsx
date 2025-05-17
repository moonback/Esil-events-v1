import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { CartSummaryProps } from './types';
import { motion } from 'framer-motion';

const CartSummary: React.FC<CartSummaryProps> = ({ items, onCheckoutClick }) => {
  const total = items?.reduce((total, item) => total + (item.priceTTC * item.quantity), 0) || 0;

  return (
    <motion.div 
      className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Total visible sur mobile */}
      <div className="flex justify-between items-center sm:hidden">
        <span className="text-sm text-gray-600">Total TTC</span>
        <span className="text-lg font-bold text-violet-600">
          {total.toFixed(2)} €
        </span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <motion.div
          whileHover={{ x: -5 }}
          transition={{ duration: 0.2 }}
          className="w-full sm:w-auto"
        >
          <Link 
            to="/products" 
            className="flex items-center justify-center sm:justify-start text-gray-700 hover:text-violet-600 transition-colors duration-300 group w-full sm:w-auto"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
              <ArrowLeft className="w-4 h-4 text-violet-600" />
            </div>
            <span className="font-medium">Continuer mes achats</span>
          </Link>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* Total visible sur desktop */}
          <div className="text-right hidden sm:block">
            <p className="text-sm text-gray-600">Total TTC</p>
            <p className="text-lg font-bold text-violet-600">
              {total.toFixed(2)} €
            </p>
          </div>
          
          <motion.button
            onClick={onCheckoutClick}
            className="w-full sm:w-auto px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileText className="w-5 h-5 mr-2" />
            <span>Demander un devis</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CartSummary;
