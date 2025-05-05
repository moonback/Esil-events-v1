import { QuoteRequest } from './quoteRequestService';
import { formatDate, formatItemsDetails, calculateTotalAmount, getDeliveryTypeLabel, getTimeSlotLabel } from '../components/admin/quoteRequests/QuoteRequestUtils';

/**
 * Service pour gérer la génération de réponses IA pour les demandes de devis
 */

// Interface pour les options de réponse
export interface ResponseOptions {
  tone?: 'formal' | 'friendly' | 'persuasive';
  includePromotion?: boolean;
  focusOnDetails?: boolean;
  responseLength?: 'concise' | 'standard' | 'detailed';
}

/**
 * Prépare les données pour la génération de réponse IA
 */
export const prepareAIPromptData = (selectedRequest: QuoteRequest, options?: ResponseOptions) => {
  const itemsDetails = formatItemsDetails(selectedRequest);
  const totalAmount = calculateTotalAmount(selectedRequest);

  // Adapter le message système en fonction des options
  let systemContent = "Tu es un expert commercial pour ESIL Events, spécialiste de la location de mobilier événementiel premium. Génère des réponses de devis personnalisées, professionnelles et persuasives pour maximiser la conversion. ";
  
  // Ajuster le ton en fonction des options
  if (options?.tone === 'formal') {
    systemContent += "Utilise un ton formel, professionnel et respectueux. ";
  } else if (options?.tone === 'friendly') {
    systemContent += "Utilise un ton amical, chaleureux et accessible. ";
  } else if (options?.tone === 'persuasive') {
    systemContent += "Utilise un ton persuasif, convaincant et orienté conversion. ";
  } else {
    systemContent += "Ton formel mais chaleureux, ";
  }
  
  // Ajouter les principes clés
  systemContent += "Principes clés : créer un sentiment d'urgence (disponibilité, offre limitée), souligner l'exclusivité et l'expertise d'ESIL Events, utiliser la preuve sociale, mettre en avant la garantie de satisfaction et le service client. ";
  
  // Ajuster la structure en fonction des options
  systemContent += "Structure : Accroche personnalisée, présentation valorisante d'ESIL, description de l'impact du mobilier sur l'événement, ";
  
  // Détailler les articles si l'option est activée
  if (options?.focusOnDetails !== false) {
    systemContent += "détail des articles (si fournis) avec caractéristiques premium, ";
  }
  
  // Inclure une promotion si l'option est activée
  if (options?.includePromotion !== false) {
    systemContent += "offre spéciale (ex: -5% si confirmation sous 7j), ";
  }
  
  // Compléter la structure
  systemContent += "conditions claires (acompte 30%), appel à l'action (RDV tel, showroom), signature pro ('L'élégance pour chaque événement'), coordonnées complètes, lien portfolio/réseaux sociaux. Intègre un témoignage générique si pertinent et mentionne nos services (conseil, installation, livraison premium).";
  
  // Ajuster la longueur de la réponse
  if (options?.responseLength === 'concise') {
    systemContent += " Génère une réponse concise et directe, en te concentrant sur l'essentiel.";
  } else if (options?.responseLength === 'detailed') {
    systemContent += " Génère une réponse détaillée et complète, en expliquant tous les aspects de l'offre.";
  }
  
  const systemMessage = {
    role: "system",
    content: systemContent
  };

  const userMessage = {
    role: "user",
    content: `Génère une réponse de devis pour la demande #${selectedRequest.id?.substring(0, 8).toUpperCase() || 'N/A'}.

CLIENT:
• Nom: ${selectedRequest.first_name || ''} ${selectedRequest.last_name || ''}
• Email: ${selectedRequest.email || 'N/A'}
• Tél: ${selectedRequest.phone || 'N/A'}
• Société: ${selectedRequest.company || 'N/A'}
• Type: ${selectedRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}
• Adresse Facturation: ${[selectedRequest.billing_address, selectedRequest.postal_code, selectedRequest.city].filter(Boolean).join(', ') || 'Non fournie'}

ÉVÉNEMENT:
• Date: ${selectedRequest.event_date ? formatDate(selectedRequest.event_date.toString()) : 'Non spécifiée'}
• Durée: ${selectedRequest.event_duration || 'Non spécifiée'}
• Heures: ${selectedRequest.event_start_time || '?'} - ${selectedRequest.event_end_time || '?'}
• Invités: ${selectedRequest.guest_count || 'Non spécifié'}
• Lieu: ${selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}
• Description: ${selectedRequest.description || 'Aucune description fournie'}

ARTICLES & MONTANT (Indicatif):
${itemsDetails}
• Total TTC Indicatif: ${totalAmount}€

LIVRAISON/RETRAIT:
• Type: ${getDeliveryTypeLabel(selectedRequest.delivery_type || undefined)}
• Date: ${selectedRequest.delivery_date ? formatDate(selectedRequest.delivery_date) : '-'}
• Créneau: ${getTimeSlotLabel(selectedRequest.delivery_time_slot || undefined)}
• Adresse: ${[selectedRequest.delivery_address, selectedRequest.delivery_postal_code, selectedRequest.delivery_city].filter(Boolean).join(', ') || 'Non fournie ou identique facturation'}

COMMENTAIRES CLIENT: ${selectedRequest.comments || 'Aucun'}

INSTRUCTIONS SPÉCIFIQUES POUR L'IA :
1.  Commence par une salutation personnalisée (Ex: "Cher Monsieur/Chère Madame [Nom de famille],", ou "Bonjour [Prénom]," si approprié).
2.  Accroche : Remercie pour la demande et fais référence à l'événement spécifique (date, type si possible).
3.  Valorise ESIL Events : Mentionne brièvement l'expertise et le positionnement premium.
4.  Confirme la bonne compréhension des besoins (mobilier, date, lieu).
5.  Si des articles sont listés, commente brièvement leur pertinence ou qualité. Sinon, propose d'aider à la sélection.
7.  Précise les prochaines étapes : envoi du devis détaillé formel, discussion téléphonique.
8.  Inclue un appel à l'action clair pour planifier un échange.
9.  Termine par une formule de politesse professionnelle et la signature complète d'ESIL Events (incluant slogan, tel, email, site web).
10. Adapte le ton légèrement si c'est un client particulier ou professionnel.
11. N'invente pas de détails non fournis, reste factuel sur les informations de la demande.
12. Fournis la réponse uniquement, sans phrases comme "Voici la réponse suggérée :".
13. Utiliser la signature complète d'ESIL Events :

L'équipe ESIL Events
L'élégance pour chaque événement
📞 06 20 46 13 85 | ✉ contact@esil-events.fr | 🌐 www.esil-events.fr
📍 Showroom : 7 rue de la cellophane, 78711 Mantes-la-Ville 
`
  };

  const messages = [systemMessage, userMessage];

  return { messages };
};

/**
 * Prépare la requête pour l'API Google Gemini
 */
const prepareGeminiRequest = (selectedRequest: QuoteRequest, options?: ResponseOptions) => {
  const { messages } = prepareAIPromptData(selectedRequest, options);
  
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
      temperature: 0.7,
      maxOutputTokens: 1024,
      topP: 0.9
    }
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
 * Génère une réponse IA pour une demande de devis en utilisant l'API Google Gemini
 */
export const generateAIResponse = async (selectedRequest: QuoteRequest, options?: ResponseOptions): Promise<{ response?: string; error?: string }> => {
  try {
    // Utiliser l'API Google Gemini au lieu de DeepSeek
    const geminiApiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return { error: 'Erreur de configuration: Clé API Google Gemini manquante (VITE_GOOGLE_GEMINI_API_KEY).' };
    }

    // Préparer la requête pour Gemini
    const requestBody = prepareGeminiRequest(selectedRequest, options);

    // Appeler l'API Gemini
    const data = await makeGeminiApiRequest(requestBody, geminiApiKey);
    const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedContent) {
      throw new Error("La réponse de l'API est vide ou mal structurée.");
    }

    return { response: generatedContent };
  } catch (err: any) {
    console.error('Erreur détaillée lors de la génération de la réponse IA:', err);
    return { error: `Erreur lors de la génération IA: ${err.message}` };
  }
};