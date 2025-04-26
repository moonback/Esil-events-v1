import { QuoteRequest } from './quoteRequestService';
import { formatDate, getDeliveryTypeLabel, getTimeSlotLabel, getAccessLabel } from '../utils/formatters';

/**
 * Configuration de l'email
 */
interface EmailConfig {
  recipient: string;
  subject: string;
  body: string;
}

/**
 * Génère le contenu HTML d'un email récapitulatif pour une demande de devis
 */
export const generateQuoteRequestEmailContent = (quoteRequest: QuoteRequest): string => {
  // Calcul du montant total
  const totalAmount = (quoteRequest.items?.reduce((total, item) => 
    total + ((item.quantity || 0) * (item.price || 0)), 0) || 0).toFixed(2);

  // Formatage de la date de création
  const creationDate = quoteRequest.created_at ? formatDate(quoteRequest.created_at) : 'N/A';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nouvelle demande de devis</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #4f46e5; font-size: 24px; margin-top: 0; }
        h2 { color: #4f46e5; font-size: 18px; margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .section { background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .label { color: #6b7280; font-weight: normal; }
        .value { font-weight: bold; color: #111827; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #f3f4f6; text-align: left; padding: 8px; font-size: 14px; }
        td { border-top: 1px solid #e5e7eb; padding: 8px; font-size: 14px; }
        .total-row { background-color: #f3f4f6; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
      </style>
    </head>
    <body>
      <h1>Nouvelle demande de devis</h1>
      <p>Une nouvelle demande de devis a été reçue le ${creationDate}.</p>
      
      <h2>Informations client</h2>
      <div class="section">
        <p><span class="label">Nom:</span> <span class="value">${quoteRequest.first_name} ${quoteRequest.last_name}</span></p>
        <p><span class="label">Type:</span> <span class="value">${quoteRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</span></p>
        <p><span class="label">Société:</span> <span class="value">${quoteRequest.company || '-'}</span></p>
        <p><span class="label">Email:</span> <span class="value">${quoteRequest.email || '-'}</span></p>
        <p><span class="label">Téléphone:</span> <span class="value">${quoteRequest.phone || '-'}</span></p>
        <p><span class="label">Facturation:</span> <span class="value">${[quoteRequest.billing_address, quoteRequest.postal_code, quoteRequest.city].filter(Boolean).join(', ') || '-'}</span></p>
      </div>
      
      <h2>Détails de l'événement</h2>
      <div class="section">
        <p><span class="label">Date:</span> <span class="value">${quoteRequest.event_date ? formatDate(quoteRequest.event_date).split(' ')[0] : '-'}</span></p>
        <p><span class="label">Durée:</span> <span class="value">${quoteRequest.event_duration || '-'}</span></p>
        <p><span class="label">Début:</span> <span class="value">${quoteRequest.event_start_time || '-'}</span></p>
        <p><span class="label">Fin:</span> <span class="value">${quoteRequest.event_end_time || '-'}</span></p>
        <p><span class="label">Invités:</span> <span class="value">${quoteRequest.guest_count || '-'}</span></p>
        <p><span class="label">Lieu:</span> <span class="value">${quoteRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</span></p>
        ${quoteRequest.description ? `<p><span class="label">Description:</span> <span class="value">${quoteRequest.description}</span></p>` : ''}
      </div>
      
      <h2>Articles demandés</h2>
      <div class="section">
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
                <td colspan="3" style="text-align: right;">Total TTC Indicatif</td>
                <td style="text-align: right;">${totalAmount}€</td>
              </tr>
            </tbody>
          </table>
        ` : `<p>Aucun article spécifique listé dans cette demande.</p>`}
      </div>
      
      <h2>Livraison / Retrait</h2>
      <div class="section">
        <p><span class="label">Type:</span> <span class="value">${getDeliveryTypeLabel(quoteRequest.delivery_type)}</span></p>
        <p><span class="label">Date:</span> <span class="value">${quoteRequest.delivery_date ? formatDate(quoteRequest.delivery_date).split(' ')[0] : '-'}</span></p>
        <p><span class="label">Créneau:</span> <span class="value">${getTimeSlotLabel(quoteRequest.delivery_time_slot)}</span></p>
        <p><span class="label">Adresse Livr.:</span> <span class="value">${[quoteRequest.delivery_address, quoteRequest.delivery_postal_code, quoteRequest.delivery_city].filter(Boolean).join(', ') || '-'}</span></p>
      </div>
      
      ${(quoteRequest.exterior_access || quoteRequest.interior_access) ? `
        <h2>Accès</h2>
        <div class="section">
          <p><span class="label">Extérieur:</span> <span class="value">${getAccessLabel(quoteRequest.exterior_access)}</span></p>
          <p><span class="label">Intérieur:</span> <span class="value">${getAccessLabel(quoteRequest.interior_access)}</span></p>
          ${quoteRequest.interior_access === 'elevator' ? `
            <p><span class="label">Asc. L:</span> <span class="value">${quoteRequest.elevator_width ? `${quoteRequest.elevator_width} cm` : '-'}</span></p>
            <p><span class="label">Asc. P:</span> <span class="value">${quoteRequest.elevator_depth ? `${quoteRequest.elevator_depth} cm` : '-'}</span></p>
            <p><span class="label">Asc. H:</span> <span class="value">${quoteRequest.elevator_height ? `${quoteRequest.elevator_height} cm` : '-'}</span></p>
          ` : ''}
        </div>
      ` : ''}
      
      ${(quoteRequest.pickup_return_date || quoteRequest.pickup_return_start_time) ? `
        <h2>Détails reprise</h2>
        <div class="section">
          <p><span class="label">Date:</span> <span class="value">${quoteRequest.pickup_return_date ? formatDate(quoteRequest.pickup_return_date).split(' ')[0] : '-'}</span></p>
          <p><span class="label">Début:</span> <span class="value">${quoteRequest.pickup_return_start_time || '-'}</span></p>
          <p><span class="label">Fin:</span> <span class="value">${quoteRequest.pickup_return_end_time || '-'}</span></p>
        </div>
      ` : ''}
      
      ${quoteRequest.comments ? `
        <h2>Commentaires client</h2>
        <div class="section">
          <p>${quoteRequest.comments}</p>
        </div>
      ` : ''}
      
      <div class="footer">
        <p>Cet email a été envoyé automatiquement par le système ESIL Events.</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Envoie un email récapitulatif pour une nouvelle demande de devis
 */
export const sendQuoteRequestEmail = async (quoteRequest: QuoteRequest, recipientEmail: string): Promise<boolean> => {
  try {
    // Préparer les données de l'email
    const emailContent = generateQuoteRequestEmailContent(quoteRequest);
    const emailConfig: EmailConfig = {
      recipient: recipientEmail,
      subject: `Nouvelle demande de devis - ${quoteRequest.first_name} ${quoteRequest.last_name} - ${quoteRequest.event_date ? formatDate(quoteRequest.event_date).split(' ')[0] : 'Date non spécifiée'}`,
      body: emailContent
    };

    // Dans un environnement de production, vous utiliseriez un service d'envoi d'emails comme:
    // - SendGrid, Mailjet, Mailchimp, etc. pour des solutions tierces
    // - Ou un serveur SMTP directement via nodemailer côté serveur
    
    // Pour cette implémentation, nous allons utiliser l'API Fetch pour envoyer l'email via un endpoint backend
    // Note: Cet endpoint doit être implémenté côté serveur
    
    // Exemple d'implémentation avec un endpoint backend (à adapter selon votre infrastructure)
    try {
      // Simuler l'envoi d'email (à remplacer par votre implémentation réelle)
      console.log('Envoi automatique d\'email à:', emailConfig.recipient);
      console.log('Sujet:', emailConfig.subject);
      console.log('Contenu HTML généré pour l\'email');
      
      // En attendant l'implémentation d'un service d'envoi d'emails côté serveur,
      // nous proposons également une solution de secours avec mailto
      const mailtoLink = `mailto:${emailConfig.recipient}?subject=${encodeURIComponent(emailConfig.subject)}&body=${encodeURIComponent('Voir le contenu HTML dans la console du navigateur')}`;
      
      // Ouvrir le lien mailto dans une nouvelle fenêtre (solution temporaire)
      if (confirm('Un email récapitulatif va être envoyé à ' + emailConfig.recipient + '. Voulez-vous l\'ouvrir dans votre client email?')) {
        window.open(mailtoLink, '_blank');
      }
      
      return true;
    } catch (fetchError) {
      console.error('Erreur lors de l\'envoi de l\'email via l\'API:', fetchError);
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la préparation de l\'email récapitulatif:', error);
    return false;
  }
};

/**
 * Configuration pour l'envoi automatique d'emails
 */
export const emailConfig = {
  // Adresse email par défaut pour recevoir les récapitulatifs de demandes de devis
  defaultRecipient: 'votre.email@orange.fr',
  
  // Activer/désactiver l'envoi automatique d'emails
  autoSendEnabled: true,
  
  // Définir les paramètres d'envoi
  setSendConfig: (config: { recipient?: string; autoSend?: boolean }) => {
    if (config.recipient) emailConfig.defaultRecipient = config.recipient;
    if (config.autoSend !== undefined) emailConfig.autoSendEnabled = config.autoSend;
    
    // Sauvegarder la configuration dans le localStorage pour la persistance
    localStorage.setItem('emailConfig', JSON.stringify({
      defaultRecipient: emailConfig.defaultRecipient,
      autoSendEnabled: emailConfig.autoSendEnabled
    }));
    
    return emailConfig;
  },
  
  // Charger la configuration depuis le localStorage
  loadConfig: () => {
    try {
      const savedConfig = localStorage.getItem('emailConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        emailConfig.defaultRecipient = parsedConfig.defaultRecipient || emailConfig.defaultRecipient;
        emailConfig.autoSendEnabled = parsedConfig.autoSendEnabled !== undefined ? parsedConfig.autoSendEnabled : emailConfig.autoSendEnabled;
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration email:', error);
    }
    return emailConfig;
  }
};

// Charger la configuration au démarrage
emailConfig.loadConfig();