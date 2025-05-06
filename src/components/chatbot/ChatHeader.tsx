import React from 'react';
import { motion } from 'framer-motion';
import { Settings, RotateCcw, X, Maximize2, Minimize2, MessageSquareText, ClipboardList } from 'lucide-react';

interface ChatHeaderProps {
  onSettingsClick: () => void;
  onResetClick: () => void;
  onToggleFullScreen?: () => void;
  onClose?: () => void;
  onOpenQuestionnaire?: () => void;
  isFullScreen?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onSettingsClick,
  onResetClick,
  onToggleFullScreen,
  onClose,
  onOpenQuestionnaire,
  isFullScreen
}) => {
  return (
    <motion.div 
      className="bg-gradient-to-r from-white via-violet-50/30 to-violet-100/50 dark:from-gray-800 dark:via-gray-800/95 dark:to-violet-900/20 text-black dark:text-white p-3 flex justify-between items-center border-b border-violet-200/70 dark:border-violet-800/30 shadow-md backdrop-blur-md relative overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Éléments décoratifs en arrière-plan */}
      <div className="absolute -left-10 -top-10 w-40 h-40 bg-gradient-to-br from-violet-400/10 to-purple-500/10 rounded-full blur-3xl dark:from-violet-600/10 dark:to-purple-700/10 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-br from-indigo-400/10 to-blue-500/10 rounded-full blur-3xl dark:from-indigo-600/10 dark:to-blue-700/10 animate-pulse" style={{ animationDuration: '10s' }}></div>
      
      <div className="flex items-center gap-3 z-10">
        <motion.div 
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 dark:shadow-violet-900/30 ring-2 ring-white/50 dark:ring-violet-900/50 overflow-hidden group"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-violet-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <MessageSquareText className="w-5 h-5 text-white relative z-10" />
        </motion.div>
        
        <div className="flex flex-col">
          <motion.span 
            className="bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent font-bold text-base"
            initial={{ backgroundPosition: '0% 50%' }}
            whileHover={{ backgroundPosition: '100% 50%' }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            ESIL Assistant
          </motion.span>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Assistant IA</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 z-10">
        {onOpenQuestionnaire && (
          <motion.button 
            onClick={onOpenQuestionnaire}
            className="p-2 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-md transition-all duration-200 relative overflow-hidden group"
            title="Questionnaire de location"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-100/0 via-violet-100/70 to-violet-100/0 dark:from-violet-800/0 dark:via-violet-800/20 dark:to-violet-800/0 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
            <ClipboardList className="w-4 h-4 relative z-10" />
          </motion.button>
        )}
        
        {/* <motion.button 
          onClick={onSettingsClick}
          className="p-2 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-md transition-all duration-200 relative overflow-hidden group"
          title="Paramètres"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-100/0 via-violet-100/70 to-violet-100/0 dark:from-violet-800/0 dark:via-violet-800/20 dark:to-violet-800/0 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
          <Settings className="w-4 h-4 relative z-10" />
        </motion.button> */}
        
        <motion.button 
          onClick={onResetClick}
          className="flex items-center gap-1.5 text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-200"
          title="Nouvelle conversation"
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline font-medium">Nouvelle location</span>
        </motion.button>
        
        {onToggleFullScreen && (
          <motion.button
            className="p-2 text-violet-600 dark:text-violet-300 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            onClick={onToggleFullScreen}
            aria-label={isFullScreen ? "Quitter le plein écran" : "Plein écran"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </motion.button>
        )}
        
        {onClose && (
          <motion.button
            className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            onClick={onClose}
            aria-label="Fermer le chatbot"
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <X size={16} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default ChatHeader;