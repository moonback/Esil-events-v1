import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types/Product';
import { searchProducts } from '../services/productService';
import { Search, ArrowRight } from 'lucide-react';

interface SearchResultsProps {
  query: string;
  onSelect: (product: Product) => void;
  onClose: () => void;
  results: Product[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, onSelect }) => {
  const navigate = useNavigate();
  const [results, setResults] = useState<Product[]>([]);
  const [, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setIsLoading(true);
        searchProducts(query)
          .then(setResults)
          .catch(console.error)
          .finally(() => setIsLoading(false));
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);
  // Définition des animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {results.length > 0 && (
        <motion.div 
          className="absolute z-10 mt-2 w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-xl rounded-xl max-h-60 sm:max-h-72 overflow-auto border border-gray-200/50 dark:border-gray-700/50"
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div 
            className="p-1.5 sm:p-2 space-y-0.5 sm:space-y-1"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {results.length > 0 && (
              <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center">
                <Search className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                <span>Résultats de recherche</span>
              </div>
            )}
            
            {results.map((product) => (
              <motion.div 
                key={product.id}
                variants={item}
                className="px-2 sm:px-3 py-2 sm:py-2.5 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 dark:hover:from-violet-900/20 dark:hover:to-indigo-900/20 rounded-lg cursor-pointer group transition-all duration-300 hover:shadow-sm"
                onClick={() => {
                  onSelect(product);
                  navigate(`/product/${product.slug}`);
                }}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors duration-300 truncate">
                      {product.name}
                    </p>
                    {product.category && (
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                        {typeof product.category === 'string' 
                          ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
                          : product.category[0].charAt(0).toUpperCase() + product.category[0].slice(1)}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 ml-2" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchResults;