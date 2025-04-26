import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QuoteRequest } from '../services/quoteRequestService';
import { formatDate, getStatusLabel, getDeliveryTypeLabel, getTimeSlotLabel, getAccessLabel } from './formatters';

/**
 * Génère un PDF à partir des détails d'une demande de devis
 * @param quoteRequest La demande de devis à exporter
 */
export const generateQuoteRequestPDF = async (quoteRequest: QuoteRequest): Promise<void> => {
  // Créer un nouveau document PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Définir les styles et les positions
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;
  const lineHeight = 7;

  // Ajouter le titre
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Demande de Devis', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += lineHeight * 2;

  // Ajouter la référence et la date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Référence: ${quoteRequest.id || 'N/A'}`, margin, yPosition);
  pdf.text(`Date: ${formatDate(quoteRequest.created_at || '')}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += lineHeight * 2;

  // Ajouter les informations du client
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Informations Client', margin, yPosition);
  yPosition += lineHeight;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Nom: ${quoteRequest.first_name} ${quoteRequest.last_name}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Société: ${quoteRequest.company || 'N/A'}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Email: ${quoteRequest.email || 'N/A'}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Téléphone: ${quoteRequest.phone || 'N/A'}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Adresse: ${[quoteRequest.billing_address, quoteRequest.postal_code, quoteRequest.city].filter(Boolean).join(', ') || 'N/A'}`, margin, yPosition);
  yPosition += lineHeight * 2;

  // Ajouter les détails de l'événement
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Détails de l\'Événement', margin, yPosition);
  yPosition += lineHeight;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Date: ${quoteRequest.event_date ? formatDate(quoteRequest.event_date).split(' ')[0] : 'N/A'}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Durée: ${quoteRequest.event_duration || 'N/A'}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Horaires: ${quoteRequest.event_start_time || 'N/A'} - ${quoteRequest.event_end_time || 'N/A'}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Nombre d'invités: ${quoteRequest.guest_count || 'N/A'}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Lieu: ${quoteRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}`, margin, yPosition);
  yPosition += lineHeight * 2;

  // Ajouter les informations de livraison
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Livraison / Retrait', margin, yPosition);
  yPosition += lineHeight;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Type: ${getDeliveryTypeLabel(quoteRequest.delivery_type)}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Date: ${quoteRequest.delivery_date ? formatDate(quoteRequest.delivery_date).split(' ')[0] : 'N/A'}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Créneau: ${getTimeSlotLabel(quoteRequest.delivery_time_slot)}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Adresse: ${[quoteRequest.delivery_address, quoteRequest.delivery_postal_code, quoteRequest.delivery_city].filter(Boolean).join(', ') || 'N/A'}`, margin, yPosition);
  yPosition += lineHeight * 2;
// Ajouter les informations de reprise
pdf.setFontSize(12);
pdf.setFont('helvetica', 'bold');
pdf.text('Informations de Reprise', margin, yPosition);
yPosition += lineHeight;

pdf.setFontSize(10);
pdf.setFont('helvetica', 'normal');
pdf.text(`Date: ${quoteRequest.pickup_return_date ? formatDate(quoteRequest.pickup_return_date).split(' ')[0] : 'N/A'}`, margin, yPosition);
yPosition += lineHeight;
pdf.text(`Horaires: ${quoteRequest.pickup_return_start_time || 'N/A'} - ${quoteRequest.pickup_return_end_time || 'N/A'}`, margin, yPosition);
yPosition += lineHeight * 2;
  // Ajouter les articles demandés
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Articles Demandés', margin, yPosition);
  yPosition += lineHeight;

  if (quoteRequest.items && quoteRequest.items.length > 0) {
    // Entêtes du tableau
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Article', margin, yPosition);
    pdf.text('Qté', pageWidth / 2 - 10, yPosition, { align: 'center' });
    pdf.text('Prix U.', pageWidth / 2 + 20, yPosition, { align: 'center' });
    pdf.text('Total', pageWidth - margin, yPosition, { align: 'right' });
    yPosition += lineHeight;

    // Ligne de séparation
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);

    // Contenu du tableau
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    let totalAmount = 0;

    quoteRequest.items.forEach(item => {
      const itemTotal = (item.quantity || 0) * (item.price || 0);
      totalAmount += itemTotal;

      pdf.text(item.name || 'N/A', margin, yPosition);
      pdf.text(String(item.quantity || 0), pageWidth / 2 - 10, yPosition, { align: 'center' });
      pdf.text(`${(item.price || 0).toFixed(2)}€`, pageWidth / 2 + 20, yPosition, { align: 'center' });
      pdf.text(`${itemTotal.toFixed(2)}€`, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += lineHeight;

      // Vérifier si on doit ajouter une nouvelle page
      if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    });

    // Ligne de séparation
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += lineHeight;

    // Total
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total TTC Indicatif', pageWidth - margin - 40, yPosition);
    pdf.text(`${totalAmount.toFixed(2)}€`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += lineHeight * 2;
  } else {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Aucun article spécifique listé dans cette demande.', margin, yPosition);
    yPosition += lineHeight * 2;
  }

  // Ajouter le statut actuel
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Statut', margin, yPosition);
  yPosition += lineHeight;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Statut actuel: ${getStatusLabel(quoteRequest.status)}`, margin, yPosition);
  yPosition += lineHeight * 2;


  // Ajouter les commentaires
  if (quoteRequest.comments) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Commentaires', margin, yPosition);
    yPosition += lineHeight;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(quoteRequest.comments, margin, yPosition);
    yPosition += lineHeight * 2;
  }

  // Ajouter le pied de page
  const footerPosition = pdf.internal.pageSize.getHeight() - 10;
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('ESIL Events - Document généré automatiquement', pageWidth / 2, footerPosition, { align: 'center' });

  // Télécharger le PDF
  pdf.save(`demande-devis-${quoteRequest.id || 'export'}.pdf`);
};

/**
 * Crée une version imprimable de la demande de devis
 * @param quoteRequest La demande de devis à imprimer
 */
export const printQuoteRequest = async (quoteRequest: QuoteRequest): Promise<void> => {
  // Créer un élément temporaire pour l'impression
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Veuillez autoriser les popups pour l\'impression');
    return;
  }

  // Créer le contenu HTML à imprimer
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Demande de Devis - ${quoteRequest.id || 'Impression'}</title>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        h1 {
          text-align: center;
          color: #4f46e5;
          margin-bottom: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .section {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f9fafb;
          border-radius: 5px;
          border: 1px solid #e5e7eb;
        }
        .section-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #4f46e5;
          font-size: 16px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .label {
          color: #6b7280;
          font-size: 14px;
        }
        .value {
          font-weight: 500;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        .total-row {
          font-weight: bold;
          background-color: #f3f4f6;
        }
        .text-right {
          text-align: right;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
        }
        @media print {
          body {
            margin: 0;
            padding: 15px;
          }
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <button onclick="window.print();" style="position: fixed; top: 20px; right: 20px; padding: 8px 16px; background-color: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Imprimer
      </button>

      <h1>Demande de Devis</h1>
      
      <div class="header">
        <div>Référence: ${quoteRequest.id || 'N/A'}</div>
        <div>Date: ${formatDate(quoteRequest.created_at || '')}</div>
      </div>

      <div class="section">
        <div class="section-title">Informations Client</div>
        <div class="grid">
          <div><span class="label">Nom:</span> <span class="value">${quoteRequest.first_name} ${quoteRequest.last_name}</span></div>
          <div><span class="label">Type:</span> <span class="value">${quoteRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</span></div>
          <div><span class="label">Société:</span> <span class="value">${quoteRequest.company || 'N/A'}</span></div>
          <div><span class="label">Email:</span> <span class="value">${quoteRequest.email || 'N/A'}</span></div>
          <div><span class="label">Téléphone:</span> <span class="value">${quoteRequest.phone || 'N/A'}</span></div>
          <div><span class="label">Adresse:</span> <span class="value">${[quoteRequest.billing_address, quoteRequest.postal_code, quoteRequest.city].filter(Boolean).join(', ') || 'N/A'}</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Détails de l'Événement</div>
        <div class="grid">
          <div><span class="label">Date:</span> <span class="value">${quoteRequest.event_date ? formatDate(quoteRequest.event_date).split(' ')[0] : 'N/A'}</span></div>
          <div><span class="label">Durée:</span> <span class="value">${quoteRequest.event_duration || 'N/A'}</span></div>
          <div><span class="label">Début:</span> <span class="value">${quoteRequest.event_start_time || 'N/A'}</span></div>
          <div><span class="label">Fin:</span> <span class="value">${quoteRequest.event_end_time || 'N/A'}</span></div>
          <div><span class="label">Invités:</span> <span class="value">${quoteRequest.guest_count || 'N/A'}</span></div>
          <div><span class="label">Lieu:</span> <span class="value">${quoteRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</span></div>
        </div>
        ${quoteRequest.description ? `
        <div style="margin-top: 10px;">
          <div class="label">Description:</div>
          <div style="background-color: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb; margin-top: 5px;">
            ${quoteRequest.description}
          </div>
        </div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">Articles Demandés</div>
        ${quoteRequest.items && quoteRequest.items.length > 0 ? `
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
            ${quoteRequest.items.map(item => `
            <tr>
              <td>${item.name || 'N/A'}</td>
              <td style="text-align: center;">${item.quantity || 0}</td>
              <td style="text-align: right;">${(item.price || 0).toFixed(2)}€</td>
              <td style="text-align: right;">${((item.quantity || 0) * (item.price || 0)).toFixed(2)}€</td>
            </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3" class="text-right">Total TTC Indicatif</td>
              <td style="text-align: right;">${quoteRequest.items.reduce((total, item) => total + ((item.quantity || 0) * (item.price || 0)), 0).toFixed(2)}€</td>
            </tr>
          </tbody>
        </table>
        ` : `<p style="font-style: italic;">Aucun article spécifique listé dans cette demande.</p>`}
      </div>

      <div class="section">
        <div class="section-title">Livraison / Retrait</div>
        <div class="grid">
          <div><span class="label">Type:</span> <span class="value">${getDeliveryTypeLabel(quoteRequest.delivery_type)}</span></div>
          <div><span class="label">Date:</span> <span class="value">${quoteRequest.delivery_date ? formatDate(quoteRequest.delivery_date).split(' ')[0] : 'N/A'}</span></div>
          <div><span class="label">Créneau:</span> <span class="value">${getTimeSlotLabel(quoteRequest.delivery_time_slot)}</span></div>
          <div><span class="label">Adresse:</span> <span class="value">${[quoteRequest.delivery_address, quoteRequest.delivery_postal_code, quoteRequest.delivery_city].filter(Boolean).join(', ') || 'N/A'}</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Statut</div>
        <div><span class="label">Statut actuel:</span> <span class="value">${getStatusLabel(quoteRequest.status)}</span></div>
      </div>

      ${quoteRequest.comments ? `
      <div class="section">
        <div class="section-title">Commentaires</div>
        <div>${quoteRequest.comments}</div>
      </div>` : ''}

      <div class="footer">
        ESIL Events - Document généré automatiquement
      </div>
    </body>
    </html>
  `;

  // Écrire le contenu dans la fenêtre d'impression
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Attendre que le contenu soit chargé avant d'imprimer
  printWindow.onload = () => {
    printWindow.focus();
    // L'impression sera déclenchée par le bouton dans la page
  };
};