import { supabase } from './supabaseClient';
import { QuoteRequest, getQuoteRequestById } from './quoteRequestService';
import { getProductById } from './productService';
import { sendEmail } from './emailService';
import { formatDate, formatItemsDetails, calculateTotalAmount, getDeliveryTypeLabel, getTimeSlotLabel } from '../components/admin/quoteRequests/QuoteRequestUtils';

// Interface pour les options de génération de devis
export interface QuoteGenerationOptions {
  includePromotion?: boolean;
  promotionDetails?: string;
  additionalNotes?: string;
  validityPeriod?: number; // Nombre de jours de validité du devis
}

/**
 * Génère et envoie un devis par email basé sur une demande de devis
 * @param quoteRequestId ID de la demande de devis
 * @param options Options de génération du devis
 * @returns Résultat de l'opération
 */
export const generateAndSendQuoteEmail = async (
  quoteRequestId: string,
  options?: QuoteGenerationOptions
): Promise<{ success: boolean; error?: string; emailSent?: boolean }> => {
  try {
    // 1. Récupérer la demande de devis complète
    const { data: quoteRequest, error: quoteError } = await getQuoteRequestById(quoteRequestId);
    
    if (quoteError || !quoteRequest) {
      throw new Error(`Demande de devis ${quoteRequestId} non trouvée ou erreur: ${quoteError?.message}`);
    }

    // 2. Récupérer les détails à jour des produits demandés
    const productDetailsPromises = (quoteRequest.items || []).map(async (item) => {
      try {
        const product = await getProductById(item.id);
        return product ? {
          ...item,
          name: product.name,
          priceHT: product.priceHT,
          priceTTC: product.priceTTC,
          description: product.description,
          isAvailable: product.isAvailable,
          stock: product.stock,
          reference: product.reference
        } : {
          ...item,
          error: true
        };
      } catch (err) {
        console.warn(`Impossible de récupérer le produit ${item.id}:`, err);
        return {
          ...item,
          error: true
        };
      }
    });

    const productDetails = await Promise.all(productDetailsPromises);

    // 3. Construire les données pour le prompt LLM
    const quoteData = {
      ...quoteRequest,
      items: productDetails.map(item => ({
        ...item,
        totalHT: (item.quantity || 0) * (item.priceHT || 0),
        totalTTC: (item.quantity || 0) * (item.priceTTC || 0)
      }))
    };

    // 4. Générer le contenu du devis via l'API Gemini
    const quoteContent = await generateQuoteContent(quoteData, options);

    // 5. Envoyer l'email au client
    const emailResult = await sendQuoteEmail(quoteRequest, quoteContent);

    // 6. Mettre à jour le statut de la demande si l'email a été envoyé avec succès
    if (emailResult.success) {
      await updateQuoteRequestAfterEmailSent(quoteRequestId);
    }

    return {
      success: true,
      emailSent: emailResult.success,
      error: emailResult.error
    };

  } catch (error: any) {
    console.error('Erreur lors de la génération et envoi du devis:', error);
    return {
      success: false,
      emailSent: false,
      error: error.message || 'Une erreur est survenue lors de la génération du devis'
    };
  }
};

/**
 * Génère le contenu du devis en utilisant l'API Gemini
 * @param quoteData Données de la demande de devis avec les produits à jour
 * @param options Options de génération
 * @returns Contenu HTML du devis
 */
async function generateQuoteContent(
  quoteData: QuoteRequest & { items: any[] },
  options?: QuoteGenerationOptions
): Promise<string> {
  try {
    // Préparer les données pour le prompt
    const itemsDetails = quoteData.items.map(item => {
      return `- ${item.name} (Réf: ${item.reference || 'N/A'}): ${item.quantity} x ${item.priceTTC.toFixed(2)}€ = ${(item.quantity * item.priceTTC).toFixed(2)}€ TTC`;
    }).join('\n');

    const totalAmount = quoteData.items.reduce((total, item) => total + (item.quantity * item.priceTTC), 0);
    const totalHT = quoteData.items.reduce((total, item) => total + (item.quantity * item.priceHT), 0);
    const validityPeriod = options?.validityPeriod || 30; // Par défaut 30 jours
    const today = new Date();
    const validUntil = new Date(today);
    validUntil.setDate(today.getDate() + validityPeriod);

    // Construire le prompt pour l'API Gemini
    const systemPrompt = `Tu es un expert commercial pour ESIL Events, spécialiste de la location de mobilier événementiel premium. 
    Génère un devis formel, professionnel et détaillé au format HTML pour le client. 
    Le devis doit être structuré, élégant et prêt à être envoyé par email.
    
    Principes clés :
    - Utiliser un ton formel et professionnel
    - Inclure tous les détails des produits avec leurs prix actualisés
    - Mentionner clairement les conditions (validité, acompte, etc.)
    - Structurer le document de manière claire avec des sections bien définies
    - Utiliser un design sobre et élégant adapté à un email HTML
    - Inclure les coordonnées complètes d'ESIL Events
    - Ajouter un appel à l'action clair pour confirmer le devis
    ${options?.includePromotion ? `- Inclure cette promotion spéciale: ${options.promotionDetails || '5% de remise pour toute confirmation dans les 7 jours'}` : ''}
    ${options?.additionalNotes ? `- Inclure ces notes supplémentaires: ${options.additionalNotes}` : ''}
    `;

    const userPrompt = `Génère un devis formel pour la demande #${quoteData.id?.substring(0, 8).toUpperCase() || 'N/A'}.

CLIENT:
• Nom: ${quoteData.first_name || ''} ${quoteData.last_name || ''}
• Email: ${quoteData.email || 'N/A'}
• Tél: ${quoteData.phone || 'N/A'}
• Société: ${quoteData.company || 'N/A'}
• Type: ${quoteData.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}
• Adresse Facturation: ${[quoteData.billing_address, quoteData.postal_code, quoteData.city].filter(Boolean).join(', ') || 'Non fournie'}

ÉVÉNEMENT:
• Date: ${quoteData.event_date ? formatDate(quoteData.event_date.toString()) : 'Non spécifiée'}
• Durée: ${quoteData.event_duration || 'Non spécifiée'}
• Heures: ${quoteData.event_start_time || '?'} - ${quoteData.event_end_time || '?'}
• Invités: ${quoteData.guest_count || 'Non spécifié'}
• Lieu: ${quoteData.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}
• Description: ${quoteData.description || 'Aucune description fournie'}

ARTICLES & MONTANT:
${itemsDetails}
• Total HT: ${totalHT.toFixed(2)}€
• TVA (20%): ${(totalAmount - totalHT).toFixed(2)}€
• Total TTC: ${totalAmount.toFixed(2)}€

LIVRAISON/RETRAIT:
• Type: ${getDeliveryTypeLabel(quoteData.delivery_type || undefined)}
• Date: ${quoteData.delivery_date ? formatDate(quoteData.delivery_date) : '-'}
• Créneau: ${getTimeSlotLabel(quoteData.delivery_time_slot || undefined)}
• Adresse: ${[quoteData.delivery_address, quoteData.delivery_postal_code, quoteData.delivery_city].filter(Boolean).join(', ') || 'Non fournie ou identique facturation'}

CONDITIONS:
• Validité du devis: ${validityPeriod} jours (jusqu'au ${formatDate(validUntil.toISOString())})
• Acompte requis: 30% à la commande
• Solde: à régler avant la livraison/retrait

Génère un devis formel au format HTML, prêt à être envoyé par email. Inclus un design élégant et professionnel avec le logo et les couleurs d'ESIL Events (indigo/violet). Ajoute un bouton d'appel à l'action pour accepter le devis.`;

    // Appel à l'API Gemini
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Clé API Gemini non configurée');
    }

    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            { text: userPrompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.9
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur API Gemini: ${errorData?.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.candidates[0].content.parts[0].text;

    return generatedContent;
  } catch (error: any) {
    console.error('Erreur lors de la génération du contenu du devis:', error);
    throw new Error(`Échec de la génération du contenu: ${error.message}`);
  }
}

/**
 * Envoie le devis par email au client
 * @param quoteRequest Demande de devis
 * @param quoteContent Contenu HTML du devis
 * @returns Résultat de l'envoi
 */
async function sendQuoteEmail(
  quoteRequest: QuoteRequest,
  quoteContent: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!quoteRequest.email) {
      throw new Error('Adresse email du client manquante');
    }

    const subject = `Votre devis ESIL Events #${quoteRequest.id?.substring(0, 8).toUpperCase() || 'N/A'}`;
    
    // Envoyer l'email
    const result = await sendEmail(
      quoteRequest.email,
      subject,
      quoteContent
    );

    return result;
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return {
      success: false,
      error: error.message || 'Échec de l\'envoi de l\'email'
    };
  }
}

/**
 * Met à jour le statut de la demande de devis après l'envoi du devis
 * @param quoteRequestId ID de la demande de devis
 */
async function updateQuoteRequestAfterEmailSent(quoteRequestId: string): Promise<void> {
  try {
    // Mettre à jour le statut pour indiquer que le devis a été envoyé
    const { error } = await supabase
      .from('quote_requests')
      .update({
        status: 'quote_sent', // Nouveau statut pour indiquer que le devis a été envoyé
        updated_at: new Date().toISOString()
        // La colonne 'notes' n'existe pas dans la table quote_requests
      })
      .eq('id', quoteRequestId);

    if (error) {
      console.error('Erreur lors de la mise à jour du statut de la demande:', error);
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour après envoi du devis:', error);
  }
}