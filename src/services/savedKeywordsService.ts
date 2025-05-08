/**
 * Service pour gérer les mots-clés sauvegardés dans la base de données
 */
import { supabase } from './supabaseClient';
import { GeneratedKeyword } from './keywordGenerationService';

/**
 * Interface pour un mot-clé sauvegardé dans la base de données
 */
export interface SavedKeyword {
  id?: string;
  keyword: string;
  relevance: number;
  difficulty?: number;
  searchVolume?: string;
  competition?: string;
  type: string;
  topic: string;
  created_at?: string;
}

/**
 * Sauvegarde un mot-clé dans la base de données
 * @param keyword Le mot-clé à sauvegarder
 * @param topic Le sujet associé au mot-clé
 * @returns L'ID du mot-clé sauvegardé ou null en cas d'erreur
 */
export const saveKeyword = async (keyword: GeneratedKeyword, topic: string): Promise<string | null> => {
  try {
    // Créer l'objet à sauvegarder
    const savedKeyword: SavedKeyword = {
      keyword: keyword.keyword,
      relevance: keyword.relevance,
      difficulty: keyword.difficulty,
      searchVolume: keyword.searchVolume,
      competition: keyword.competition,
      type: keyword.type,
      topic: topic
    };

    // Insérer dans la table saved_keywords
    const { data, error } = await supabase
      .from('saved_keywords')
      .insert(savedKeyword)
      .select('id')
      .single();

    if (error) {
      console.error('Erreur lors de la sauvegarde du mot-clé:', error);
      return null;
    }

    return data.id;
  } catch (err) {
    console.error('Erreur lors de la sauvegarde du mot-clé:', err);
    return null;
  }
};

/**
 * Interface pour les options de filtrage des mots-clés
 */
export interface KeywordFilterOptions {
  search?: string;
  type?: string;
  topic?: string;
  page?: number;
  perPage?: number;
}

/**
 * Récupère tous les mots-clés sauvegardés avec options de filtrage et pagination
 * @param options Options de filtrage et pagination
 * @returns La liste des mots-clés sauvegardés filtrés
 */
export const getSavedKeywords = async (options?: KeywordFilterOptions): Promise<SavedKeyword[]> => {
  try {
    let query = supabase
      .from('saved_keywords')
      .select('*')
      .order('created_at', { ascending: false });

    // Appliquer les filtres si fournis
    if (options?.search) {
      query = query.ilike('keyword', `%${options.search}%`);
    }

    if (options?.type) {
      query = query.eq('type', options.type);
    }

    if (options?.topic) {
      query = query.eq('topic', options.topic);
    }

    // Exécuter la requête
    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des mots-clés sauvegardés:', error);
      return [];
    }

    // Appliquer la pagination côté client si nécessaire
    let result = data || [];
    if (options?.page && options?.perPage) {
      const startIndex = (options.page - 1) * options.perPage;
      const endIndex = startIndex + options.perPage;
      result = result.slice(startIndex, endIndex);
    }

    return result;
  } catch (err) {
    console.error('Erreur lors de la récupération des mots-clés sauvegardés:', err);
    return [];
  }
};

/**
 * Supprime un mot-clé sauvegardé
 * @param id L'ID du mot-clé à supprimer
 * @returns true si la suppression a réussi, false sinon
 */
export const deleteSavedKeyword = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('saved_keywords')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression du mot-clé:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Erreur lors de la suppression du mot-clé:', err);
    return false;
  }
};