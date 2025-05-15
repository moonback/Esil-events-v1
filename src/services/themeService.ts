import { Theme } from '../types/theme';

// Types de thèmes disponibles
export const THEME_TYPES = {
  DEFAULT: 'default',
  CHRISTMAS: 'christmas',
  VALENTINE: 'valentine'
} as const;

// Configuration des thèmes
export const THEME_CONFIG: Record<string, Theme> = {
  [THEME_TYPES.DEFAULT]: {
    id: THEME_TYPES.DEFAULT,
    name: 'Thème par défaut',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: '#ffffff',
      text: '#1f2937'
    },
    isActive: true
  },
  [THEME_TYPES.CHRISTMAS]: {
    id: THEME_TYPES.CHRISTMAS,
    name: 'Thème Noël',
    colors: {
      primary: '#dc2626',
      secondary: '#059669',
      background: '#fef2f2',
      text: '#1f2937'
    },
    isActive: false
  },
  [THEME_TYPES.VALENTINE]: {
    id: THEME_TYPES.VALENTINE,
    name: 'Thème Saint-Valentin',
    colors: {
      primary: '#ec4899',
      secondary: '#f43f5e',
      background: '#fdf2f8',
      text: '#1f2937'
    },
    isActive: false
  }
};

// Récupérer le thème actif
export const getActiveTheme = (): Theme => {
  const activeTheme = Object.values(THEME_CONFIG).find(theme => theme.isActive);
  return activeTheme || THEME_CONFIG[THEME_TYPES.DEFAULT];
};

// Activer un thème
export const activateTheme = (themeId: string): Theme => {
  // Désactiver tous les thèmes
  Object.values(THEME_CONFIG).forEach(theme => {
    theme.isActive = false;
  });

  // Activer le thème sélectionné
  if (THEME_CONFIG[themeId]) {
    THEME_CONFIG[themeId].isActive = true;
  }

  return getActiveTheme();
};

// Récupérer tous les thèmes
export const getAllThemes = (): Theme[] => {
  return Object.values(THEME_CONFIG);
}; 