import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, MessageSquare, Package, X, Sparkles, DollarSign, Clock, Calendar } from 'lucide-react';

interface ChatSuggestionsProps {
  suggestions: string[];
  showSuggestions: boolean;
  onSuggestionClick: (suggestion: string) => void;
  onClose: () => void;
}

const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({
  suggestions,
  showSuggestions,
  onSuggestionClick,
  onClose
}) => {
  if (!showSuggestions || suggestions.length === 0) return null;

  return (
    <motion.div 
      className="p-4 sm:p-5 border-t border-violet-200/50 dark:border-violet-800/30 bg-gradient-to-b from-white/95 via-violet-50/30 to-violet-100/50 dark:from-gray-800/95 dark:via-gray-850/90 dark:to-gray-900/95 backdrop-blur-md shadow-inner relative overflow-hidden"
      initial={{ opacity: 0, y: 20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: 20, height: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10 pointer-events-none"></div>
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-gradient-to-br from-amber-400/5 to-amber-500/10 rounded-full blur-3xl dark:from-amber-600/10 dark:to-amber-700/15 animate-pulse" style={{ animationDuration: '15s' }}></div>
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-violet-400/5 to-violet-500/10 rounded-full blur-3xl dark:from-violet-600/10 dark:to-violet-700/15 animate-pulse" style={{ animationDuration: '12s' }}></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-700/30 dark:to-amber-900/30 rounded-lg shadow-md ring-1 ring-amber-200/50 dark:ring-amber-800/30 group">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 group-hover:animate-ping" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <span className="text-sm font-medium bg-gradient-to-r from-amber-600 to-amber-500 dark:from-amber-400 dark:to-amber-300 bg-clip-text text-transparent">
              Questions suggérées
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sélectionnez une question pour obtenir une réponse rapide</p>
          </div>
        </div>
        <motion.button 
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
          aria-label="Fermer les suggestions"
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">

        {suggestions.map((suggestion, index) => {
          // Déterminer l'icône en fonction du contenu de la suggestion
          let icon = <MessageSquare className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />;
          
          if (suggestion.toLowerCase().includes('prix') || suggestion.toLowerCase().includes('tarif') || suggestion.toLowerCase().includes('coût') || suggestion.toLowerCase().includes('€')) {
            icon = <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 dark:text-emerald-400"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>;
          } else if (suggestion.toLowerCase().includes('livraison') || suggestion.toLowerCase().includes('délai') || suggestion.toLowerCase().includes('disponible')) {
            icon = <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 dark:text-blue-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
          } else if (suggestion.toLowerCase().includes('catégorie') || suggestion.toLowerCase().includes('produit')) {
            icon = <Package className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />;
          } else if (suggestion.toLowerCase().includes('événement') || suggestion.toLowerCase().includes('mariage') || suggestion.toLowerCase().includes('conférence')) {
            icon = <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500 dark:text-pink-400"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2"/><path d="M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M18 21a6 6 0 0 0-6-6h-3"/></svg>;
          }
          
          return (
            <motion.button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="flex items-center gap-2 text-left text-xs sm:text-sm bg-white dark:bg-gray-700/70 text-gray-700 dark:text-gray-200 p-2.5 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-600/50 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 dark:hover:from-violet-900/30 dark:hover:to-indigo-900/30 hover:border-violet-200 dark:hover:border-violet-700/70 transition-all duration-200 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors duration-200 flex-shrink-0">
                {icon}
              </div>
              <span className="line-clamp-2">
                {suggestion}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ChatSuggestions;