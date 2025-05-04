import React, { useState, useEffect, useCallback } from 'react';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { Maximize2, Minimize2 } from 'lucide-react';
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
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
        onClick={toggleChatbot}
        aria-label="Ouvrir le chatbot"
      >
        <IoChatbubbleEllipsesOutline size={28} />
      </button>

      {/* Chatbot Modal/Panel */}
      {open && (
        <div className={`fixed ${isFullScreen ? 'inset-0' : 'bottom-20 right-0 w-full md:w-[600px] lg:w-[800px] h-[80vh] md:h-[800px] mx-1 md:mx-0'} z-50 bg-white dark:bg-gray-900 border border-gray-300 rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out`}>
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-blue-700 dark:text-blue-400">Assistant IA</span>
            <div className="flex items-center space-x-2">
              <button
                className="text-gray-500 hover:text-blue-500 p-2 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={toggleFullScreen}
                aria-label={isFullScreen ? "Quitter le mode plein écran" : "Passer en mode plein écran"}
              >
                {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button
                className="text-gray-500 hover:text-red-500 p-2 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500"
                onClick={toggleChatbot}
                aria-label="Fermer le chatbot"
              >
                <span className="text-xl font-bold">×</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-800">
            <ProductChatbot initialQuestion={productQuestion} />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;