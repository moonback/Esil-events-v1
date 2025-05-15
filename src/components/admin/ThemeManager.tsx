import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { Theme } from '../../types/theme';
import { getAllThemes } from '../../services/themeService';
import { useTheme } from '../../context/ThemeContext';

const ThemeManager: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { currentTheme, activateTheme } = useTheme();

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = () => {
    try {
      const allThemes = getAllThemes();
      setThemes(allThemes);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des thèmes');
      setLoading(false);
    }
  };

  const handleThemeActivation = (themeId: string) => {
    try {
      activateTheme(themeId);
      loadThemes();
      setSuccessMessage('Thème activé avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Erreur lors de l\'activation du thème');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return <div>Chargement des thèmes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des thèmes</h2>
        <Palette className="w-6 h-6 text-violet-600" />
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
              theme.id === currentTheme.id ? 'ring-2 ring-violet-500' : ''
            }`}
          >
            <div
              className="h-32"
              style={{ backgroundColor: theme.colors.background }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="w-24 h-4 rounded mx-auto"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {theme.name}
              </h3>
              <div className="flex space-x-2 mb-4">
                {Object.entries(theme.colors).map(([key, color]) => (
                  <div
                    key={key}
                    className="w-6 h-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                    title={`${key}: ${color}`}
                  />
                ))}
              </div>
              <button
                onClick={() => handleThemeActivation(theme.id)}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  theme.id === currentTheme.id
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
                disabled={theme.id === currentTheme.id}
              >
                {theme.id === currentTheme.id ? 'Thème actif' : 'Activer ce thème'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeManager; 