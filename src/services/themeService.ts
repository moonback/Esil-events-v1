import { Theme } from '../context/ThemeContext';
import { supabase } from '../config/supabaseClient';

const THEME_SETTING_KEY = 'current_theme';

export const getCurrentThemeSetting = async (): Promise<Theme | null> => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', THEME_SETTING_KEY)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du thème:', error);
      return null;
    }

    return data?.value as Theme || null;
  } catch (error) {
    console.error('Erreur lors de la récupération du thème:', error);
    return null;
  }
};

export const updateCurrentThemeSetting = async (theme: Theme): Promise<void> => {
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: THEME_SETTING_KEY, value: theme });

    if (error) {
      console.error('Erreur lors de la mise à jour du thème:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du thème:', error);
    throw error;
  }
}; 