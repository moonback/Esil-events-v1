import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QuoteRequest } from '../../../services/quoteRequestService';
import { formatDate, getStatusLabel, getDeliveryTypeLabel, getTimeSlotLabel } from './QuoteRequestUtils';

/**
 * Fonctions utilitaires pour l'export et l'impression des demandes de devis
 */

/**
 * Exporte une demande de devis au format PDF
 */
export const exportToPDF = async (
  selectedRequest: QuoteRequest,
  setFeedbackMessage: (message: { type: 'success' | 'error', text: string } | null) => void
): Promise<void> => {
  if (!selectedRequest) {
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
    const totalAmount = (selectedRequest.items?.reduce((total, item) => total + ((item.quantity || 0) * (item.price || 0)), 0) || 0).toFixed(2);
    
    printElement.innerHTML = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4f46e5; font-size: 24px; margin-bottom: 5px;">ESIL Events</h1>
          <p style="font-size: 14px; margin: 0;">Location de mobilier événementiel premium</p>
        </div>
        
        <div style="margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
          <h2 style="font-size: 18px; margin-bottom: 10px;">Demande de Devis #${selectedRequest.id?.substring(0, 8).toUpperCase() || 'N/A'}</h2>
          <p style="font-size: 12px; margin: 0;">Date de la demande: ${formatDate(selectedRequest.created_at)}</p>
          <p style="font-size: 12px; margin: 0;">Statut: ${getStatusLabel(selectedRequest.status)}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px; color: #4f46e5;">Informations Client</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="padding: 5px; width: 30%;"><strong>Nom:</strong></td>
              <td style="padding: 5px;">${selectedRequest.first_name} ${selectedRequest.last_name}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Type:</strong></td>
              <td style="padding: 5px;">${selectedRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Société:</strong></td>
              <td style="padding: 5px;">${selectedRequest.company || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Email:</strong></td>
              <td style="padding: 5px;">${selectedRequest.email || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Téléphone:</strong></td>
              <td style="padding: 5px;">${selectedRequest.phone || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Adresse:</strong></td>
              <td style="padding: 5px;">${[selectedRequest.billing_address, selectedRequest.postal_code, selectedRequest.city].filter(Boolean).join(', ') || '-'}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px; color: #4f46e5;">Détails de l'Événement</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="padding: 5px; width: 30%;"><strong>Date:</strong></td>
              <td style="padding: 5px;">${selectedRequest.event_date ? formatDate(selectedRequest.event_date).split(' ')[0] : '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Durée:</strong></td>
              <td style="padding: 5px;">${selectedRequest.event_duration || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Horaires:</strong></td>
              <td style="padding: 5px;">${selectedRequest.event_start_time || '-'} - ${selectedRequest.event_end_time || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Invités:</strong></td>
              <td style="padding: 5px;">${selectedRequest.guest_count || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Lieu:</strong></td>
              <td style="padding: 5px;">${selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</td>
            </tr>
          </table>
          ${selectedRequest.description ? `
            <div style="margin-top: 10px;">
              <p style="font-size: 12px; margin-bottom: 5px;"><strong>Description:</strong></p>
              <p style="font-size: 12px; padding: 5px; background-color: #f9fafb; border: 1px solid #e5e7eb;">${selectedRequest.description}</p>
            </div>
          ` : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px; color: #4f46e5;">Articles Demandés</h3>
          ${selectedRequest.items && selectedRequest.items.length > 0 ? `
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
                ${selectedRequest.items.map(item => `
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
              <td style="padding: 5px;">${getDeliveryTypeLabel(selectedRequest.delivery_type)}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Date:</strong></td>
              <td style="padding: 5px;">${selectedRequest.delivery_date ? formatDate(selectedRequest.delivery_date).split(' ')[0] : '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Créneau:</strong></td>
              <td style="padding: 5px;">${getTimeSlotLabel(selectedRequest.delivery_time_slot)}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Adresse:</strong></td>
              <td style="padding: 5px;">${[selectedRequest.delivery_address, selectedRequest.delivery_postal_code, selectedRequest.delivery_city].filter(Boolean).join(', ') || '-'}</td>
            </tr>
          </table>
        </div>
        
        ${selectedRequest.comments ? `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px; color: #4f46e5;">Commentaires Client</h3>
            <p style="font-size: 12px; padding: 8px; background-color: #f9fafb; border: 1px solid #e5e7eb;">${selectedRequest.comments}</p>
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
      scale: 1,
      useCORS: true,
      logging: false
    });

    // Créer le PDF au format A4
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = canvas.height * imgWidth / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Générer un nom de fichier basé sur les informations de la demande
    const fileName = `ESIL_Devis_${selectedRequest.id?.substring(0, 8).toUpperCase() || 'N/A'}_${selectedRequest.last_name || 'Client'}.pdf`;
    
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
  selectedRequest: QuoteRequest,
  setFeedbackMessage: (message: { type: 'success' | 'error', text: string } | null) => void
): void => {
  if (!selectedRequest) {
    setFeedbackMessage({ type: 'error', text: 'Aucune demande sélectionnée pour l\'impression.' });
    return;
  }

  try {
    // Créer une fenêtre d'impression
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      throw new Error('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez les paramètres de votre navigateur.');
    }

    // Formater le contenu pour l'impression (réutiliser le même format que pour le PDF)
    const totalAmount = (selectedRequest.items?.reduce((total, item) => total + ((item.quantity || 0) * (item.price || 0)), 0) || 0).toFixed(2);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Demande de Devis #${selectedRequest.id?.substring(0, 8).toUpperCase() || 'N/A'}</title>
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
          <h2>Demande de Devis #${selectedRequest.id?.substring(0, 8).toUpperCase() || 'N/A'}</h2>
          <p>Date de la demande: ${formatDate(selectedRequest.created_at)}</p>
          <p>Statut: ${getStatusLabel(selectedRequest.status)}</p>
        </div>
        
        <div class="section">
          <h3>Informations Client</h3>
          <table>
            <tr>
              <td><strong>Nom:</strong></td>
              <td>${selectedRequest.first_name} ${selectedRequest.last_name}</td>
            </tr>
            <tr>
              <td><strong>Type:</strong></td>
              <td>${selectedRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</td>
            </tr>
            <tr>
              <td><strong>Société:</strong></td>
              <td>${selectedRequest.company || '-'}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong></td>
              <td>${selectedRequest.email || '-'}</td>
            </tr>
            <tr>
              <td><strong>Téléphone:</strong></td>
              <td>${selectedRequest.phone || '-'}</td>
            </tr>
            <tr>
              <td><strong>Adresse:</strong></td>
              <td>${[selectedRequest.billing_address, selectedRequest.postal_code, selectedRequest.city].filter(Boolean).join(', ') || '-'}</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <h3>Détails de l'Événement</h3>
          <table>
            <tr>
              <td><strong>Date:</strong></td>
              <td>${selectedRequest.event_date ? formatDate(selectedRequest.event_date).split(' ')[0] : '-'}</td>
            </tr>
            <tr>
              <td><strong>Durée:</strong></td>
              <td>${selectedRequest.event_duration || '-'}</td>
            </tr>
            <tr>
              <td><strong>Horaires:</strong></td>
              <td>${selectedRequest.event_start_time || '-'} - ${selectedRequest.event_end_time || '-'}</td>
            </tr>
            <tr>
              <td><strong>Invités:</strong></td>
              <td>${selectedRequest.guest_count || '-'}</td>
            </tr>
            <tr>
              <td><strong>Lieu:</strong></td>
              <td>${selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</td>
            </tr>
          </table>
          ${selectedRequest.description ? `
            <div>
              <p><strong>Description:</strong></p>
              <p style="padding: 10px; background-color: #f9fafb; border: 1px solid #e5e7eb;">${selectedRequest.description}</p>
            </div>
          ` : ''}
        </div>
        
        <div class="section">
          <h3>Articles Demandés</h3>
          ${selectedRequest.items && selectedRequest.items.length > 0 ? `
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
                ${selectedRequest.items.map(item => `
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
              <td>${getDeliveryTypeLabel(selectedRequest.delivery_type)}</td>
            </tr>
            <tr>
              <td><strong>Date:</strong></td>
              <td>${selectedRequest.delivery_date ? formatDate(selectedRequest.delivery_date).split(' ')[0] : '-'}</td>
            </tr>
            <tr>
              <td><strong>Créneau:</strong></td>
              <td>${getTimeSlotLabel(selectedRequest.delivery_time_slot)}</td>
            </tr>
            <tr>
              <td><strong>Adresse:</strong></td>
              <td>${[selectedRequest.delivery_address, selectedRequest.delivery_postal_code, selectedRequest.delivery_city].filter(Boolean).join(', ') || '-'}</td>
            </tr>
          </table>
        </div>
        
        ${selectedRequest.comments ? `
          <div class="section">
            <h3>Commentaires Client</h3>
            <p style="padding: 10px; background-color: #f9fafb; border: 1px solid #e5e7eb;">${selectedRequest.comments}</p>
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
    
    setFeedbackMessage({ type: 'success', text: 'Document prêt pour impression.' });
    setTimeout(() => setFeedbackMessage(null), 3000);
  } catch (err: any) {
    console.error('Erreur lors de la préparation de l\'impression:', err);
    setFeedbackMessage({ type: 'error', text: `Erreur lors de l'impression: ${err.message}` });
  }
};