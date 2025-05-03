import { KeywordRanking } from './keywordTrackingService';

// Types pour l'authentification et les réponses de l'API Google Search Console
interface GoogleCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
  accessToken?: string;
  expiryDate?: number;
}

interface SearchAnalyticsQueryRequest {
  startDate: string;
  endDate: string;
  dimensions: string[];
  rowLimit?: number;
  startRow?: number;
  searchType?: string;
  dimensionFilterGroups?: Array<{
    filters: Array<{
      dimension: string;
      operator: string;
      expression: string;
    }>;
  }>;
}

interface SearchAnalyticsRow {
  keys: string[];
  position: number;
  clicks: number;
  impressions: number;
  ctr: number;
}

interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[];
}

// Configuration des identifiants Google
const googleCredentials: GoogleCredentials = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/admin/google-auth-callback',
  refreshToken: localStorage.getItem('google_refresh_token') || undefined,
  accessToken: localStorage.getItem('google_access_token') || undefined,
  expiryDate: localStorage.getItem('google_token_expiry') ? Number(localStorage.getItem('google_token_expiry')) : undefined
};

/**
 * Vérifie si l'utilisateur est authentifié à Google
 */
export const isGoogleAuthenticated = (): boolean => {
  return !!googleCredentials.refreshToken;
};

/**
 * Génère l'URL d'authentification Google
 */
export const getGoogleAuthUrl = (): string => {
  const scopes = [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/webmasters'
  ];

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.append('client_id', googleCredentials.clientId);
  url.searchParams.append('redirect_uri', googleCredentials.redirectUri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', scopes.join(' '));
  url.searchParams.append('access_type', 'offline');
  url.searchParams.append('prompt', 'consent');

  return url.toString();
};

/**
 * Échange le code d'autorisation contre un token d'accès
 */
export const exchangeCodeForTokens = async (code: string): Promise<boolean> => {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: googleCredentials.clientId,
        client_secret: googleCredentials.clientSecret,
        redirect_uri: googleCredentials.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur lors de l'échange du code: ${errorData.error_description || response.statusText}`);
    }

    const data = await response.json();
    
    // Stocker les tokens
    localStorage.setItem('google_access_token', data.access_token);
    localStorage.setItem('google_token_expiry', String(Date.now() + (data.expires_in * 1000)));
    
    if (data.refresh_token) {
      localStorage.setItem('google_refresh_token', data.refresh_token);
    }
    
    // Mettre à jour les credentials en mémoire
    googleCredentials.accessToken = data.access_token;
    googleCredentials.expiryDate = Date.now() + (data.expires_in * 1000);
    if (data.refresh_token) {
      googleCredentials.refreshToken = data.refresh_token;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'échange du code:', error);
    return false;
  }
};

/**
 * Rafraîchit le token d'accès si nécessaire
 */
async function refreshAccessTokenIfNeeded(): Promise<boolean> {
  // Si pas de refresh token, impossible de rafraîchir
  if (!googleCredentials.refreshToken) {
    return false;
  }
  
  // Si le token est encore valide, pas besoin de rafraîchir
  if (googleCredentials.expiryDate && googleCredentials.expiryDate > Date.now() + 60000) {
    return true;
  }
  
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: googleCredentials.clientId,
        client_secret: googleCredentials.clientSecret,
        refresh_token: googleCredentials.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur lors du rafraîchissement du token: ${errorData.error_description || response.statusText}`);
    }

    const data = await response.json();
    
    // Mettre à jour le token d'accès
    localStorage.setItem('google_access_token', data.access_token);
    localStorage.setItem('google_token_expiry', String(Date.now() + (data.expires_in * 1000)));
    
    googleCredentials.accessToken = data.access_token;
    googleCredentials.expiryDate = Date.now() + (data.expires_in * 1000);
    
    return true;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    // Si l'erreur est liée au refresh token invalide, supprimer les tokens stockés
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_token_expiry');
    googleCredentials.accessToken = undefined;
    googleCredentials.refreshToken = undefined;
    googleCredentials.expiryDate = undefined;
    return false;
  }
}

/**
 * Récupère les sites vérifiés dans Search Console
 */
export const getVerifiedSites = async (): Promise<string[]> => {
  try {
    const tokenValid = await refreshAccessTokenIfNeeded();
    if (!tokenValid) {
      throw new Error('Non authentifié à Google Search Console');
    }
    
    const response = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: {
        'Authorization': `Bearer ${googleCredentials.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur lors de la récupération des sites: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.siteEntry?.map((site: any) => site.siteUrl) || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des sites vérifiés:', error);
    return [];
  }
};

/**
 * Récupère la position d'un mot-clé spécifique pour un site donné
 */
export const getKeywordPosition = async (keyword: string, siteUrl: string): Promise<number | null> => {
  try {
    const tokenValid = await refreshAccessTokenIfNeeded();
    if (!tokenValid) {
      throw new Error('Non authentifié à Google Search Console');
    }
    
    // Préparer la requête pour l'API Search Analytics
    const endDate = new Date().toISOString().split('T')[0]; // Aujourd'hui
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 7 jours avant
    
    const queryData: SearchAnalyticsQueryRequest = {
      startDate,
      endDate,
      dimensions: ['QUERY'],
      dimensionFilterGroups: [{
        filters: [{
          dimension: 'QUERY',
          operator: 'CONTAINS',
          expression: keyword
        }]
      }],
      rowLimit: 10
    };
    
    const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${googleCredentials.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(queryData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur lors de la récupération des données: ${errorData.error?.message || response.statusText}`);
    }

    const data: SearchAnalyticsResponse = await response.json();
    
    // Si aucune donnée n'est retournée, le mot-clé n'est pas classé
    if (!data.rows || data.rows.length === 0) {
      return null;
    }
    
    // Trouver la ligne qui correspond exactement au mot-clé recherché
    const exactMatch = data.rows.find(row => row.keys[0].toLowerCase() === keyword.toLowerCase());
    if (exactMatch) {
      return Math.round(exactMatch.position);
    }
    
    // Si pas de correspondance exacte, prendre la première ligne (meilleure approximation)
    return Math.round(data.rows[0].position);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la position pour le mot-clé "${keyword}":`, error);
    return null;
  }
};

/**
 * Récupère les positions de plusieurs mots-clés pour un site donné
 */
export const getMultipleKeywordPositions = async (keywords: KeywordRanking[], siteUrl: string): Promise<KeywordRanking[]> => {
  try {
    const tokenValid = await refreshAccessTokenIfNeeded();
    if (!tokenValid) {
      throw new Error('Non authentifié à Google Search Console');
    }
    
    // Préparer la requête pour l'API Search Analytics
    const endDate = new Date().toISOString().split('T')[0]; // Aujourd'hui
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 7 jours avant
    
    // Récupérer tous les mots-clés en une seule requête
    const queryData: SearchAnalyticsQueryRequest = {
      startDate,
      endDate,
      dimensions: ['QUERY'],
      rowLimit: 1000 // Limite maximale pour obtenir le plus de mots-clés possible
    };
    
    const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${googleCredentials.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(queryData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur lors de la récupération des données: ${errorData.error?.message || response.statusText}`);
    }

    const data: SearchAnalyticsResponse = await response.json();
    
    // Si aucune donnée n'est retournée
    if (!data.rows || data.rows.length === 0) {
      return keywords; // Retourner les mots-clés inchangés
    }
    
    // Mettre à jour les positions des mots-clés
    return keywords.map(keyword => {
      // Chercher une correspondance exacte dans les résultats
      const match = data.rows?.find(row => row.keys[0].toLowerCase() === keyword.keyword.toLowerCase());
      
      if (match) {
        return {
          ...keyword,
          previousPosition: keyword.position,
          position: Math.round(match.position),
          lastChecked: new Date().toISOString().split('T')[0]
        };
      }
      
      // Si aucune correspondance n'est trouvée, conserver la position actuelle
      return keyword;
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des positions des mots-clés:', error);
    return keywords; // Retourner les mots-clés inchangés en cas d'erreur
  }
};

/**
 * Déconnecte l'utilisateur de Google
 */
export const disconnectFromGoogle = (): void => {
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_refresh_token');
  localStorage.removeItem('google_token_expiry');
  
  googleCredentials.accessToken = undefined;
  googleCredentials.refreshToken = undefined;
  googleCredentials.expiryDate = undefined;
};