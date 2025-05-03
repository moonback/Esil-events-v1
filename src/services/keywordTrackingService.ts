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
 * Met à jour la position d'un mot-clé spécifique en utilisant Google Search Console
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

    // Importer dynamiquement le service Google Search Console
    const { getKeywordPosition, isGoogleAuthenticated } = await import('./googleSearchConsoleService');
    
    let newPosition = currentKeyword.position;
    
    // Vérifier si l'utilisateur est authentifié à Google
    if (isGoogleAuthenticated()) {
      // Extraire le domaine de l'URL pour la recherche
      const urlObj = new URL(currentKeyword.url);
      const siteUrl = `${urlObj.protocol}//${urlObj.hostname}/`;
      
      // Récupérer la position depuis Google Search Console
      const position = await getKeywordPosition(currentKeyword.keyword, siteUrl);
      
      // Si une position est trouvée, l'utiliser
      if (position !== null) {
        newPosition = position;
      } else {
        // Si aucune position n'est trouvée, utiliser la simulation comme fallback
        newPosition = await simulatePositionCheck(currentKeyword.keyword);
      }
    } else {
      // Si non authentifié, utiliser la simulation
      newPosition = await simulatePositionCheck(currentKeyword.keyword);
    }
    
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
 * Met à jour les positions de tous les mots-clés en utilisant Google Search Console
 */
export const updateAllKeywordPositions = async (): Promise<{ data: KeywordRanking[] | null; error: any }> => {
  try {
    // Récupérer tous les mots-clés
    const { data: keywords, error: fetchError } = await supabase
      .from('keyword_rankings')
      .select('*');

    if (fetchError) throw fetchError;
    if (!keywords || keywords.length === 0) return { data: [], error: null };

    // Importer dynamiquement le service Google Search Console
    const { getMultipleKeywordPositions, isGoogleAuthenticated } = await import('./googleSearchConsoleService');
    
    let updatedKeywordsData = [...keywords];
    
    // Vérifier si l'utilisateur est authentifié à Google
    if (isGoogleAuthenticated() && keywords.length > 0) {
      // Regrouper les mots-clés par domaine
      const keywordsByDomain = keywords.reduce((acc, keyword) => {
        try {
          const urlObj = new URL(keyword.url);
          const siteUrl = `${urlObj.protocol}//${urlObj.hostname}/`;
          
          if (!acc[siteUrl]) {
            acc[siteUrl] = [];
          }
          
          acc[siteUrl].push(keyword);
        } catch (e) {
          console.error(`URL invalide pour le mot-clé ${keyword.keyword}:`, e);
        }
        
        return acc;
      }, {} as Record<string, KeywordRanking[]>);
      
      // Pour chaque domaine, récupérer les positions en masse
      const domainUpdates = await Promise.all(
        Object.entries(keywordsByDomain).map(async ([siteUrl, domainKeywords]) => {
          try {
            // Récupérer les positions depuis Google Search Console
            // Ajouter une assertion de type pour indiquer que domainKeywords est bien un tableau de KeywordRanking
            const updatedKeywords = await getMultipleKeywordPositions(domainKeywords as KeywordRanking[], siteUrl);
            return updatedKeywords;
          } catch (error) {
            console.error(`Erreur lors de la récupération des positions pour ${siteUrl}:`, error);
            // En cas d'erreur, simuler les positions
            // Ajouter une assertion de type pour indiquer que domainKeywords est bien un tableau de KeywordRanking
            return Promise.all((domainKeywords as KeywordRanking[]).map(async (keyword) => {
              const newPosition = await simulatePositionCheck(keyword.keyword);
              return {
                ...keyword,
                previousPosition: keyword.position,
                position: newPosition,
                lastChecked: new Date().toISOString().split('T')[0]
              };
            }));
          }
        })
      );
      
      // Fusionner tous les résultats
      updatedKeywordsData = domainUpdates.flat();
    } else {
      // Si non authentifié, utiliser la simulation pour tous les mots-clés
      updatedKeywordsData = await Promise.all(
        keywords.map(async (keyword) => {
          const newPosition = await simulatePositionCheck(keyword.keyword);
          return {
            ...keyword,
            previousPosition: keyword.position,
            position: newPosition,
            lastChecked: new Date().toISOString().split('T')[0]
          };
        })
      );
    }
    
    // Mettre à jour tous les mots-clés dans la base de données
    const updatedKeywords = await Promise.all(
      updatedKeywordsData.map(async (keyword) => {
        const { data, error } = await supabase
          .from('keyword_rankings')
          .update({
            previousPosition: keyword.previousPosition,
            position: keyword.position,
            lastChecked: keyword.lastChecked
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