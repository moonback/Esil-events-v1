import { supabase } from './supabaseClient';
import { GOOGLE_SEARCH_CONFIG, isGoogleSearchConfigValid } from '../config/googleSearchApi';

export interface KeywordRanking {
  id?: string;
  keyword: string;
  position: number;
  previousPosition?: number | null;
  lastChecked: string; // Date au format ISO
  url: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface pour les résultats de recherche de mots-clés
 */
export interface SearchResult {
  position: number;          // Position du site dans les résultats (0 si non trouvé)
  isRealResult: boolean;     // Indique si le résultat provient de l'API réelle ou du mode simulation
  totalResults?: string;     // Nombre total de résultats trouvés (uniquement avec l'API réelle)
  searchTime?: number;       // Temps de recherche en secondes (uniquement avec l'API réelle)
  errorMessage?: string;     // Message d'erreur éventuel
}

/**
 * Recherche la position d'un mot-clé dans les résultats de Google en utilisant l'API Google Custom Search
 * @param keyword Le mot-clé à rechercher
 * @param siteUrl L'URL du site pour lequel vérifier le classement
 * @returns Un objet SearchResult contenant la position et des informations supplémentaires
 */
export const getKeywordPosition = async (keyword: string, siteUrl: string): Promise<SearchResult> => {
  try {
    // Logs pour déboguer la configuration
    console.log('Configuration Google Search API:', {
      API_KEY: GOOGLE_SEARCH_CONFIG.API_KEY ? '✓ Définie' : '✗ Non définie',
      SEARCH_ENGINE_ID: GOOGLE_SEARCH_CONFIG.SEARCH_ENGINE_ID ? '✓ Défini' : '✗ Non défini',
      BASE_URL: GOOGLE_SEARCH_CONFIG.BASE_URL,
      MAX_RESULTS: GOOGLE_SEARCH_CONFIG.MAX_RESULTS
    });
    
    // Vérifier si la configuration de l'API est valide
    if (!isGoogleSearchConfigValid()) {
      console.warn('Configuration de l\'API Google Search incomplète. Impossible de vérifier la position du mot-clé.');
      console.log('Détails de validation:', {
        'API_KEY présente': !!GOOGLE_SEARCH_CONFIG.API_KEY,
        'SEARCH_ENGINE_ID présent': !!GOOGLE_SEARCH_CONFIG.SEARCH_ENGINE_ID
      });
      return {
        position: 0,
        isRealResult: false,
        errorMessage: 'Configuration de l\'API Google Search incomplète. Impossible de vérifier la position du mot-clé.'
      };
    }

    // Extraire le domaine de base de l'URL pour la recherche
    const domainMatch = siteUrl.match(/^(?:https?:\/\/)?(?:www\.)?([^\/?#]+)(?:[\/?#]|$)/i);
    const domain = domainMatch ? domainMatch[1] : siteUrl;
    console.log('Recherche pour le domaine:', domain, 'extrait de l\'URL:', siteUrl);

    // Construire l'URL de l'API avec les paramètres
    const searchUrl = new URL(GOOGLE_SEARCH_CONFIG.BASE_URL);
    searchUrl.searchParams.append('key', GOOGLE_SEARCH_CONFIG.API_KEY);
    searchUrl.searchParams.append('cx', GOOGLE_SEARCH_CONFIG.SEARCH_ENGINE_ID);
    searchUrl.searchParams.append('q', keyword);
    searchUrl.searchParams.append('num', GOOGLE_SEARCH_CONFIG.MAX_RESULTS.toString());
    
    // Log de l'URL construite (sans la clé API pour des raisons de sécurité)
    const searchUrlForLog = new URL(searchUrl.toString());
    searchUrlForLog.searchParams.delete('key');
    console.log('URL de recherche Google (sans clé API):', searchUrlForLog.toString());
    console.log('Paramètres de recherche:', {
      q: keyword,
      cx: GOOGLE_SEARCH_CONFIG.SEARCH_ENGINE_ID ? GOOGLE_SEARCH_CONFIG.SEARCH_ENGINE_ID.substring(0, 4) + '...' : 'Non défini',
      num: GOOGLE_SEARCH_CONFIG.MAX_RESULTS
    });

    // Effectuer la requête à l'API
    console.log('Envoi de la requête à l\'API Google Search...');
    const response = await fetch(searchUrl.toString());
    console.log('Statut de la réponse:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur API Google Search:', errorData);
      console.error('Détails de l\'erreur:', {
        code: errorData.error?.code,
        message: errorData.error?.message,
        status: errorData.error?.status,
        details: errorData.error?.details
      });
      throw new Error(`Erreur API Google Search: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Log des informations de la réponse pour débogage
    console.log('Réponse de l\'API Google Search:', {
      searchInformation: data.searchInformation,
      itemCount: data.items?.length || 0,
      query: data.queries?.request?.[0]
    });
    
    // Vérifier si des résultats ont été trouvés
    if (!data.items || data.items.length === 0) {
      console.log(`Aucun résultat trouvé pour le mot-clé "${keyword}"`);
      return {
        position: 0,
        isRealResult: true,
        totalResults: '0',
        searchTime: 0
      }; // No results found
    }

    // Rechercher la position du site dans les résultats
    let position = 0;
    console.log(`Recherche du domaine "${domain}" dans ${data.items.length} résultats...`);
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      console.log(`Résultat #${i+1}:`, {
        link: item.link,
        title: item.title,
        match: item.link && item.link.includes(domain) ? 'OUI' : 'NON'
      });
      if (item.link && item.link.includes(domain)) {
        position = i + 1; // Les positions commencent à 1
        console.log(`✓ Site trouvé à la position ${position}`);
        break;
      }
    }

    // Si le site n'a pas été trouvé dans les premiers résultats
    if (position === 0 && data.searchInformation && data.searchInformation.totalResults > 0) {
      // On retourne une position au-delà des résultats actuels
      position = GOOGLE_SEARCH_CONFIG.MAX_RESULTS + 1;
    }

    const result = {
      position,
      isRealResult: true,
      totalResults: data.searchInformation?.totalResults,
      searchTime: data.searchInformation?.searchTime
    };
    
    console.log(`✅ Résultat RÉEL: position ${position} pour le mot-clé "${keyword}" (sur ${data.searchInformation?.totalResults || '?'} résultats)`);
    return result;
  } catch (error) {
    console.error('Erreur lors de la recherche de position du mot-clé:', error);
    console.warn('Impossible de vérifier la position du mot-clé suite à une erreur API');
    return {
      position: 0,
      isRealResult: false,
      errorMessage: error instanceof Error ? `Erreur lors de la recherche: ${error.message}` : 'Erreur lors de la recherche. Impossible de vérifier la position du mot-clé.'
    };
  }
};


/**
 * Fonction de compatibilité pour l'ancienne API
 * @deprecated Utilisez getKeywordPosition à la place
 */
export const searchKeywordPosition = async (keyword: string, siteUrl: string): Promise<number> => {
  const result = await getKeywordPosition(keyword, siteUrl);
  return result.position;
};

/**
 * Sauvegarde le classement d'un mot-clé dans la base de données
 * @param keywordRanking Les données de classement à sauvegarder
 * @returns Les données sauvegardées
 */
export const saveKeywordRanking = async (keywordRanking: KeywordRanking): Promise<KeywordRanking> => {
  try {
    // Préparer les notes avec indication si le mot-clé n'a pas été trouvé
    let notesWithStatus = keywordRanking.notes || '';
    if (keywordRanking.position === 0) {
      notesWithStatus = `${notesWithStatus ? notesWithStatus + ' ' : ''}[Mot-clé non trouvé]`;
    }

    // Vérifier si un enregistrement existe déjà pour ce mot-clé et cette URL
    const { data: existingRankings } = await supabase
      .from('keyword_rankings')
      .select('*')
      .eq('keyword', keywordRanking.keyword)
      .eq('url', keywordRanking.url)
      .limit(1);

    if (existingRankings && existingRankings.length > 0) {
      // Mettre à jour l'enregistrement existant
      const existingRanking = existingRankings[0];
      const { data, error } = await supabase
        .from('keyword_rankings')
        .update({
          previousPosition: existingRanking.position,
          position: keywordRanking.position,
          lastChecked: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
          notes: notesWithStatus
        })
        .eq('id', existingRanking.id)
        .select();

      if (error) throw error;
      return data?.[0] as KeywordRanking;
    } else {
      // Créer un nouvel enregistrement
      const { data, error } = await supabase
        .from('keyword_rankings')
        .insert([
          {
            keyword: keywordRanking.keyword,
            position: keywordRanking.position,
            previousPosition: null,
            lastChecked: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
            url: keywordRanking.url,
            notes: notesWithStatus
          }
        ])
        .select();

      if (error) throw error;
      return data?.[0] as KeywordRanking;
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du classement du mot-clé:', error);
    throw error;
  }
};

/**
 * Récupère tous les classements de mots-clés
 * @returns La liste des classements de mots-clés
 */
export const getAllKeywordRankings = async (): Promise<KeywordRanking[]> => {
  try {
    const { data, error } = await supabase
      .from('keyword_rankings')
      .select('*')
      .order('lastChecked', { ascending: false });

    if (error) throw error;
    return data as KeywordRanking[];
  } catch (error) {
    console.error('Erreur lors de la récupération des classements de mots-clés:', error);
    throw error;
  }
};

/**
 * Supprime un classement de mot-clé
 * @param id L'identifiant du classement à supprimer
 * @returns true si la suppression a réussi
 */
export const deleteKeywordRanking = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('keyword_rankings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du classement du mot-clé:', error);
    throw error;
  }
};