import { supabase } from './supabaseClient';

// Types pour le suivi des mots-clés
export interface KeywordRanking {
  id: string;
  keyword: string;
  position: number;
  previousPosition: number | null;
  lastChecked: string;
  url: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Récupère tous les mots-clés suivis
 */
export const getKeywords = async (): Promise<{ data: KeywordRanking[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('keyword_rankings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Erreur lors de la récupération des mots-clés:', error);
    return { data: null, error };
  }
};

/**
 * Ajoute un nouveau mot-clé à suivre
 */
export const addKeyword = async (keywordData: Omit<KeywordRanking, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: KeywordRanking | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('keyword_rankings')
      .insert([
        {
          keyword: keywordData.keyword,
          position: keywordData.position || 0,
          previousPosition: keywordData.previousPosition || null,
          lastChecked: keywordData.lastChecked || new Date().toISOString().split('T')[0],
          url: keywordData.url,
          notes: keywordData.notes || ''
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Erreur lors de l\'ajout du mot-clé:', error);
    return { data: null, error };
  }
};

/**
 * Supprime un mot-clé
 */
export const deleteKeyword = async (id: string): Promise<{ success: boolean; error: any }> => {
  try {
    const { error } = await supabase
      .from('keyword_rankings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Erreur lors de la suppression du mot-clé:', error);
    return { success: false, error };
  }
};

/**
 * Met à jour la position d'un mot-clé spécifique
 */
export const updateKeywordPosition = async (id: string): Promise<{ data: KeywordRanking | null; error: any }> => {
  try {
    // D'abord, récupérer le mot-clé actuel pour obtenir sa position actuelle
    const { data: currentKeyword, error: fetchError } = await supabase
      .from('keyword_rankings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!currentKeyword) throw new Error('Mot-clé non trouvé');

    // Simuler une vérification de position (dans une application réelle, cela appellerait une API externe)
    // Par exemple, Google Search Console API ou un service de suivi de classement SEO
    const newPosition = await simulatePositionCheck(currentKeyword.keyword);
    
    // Mettre à jour le mot-clé avec la nouvelle position
    const { data, error } = await supabase
      .from('keyword_rankings')
      .update({
        previousPosition: currentKeyword.position,
        position: newPosition,
        lastChecked: new Date().toISOString().split('T')[0]
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la position du mot-clé:', error);
    return { data: null, error };
  }
};

/**
 * Met à jour les positions de tous les mots-clés
 */
export const updateAllKeywordPositions = async (): Promise<{ data: KeywordRanking[] | null; error: any }> => {
  try {
    // Récupérer tous les mots-clés
    const { data: keywords, error: fetchError } = await supabase
      .from('keyword_rankings')
      .select('*');

    if (fetchError) throw fetchError;
    if (!keywords || keywords.length === 0) return { data: [], error: null };

    // Pour chaque mot-clé, mettre à jour sa position
    const updatedKeywords = await Promise.all(
      keywords.map(async (keyword) => {
        const newPosition = await simulatePositionCheck(keyword.keyword);
        
        const { data, error } = await supabase
          .from('keyword_rankings')
          .update({
            previousPosition: keyword.position,
            position: newPosition,
            lastChecked: new Date().toISOString().split('T')[0]
          })
          .eq('id', keyword.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      })
    );

    return { data: updatedKeywords, error: null };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de toutes les positions:', error);
    return { data: null, error };
  }
};

// Fonction utilitaire pour simuler une vérification de position
// Dans une application réelle, cela serait remplacé par un appel à une API externe
const simulatePositionCheck = async (keyword: string): Promise<number> => {
  // Simuler un délai de traitement
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Générer une position aléatoire entre 1 et 30
  return Math.floor(Math.random() * 30) + 1;
};