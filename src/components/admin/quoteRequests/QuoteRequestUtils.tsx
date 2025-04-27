import { QuoteRequest } from '../../../services/quoteRequestService';
import { jsPDF } from 'jspdf';

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
 * Exporte une demande de devis en PDF
 */
export const exportToPDF = async (request: QuoteRequest, setFeedbackMessage: (message: { type: 'success' | 'error', text: string } | null) => void) => {
  try {
    const doc = new jsPDF();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.text('Demande de Devis', 105, yPos, { align: 'center' });
    yPos += 20;

    // Client Info
    doc.setFontSize(16);
    doc.text('Informations Client', 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Nom: ${request.first_name} ${request.last_name}`, 20, yPos);
    yPos += 10;
    doc.text(`Email: ${request.email || '-'}`, 20, yPos);
    yPos += 10;
    doc.text(`Téléphone: ${request.phone || '-'}`, 20, yPos);
    yPos += 10;
    doc.text(`Société: ${request.company || '-'}`, 20, yPos);
    yPos += 20;

    // Event Info
    doc.setFontSize(16);
    doc.text('Détails Événement', 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Date: ${request.event_date ? formatDate(request.event_date) : '-'}`, 20, yPos);
    yPos += 10;
    doc.text(`Lieu: ${request.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}`, 20, yPos);
    yPos += 10;
    doc.text(`Invités: ${request.guest_count || '-'}`, 20, yPos);
    yPos += 20;

    // Save the PDF
    doc.save(`devis_${request.id}.pdf`);
    setFeedbackMessage({ type: 'success', text: 'PDF exporté avec succès.' });
    setTimeout(() => setFeedbackMessage(null), 3000);
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    setFeedbackMessage({ type: 'error', text: 'Erreur lors de l\'export PDF.' });
  }
};

/**
 * Imprime une demande de devis
 */
export const printQuoteRequest = (request: QuoteRequest) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Demande de Devis - ${request.id}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .info-item { padding: 8px; background: #f5f5f5; border-radius: 4px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Demande de Devis</h1>
          <p>ID: ${request.id} - Date: ${formatDate(request.created_at)}</p>
        </div>
        
        <div class="section">
          <div class="section-title">Informations Client</div>
          <div class="info-grid">
            <div class="info-item">Nom: ${request.first_name} ${request.last_name}</div>
            <div class="info-item">Email: ${request.email || '-'}</div>
            <div class="info-item">Téléphone: ${request.phone || '-'}</div>
            <div class="info-item">Société: ${request.company || '-'}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Détails Événement</div>
          <div class="info-grid">
            <div class="info-item">Date: ${request.event_date ? formatDate(request.event_date) : '-'}</div>
            <div class="info-item">Lieu: ${request.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</div>
            <div class="info-item">Invités: ${request.guest_count || '-'}</div>
            <div class="info-item">Statut: ${getStatusLabel(request.status)}</div>
          </div>
        </div>

        ${request.items && request.items.length > 0 ? `
        <div class="section">
          <div class="section-title">Articles</div>
          <div class="info-grid">
            ${formatItemsDetails(request).split('\n').map(item => 
              `<div class="info-item">${item}</div>`
            ).join('')}
          </div>
        </div>
        ` : ''}
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};