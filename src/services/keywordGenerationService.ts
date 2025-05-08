/**
 * Service pour générer des suggestions de mots-clés à l'aide de l'API Google Gemini
 */

/**
 * Interface pour les options de génération de mots-clés
 */
export interface KeywordGenerationOptions {
  topic: string;           // Sujet ou thème principal pour générer des mots-clés
  industry?: string;       // Secteur d'activité (optionnel)
  targetAudience?: string; // Public cible (optionnel)
  location?: string;       // Localisation géographique (optionnel)
  count?: number;          // Nombre de mots-clés à générer (par défaut: 20)
  includeMetrics?: boolean; // Inclure des métriques estimées (difficulté, volume, etc.)
}

/**
 * Interface pour un mot-clé généré
 */
export interface GeneratedKeyword {
  keyword: string;           // Le mot-clé généré
  relevance: number;         // Score de pertinence (1-10)
  difficulty?: number;       // Difficulté estimée (1-10, optionnel)
  searchVolume?: string;     // Volume de recherche estimé (optionnel)
  competition?: string;      // Niveau de concurrence (optionnel)
  type: string;              // Type de mot-clé (longue traîne, principal, question, etc.)
}

/**
 * Interface pour le résultat de la génération de mots-clés
 */
export interface KeywordGenerationResult {
  keywords: GeneratedKeyword[];
  error?: string;
}

/**
 * Prépare la requête pour l'API Google Gemini
 */
const prepareGeminiRequest = (options: KeywordGenerationOptions) => {
  const {
    topic,
    industry = "événementiel",
    targetAudience = "Loueur matèriel evenenementiel et organisateurs d'événements",
    location = "France",
    count = 20,
    includeMetrics = true
  } = options;

  // Construire les instructions spécifiques
  const metricsInstruction = includeMetrics 
    ? "Pour chaque mot-clé, fournis une estimation de la difficulté (1-10), du volume de recherche (faible/moyen/élevé) et du niveau de concurrence (faible/moyen/élevé)."
    : "";

  const systemPrompt = "Tu es un expert en SEO spécialisé dans la recherche de mots-clés pour le secteur de l'événementiel. Tu excelles dans l'identification de mots-clés pertinents, à fort potentiel et avec une intention de recherche claire. Tu comprends parfaitement les besoins des organisateurs d'événements et sais comment optimiser le contenu pour maximiser la visibilité dans les moteurs de recherche.";

  const userQuestion = `Génère une liste de ${count} mots-clés pertinents pour le sujet "${topic}" dans le secteur de l'${industry}, ciblant ${targetAudience} en ${location}.

Inclus différents types de mots-clés :
- Mots-clés principaux à fort volume
- Mots-clés de longue traîne avec intention d'achat
- Mots-clés sous forme de questions
- Mots-clés locaux pertinents
- Mots-clés liés aux tendances actuelles

${metricsInstruction}

Formate ta réponse en JSON avec cette structure :
{
  "keywords": [
    {
      "keyword": "mot-clé exemple",
      "relevance": 8,
      "difficulty": 6,
      "searchVolume": "moyen",
      "competition": "élevé",
      "type": "longue traîne"
    }
  ]
}`;

  return {
    contents: [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      {
        role: "model",
        parts: [{ text: "Je comprends parfaitement. Je vais générer des mots-clés pertinents selon vos critères et les formater en JSON comme demandé." }]
      },
      {
        role: "user",
        parts: [{ text: userQuestion }]
      }
    ]
  };
};

/**
 * Fonction pour effectuer une requête API Google Gemini avec retry
 */
async function makeGeminiApiRequest(requestBody: any, apiKey: string, retryCount = 0, maxRetries = 3): Promise<any> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API Gemini:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });

      // Si on a atteint le nombre maximum de tentatives, on abandonne
      if (retryCount >= maxRetries) {
        throw new Error(`Erreur API Gemini après ${maxRetries} tentatives: ${response.status} ${response.statusText}`);
      }

      // Sinon, on attend un peu et on réessaie
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`Tentative Google API ${retryCount + 1}/${maxRetries} échouée. Nouvelle tentative dans ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));

      // Réessayer
      return makeGeminiApiRequest(requestBody, apiKey, retryCount + 1, maxRetries);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    // Si on a atteint le nombre maximum de tentatives, on abandonne
    if (retryCount >= maxRetries) {
      throw err;
    }

    // Sinon, on attend un peu et on réessaie
    const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
    console.log(`Erreur lors de la tentative Google API ${retryCount + 1}/${maxRetries}. Nouvelle tentative dans ${waitTime}ms...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));

    // Réessayer
    return makeGeminiApiRequest(requestBody, apiKey, retryCount + 1, maxRetries);
  }
}

/**
 * Génère des suggestions de mots-clés en utilisant l'API Google Gemini
 */
export const generateKeywords = async (options: KeywordGenerationOptions): Promise<KeywordGenerationResult> => {
  try {
    // Utiliser l'API Google Gemini
    const geminiApiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;

    if (!geminiApiKey) {
      return { 
        keywords: [],
        error: 'Erreur de configuration: Clé API Google Gemini manquante (VITE_GOOGLE_GEMINI_API_KEY).' 
      };
    }

    // Préparer la requête pour Gemini
    const requestBody = prepareGeminiRequest(options);

    // Appeler l'API Gemini
    const data = await makeGeminiApiRequest(requestBody, geminiApiKey);

    // Extraire le contenu de la réponse
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      const responseText = data.candidates[0].content.parts[0].text;
      
      try {
        // Essayer de parser le JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : responseText;
        const parsedData = JSON.parse(jsonString);
        
        if (parsedData && parsedData.keywords && Array.isArray(parsedData.keywords)) {
          return {
            keywords: parsedData.keywords
          };
        } else {
          return {
            keywords: [],
            error: 'Format de réponse invalide: la structure JSON attendue est absente.'
          };
        }
      } catch (jsonError) {
        console.error('Erreur lors du parsing JSON:', jsonError);
        return {
          keywords: [],
          error: 'Impossible de parser la réponse JSON.'
        };
      }
    }

    return {
      keywords: [],
      error: 'Format de réponse invalide ou vide.'
    };
  } catch (err) {
    console.error('Erreur détaillée lors de la génération des mots-clés:', err);
    return {
      keywords: [],
      error: err instanceof Error ? err.message : 'Erreur inconnue lors de la génération des mots-clés.'
    };
  }
};