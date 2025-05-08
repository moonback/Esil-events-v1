import { supabase } from './supabaseClient';
import { SERP_API_CONFIG, isGoogleSearchConfigValid } from '../config/googleSearchApi';

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
 * Recherche la position d'un mot-clé dans les résultats de Google en utilisant SerpApi
 * @param keyword Le mot-clé à rechercher
 * @param siteUrl L'URL du site pour lequel vérifier le classement
 * @returns Un objet SearchResult contenant la position et des informations supplémentaires
 */
export const getKeywordPosition = async (keyword: string, siteUrl: string): Promise<SearchResult> => {
  try {
    // Logs pour déboguer la configuration
    console.log('Configuration SerpApi:', {
      API_KEY: SERP_API_CONFIG.API_KEY ? '✓ Définie' : '✗ Non définie',
      BASE_URL: SERP_API_CONFIG.BASE_URL,
      MAX_RESULTS: SERP_API_CONFIG.MAX_RESULTS
    });
    
    // Vérifier si la configuration de l'API est valide
    if (!isGoogleSearchConfigValid()) {
      console.warn('Configuration de l\'API SerpApi incomplète. Impossible de vérifier la position du mot-clé.');
      console.log('Détails de validation:', {
        'API_KEY présente': !!SERP_API_CONFIG.API_KEY
      });
      return {
        position: 0,
        isRealResult: false,
        errorMessage: 'Configuration de l\'API SerpApi incomplète. Impossible de vérifier la position du mot-clé.'
      };
    }

    // Extraire le domaine de base de l'URL pour la recherche
    const domainMatch = siteUrl.match(/^(?:https?:\/\/)?(?:www\.)?([^\/?#]+)(?:[\/?#]|$)/i);
    const domain = domainMatch ? domainMatch[1] : siteUrl;
    console.log('Recherche pour le domaine:', domain, 'extrait de l\'URL:', siteUrl);

    // Construire l'URL du proxy local pour contourner les problèmes CORS
    // Au lieu d'appeler directement SerpApi, nous passons par notre serveur Express
    const proxyUrl = new URL('http://localhost:3001/api/serpapi/search');
    
    // Ajouter les paramètres de recherche
    proxyUrl.searchParams.append('api_key', SERP_API_CONFIG.API_KEY);
    proxyUrl.searchParams.append('q', keyword);
    proxyUrl.searchParams.append('num', SERP_API_CONFIG.MAX_RESULTS.toString());
    
    // Ajouter les paramètres par défaut
    Object.entries(SERP_API_CONFIG.DEFAULT_PARAMS).forEach(([key, value]) => {
      proxyUrl.searchParams.append(key, value.toString());
    });
    
    // Log de l'URL construite (sans la clé API pour des raisons de sécurité)
    const proxyUrlForLog = new URL(proxyUrl.toString());
    proxyUrlForLog.searchParams.delete('api_key');
    console.log('URL du proxy SerpApi (sans clé API):', proxyUrlForLog.toString());
    console.log('Paramètres de recherche:', {
      q: keyword,
      num: SERP_API_CONFIG.MAX_RESULTS
    });

    // Effectuer la requête via notre proxy local pour éviter les problèmes CORS
    console.log('Envoi de la requête via le proxy SerpApi...');
    const response = await fetch(proxyUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Timeout de 30 secondes pour éviter les attentes infinies
      signal: AbortSignal.timeout(30000)
    }).catch(error => {
      console.error('Erreur de connexion au proxy SerpApi:', error);
      // Analyser l'erreur pour fournir un message plus précis
      if (error.message && error.message.includes('Failed to fetch')) {
        throw new Error(`Erreur de connexion: Impossible de contacter le serveur proxy. Assurez-vous que le serveur Express est en cours d'exécution sur le port 3001.`);
      }
      throw error;
    });
    
    // Vérifier si la réponse existe (pour gérer le cas où fetch échoue sans lancer d'erreur)
    if (!response) {
      throw new Error('Aucune réponse reçue du proxy SerpApi');
    }
    
    console.log('Statut de la réponse:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur API SerpApi via proxy:', errorData);
      console.error('Détails de l\'erreur:', {
        error: errorData.error
      });
      throw new Error(`Erreur API SerpApi via proxy: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Log des informations de la réponse pour débogage
    console.log('Réponse de l\'API SerpApi:', {
      searchMetadata: data.search_metadata,
      organicResultsCount: data.organic_results?.length || 0
    });
    
    // Vérifier si des résultats ont été trouvés
    if (!data.organic_results || data.organic_results.length === 0) {
      console.log(`Aucun résultat trouvé pour le mot-clé "${keyword}"`);
      return {
        position: 0,
        isRealResult: true,
        totalResults: data.search_information?.total_results || '0',
        searchTime: data.search_metadata?.total_time_taken || 0
      }; // No results found
    }

    // Rechercher la position du site dans les résultats
    let position = 0;
    console.log(`Recherche du domaine "${domain}" dans ${data.organic_results.length} résultats...`);
    for (let i = 0; i < data.organic_results.length; i++) {
      const item = data.organic_results[i];
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
    if (position === 0 && data.search_information && data.search_information.total_results > 0) {
      // On retourne une position au-delà des résultats actuels
      position = SERP_API_CONFIG.MAX_RESULTS + 1;
    }

    const result = {
      position,
      isRealResult: true,
      totalResults: data.search_information?.total_results || data.search_information?.total,
      searchTime: data.search_metadata?.total_time_taken
    };
    
    console.log(`✅ Résultat RÉEL: position ${position} pour le mot-clé "${keyword}" (sur ${result.totalResults || '?'} résultats)`);
    return result;
  } catch (error) {
    console.error('Erreur lors de la recherche de position du mot-clé:', error);
    console.warn('Impossible de vérifier la position du mot-clé suite à une erreur API');
    
    // Analyser le type d'erreur pour fournir un message plus précis
    let errorMessage = 'Erreur lors de la recherche. Impossible de vérifier la position du mot-clé.';
    
    if (error instanceof Error) {
      // Erreurs de serveur proxy
      if (error.message.includes('Impossible de contacter le serveur proxy')) {
        errorMessage = `Erreur de connexion au serveur proxy: Assurez-vous que le serveur Express est démarré (npm run server). Si le problème persiste, vérifiez que le port 3001 est disponible.`;
      }
      // Erreurs réseau
      else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = `Erreur de connexion réseau: Impossible de contacter le serveur proxy ou l'API SerpApi. Vérifiez votre connexion Internet et que le serveur Express est bien démarré.`;
      }
      // Erreurs CORS (ne devrait plus se produire avec le proxy, mais gardé par précaution)
      else if (error.message.includes('CORS')) {
        errorMessage = `Erreur CORS: Utilisez le serveur proxy pour contourner cette limitation. Assurez-vous que le serveur Express est démarré avec 'npm run server'.`;
      }
      // Erreurs de timeout
      else if (error.message.includes('timeout') || error.message.includes('timed out')) {
        errorMessage = `Délai d'attente dépassé: Le serveur proxy ou l'API SerpApi n'a pas répondu dans le temps imparti. Réessayez plus tard.`;
      }
      // Erreurs d'API
      else if (error.message.includes('API SerpApi via proxy')) {
        errorMessage = `Erreur de l'API SerpApi: ${error.message}. Vérifiez que votre clé API est valide et que vous n'avez pas dépassé votre quota.`;
      }
      // Autres erreurs avec message
      else {
        errorMessage = `Erreur lors de la recherche: ${error.message}`;
      }
    }
    
    return {
      position: 0,
      isRealResult: false,
      errorMessage: errorMessage
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