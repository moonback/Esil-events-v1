import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lightbulb, X, Package, Sparkles, Search } from 'lucide-react';
import { Product } from '../../types/Product';

interface ChatInputProps {
  input: string;
  inputRef: React.RefObject<HTMLInputElement>;
  isLoading: boolean;
  isSearchingProducts: boolean;
  productSearchResults: Product[];
  showSuggestions: boolean;
  showSuggestionsButton: boolean;
  suggestions: string[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSendMessage: () => void;
  onProductSelect: (product: Product) => void;
  onShowSuggestions: () => void;
  onHideSuggestions: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  inputRef,
  isLoading,
  isSearchingProducts,
  productSearchResults,
  showSuggestions,
  showSuggestionsButton,
  suggestions,
  onInputChange,
  onKeyDown,
  onSendMessage,
  onProductSelect,
  onShowSuggestions,
  onHideSuggestions
}) => {
  return (
    <div className="p-3 sm:p-4 border-t border-violet-100/50 dark:border-violet-800/30 bg-gradient-to-b from-white/95 to-violet-50/30 dark:from-gray-800/95 dark:to-gray-900/80 backdrop-blur-md relative">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10 pointer-events-none"></div>
      
      {/* Bouton flottant pour les suggestions */}
      <AnimatePresence>
        {!showSuggestions && showSuggestionsButton && suggestions.length > 0 && (
          <motion.button
            onClick={onShowSuggestions}
            className="absolute -top-14 right-4 bg-gradient-to-r from-amber-400 to-amber-500 text-white p-2 rounded-full shadow-lg shadow-amber-500/20 dark:shadow-amber-700/20 z-10 flex items-center gap-2 pr-4 border border-amber-300 dark:border-amber-600 hover:shadow-amber-300/30 dark:hover:shadow-amber-700/40 group"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <Lightbulb className="w-4 h-4 relative z-10" />
              <div className="absolute inset-0 bg-white rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">Suggestions</span>
              <Sparkles className="w-3 h-3 text-amber-100 animate-pulse" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Résultats de recherche de produits */}
      <AnimatePresence>
        {isSearchingProducts && productSearchResults.length > 0 && (
          <motion.div 
            className="absolute bottom-full left-0 w-full bg-white/95 dark:bg-gray-800/95 border-t border-violet-200/50 dark:border-violet-800/30 rounded-t-2xl shadow-xl max-h-72 overflow-y-auto z-10 backdrop-blur-md"
            initial={{ height: 0, opacity: 0, y: 20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-lg shadow-sm">
                    <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                    Produits trouvés
                  </span>
                </div>
                <motion.button 
                  onClick={() => onHideSuggestions()}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="space-y-2">
                {productSearchResults.map(product => (
                  <motion.button
                    key={product.id}
                    onClick={() => onProductSelect(product)}
                    className="w-full p-3 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 dark:hover:from-violet-900/20 dark:hover:to-indigo-900/20 rounded-xl flex items-center gap-3 group border border-transparent hover:border-violet-200/70 dark:hover:border-violet-800/50 shadow-sm hover:shadow-md transition-all duration-200"
                    whileHover={{ x: 5, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-400/0 to-indigo-500/0 group-hover:from-violet-400/20 group-hover:to-indigo-500/20 transition-colors duration-200"></div>
                      <Package className="w-5 h-5 text-violet-600 dark:text-violet-400 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                    </div>
                    
                    <div className="text-left flex-1">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors duration-200">
                        {product.name}
                      </div>
                      {product.category && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400/50 dark:bg-violet-600/50"></span>
                          {typeof product.category === 'string' ? product.category : product.category.join(', ')}
                        </div>
                      )}
                    </div>
                    
                    <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-3 h-3 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center gap-3 mt-1">
        <div className="relative flex-1">
          <div className="relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/0 to-violet-500/0 group-hover:from-violet-500/5 group-hover:via-indigo-500/5 group-hover:to-violet-500/5 dark:group-hover:from-violet-600/10 dark:group-hover:via-indigo-600/10 dark:group-hover:to-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            
            <div className="relative flex items-center">
              {/* Icône @ pour mentionner un produit */}
              <div className="absolute left-4 text-gray-400 dark:text-gray-500 pointer-events-none">
                <span className="text-sm font-medium bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-400 bg-clip-text text-transparent">@</span>
              </div>
              
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={onInputChange}
                onKeyDown={onKeyDown}
                placeholder="Posez votre question... Utilisez @ pour mentionner un produit"
                className="w-full bg-white/80 dark:bg-gray-800/50 rounded-2xl pl-10 pr-12 py-3.5 focus:ring-2 focus:ring-violet-500/50 text-sm border border-violet-200/50 dark:border-violet-800/30 shadow-md hover:shadow-lg focus:shadow-lg transition-all duration-200 group-hover:border-violet-300/50 dark:group-hover:border-violet-700/50"
                disabled={isLoading}
              />
              
              {/* Effet de focus */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-violet-300/0 group-hover:ring-violet-300/30 dark:group-hover:ring-violet-700/30 pointer-events-none transition-all duration-300"></div>
              
              {/* Bouton de suggestions */}
              {showSuggestionsButton && !showSuggestions && (
                <motion.button 
                  onClick={onShowSuggestions}
                  className="absolute right-12 p-2 text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 rounded-full transition-colors duration-200 z-10"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  title="Afficher les suggestions"
                >
                  <Lightbulb className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
        
        <motion.button
          onClick={onSendMessage}
          disabled={!input.trim() || isLoading}
          className={`p-3.5 rounded-xl shadow-md flex items-center justify-center ${!input.trim() || isLoading ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/20 hover:shadow-violet-500/30'} transition-all duration-200`}
          whileHover={!input.trim() || isLoading ? {} : { scale: 1.05, y: -2 }}
          whileTap={!input.trim() || isLoading ? {} : { scale: 0.95 }}
        >
          <Send className="w-5 h-5" />
          <span className="absolute animate-ping w-2 h-2 rounded-full bg-white opacity-75 scale-0 group-hover:scale-100"></span>
        </motion.button>
      </div>
    </div>
  );
};

export default ChatInput;