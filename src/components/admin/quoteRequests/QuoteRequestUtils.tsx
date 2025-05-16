import { QuoteRequest } from '../../../services/quoteRequestService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Fonctions utilitaires pour les demandes de devis
 */

/**
 * Formate une date en format français
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date invalide'; // Check for invalid date object
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Date invalide';
  }
};

/**
 * Retourne la classe CSS pour la couleur du statut
 */
export const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'approved': return 'bg-green-100 text-green-800 border-green-300';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

/**
 * Retourne le libellé du statut
 */
export const getStatusLabel = (status?: string): string => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'approved': return 'Approuvé';
    case 'rejected': return 'Rejeté';
    case 'completed': return 'Terminé';
    default: return 'Nouveau';
  }
};

/**
 * Retourne le libellé du type de livraison
 */
export const getDeliveryTypeLabel = (type?: string): string => {
  switch (type) {
    case 'pickup': return 'Retrait sur place';
    case 'eco': return 'Livraison standard';
    case 'premium': return 'Livraison premium';
    default: return 'Non spécifié';
  }
};

/**
 * Retourne le libellé du créneau horaire
 */
export const getTimeSlotLabel = (slot?: string): string => {
  switch (slot) {
    case 'before9': return 'Avant 9h';
    case '9to13': return '9h - 13h';
    case '13to19': return '13h - 19h';
    default: return 'Non spécifié';
  }
};

/**
 * Retourne le libellé du type d'accès
 */
export const getAccessLabel = (access?: string): string => {
  switch (access) {
    case 'parking': return 'Parking';
    case 'street': return 'Rue';
    case 'stairs': return 'Escaliers';
    case 'flat': return 'Plain-pied';
    case 'elevator': return 'Ascenseur';
    default: return 'Non spécifié';
  }
};

/**
 * Calcule le montant total d'une demande de devis
 */
export const calculateTotalAmount = (request: QuoteRequest): string => {
  const total = (request.items?.reduce((total, item) => 
    total + ((item.quantity || 0) * (item.price || 0)), 0) || 0);
  return total.toFixed(2);
};

/**
 * Formate les détails des articles pour l'affichage
 */
export const formatItemsDetails = (request: QuoteRequest): string => {
  if (!request.items || request.items.length === 0) {
    return 'Aucun article spécifique listé dans la demande.';
  }
  
  return request.items.map(item =>
    `• ${item.name || 'Article inconnu'} (${item.quantity || 0} unité${(item.quantity || 0) > 1 ? 's' : ''} × ${(item.price || 0).toFixed(2)}€) - Sous-total: ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}€`
  ).join('\n');
};

/**
 * Exporte une demande de devis au format PDF
 */
export const exportToPDF = async (
  request: QuoteRequest,
  setFeedbackMessage: (message: { type: 'success' | 'error', text: string } | null) => void
): Promise<void> => {
  if (!request) {
    setFeedbackMessage({ type: 'error', text: 'Aucune demande sélectionnée pour l\'export.' });
    return;
  }

  try {
    setFeedbackMessage({ type: 'success', text: 'Préparation du PDF en cours...' });
    
    // Créer un élément temporaire pour le rendu du contenu
    const printElement = document.createElement('div');
    printElement.className = 'pdf-export-container';
    printElement.style.width = '210mm'; // Format A4
    printElement.style.padding = '15mm';
    printElement.style.position = 'absolute';
    printElement.style.left = '-9999px';
    printElement.style.top = '-9999px';
    document.body.appendChild(printElement);

    // Formater le contenu pour le PDF
    const totalAmount = (request.items?.reduce((total, item) => total + ((item.quantity || 0) * (item.price || 0)), 0) || 0).toFixed(2);
    
    printElement.innerHTML = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4f46e5; font-size: 24px; margin-bottom: 5px;">ESIL Events</h1>
        </div>
        
        <div style="margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
          <h2 style="font-size: 18px; margin-bottom: 10px;">Demande de Devis #${request.id?.substring(0, 8).toUpperCase() || 'N/A'}</h2>
          <p style="font-size: 12px; margin: 0;">Date de la demande: ${formatDate(request.created_at)}</p>
          <p style="font-size: 12px; margin: 0;">Statut: ${getStatusLabel(request.status)}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px; color: #4f46e5;">Informations Client</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="padding: 5px; width: 30%;"><strong>Nom:</strong></td>
              <td style="padding: 5px;">${request.first_name} ${request.last_name}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Type:</strong></td>
              <td style="padding: 5px;">${request.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Société:</strong></td>
              <td style="padding: 5px;">${request.company || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Email:</strong></td>
              <td style="padding: 5px;">${request.email || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Téléphone:</strong></td>
              <td style="padding: 5px;">${request.phone || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Adresse:</strong></td>
              <td style="padding: 5px;">${[request.billing_address, request.postal_code, request.city].filter(Boolean).join(', ') || '-'}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px; color: #4f46e5;">Détails de l'Événement</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="padding: 5px; width: 30%;"><strong>Date:</strong></td>
              <td style="padding: 5px;">${request.event_date ? formatDate(request.event_date.toString()).split(' ')[0] : '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Durée:</strong></td>
              <td style="padding: 5px;">${request.event_duration || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Horaires:</strong></td>
              <td style="padding: 5px;">${request.event_start_time || '-'} - ${request.event_end_time || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Invités:</strong></td>
              <td style="padding: 5px;">${request.guest_count || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Lieu:</strong></td>
              <td style="padding: 5px;">${request.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</td>
            </tr>
          </table>
          ${request.description ? `
            <div style="margin-top: 10px;">
              <p style="font-size: 12px; margin-bottom: 5px;"><strong>Description:</strong></p>
              <p style="font-size: 12px; padding: 5px; background-color: #f9fafb; border: 1px solid #e5e7eb;">${request.description}</p>
            </div>
          ` : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px; color: #4f46e5;">Articles Demandés</h3>
          ${request.items && request.items.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #e5e7eb;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Article</th>
                  <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">Qté</th>
                  <th style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">Prix U.</th>
                  <th style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${request.items.map(item => `
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name || 'N/A'}</td>
                    <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity || 0}</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">${(item.price || 0).toFixed(2)}€</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">${((item.quantity || 0) * (item.price || 0)).toFixed(2)}€</td>
                  </tr>
                `).join('')}
                <tr style="background-color: #f3f4f6; font-weight: bold;">
                  <td colspan="3" style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">Total TTC Indicatif</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #4f46e5;">${totalAmount}€</td>
                </tr>
              </tbody>
            </table>
          ` : `
            <p style="font-size: 12px; font-style: italic;">Aucun article spécifique listé dans cette demande.</p>
          `}
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px; color: #4f46e5;">Livraison / Retrait</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="padding: 5px; width: 30%;"><strong>Type:</strong></td>
              <td style="padding: 5px;">${getDeliveryTypeLabel(request.delivery_type || undefined)}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Date:</strong></td>
              <td style="padding: 5px;">${request.delivery_date ? formatDate(request.delivery_date).split(' ')[0] : '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Créneau:</strong></td>
              <td style="padding: 5px;">${getTimeSlotLabel(request.delivery_time_slot || undefined)}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Adresse:</strong></td>
              <td style="padding: 5px;">${[request.delivery_address, request.delivery_postal_code, request.delivery_city].filter(Boolean).join(', ') || '-'}</td>
            </tr>
          </table>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px; color: #4f46e5;">Accès</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="padding: 5px; width: 30%;"><strong>Accès extérieur:</strong></td>
              <td style="padding: 5px;">${request.exterior_access || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Accès intérieur:</strong></td>
              <td style="padding: 5px;">${request.interior_access || '-'}</td>
            </tr>
            ${request.elevator_width || request.elevator_height || request.elevator_depth ? `
              <tr>
                <td style="padding: 5px;"><strong>Dimensions ascenseur:</strong></td>
                <td style="padding: 5px;">
                  ${[
                    request.elevator_width ? `Largeur: ${request.elevator_width}cm` : null,
                    request.elevator_height ? `Hauteur: ${request.elevator_height}cm` : null,
                    request.elevator_depth ? `Profondeur: ${request.elevator_depth}cm` : null
                  ].filter(Boolean).join(' | ')}
                </td>
              </tr>
            ` : ''}
          </table>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px; color: #4f46e5;">Reprise</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="padding: 5px; width: 30%;"><strong>Date:</strong></td>
              <td style="padding: 5px;">${request.pickup_return_date ? formatDate(request.pickup_return_date).split(' ')[0] : '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Début:</strong></td>
              <td style="padding: 5px;">${request.pickup_return_start_time || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Fin:</strong></td>
              <td style="padding: 5px;">${request.pickup_return_end_time || '-'}</td>
            </tr>
          </table>
        </div>
        ${request.comments ? `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px; color: #4f46e5;">Commentaires Client</h3>
            <p style="font-size: 12px; padding: 8px; background-color: #f9fafb; border: 1px solid #e5e7eb;">${request.comments}</p>
          </div>
        ` : ''}
        
        <div style="margin-top: 30px; font-size: 10px; text-align: center; color: #6b7280;">
          <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          <p>ESIL Events - L'élégance pour chaque événement</p>
        </div>
      </div>
    `;

    // Générer le PDF à partir du contenu HTML
    const canvas = await html2canvas(printElement, {
      scale: 2, // Augmenter la résolution pour une meilleure qualité
      useCORS: true,
      logging: false,
      windowWidth: 210 * 8, // Largeur en pixels (210mm * 8 pixels par mm)
      windowHeight: 297 * 8 // Hauteur en pixels (297mm * 8 pixels par mm)
    });

    // Créer le PDF au format A4
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Dimensions A4 en mm
    const pageWidth = 210;
    const pageHeight = 297;
    
    // Calculer le nombre de pages nécessaires
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageCount = Math.ceil(imgHeight / pageHeight);
    
    // Ajouter chaque page au PDF
    for (let i = 0; i < pageCount; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      // Calculer la position Y pour cette page
      const positionY = -(i * pageHeight);
      
      // Ajouter l'image avec la position Y ajustée
      pdf.addImage(
        imgData,
        'PNG',
        0,
        positionY,
        imgWidth,
        imgHeight
      );
    }
    
    // Générer un nom de fichier basé sur les informations de la demande
    const fileName = `ESIL_Devis_${request.id?.substring(0, 8).toUpperCase() || 'N/A'}_${request.last_name || 'Client'}.pdf`;
    
    // Télécharger le PDF
    pdf.save(fileName);
    
    // Nettoyer l'élément temporaire
    document.body.removeChild(printElement);
    
    setFeedbackMessage({ type: 'success', text: 'PDF exporté avec succès.' });
    setTimeout(() => setFeedbackMessage(null), 3000);
  } catch (err: any) {
    console.error('Erreur lors de l\'export PDF:', err);
    setFeedbackMessage({ type: 'error', text: `Erreur lors de l'export PDF: ${err.message}` });
  }
};

/**
 * Imprime une demande de devis
 */
export const printQuoteRequest = (
  request: QuoteRequest,
  setFeedbackMessage?: (message: { type: 'success' | 'error', text: string } | null) => void
): void => {
  if (!request) {
    setFeedbackMessage?.({ type: 'error', text: 'Aucune demande sélectionnée pour l\'impression.' });
    return;
  }

  try {
    // Créer une fenêtre d'impression
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      throw new Error('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez les paramètres de votre navigateur.');
    }

    // Formater le contenu pour l'impression (réutiliser le même format que pour le PDF)
    const totalAmount = (request.items?.reduce((total, item) => total + ((item.quantity || 0) * (item.price || 0)), 0) || 0).toFixed(2);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Demande de Devis #${request.id?.substring(0, 8).toUpperCase() || 'N/A'}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; }
          h1, h2, h3 { color: #4f46e5; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background-color: #f3f4f6; }
          .header { text-align: center; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #6b7280; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ESIL Events</h1>
          <p>Location de mobilier événementiel premium</p>
        </div>
        
        <div class="section">
          <h2>Demande de Devis #${request.id?.substring(0, 8).toUpperCase() || 'N/A'}</h2>
          <p>Date de la demande: ${formatDate(request.created_at)}</p>
          <p>Statut: ${getStatusLabel(request.status)}</p>
        </div>
        
        <div class="section">
          <h3>Informations Client</h3>
          <table>
            <tr>
              <td><strong>Nom:</strong></td>
              <td>${request.first_name} ${request.last_name}</td>
            </tr>
            <tr>
              <td><strong>Type:</strong></td>
              <td>${request.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</td>
            </tr>
            <tr>
              <td><strong>Société:</strong></td>
              <td>${request.company || '-'}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong></td>
              <td>${request.email || '-'}</td>
            </tr>
            <tr>
              <td><strong>Téléphone:</strong></td>
              <td>${request.phone || '-'}</td>
            </tr>
            <tr>
              <td><strong>Adresse:</strong></td>
              <td>${[request.billing_address, request.postal_code, request.city].filter(Boolean).join(', ') || '-'}</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <h3>Détails de l'Événement</h3>
          <table>
            <tr>
              <td><strong>Date:</strong></td>
              <td>${request.event_date ? formatDate(request.event_date.toString()).split(' ')[0] : '-'}</td>
            </tr>
            <tr>
              <td><strong>Durée:</strong></td>
              <td>${request.event_duration || '-'}</td>
            </tr>
            <tr>
              <td><strong>Horaires:</strong></td>
              <td>${request.event_start_time || '-'} - ${request.event_end_time || '-'}</td>
            </tr>
            <tr>
              <td><strong>Invités:</strong></td>
              <td>${request.guest_count || '-'}</td>
            </tr>
            <tr>
              <td><strong>Lieu:</strong></td>
              <td>${request.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</td>
            </tr>
          </table>
          ${request.description ? `
            <div>
              <p><strong>Description:</strong></p>
              <p style="padding: 10px; background-color: #f9fafb; border: 1px solid #e5e7eb;">${request.description}</p>
            </div>
          ` : ''}
        </div>
        
        <div class="section">
          <h3>Articles Demandés</h3>
          ${request.items && request.items.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Article</th>
                  <th style="text-align: center;">Qté</th>
                  <th style="text-align: right;">Prix U.</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${request.items.map(item => `
                  <tr>
                    <td>${item.name || 'N/A'}</td>
                    <td style="text-align: center;">${item.quantity || 0}</td>
                    <td style="text-align: right;">${(item.price || 0).toFixed(2)}€</td>
                    <td style="text-align: right;">${((item.quantity || 0) * (item.price || 0)).toFixed(2)}€</td>
                  </tr>
                `).join('')}
                <tr style="font-weight: bold; background-color: #f3f4f6;">
                  <td colspan="3" style="text-align: right;">Total TTC Indicatif</td>
                  <td style="text-align: right; color: #4f46e5;">${totalAmount}€</td>
                </tr>
              </tbody>
            </table>
          ` : `
            <p style="font-style: italic;">Aucun article spécifique listé dans cette demande.</p>
          `}
        </div>
        
        <div class="section">
          <h3>Livraison / Retrait</h3>
          <table>
            <tr>
              <td><strong>Type:</strong></td>
              <td>${getDeliveryTypeLabel(request.delivery_type || undefined)}</td>
            </tr>
            <tr>
              <td><strong>Date:</strong></td>
              <td>${request.delivery_date ? formatDate(request.delivery_date).split(' ')[0] : '-'}</td>
            </tr>
            <tr>
              <td><strong>Créneau:</strong></td>
              <td>${getTimeSlotLabel(request.delivery_time_slot || undefined)}</td>
            </tr>
            <tr>
              <td><strong>Adresse:</strong></td>
              <td>${[request.delivery_address, request.delivery_postal_code, request.delivery_city].filter(Boolean).join(', ') || '-'}</td>
            </tr>
          </table>
        </div>
        <div class="section">
          <h3>Accès</h3>
          <table>
            <tr>
              <td><strong>Accès extérieur:</strong></td>
              <td>${request.exterior_access || '-'}</td>
            </tr>
            <tr>
              <td><strong>Accès intérieur:</strong></td>
              <td>${request.interior_access || '-'}</td>
            </tr>
            ${request.elevator_width || request.elevator_height || request.elevator_depth ? `
              <tr>
                <td><strong>Dimensions ascenseur:</strong></td>
                <td>
                  ${[
                    request.elevator_width ? `Largeur: ${request.elevator_width}cm` : null,
                    request.elevator_height ? `Hauteur: ${request.elevator_height}cm` : null,
                    request.elevator_depth ? `Profondeur: ${request.elevator_depth}cm` : null
                  ].filter(Boolean).join(' | ')}
                </td>
              </tr>
            ` : ''}
          </table>
        </div>

        <div class="section">
          <h3>Reprise</h3>
          <table>
            <tr>
              <td><strong>Date:</strong></td>
              <td>${request.pickup_return_date ? formatDate(request.pickup_return_date).split(' ')[0] : '-'}</td>
            </tr>
            <tr>
              <td><strong>Début:</strong></td>
              <td>${request.pickup_return_start_time || '-'}</td>
            </tr>
            <tr>
              <td><strong>Fin:</strong></td>
              <td>${request.pickup_return_end_time || '-'}</td>
            </tr>
          </table>
        </div>
        ${request.comments ? `
          <div class="section">
            <h3>Commentaires Client</h3>
            <p style="padding: 10px; background-color: #f9fafb; border: 1px solid #e5e7eb;">${request.comments}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Document imprimé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          <p>ESIL Events - L'élégance pour chaque événement</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.print(); setTimeout(() => window.close(), 500);" style="padding: 10px 20px; background-color: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Imprimer
          </button>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    setFeedbackMessage?.({ type: 'success', text: 'Document prêt pour impression.' });
    if (setFeedbackMessage) {
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  } catch (err: any) {
    console.error('Erreur lors de la préparation de l\'impression:', err);
    setFeedbackMessage?.({ type: 'error', text: `Erreur lors de l'impression: ${err.message}` });
  }
};