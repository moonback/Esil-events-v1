import React, { useState, useEffect } from 'react';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
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

  // Check for selected product when component mounts
  useEffect(() => {
    const selectedProduct = getSelectedProductForChatbot();
    if (selectedProduct) {
      // Open the chatbot automatically
      setOpen(true);
      // Create a question about the product
      setProductQuestion(`Je souhaite des informations sur le produit "${selectedProduct.name}".`);
    }
    
    // Écouter l'événement personnalisé pour ouvrir le chatbot
    const handleOpenChatbotEvent = () => {
      // Vérifier à nouveau s'il y a un produit sélectionné
      const product = getSelectedProductForChatbot();
      if (product) {
        setOpen(true);
        setProductQuestion(`Je souhaite des informations sur le produit "${product.name}".`);
      }
    };
    
    window.addEventListener('openProductChatbot', handleOpenChatbotEvent);
    
    // Nettoyer l'écouteur d'événement lors du démontage du composant
    return () => {
      window.removeEventListener('openProductChatbot', handleOpenChatbotEvent);
    };
  }, []);

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg focus:outline-none"
        onClick={() => setOpen(!open)}
        aria-label="Ouvrir le chatbot"
      >
        <IoChatbubbleEllipsesOutline size={28} />
      </button>

      {/* Chatbot Modal/Panel */}
      {open && (
        <div className="fixed bottom-20 right-0 z-50 w-full md:w-[600px] lg:w-[800px] h-[80vh] md:h-[800px] mx-1 md:mx-0 bg-white dark:bg-gray-900 border border-gray-300 rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-blue-700 dark:text-blue-400">Assistant IA</span>
            <button
              className="text-gray-500 hover:text-red-500 p-2 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={() => setOpen(false)}
              aria-label="Fermer le chatbot"
            >
              <span className="text-xl font-bold">×</span>
            </button>
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