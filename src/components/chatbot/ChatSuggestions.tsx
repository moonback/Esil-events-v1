import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, MessageSquare, Package, X, Sparkles, DollarSign, Clock, Calendar, MapPin, Users, HelpCircle, Truck } from 'lucide-react';

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
  
  // Variantes d'animation pour les éléments décoratifs
  const decorationVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.4, ease: "easeIn" }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="suggestions-panel"
        className="p-4 sm:p-5 border-t border-violet-200/50 dark:border-violet-800/30 bg-gradient-to-b from-white/95 via-violet-50/30 to-violet-100/50 dark:from-gray-800/95 dark:via-gray-850/90 dark:to-gray-900/95 backdrop-blur-md shadow-inner relative overflow-hidden"
        initial={{ opacity: 0, y: 20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: 20, height: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        layout
      >
      {/* Éléments décoratifs améliorés */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10 pointer-events-none"></div>
      <motion.div 
        variants={decorationVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute -left-10 -bottom-10 w-40 h-40 bg-gradient-to-br from-amber-400/5 to-amber-500/10 rounded-full blur-3xl dark:from-amber-600/10 dark:to-amber-700/15 animate-pulse" 
        style={{ animationDuration: '15s' }}
      />
      <motion.div 
        variants={decorationVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-violet-400/5 to-violet-500/10 rounded-full blur-3xl dark:from-violet-600/10 dark:to-violet-700/15 animate-pulse" 
        style={{ animationDuration: '12s' }}
      />
      <motion.div 
        variants={decorationVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute right-1/4 top-1/3 w-24 h-24 bg-gradient-to-br from-blue-400/5 to-cyan-500/10 rounded-full blur-3xl dark:from-blue-600/10 dark:to-cyan-700/15 animate-pulse" 
        style={{ animationDuration: '18s' }}
      />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <motion.div 
          className="flex items-center gap-2.5"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-700/30 dark:to-amber-900/30 rounded-lg shadow-md ring-1 ring-amber-200/50 dark:ring-amber-800/30 group overflow-hidden relative">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0 dark:from-amber-600/0 dark:via-amber-600/20 dark:to-amber-600/0"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 relative z-10" />
          </div>
          <div>
            <motion.span 
              className="text-sm font-medium bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 dark:from-amber-400 dark:via-amber-300 dark:to-amber-200 bg-clip-text text-transparent"
              initial={{ backgroundPosition: '0% 50%' }}
              whileHover={{ backgroundPosition: '100% 50%' }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              Questions suggérées
            </motion.span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sélectionnez une question pour obtenir une réponse rapide</p>
          </div>
        </motion.div>
        <motion.button 
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-full shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group"
          aria-label="Fermer les suggestions"
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-red-100/0 group-hover:bg-red-100/50 dark:group-hover:bg-red-900/30 rounded-full transition-colors duration-200"></div>
          <X className="w-4 h-4 relative z-10 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-200" />
        </motion.button>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.07,
              delayChildren: 0.2
            }
          }
        }}
        initial="hidden"
        animate="show"
      >

        {suggestions.map((suggestion, index) => {
            // Utiliser useMemo pour optimiser la détermination des styles
            const suggestionStyle = useMemo(() => {
              const text = suggestion.toLowerCase();
              
              // Catégorie: Prix et tarifs
              if (text.includes('prix') || text.includes('tarif') || text.includes('coût') || 
                  text.includes('€') || text.includes('euro') || text.includes('budget') || 
                  text.includes('réduction') || text.includes('promotion')) {
                return {
                  icon: <DollarSign className="w-4 h-4" />,
                  bgGradient: "from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30",
                  textGradient: "from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400",
                  shadowColor: "shadow-emerald-500/10 dark:shadow-emerald-900/20"
                };
              }
              
              // Catégorie: Livraison et logistique
              if (text.includes('livraison') || text.includes('délai') || text.includes('disponible') || 
                  text.includes('transport') || text.includes('installation') || text.includes('retour') || 
                  text.includes('récupération')) {
                return {
                  icon: <Truck className="w-4 h-4" />,
                  bgGradient: "from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30",
                  textGradient: "from-blue-600 to-sky-600 dark:from-blue-400 dark:to-sky-400",
                  shadowColor: "shadow-blue-500/10 dark:shadow-blue-900/20"
                };
              }
              
              // Catégorie: Produits et équipements
              if (text.includes('catégorie') || text.includes('produit') || text.includes('équipement') || 
                  text.includes('matériel') || text.includes('modèle') || text.includes('référence') || 
                  text.includes('technique') || text.includes('spécification')) {
                return {
                  icon: <Package className="w-4 h-4" />,
                  bgGradient: "from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30",
                  textGradient: "from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400",
                  shadowColor: "shadow-amber-500/10 dark:shadow-amber-900/20"
                };
              }
              
              // Catégorie: Événements
              if (text.includes('événement') || text.includes('mariage') || text.includes('conférence') || 
                  text.includes('festival') || text.includes('concert') || text.includes('séminaire') || 
                  text.includes('cérémonie')) {
                return {
                  icon: <Calendar className="w-4 h-4" />,
                  bgGradient: "from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30",
                  textGradient: "from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400",
                  shadowColor: "shadow-pink-500/10 dark:shadow-pink-900/20"
                };
              }
              
              // Catégorie: Localisation et lieu
              if (text.includes('lieu') || text.includes('adresse') || text.includes('localisation') || 
                  text.includes('extérieur') || text.includes('intérieur') || text.includes('salle') || 
                  text.includes('emplacement')) {
                return {
                  icon: <MapPin className="w-4 h-4" />,
                  bgGradient: "from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30",
                  textGradient: "from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400",
                  shadowColor: "shadow-cyan-500/10 dark:shadow-cyan-900/20"
                };
              }
              
              // Catégorie: Capacité et public
              if (text.includes('personne') || text.includes('invité') || text.includes('participant') || 
                  text.includes('capacité') || text.includes('public') || text.includes('audience')) {
                return {
                  icon: <Users className="w-4 h-4" />,
                  bgGradient: "from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30",
                  textGradient: "from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400",
                  shadowColor: "shadow-indigo-500/10 dark:shadow-indigo-900/20"
                };
              }
              
              // Catégorie: Temps et durée
              if (text.includes('heure') || text.includes('durée') || text.includes('temps') || 
                  text.includes('jour') || text.includes('date') || text.includes('week-end')) {
                return {
                  icon: <Clock className="w-4 h-4" />,
                  bgGradient: "from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30",
                  textGradient: "from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400",
                  shadowColor: "shadow-orange-500/10 dark:shadow-orange-900/20"
                };
              }
              
              // Catégorie par défaut (questions générales)
              return {
                icon: <MessageSquare className="w-4 h-4" />,
                bgGradient: "from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30",
                textGradient: "from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400",
                shadowColor: "shadow-violet-500/10 dark:shadow-violet-900/20"
              };
            }, [suggestion]);
            
            // Destructurer les styles pour faciliter l'utilisation
            const { icon, bgGradient, textGradient, shadowColor } = suggestionStyle;
            
            return (
<motion.button
  key={index}
  onClick={() => onSuggestionClick(suggestion)}
  className={`flex items-center gap-3 text-left text-xs sm:text-sm md:text-base bg-white/90 dark:bg-gray-800/70 text-gray-700 dark:text-gray-200 p-3.5 sm:p-4 rounded-xl shadow-md ${shadowColor} border border-gray-200/50 dark:border-gray-700/50 hover:border-violet-200/70 dark:hover:border-violet-700/50 transition-all duration-300 group overflow-hidden relative`}
  initial={{ opacity: 0, y: 15, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ 
    type: "spring", 
    stiffness: 300, 
    damping: 15,
    delay: 0.1 + (index * 0.05) // Animation séquentielle
  }}
  whileHover={{ scale: 1.03, y: -3 }}
  whileTap={{ scale: 0.97 }}
>
  {/* Effet de brillance sur hover */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent hover:via-white/20 dark:hover:via-white/5 transition-all duration-700 ease-in-out bg-[length:0%_100%] hover:bg-[length:100%_100%] bg-no-repeat"></div>
  
  {/* Icône avec fond coloré */}
  <div className={`p-2.5 sm:p-3 bg-gradient-to-br ${bgGradient} rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200 flex-shrink-0 relative z-10 ring-1 ring-white/50 dark:ring-gray-800/50 overflow-hidden`}>
    <motion.div 
      className="absolute inset-0 bg-white/0 group-hover:bg-white/20 dark:group-hover:bg-white/10 rounded-lg"
      initial={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    />
    <div className={`text-gradient bg-gradient-to-br ${textGradient} bg-clip-text text-transparent relative z-10`}>
      <motion.div
        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>
    </div>
  </div>
  
  {/* Texte de la suggestion */}
  <div className="flex-1 relative z-10">
    <span className="line-clamp-3 font-medium group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors duration-200">
      {suggestion}
    </span>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 opacity-80">
      Cliquez pour obtenir une réponse détaillée
    </p>
  </div>
  
  {/* Indicateur de flèche sur hover */}
  <motion.div 
    className="w-8 h-8 rounded-full bg-violet-100/0 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 relative z-10 mr-1"
    whileHover={{ scale: 1.2, rotate: 5 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <motion.svg 
      className="w-4 h-4 text-violet-600/0 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      initial={{ x: -5, opacity: 0 }}
      whileHover={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </motion.svg>
  </motion.div>
</motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatSuggestions;