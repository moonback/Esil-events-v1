import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { CartSummaryProps } from './types';
import { motion } from 'framer-motion';

const CartSummary: React.FC<CartSummaryProps> = ({ items, onCheckoutClick }) => {
  return (
    <motion.div 
      className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 p-4 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-md border border-gray-200/30 dark:border-gray-700/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        whileHover={{ x: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Link 
          to="/products" 
          className="flex items-center text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-300 group"
        >
          <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-800/30 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
            <ArrowLeft className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="font-medium">Continuer mes achats</span>
        </Link>
      </motion.div>
      
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total TTC</p>
          <p className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            {items?.reduce((total, item) => total + (item.priceTTC * item.quantity), 0).toFixed(2) || '0.00'} €
          </p>
        </div>
        
        <motion.button
          onClick={onCheckoutClick}
          className="px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FileText className="w-5 h-5 mr-2" />
          <span>Demander un devis</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CartSummary;
