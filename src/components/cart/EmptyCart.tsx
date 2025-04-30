import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyCartProps } from './types';
import { motion } from 'framer-motion';

const EmptyCart: React.FC<EmptyCartProps> = ({ 
  message = "Vous n'avez pas encore ajouté de produits à votre devis."
}) => {
  return (
    <motion.div 
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-10 rounded-3xl shadow-xl text-center max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-100 rounded-full opacity-50 dark:opacity-20 blur-3xl z-0"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full opacity-60 dark:opacity-20 blur-3xl z-0"></div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 flex justify-center"
          >
            <div className="bg-violet-50 dark:bg-gray-700 p-6 rounded-full">
              <svg className="w-20 h-20 text-violet-500 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </motion.div>
          
          <motion.h2 
            className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Votre panier est vide
          </motion.h2>
          
          <motion.p 
            className="mb-8 text-gray-600 dark:text-gray-300"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {message}
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to="/" 
              className="inline-flex items-center justify-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              Découvrir nos produits
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmptyCart;
