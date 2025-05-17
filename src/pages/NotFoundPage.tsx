import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici, vous pourriez implémenter une recherche réelle
    // ou rediriger vers une page de recherche
    console.log(`Recherche pour: ${searchTerm}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-all duration-500">
      <div 
        className={`max-w-lg w-full space-y-8 text-center transform transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="relative">
          {/* Illustration stylisée */}
          <div className="w-40 h-40 mx-auto mb-6">
            <img 
              src="images/logo.png" 
              alt="ESIL Events Logo"
              className="w-full h-full object-contain"
            />
          </div>
          
          <h1 className="text-9xl font-extrabold text-violet-500 bg-clip-text bg-gradient-to-r from-primary-500 to-purple-600 dark:from-primary-400 dark:to-purple-500">404</h1>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Page non trouvée
          </h2>
          
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        
        
        
        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-violet-500 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Retour à l'accueil
          </Link>
          
          
        </div>
        
        {/* Suggestions */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Vous pourriez être intéressé par
          </h3>
          <div className="flex flex-col gap-4">
            <Link
              to="/products"
              className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 text-left flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <h4 className="font-medium text-primary-600 dark:text-primary-400">Nos produits</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Découvrez notre catalogue de produits</p>
            </Link>
            
          </div>
        </div>
      </div>
     
    </div>
  );
};

export default NotFoundPage;