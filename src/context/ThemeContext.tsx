import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme } from '../types/theme';
import { getActiveTheme, activateTheme as activateThemeService } from '../services/themeService';

interface ThemeContextType {
  currentTheme: Theme;
  activateTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getActiveTheme());

  const activateTheme = (themeId: string) => {
    const newTheme = activateThemeService(themeId);
    setCurrentTheme(newTheme);
    
    // Appliquer les variables CSS pour le thème
    document.documentElement.style.setProperty('--color-primary', newTheme.colors.primary);
    document.documentElement.style.setProperty('--color-secondary', newTheme.colors.secondary);
    document.documentElement.style.setProperty('--color-background', newTheme.colors.background);
    document.documentElement.style.setProperty('--color-text', newTheme.colors.text);
  };

  useEffect(() => {
    // Appliquer le thème initial
    activateTheme(currentTheme.id);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, activateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 