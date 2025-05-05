import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lightbulb, X, Package } from 'lucide-react';
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
    <div className="p-3 border-t bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative">
      {/* Bouton flottant pour les suggestions */}
      {!showSuggestions && showSuggestionsButton && suggestions.length > 0 && (
        <motion.button
          onClick={onShowSuggestions}
          className="absolute -top-12 right-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white p-2 rounded-full shadow-lg z-10 flex items-center gap-2 pr-3 border border-violet-400 dark:border-violet-700 hover:shadow-violet-200 dark:hover:shadow-violet-900/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Lightbulb className="w-4 h-4" />
          <span className="text-xs font-medium">Suggestions</span>
        </motion.button>
      )}
      
      {/* Résultats de recherche de produits */}
      <AnimatePresence>
        {isSearchingProducts && productSearchResults.length > 0 && (
          <motion.div 
            className="absolute bottom-full left-0 w-full bg-white/95 dark:bg-gray-800/95 border-t rounded-t-xl shadow-lg max-h-60 overflow-y-auto z-10"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-medium text-violet-600">Suggestions</span>
                </div>
                <motion.button 
                  onClick={() => onHideSuggestions()}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  whileHover={{ rotate: 90 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="space-y-1">
                {productSearchResults.map(product => (
                  <motion.button
                    key={product.id}
                    onClick={() => onProductSelect(product)}
                    className="w-full p-2 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg flex items-center gap-2 group"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-violet-500" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{product.name}</div>
                      {product.category && (
                        <div className="text-xs text-gray-500">
                          {typeof product.category === 'string' ? product.category : product.category.join(', ')}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="relative group">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder="Posez votre question... Utilisez @ pour mentionner un produit"
              className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-violet-500/50 text-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all duration-200 group-hover:border-violet-200 dark:group-hover:border-violet-700/50 group-hover:shadow-md"
              disabled={isLoading}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {/* <span className="hidden sm:inline">Utilisez </span>@ pour mentionner un produit */}
            </div>
          </div>
          {showSuggestionsButton && !showSuggestions && (
            <motion.button 
              onClick={onShowSuggestions}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-full transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Lightbulb className="w-4 h-4" />
            </motion.button>
          )}
        </div>
        <motion.button
          onClick={onSendMessage}
          disabled={!input.trim() || isLoading}
          className="bg-violet-600 text-white p-2.5 rounded-xl disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default ChatInput;