import React, { useState } from 'react';
import { Send, Clipboard, Check, Edit, Mail, ExternalLink, Sparkles } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  if (!selectedRequest) return null;

  const handleCopy = () => {
    onCopyResponse();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const openEmailClient = () => {
    if (!selectedRequest.email) return;
    
    const subject = encodeURIComponent(`Votre demande de devis ESIL Events #${selectedRequest.id?.substring(0, 8).toUpperCase() || 'N/A'}`);
    const body = encodeURIComponent(suggestedResponse);
    window.open(`mailto:${selectedRequest.email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" /> Réponse IA
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            disabled={!suggestedResponse}
            className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showPreview ? (
              <>
                <Edit className="h-4 w-4 mr-1" />
                Éditer
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-1" />
                Aperçu
              </>
            )}
          </button>
          
          <button
            onClick={onGenerateResponse}
            disabled={generatingResponse}
            className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4 mr-1" />
            {generatingResponse ? 'Génération...' : 'Générer'}
          </button>
        </div>
      </div>

      {suggestedResponse ? (
        <div className="relative">
          {showPreview ? (
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto shadow-inner">
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: suggestedResponse.replace(/\n/g, '<br/>') }} />
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto font-mono">
              {suggestedResponse}
            </div>
          )}
          
          <div className="flex justify-between mt-4">
            <div className="text-xs text-gray-500">
              {suggestedResponse.length} caractères • {suggestedResponse.split(/\s+/).length} mots
            </div>
            <div className="flex space-x-2">
              {selectedRequest.email && (
                <button
                  onClick={openEmailClient}
                  className="flex items-center px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 transition-colors"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Envoyer par email
                </button>
              )}
              <button
                onClick={handleCopy}
                className={`flex items-center px-3 py-1.5 ${copied ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'} text-sm rounded-md hover:bg-gray-200 transition-colors`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copié!
                  </>
                ) : (
                  <>
                    <Clipboard className="h-4 w-4 mr-1" />
                    Copier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-500 italic">
          {generatingResponse ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
              <p className="font-medium">Génération de la réponse en cours...</p>
              <p className="text-xs mt-2">Cela peut prendre quelques secondes</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Sparkles className="h-10 w-10 text-indigo-300 mb-3" />
              <p>Cliquez sur 'Générer' pour créer une réponse personnalisée basée sur les détails de cette demande.</p>
              <p className="text-xs mt-3">La réponse sera adaptée au profil du client et aux spécificités de l'événement.</p>
            </div>
          )}
        </div>
      )}
      
      {suggestedResponse && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-700">
          <p className="font-medium mb-1">Conseils d'utilisation:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Personnalisez davantage la réponse si nécessaire avant de l'envoyer</li>
            <li>Vérifiez les détails spécifiques comme les dates et les prix</li>
            <li>Ajoutez des informations complémentaires sur les produits si pertinent</li>
          </ul>
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
12. Fournis la réponse uniquement, sans phrases comme "Voici la réponse suggérée :"."
13. Utiliser la signature complète d'ESIL Events :

L'équipe ESIL Events
L'élégance pour chaque événement
📞 06 20 46 13 85 | ✉ contact@esil-events.fr | 🌐 www.esil-events.fr
📍 Showroom : 7 rue de la cellophane, 78711 Mantes-la-Ville 

`
    }
  ];

  return messages;
};

export { AIResponseGenerator };