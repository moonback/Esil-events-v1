import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onChange?: (query: string) => void;
  value?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onChange, value }) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  // Définition des animations
  const pulseAnimation = {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="w-full">
      <motion.form 
        onSubmit={handleSubmit} 
        className="relative max-w-2xl mx-auto"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-violet-200/20 to-indigo-200/20 dark:from-violet-900/10 dark:to-indigo-900/10 rounded-full blur-md z-0"
          animate={{
            boxShadow: [
              "0 0 0 rgba(139, 92, 246, 0)",
              "0 0 8px rgba(139, 92, 246, 0.3)",
              "0 0 0 rgba(139, 92, 246, 0)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onChange?.(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Rechercher un produit..."
          className="w-full pl-12 pr-12 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/50 rounded-full text-sm focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 dark:focus:ring-violet-400/20 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md relative z-10"
        />
        <motion.div 
          className={`absolute left-3.5 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full ${isFocused ? 'bg-violet-100 dark:bg-violet-900/30' : ''} transition-all duration-300 z-10`}
          animate={isFocused ? pulseAnimation : {}}
        >
          <Search 
            className={`w-4 h-4 transition-colors duration-300 ${isFocused ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500'}`}
          />
        </motion.div>
        {searchQuery && (
          <motion.button
            type="button"
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-300 bg-gray-100/80 dark:bg-gray-800/80 rounded-full w-6 h-6 flex items-center justify-center z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </motion.form>
    </div>
  );
};

export default SearchBar;
