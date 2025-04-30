import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItemListProps } from './types';
import { motion } from 'framer-motion';

const CartItemList: React.FC<CartItemListProps> = ({ items, removeFromCart, updateQuantity }) => {
  if (items.length === 0) return null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-200/30 dark:border-gray-700/30"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-violet-50/90 to-indigo-50/90 dark:from-violet-900/30 dark:to-indigo-900/30">
            <tr>
              <th className="py-4 px-6 text-left text-sm font-medium text-violet-700 dark:text-violet-300">Produit</th>
              <th className="py-4 px-6 text-center text-sm font-medium text-violet-700 dark:text-violet-300">Quantité</th>
              <th className="py-4 px-6 text-right text-sm font-medium text-violet-700 dark:text-violet-300">Prix TTC</th>
              <th className="py-4 px-6 text-right text-sm font-medium text-violet-700 dark:text-violet-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <motion.tr 
                key={item.id} 
                className="border-t border-gray-200/30 dark:border-gray-700/30 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200"
                variants={itemVariants}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg shadow-md mr-4"
                      />
                    </motion.div>
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">{item.name}</h3>
                      {item.color && <p className="text-sm text-gray-500 dark:text-gray-400">Couleur: {item.color}</p>}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center justify-center">
                      <motion.button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-l-lg disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                        disabled={item.quantity <= 1}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Minus className="w-4 h-4" />
                      </motion.button>
                      <span className="px-4 py-1.5 border-t border-b border-gray-300 dark:border-gray-600 min-w-[40px] text-center bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {item.quantity}
                      </span>
                      <motion.button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-right font-bold text-gray-800 dark:text-gray-200">
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    {(item.priceTTC).toFixed(2)} €
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <motion.button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/30 transition-all duration-300 shadow-sm hover:shadow-md"
                    aria-label={`Supprimer ${item.name}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot className="bg-gradient-to-r from-violet-50/90 to-indigo-50/90 dark:from-violet-900/30 dark:to-indigo-900/30">
            <tr>
              <td colSpan={2} className="py-4 px-6 text-right font-medium text-gray-700 dark:text-gray-300">
                Total TTC
              </td>
              <td className="py-4 px-6 text-right font-bold">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent text-lg">
                  {items.reduce((total, item) => total + (item.priceTTC * item.quantity), 0).toFixed(2)} €
                </span>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <motion.div 
        className="p-4 bg-gradient-to-r from-violet-50/80 to-indigo-50/80 dark:from-violet-900/20 dark:to-indigo-900/20 border-t border-gray-200/30 dark:border-gray-700/30"
        variants={itemVariants}
      >
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Les prix incluent la TVA
          </p>
          <motion.button
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Passer à la caisse
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CartItemList;
