import React from 'react';
import { CartItem } from './types';
import { motion } from 'framer-motion';

interface CartSummaryPreviewProps {
  items: CartItem[];
}

const CartSummaryPreview: React.FC<CartSummaryPreviewProps> = ({ items }) => {
  // Calculer le total du panier
  const cartTotal = items.reduce((total, item) => total + (item.priceTTC * item.quantity), 0);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-3xl shadow-xl mb-6 overflow-hidden relative"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Cercles décoratifs */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <motion.div 
          className="absolute top-10 left-5 w-32 h-32 rounded-full bg-purple-500 opacity-5"
          animate={{ 
            x: [0, 10, 0], 
            y: [0, -10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 8,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-5 right-10 w-48 h-48 rounded-full bg-indigo-500 opacity-5"
          animate={{ 
            x: [0, -15, 0], 
            y: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 10,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10">
        <motion.div variants={fadeInUp}>
          <h3 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent">
            Récapitulatif de votre demande
          </h3>
        </motion.div>
        
        <motion.div 
          className="max-h-60 overflow-y-auto mb-6 pr-2 custom-scrollbar"
          variants={staggerContainer}
        >
          {items.map((item, index) => (
            <motion.div 
              key={item.id} 
              className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
              variants={fadeInUp}
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
            >
              <div className="w-16 h-16 flex-shrink-0 mr-4 bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-md">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-grow">
                <h4 className="font-semibold text-gray-800 dark:text-white">{item.name}</h4>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 mr-1 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    Quantité: {item.quantity}
                  </span>
                  {item.color && (
                    <span className="ml-3 inline-flex items-center">
                      <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                      </svg>
                      Couleur: {item.color}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-violet-700 dark:text-violet-400">{(item.priceTTC * item.quantity).toFixed(2)} €</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{item.priceTTC.toFixed(2)} € / unité</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="flex justify-between items-center font-semibold text-lg pt-4 border-t border-gray-300 dark:border-gray-700"
          variants={fadeInUp}
        >
          <span className="text-gray-800 dark:text-white">Total estimatif:</span>
          <span className="text-2xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            {cartTotal.toFixed(2)} € TTC
          </span>
        </motion.div>
        
        <motion.div 
          className="mt-4 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-inner"
          variants={fadeInUp}
        >
          <p className="flex items-start">
            <svg className="w-5 h-5 mr-2 text-violet-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Ce montant est donné à titre indicatif. Le devis final pourra être ajusté en fonction de vos besoins spécifiques.
          </p>
        </motion.div>

        
      </div>

      
    </motion.div>
  );
};

export default CartSummaryPreview;
