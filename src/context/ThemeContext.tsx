import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getCurrentThemeSetting, updateCurrentThemeSetting } from '../services/themeService';

export type Theme = 'default' | 'noel' | 'saint-valentin' | 'halloween';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app-theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('default');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Essayer de charger le thème depuis le serveur
        const serverTheme = await getCurrentThemeSetting();
        if (serverTheme) {
          setThemeState(serverTheme);
          localStorage.setItem(THEME_STORAGE_KEY, serverTheme);
        } else {
          // Fallback sur localStorage
          const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
          if (storedTheme) setThemeState(storedTheme);
        }
      } catch (error) {
        console.warn('Erreur lors du chargement du thème depuis le serveur, utilisation de localStorage:', error);
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
        if (storedTheme) setThemeState(storedTheme);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    
    try {
      // Sauvegarder le thème sur le serveur
      await updateCurrentThemeSetting(newTheme);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème sur le serveur:', error);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, isLoading]);

  if (isLoading) {
    return <div data-theme="default">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 