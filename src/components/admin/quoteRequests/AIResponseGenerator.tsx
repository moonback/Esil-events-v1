import React from 'react';
import { Send, Clipboard } from 'lucide-react';
import { QuoteRequest } from '../../../services/quoteRequestService';
import { formatDate, formatItemsDetails, calculateTotalAmount, getDeliveryTypeLabel, getTimeSlotLabel } from './QuoteRequestUtils';

interface AIResponseGeneratorProps {
  selectedRequest: QuoteRequest | null;
  suggestedResponse: string;
  generatingResponse: boolean;
  onGenerateResponse: () => void;
  onCopyResponse: () => void;
}

const AIResponseGenerator: React.FC<AIResponseGeneratorProps> = ({
  selectedRequest,
  suggestedResponse,
  generatingResponse,
  onGenerateResponse,
  onCopyResponse
}) => {
  if (!selectedRequest) return null;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Send className="h-5 w-5 text-indigo-600" /> Réponse IA
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={onGenerateResponse}
            disabled={generatingResponse}
            className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4 mr-1" />
            {generatingResponse ? 'Génération...' : 'Générer'}
          </button>
          {suggestedResponse && (
            <button
              onClick={onCopyResponse}
              className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
            >
              <Clipboard className="h-4 w-4 mr-1" />
              Copier
            </button>
          )}
        </div>
      </div>

      {suggestedResponse ? (
        <div className="relative">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {suggestedResponse}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-500 italic">
          {generatingResponse ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
              <p>Génération de la réponse en cours...</p>
            </div>
          ) : (
            "Cliquez sur 'Générer' pour créer une réponse personnalisée basée sur les détails de cette demande."
          )}
        </div>
      )}
    </div>
  );
};

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
12. Fournis la réponse uniquement, sans phrases comme "Voici la réponse suggérée :"."`
    }
  ];

  return messages;
};

export { AIResponseGenerator };