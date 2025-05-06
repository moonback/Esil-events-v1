import React, { useState, useEffect, useCallback } from 'react';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { Maximize2, Minimize2, MessageSquareText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductChatbot from './ProductChatbot';
import { Product } from '../types/Product';

// Fonction pour récupérer le produit sélectionné depuis le localStorage
const getSelectedProductForChatbot = (): Product | null => {
  const productStr = localStorage.getItem('selectedProductForChatbot');
  if (productStr) {
    try {
      const product = JSON.parse(productStr);
      // Supprimer l'item après l'avoir récupéré pour éviter de réouvrir le chatbot
      // avec le même produit lors d'une navigation ultérieure
      localStorage.removeItem('selectedProductForChatbot');
      return product;
    } catch (error) {
      console.error('Erreur lors de la récupération du produit pour le chatbot:', error);
    }
  }
  return null;
};

const FloatingChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [productQuestion, setProductQuestion] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Memoized handler for opening chatbot with product
  const handleOpenChatbotWithProduct = useCallback(() => {
    const product = getSelectedProductForChatbot();
    if (product) {
      setOpen(true);
      setProductQuestion(`Je souhaite des informations sur le produit "${product.name}".`);
    }
  }, []);

  // Check for selected product when component mounts
  useEffect(() => {
    // Initial check for product
    handleOpenChatbotWithProduct();
    
    // Écouter l'événement personnalisé pour ouvrir le chatbot
    window.addEventListener('openProductChatbot', handleOpenChatbotWithProduct);
    
    // Nettoyer l'écouteur d'événement lors du démontage du composant
    return () => {
      window.removeEventListener('openProductChatbot', handleOpenChatbotWithProduct);
    };
  }, [handleOpenChatbotWithProduct]);

  // Toggle chatbot visibility
  const toggleChatbot = useCallback(() => {
    setOpen(prevOpen => !prevOpen);
    // Reset product question when closing
    if (open) {
      setProductQuestion(null);
    }
  }, [open]);

  // Toggle fullscreen mode
  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(prevState => !prevState);
  }, []);

  return (
    <>
      {/* Bouton flottant */}
      <motion.button
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-br from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white rounded-full p-3 shadow-md hover:shadow-lg hover:shadow-violet-400/20 focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all duration-200"
        onClick={toggleChatbot}
        aria-label="Ouvrir le chatbot"
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        <div className="relative">
          <IoChatbubbleEllipsesOutline size={24} className="relative z-10" />
          <div className="absolute inset-0 rounded-full bg-white/10 blur-sm opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
        </div>
      </motion.button>

      {/* Modal/Panel du Chatbot */}
      <AnimatePresence>
        {open && (
          <motion.div 
            className={`fixed ${
              isFullScreen 
                ? 'inset-0' 
                : 'bottom-20 right-6 w-[95%] sm:w-[80%] md:w-[600px] lg:w-[600px] h-[80vh] sm:h-[85vh] md:h-[600px] mx-auto sm:mx-1 md:mx-0'
            } z-50 bg-white dark:bg-gray-900 border border-violet-200/50 dark:border-violet-800/30 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Éléments décoratifs */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 dark:from-violet-500/10 dark:to-indigo-500/10 pointer-events-none"></div>
            
            <div className="flex-1 overflow-hidden bg-transparent">
              <ProductChatbot 
                initialQuestion={productQuestion} 
                onClose={toggleChatbot} 
                onToggleFullScreen={toggleFullScreen} 
                isFullScreen={isFullScreen} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatbot;