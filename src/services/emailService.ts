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
 * Configuration pour le service d'email
 */
interface EmailServiceConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

/**
 * Configuration par défaut pour le service d'email
 * Ces valeurs doivent être remplacées par les valeurs réelles dans un environnement de production
 * via les variables d'environnement
 */
const emailServiceConfig: EmailServiceConfig = {
  host: import.meta.env.VITE_EMAIL_HOST || 'smtp.orange.fr',
  port: Number(import.meta.env.VITE_EMAIL_PORT) || 587,
  secure: import.meta.env.VITE_EMAIL_SECURE === 'true',
  auth: {
    user: import.meta.env.VITE_EMAIL_USER || '',
    pass: import.meta.env.VITE_EMAIL_PASSWORD || ''
  },
  from: import.meta.env.VITE_EMAIL_FROM || 'ESIL Events <contact@esil-events.com>'
};

/**
 * Envoie un email récapitulatif pour une nouvelle demande de devis
 * @param quoteRequest - La demande de devis à envoyer par email
 * @param recipientEmail - L'adresse email du destinataire
 * @returns Un objet contenant le statut de l'envoi et un message explicatif
 */
export const sendQuoteRequestEmail = async (quoteRequest: QuoteRequest, recipientEmail: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Vérifier que l'adresse email du destinataire est valide
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return { 
        success: false, 
        message: 'Adresse email du destinataire invalide' 
      };
    }

    // Préparer les données de l'email
    const emailContent = generateQuoteRequestEmailContent(quoteRequest);
    const emailConfig: EmailConfig = {
      recipient: recipientEmail,
      subject: `Nouvelle demande de devis - ${quoteRequest.first_name} ${quoteRequest.last_name} - ${quoteRequest.event_date ? formatDate(quoteRequest.event_date).split(' ')[0] : 'Date non spécifiée'}`,
      body: emailContent
    };

    // Vérifier si nous sommes en mode développement
    const isDevelopment = import.meta.env.DEV;

    if (isDevelopment) {
      // En mode développement, on affiche les informations dans la console
      console.log('Mode développement: Simulation d\'envoi d\'email');
      console.log('Destinataire:', emailConfig.recipient);
      console.log('Sujet:', emailConfig.subject);
      console.log('Contenu HTML généré pour l\'email');
      
      // Solution de secours avec mailto pour le développement
      const mailtoLink = `mailto:${emailConfig.recipient}?subject=${encodeURIComponent(emailConfig.subject)}&body=${encodeURIComponent('Voir le contenu HTML dans la console du navigateur')}`;
      
      // Ouvrir le lien mailto dans une nouvelle fenêtre (solution temporaire)
      if (confirm('Mode développement: Un email récapitulatif va être envoyé à ' + emailConfig.recipient + '. Voulez-vous l\'ouvrir dans votre client email?')) {
        window.open(mailtoLink, '_blank');
      }
      
      return { 
        success: true, 
        message: 'Email simulé en mode développement' 
      };
    } else {
      // En production, utiliser le service d'API d'email
      try {
        // Import dynamique du service d'API d'email
        const { sendEmailViaApi } = await import('./emailApiService');
        
        // Vérifier si la configuration SMTP est complète
        if (!isSmtpConfigured()) {
          console.warn('Configuration SMTP incomplète. L\'email ne peut pas être envoyé.');
          return { 
            success: false, 
            message: 'Configuration SMTP incomplète. Veuillez configurer les variables d\'environnement.' 
          };
        }

        // Utiliser le service d'API pour envoyer l'email
        const result = await sendEmailViaApi({
          to: emailConfig.recipient,
          subject: emailConfig.subject,
          html: emailConfig.body,
          from: emailServiceConfig.from,
          smtpConfig: {
            host: emailServiceConfig.host,
            port: emailServiceConfig.port,
            secure: emailServiceConfig.secure,
            auth: {
              user: emailServiceConfig.auth.user
            }
          }
        });
        
        return result;
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email:', emailError);
        
        // Message d'erreur détaillé pour faciliter le débogage
        return { 
          success: false, 
          message: `Erreur d'envoi: ${emailError instanceof Error ? emailError.message : 'Erreur inconnue'}` 
        };
      }
    }
  } catch (error) {
    console.error('Erreur lors de la préparation de l\'email récapitulatif:', error);
    return { 
      success: false, 
      message: `Erreur de préparation: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    };
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
  },

  // Tester la connexion au serveur SMTP
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    try {
      // Vérifier si nous sommes en mode développement
      if (import.meta.env.DEV && !emailServiceConfig.auth.user) {
        return { 
          success: false, 
          message: 'Configuration SMTP incomplète. Veuillez configurer les variables d\'environnement.' 
        };
      }

      // Import dynamique du service d'API d'email
      const { testSmtpConnectionViaApi } = await import('./emailApiService');
      
      // Utiliser le service d'API pour tester la connexion SMTP
      return await testSmtpConnectionViaApi();

    } catch (error) {
      console.error('Erreur lors du test de connexion SMTP:', error);
      return { 
        success: false, 
        message: `Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      };
    }
  },
  
  // Envoyer un email de test pour vérifier la configuration
  sendTestEmail: async (testEmail: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!isSmtpConfigured()) {
        return {
          success: false,
          message: 'Configuration SMTP incomplète. Veuillez configurer les variables d\'environnement.'
        };
      }
      
      // Contenu de l'email de test
      const testEmailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test de configuration email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #4f46e5; font-size: 24px; margin-top: 0; }
            .container { background-color: #f9fafb; padding: 20px; border-radius: 5px; }
            .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Test de configuration email</h1>
          <div class="container">
            <p>Cet email confirme que votre configuration SMTP pour ESIL Events fonctionne correctement.</p>
            <p>Vous pouvez maintenant recevoir les notifications de demandes de devis.</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par le système ESIL Events.</p>
          </div>
        </body>
        </html>
      `;
      
      // Vérifier si nous sommes en mode développement
      if (import.meta.env.DEV) {
        console.log('Mode développement: Simulation d\'envoi d\'email de test');
        console.log('Destinataire:', testEmail);
        console.log('Contenu HTML généré pour l\'email de test');
        
        // Solution de secours avec mailto pour le développement
        const mailtoLink = `mailto:${testEmail}?subject=${encodeURIComponent('Test de configuration email - ESIL Events')}&body=${encodeURIComponent('Ceci est un email de test pour ESIL Events.')}`;        
        
        // Ouvrir le lien mailto dans une nouvelle fenêtre (solution temporaire)
        if (confirm('Mode développement: Un email de test va être envoyé à ' + testEmail + '. Voulez-vous l\'ouvrir dans votre client email?')) {
          window.open(mailtoLink, '_blank');
        }
        
        return { 
          success: true, 
          message: 'Email de test simulé en mode développement' 
        };
      } else {
        // En production, faire une requête à un endpoint API pour envoyer l'email
        const response = await fetch('/api/send-test-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: testEmail,
            subject: 'Test de configuration email - ESIL Events',
            html: testEmailContent,
            from: emailServiceConfig.from,
            smtpConfig: {
              host: emailServiceConfig.host,
              port: emailServiceConfig.port,
              secure: emailServiceConfig.secure,
              auth: {
                user: emailServiceConfig.auth.user
                // Note: Pour des raisons de sécurité, le mot de passe ne devrait pas être envoyé depuis le frontend
              }
            }
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de l\'envoi de l\'email de test');
        }
        
        const result = await response.json();
        console.log('Email de test envoyé avec succès:', result);
        return {
          success: true,
          message: 'Email de test envoyé avec succès à ' + testEmail
        };
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de test:', error);
      return {
        success: false,
        message: `Erreur d'envoi: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }
};

/**
 * Utilitaire pour vérifier si la configuration SMTP est complète
 */
export const isSmtpConfigured = (): boolean => {
  return !!emailServiceConfig.auth.user && !!emailServiceConfig.auth.pass;
};

// Charger la configuration au démarrage
emailConfig.loadConfig();

// Instructions pour configurer le service d'email:
// 1. Créer un fichier .env à la racine du projet avec les variables suivantes:
//    VITE_EMAIL_HOST=smtp.votredomaine.com
//    VITE_EMAIL_PORT=587
//    VITE_EMAIL_SECURE=false
//    VITE_EMAIL_USER=votre_email@votredomaine.com
//    VITE_EMAIL_PASSWORD=votre_mot_de_passe
//    VITE_EMAIL_FROM="ESIL Events <contact@esil-events.com>"
// 2. Redémarrer l'application pour prendre en compte les nouvelles variables d'environnement