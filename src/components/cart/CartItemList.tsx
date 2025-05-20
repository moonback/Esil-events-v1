import React, { memo, useCallback, useMemo } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItemListProps } from './types';
import { motion } from 'framer-motion';

const CartItemList: React.FC<CartItemListProps> = memo(({ items, removeFromCart, updateQuantity }) => {
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

  const total = useMemo(() => 
    items.reduce((sum, item) => sum + (item.priceTTC * item.quantity), 0),
    [items]
  );

  return (
    <motion.div 
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {items.map((item) => (
        <CartItem 
          key={item.id} 
          item={item} 
          removeFromCart={removeFromCart} 
          updateQuantity={updateQuantity}
          variants={itemVariants}
        />
      ))}
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
});

interface CartItemProps {
  item: CartItemListProps['items'][0];
  removeFromCart: CartItemListProps['removeFromCart'];
  updateQuantity: CartItemListProps['updateQuantity'];
  variants: any;
}

const CartItem: React.FC<CartItemProps> = memo(({ item, removeFromCart, updateQuantity, variants }) => {
  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(item.id, newQuantity);
    }
  }, [item.id, updateQuantity]);

  const handleRemove = useCallback(() => {
    removeFromCart(item.id);
  }, [item.id, removeFromCart]);

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
      variants={variants}
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
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="p-2 hover:bg-gray-50 transition-colors"
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4 text-gray-600" />
            </button>
            <span className="px-4 py-2 text-gray-700">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="p-2 hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

CartItemList.displayName = 'CartItemList';
CartItem.displayName = 'CartItem';

export default CartItemList;
