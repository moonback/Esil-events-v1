import { QuoteRequest } from './quoteRequestService';
import { formatDate, formatItemsDetails, calculateTotalAmount, getDeliveryTypeLabel, getTimeSlotLabel } from '../components/admin/quoteRequests/QuoteRequestUtils';

/**
 * Service pour gérer la génération de réponses IA pour les demandes de devis
 */

/**
 * Prépare les données pour la génération de réponse IA
 */
export const prepareAIPromptData = (selectedRequest: QuoteRequest) => {
  const itemsDetails = formatItemsDetails(selectedRequest);
  const totalAmount = calculateTotalAmount(selectedRequest);

  const messages = [
    {
      role: "system",
      content: "Tu es un expert commercial pour ESIL Events, spécialiste de la location de mobilier événementiel premium. Génère des réponses de devis personnalisées, professionnelles et persuasives pour maximiser la conversion. Principes clés : Ton formel mais chaleureux, créer un sentiment d'urgence (disponibilité, offre limitée), souligner l'exclusivité et l'expertise d'ESIL Events, utiliser la preuve sociale, mettre en avant la garantie de satisfaction et le service client. Structure : Accroche personnalisée, présentation valorisante d'ESIL, description de l'impact du mobilier sur l'événement, détail des articles (si fournis) avec caractéristiques premium, offre spéciale (ex: -5% si confirmation sous 7j), conditions claires (acompte 30%), appel à l'action (RDV tel, showroom), signature pro ('L'élégance pour chaque événement'), coordonnées complètes, lien portfolio/réseaux sociaux. Intègre un témoignage générique si pertinent et mentionne nos services (conseil, installation, livraison premium)."
    },
    {
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
• Date: ${selectedRequest.event_date ? formatDate(selectedRequest.event_date) : 'Non spécifiée'}
• Durée: ${selectedRequest.event_duration || 'Non spécifiée'}
• Heures: ${selectedRequest.event_start_time || '?'} - ${selectedRequest.event_end_time || '?'}
• Invités: ${selectedRequest.guest_count || 'Non spécifié'}
• Lieu: ${selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}
• Description: ${selectedRequest.description || 'Aucune description fournie'}

ARTICLES & MONTANT (Indicatif):
${itemsDetails}
• Total TTC Indicatif: ${totalAmount}€

LIVRAISON/RETRAIT:
• Type: ${getDeliveryTypeLabel(selectedRequest.delivery_type)}
• Date: ${selectedRequest.delivery_date ? formatDate(selectedRequest.delivery_date) : '-'}
• Créneau: ${getTimeSlotLabel(selectedRequest.delivery_time_slot)}
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
12. Fournis la réponse uniquement, sans phrases comme "Voici la réponse suggérée :".`
    }
  ];

  return messages;
};

/**
 * Génère une réponse IA pour une demande de devis
 */
export const generateAIResponse = async (selectedRequest: QuoteRequest): Promise<{ response?: string; error?: string }> => {
  try {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return { error: 'Erreur de configuration: Clé API DeepSeek manquante (VITE_DEEPSEEK_API_KEY).' };
    }

    const messages = prepareAIPromptData(selectedRequest);

    const requestBody = {
      model: "deepseek-chat",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.95,
    };

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
      throw new Error(`Erreur API (${response.status}): ${errorData?.error?.message || response.statusText || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content?.trim();

    if (!generatedContent) {
      throw new Error("La réponse de l'API est vide ou mal structurée.");
    }

    return { response: generatedContent };
  } catch (err: any) {
    console.error('Erreur détaillée lors de la génération de la réponse IA:', err);
    return { error: `Erreur lors de la génération IA: ${err.message}` };
  }
};