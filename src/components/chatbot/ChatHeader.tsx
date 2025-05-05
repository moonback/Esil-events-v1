import React from 'react';
import { motion } from 'framer-motion';
import { Settings, RotateCcw, X } from 'lucide-react';

interface ChatHeaderProps {
  onSettingsClick: () => void;
  onResetClick: () => void;
  onToggleFullScreen?: () => void;
  onClose?: () => void;
  isFullScreen?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onSettingsClick,
  onResetClick,
  onToggleFullScreen,
  onClose,
  isFullScreen
}) => {
  return (
    <div className="bg-gradient-to-r from-white to-violet-50 dark:from-gray-800 dark:to-gray-900 text-black dark:text-white p-3 flex justify-between items-center border-b border-violet-200 dark:border-violet-800 shadow-md backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-400 to-violet-700 flex items-center justify-center shadow-md transform hover:rotate-3 transition-all duration-300 ring-2 ring-violet-200 dark:ring-violet-900">
          <span className="text-white text-sm font-bold">CHAT</span>
        </div>
        <div className="flex flex-col">
          <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-violet-700 bg-clip-text text-transparent font-bold text-base">
            ESIL Assistant
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">AI Assistant</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <motion.button 
          onClick={onSettingsClick}
          className="p-2 text-violet-700 dark:text-violet-200 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/50 transition-all duration-200"
          title="Settings"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-4 h-4" />
        </motion.button>
        <motion.button 
          onClick={onResetClick}
          className="flex items-center gap-1 text-sm bg-violet-500 hover:bg-violet-600 text-white px-3 py-2 rounded-lg transition-all duration-200"
          title="New conversation"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Nouveau</span>
        </motion.button>
        {onToggleFullScreen && (
          <motion.button
            className="p-2 text-violet-500 hover:text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/50 rounded-lg transition-all duration-200"
            onClick={onToggleFullScreen}
            aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isFullScreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            )}
          </motion.button>
        )}
        {onClose && (
          <motion.button
            className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-all duration-200"
            onClick={onClose}
            aria-label="Close chatbot"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={16} />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;