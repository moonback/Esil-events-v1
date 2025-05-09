import { QuoteRequest } from './quoteRequestService';

/**
 * Service pour analyser automatiquement les demandes de devis entrantes à l'aide de l'IA
 * Utilise l'API Google Gemini pour analyser le texte des demandes, identifier le type d'événement,
 * l'urgence, les besoins spécifiques, et calculer un score de lead
 */

// Interface pour les résultats d'analyse
export interface QuoteRequestAnalysis {
  eventType: string;           // Type d'événement identifié (mariage, corporate, anniversaire, etc.)
  urgencyLevel: number;        // Niveau d'urgence de 1 (faible) à 5 (très urgent)
  specificNeeds: string[];     // Besoins spécifiques identifiés
  suggestedTags: string[];     // Tags suggérés pour catégoriser la demande
  leadScore: number;           // Score de lead de 1 (faible potentiel) à 10 (fort potentiel)
  leadScoreExplanation: string; // Explication du score de lead
  summary: string;             // Résumé de la demande
  aiComments: string;          // Commentaires ou suggestions de l'IA
}

/**
 * Prépare les données pour l'analyse IA
 */
export const prepareAnalysisPromptData = (quoteRequest: QuoteRequest) => {
  // Construire le message système pour guider l'IA
  const systemContent = `Tu es un assistant spécialisé dans l'analyse des demandes de devis pour ESIL Events, 
  une entreprise de location de mobilier événementiel premium. 
  Ton rôle est d'analyser la description et les commentaires du client pour extraire des informations clés 
  et fournir une évaluation préliminaire de la demande avant qu'un administrateur ne la traite.
  
  Analyse la demande selon ces critères :
  1. Type d'événement (mariage, corporate, anniversaire, etc.)
  2. Niveau d'urgence (de 1 à 5)
  3. Besoins spécifiques identifiés
  4. Tags pertinents pour catégoriser la demande
  5. Score de lead (de 1 à 10) basé sur la clarté de la demande, le potentiel commercial, et l'adéquation avec les services d'ESIL Events
  6. Explication du score de lead
  7. Résumé concis de la demande
  8. Commentaires ou suggestions pour l'administrateur
  
  Réponds uniquement au format JSON structuré comme suit :
  {
    "eventType": "type d'événement identifié",
    "urgencyLevel": nombre de 1 à 5,
    "specificNeeds": ["besoin 1", "besoin 2", ...],
    "suggestedTags": ["tag1", "tag2", ...],
    "leadScore": nombre de 1 à 10,
    "leadScoreExplanation": "explication du score",
    "summary": "résumé concis",
    "aiComments": "commentaires ou suggestions"
  }`;

  const userMessage = `Analyse cette demande de devis :

CLIENT:
• Nom: ${quoteRequest.first_name || ''} ${quoteRequest.last_name || ''}
• Email: ${quoteRequest.email || 'N/A'}
• Tél: ${quoteRequest.phone || 'N/A'}
• Société: ${quoteRequest.company || 'N/A'}
• Type: ${quoteRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}

ÉVÉNEMENT:
• Date: ${quoteRequest.event_date ? new Date(quoteRequest.event_date).toLocaleDateString('fr-FR') : 'Non spécifiée'}
• Durée: ${quoteRequest.event_duration || 'Non spécifiée'}
• Invités: ${quoteRequest.guest_count || 'Non spécifié'}
• Lieu: ${quoteRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}
• Description: ${quoteRequest.description || 'Aucune description fournie'}

COMMENTAIRES CLIENT: ${quoteRequest.comments || 'Aucun'}

ARTICLES DEMANDÉS: ${quoteRequest.items && quoteRequest.items.length > 0 ? 
  quoteRequest.items.map(item => `${item.quantity || 1}x ${item.name || 'Article'} (${item.price || 0}€)`).join(', ') : 
  'Aucun article spécifié'}`;

  const messages = [
    { role: "system", content: systemContent },
    { role: "user", content: userMessage }
  ];

  return { messages };
};

/**
 * Prépare la requête pour l'API Google Gemini
 */
const prepareGeminiRequest = (quoteRequest: QuoteRequest) => {
  const { messages } = prepareAnalysisPromptData(quoteRequest);
  
  // Extraire les messages système et utilisateur
  const systemPrompt = messages[0].content;
  const userQuestion = messages[1].content;

  return {
    contents: [
      {
        parts: [
          { text: systemPrompt },
          { text: userQuestion }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,       // Température plus basse pour des réponses plus précises et cohérentes
      maxOutputTokens: 1024,
      topP: 0.8
    }
  };
};

/**
 * Fonction pour effectuer une requête API Google Gemini avec retry
 * Réutilisation du code existant pour maintenir la cohérence
 */
async function makeGeminiApiRequest(requestBody: any, apiKey: string, retryCount = 0, maxRetries = 3): Promise<any> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorData;
      try {
        const errorText = await response.text();
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        errorData = { error: { message: `Erreur ${response.status}: ${response.statusText}. Réponse non JSON.` } };
      }
      
      // Si on a atteint le nombre maximum de tentatives, lancer une erreur
      if (retryCount >= maxRetries) {
        throw new Error(`Erreur API Google (${response.status}): ${errorData?.error?.message || response.statusText || 'Erreur inconnue'}`);
      }
      
      // Attendre avant de réessayer (backoff exponentiel)
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`Tentative Google API ${retryCount + 1}/${maxRetries} échouée. Nouvelle tentative dans ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Réessayer
      return makeGeminiApiRequest(requestBody, apiKey, retryCount + 1, maxRetries);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (retryCount < maxRetries) {
      // Attendre avant de réessayer
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`Erreur lors de la tentative Google API ${retryCount + 1}/${maxRetries}. Nouvelle tentative dans ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Réessayer
      return makeGeminiApiRequest(requestBody, apiKey, retryCount + 1, maxRetries);
    }
    throw error;
  }
}

/**
 * Analyse une demande de devis en utilisant l'API Google Gemini
 */
export const analyzeQuoteRequest = async (quoteRequest: QuoteRequest): Promise<{ analysis?: QuoteRequestAnalysis; error?: string }> => {
  try {
    // Utiliser l'API Google Gemini
    const geminiApiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return { error: 'Erreur de configuration: Clé API Google Gemini manquante (VITE_GOOGLE_GEMINI_API_KEY).' };
    }
    
    // Préparer la requête pour Gemini
    const requestBody = prepareGeminiRequest(quoteRequest);
    
    // Appeler l'API Gemini
    const data = await makeGeminiApiRequest(requestBody, geminiApiKey);
    
    // Extraire la réponse
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const responseText = data.candidates[0].content.parts[0].text;
      
      try {
        // Nettoyer la réponse pour supprimer les délimiteurs Markdown
        let cleanedResponse = responseText;
        
        // Supprimer les délimiteurs Markdown ```json et ``` si présents
        cleanedResponse = cleanedResponse.replace(/^\s*```json\s*/g, '');
        cleanedResponse = cleanedResponse.replace(/\s*```\s*$/g, '');
        
        // Tenter de parser la réponse JSON nettoyée
        const analysisResult = JSON.parse(cleanedResponse);
        
        // Valider et normaliser les données
        const analysis: QuoteRequestAnalysis = {
          eventType: analysisResult.eventType || 'Non identifié',
          urgencyLevel: Math.min(Math.max(parseInt(analysisResult.urgencyLevel) || 1, 1), 5),
          specificNeeds: Array.isArray(analysisResult.specificNeeds) ? analysisResult.specificNeeds : [],
          suggestedTags: Array.isArray(analysisResult.suggestedTags) ? analysisResult.suggestedTags : [],
          leadScore: Math.min(Math.max(parseInt(analysisResult.leadScore) || 1, 1), 10),
          leadScoreExplanation: analysisResult.leadScoreExplanation || '',
          summary: analysisResult.summary || '',
          aiComments: analysisResult.aiComments || ''
        };
        
        return { analysis };
      } catch (parseError) {
        console.error('Erreur lors du parsing de la réponse JSON:', parseError);
        return { error: 'La réponse de l\'IA n\'est pas au format JSON valide.' };
      }
    } else {
      return { error: 'Réponse de l\'API Gemini invalide ou vide.' };
    }
  } catch (error) {
    console.error('Erreur lors de l\'analyse de la demande de devis:', error);
    return { error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'analyse' };
  }
};

/**
 * Analyse automatiquement une demande de devis nouvellement créée
 * Cette fonction peut être appelée après la création d'une nouvelle demande
 */
export const analyzeNewQuoteRequest = async (quoteRequest: QuoteRequest): Promise<QuoteRequestAnalysis | null> => {
  try {
    const { analysis, error } = await analyzeQuoteRequest(quoteRequest);
    
    if (error || !analysis) {
      console.error('Erreur lors de l\'analyse automatique:', error);
      return null;
    }
    
    // Ici, on pourrait enregistrer l'analyse en base de données
    // ou mettre à jour la demande avec les tags suggérés
    
    return analysis;
  } catch (error) {
    console.error('Erreur lors de l\'analyse automatique:', error);
    return null;
  }
};