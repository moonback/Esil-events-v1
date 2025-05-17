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

  const total = items.reduce((sum, item) => sum + (item.priceTTC * item.quantity), 0);

  return (
    <motion.div 
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {items.map((item) => (
        <motion.div 
          key={item.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          variants={itemVariants}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Image et nom du produit */}
            <div className="flex items-start gap-4 flex-1">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg shadow-sm"
                />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{item.name}</h3>
                {item.color && (
                  <p className="text-sm text-gray-500">Couleur: {item.color}</p>
                )}
                <p className="text-lg font-bold text-violet-600 mt-2">
                  {(item.priceTTC * item.quantity).toFixed(2)} €
                </p>
              </div>
            </div>

            {/* Contrôles de quantité et suppression */}
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="flex items-center">
                <motion.button
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="p-2 border border-gray-300 rounded-l-lg disabled:opacity-50 bg-white text-gray-700"
                  disabled={item.quantity <= 1}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                <span className="px-4 py-2 border-t border-b border-gray-300 min-w-[40px] text-center bg-white text-gray-800">
                  {item.quantity}
                </span>
                <motion.button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-2 border border-gray-300 rounded-r-lg bg-white text-gray-700"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>

              <motion.button
                onClick={() => removeFromCart(item.id)}
                className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-all duration-300"
                aria-label={`Supprimer ${item.name}`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Total */}
      <motion.div 
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4"
        variants={itemVariants}
      >
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Total TTC</span>
          <span className="text-xl font-bold text-violet-600">
            {total.toFixed(2)} €
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Les prix incluent la TVA
        </p>
      </motion.div>
    </motion.div>
  );
};

export default CartItemList;
