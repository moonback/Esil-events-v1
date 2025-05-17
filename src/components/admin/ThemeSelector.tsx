import React from 'react';
import { useTheme, Theme } from '../../context/ThemeContext';
import { Sun, Moon, Gift, Heart, Ghost } from 'lucide-react';

const themeOptions: { value: Theme; label: string; icon: JSX.Element }[] = [
  { value: 'default', label: 'Défaut', icon: <Sun className="w-4 h-4" /> },
  { value: 'noel', label: 'Noël', icon: <Gift className="w-4 h-4" /> },
  { value: 'halloween', label: 'Halloween', icon: <Ghost className="w-4 h-4" /> },
  { value: 'saint-valentin', label: 'Saint-Valentin', icon: <Heart className="w-4 h-4" /> },
];

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
        Sélecteur de Thème
      </h3>
      <div className="space-y-2">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`w-full flex items-center px-4 py-2 text-sm rounded-md transition-colors
              ${
                theme === option.value
                  ? 'bg-violet-600 text-white font-semibold shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-violet-100 dark:hover:bg-violet-700'
              }`}
          >
            {React.cloneElement(option.icon, { 
              className: `w-5 h-5 mr-3 ${theme === option.value ? 'text-white' : 'text-violet-500 dark:text-violet-400'}` 
            })}
            {option.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        Le thème sélectionné sera appliqué à l'ensemble du site.
        Actuellement : <span className="font-semibold">{themeOptions.find(opt => opt.value === theme)?.label || theme}</span>
      </p>
    </div>
  );
};

export default ThemeSelector; 