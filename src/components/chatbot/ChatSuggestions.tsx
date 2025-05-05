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
            // Déterminer l'icône et la couleur en fonction du contenu de la suggestion
            let icon = <MessageSquare className="w-4 h-4" />;
            let bgGradient = "from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30";
            let textGradient = "from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400";
            let shadowColor = "shadow-violet-500/10 dark:shadow-violet-900/20";
            
            if (suggestion.toLowerCase().includes('prix') || suggestion.toLowerCase().includes('tarif') || suggestion.toLowerCase().includes('coût') || suggestion.toLowerCase().includes('€')) {
              icon = <DollarSign className="w-4 h-4" />;
              bgGradient = "from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30";
              textGradient = "from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400";
              shadowColor = "shadow-emerald-500/10 dark:shadow-emerald-900/20";
            } else if (suggestion.toLowerCase().includes('livraison') || suggestion.toLowerCase().includes('délai') || suggestion.toLowerCase().includes('disponible')) {
              icon = <Clock className="w-4 h-4" />;
              bgGradient = "from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30";
              textGradient = "from-blue-600 to-sky-600 dark:from-blue-400 dark:to-sky-400";
              shadowColor = "shadow-blue-500/10 dark:shadow-blue-900/20";
            } else if (suggestion.toLowerCase().includes('catégorie') || suggestion.toLowerCase().includes('produit')) {
              icon = <Package className="w-4 h-4" />;
              bgGradient = "from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30";
              textGradient = "from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400";
              shadowColor = "shadow-amber-500/10 dark:shadow-amber-900/20";
            } else if (suggestion.toLowerCase().includes('événement') || suggestion.toLowerCase().includes('mariage') || suggestion.toLowerCase().includes('conférence')) {
              icon = <Calendar className="w-4 h-4" />;
              bgGradient = "from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30";
              textGradient = "from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400";
              shadowColor = "shadow-pink-500/10 dark:shadow-pink-900/20";
            }
            
            return (
              <motion.button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className={`flex items-center gap-3 text-left text-xs sm:text-sm bg-white/90 dark:bg-gray-800/70 text-gray-700 dark:text-gray-200 p-3.5 rounded-xl shadow-md ${shadowColor} border border-gray-200/50 dark:border-gray-700/50 hover:border-violet-200/70 dark:hover:border-violet-700/50 transition-all duration-300 group overflow-hidden relative`}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {/* Effet de brillance sur hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent hover:via-white/20 dark:hover:via-white/5 transition-all duration-700 ease-in-out bg-[length:0%_100%] hover:bg-[length:100%_100%] bg-no-repeat"></div>
                
                {/* Icône avec fond coloré */}
                <div className={`p-2 bg-gradient-to-br ${bgGradient} rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200 flex-shrink-0 relative z-10 ring-1 ring-white/50 dark:ring-gray-800/50`}>
                  <div className={`text-gradient bg-gradient-to-br ${textGradient} bg-clip-text text-transparent`}>
                    {icon}
                  </div>
                </div>
                
                {/* Texte de la suggestion */}
                <div className="flex-1 relative z-10">
                  <span className="line-clamp-2 font-medium group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors duration-200">
                    {suggestion}
                  </span>
                </div>
                
                {/* Indicateur de flèche sur hover */}
                <div className="w-6 h-6 rounded-full bg-violet-100/0 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 relative z-10 mr-1">
                  <svg className="w-3 h-3 text-violet-600/0 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>
            );
          })}
      </div>
    </motion.div>
  );
};

export default ChatSuggestions;