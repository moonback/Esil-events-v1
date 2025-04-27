import { QuoteRequest } from './quoteRequestService';

// Interface pour les paramètres SMTP
export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string; // Adresse email d'expédition par défaut
}

// Récupération des valeurs depuis les variables d'environnement
// Note: Pour Gmail, vous devez utiliser un mot de passe d'application et non votre mot de passe habituel
// Voir: https://support.google.com/accounts/answer/185833
// Si vous rencontrez des erreurs de connexion, vérifiez que:
// 1. Vous avez activé l'authentification à deux facteurs sur votre compte Google
// 2. Vous avez généré un mot de passe d'application spécifique pour cette application
let smtpConfig: SmtpConfig = {
  host: import.meta.env.VITE_SMTP_HOST || 'mail.dresscodeia.fr',
  port: Number(import.meta.env.VITE_SMTP_PORT) || 465,
  secure: import.meta.env.VITE_SMTP_SECURE === 'false' ? false : true, // true pour 465, false pour les autres ports comme 587
  auth: {
    user: import.meta.env.VITE_SMTP_USER || 'contact@dresscodeia.fr',
    pass: import.meta.env.VITE_SMTP_PASS || '' // Le mot de passe doit être défini dans les variables d'environnement
  },
  from: import.meta.env.VITE_SMTP_FROM || 'contact@dresscodeia.fr'
};

// Fonction pour mettre à jour la configuration SMTP
export const updateSmtpConfig = (config: Partial<SmtpConfig>): void => {
  smtpConfig = { ...smtpConfig, ...config };
  console.log('Configuration SMTP mise à jour:', { ...smtpConfig, auth: { ...smtpConfig.auth, pass: '***' } });
};

// Fonction pour récupérer la configuration SMTP actuelle (sans le mot de passe)
export const getSmtpConfig = (): Omit<SmtpConfig, 'auth'> & { auth: { user: string } } => {
  const { auth, ...rest } = smtpConfig;
  return {
    ...rest,
    auth: {
      user: auth.user
    }
  };
};

// Fonction pour tester la connexion SMTP
export const testSmtpConnection = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    // Vérifier si la configuration SMTP est complète
    if (!smtpConfig.auth.pass) {
      console.error('Erreur: Mot de passe SMTP non configuré');
      return { success: false, error: 'Configuration SMTP incomplète' };
    }

    // Construire l'URL complète de l'API
    const apiUrl = 'http://localhost:3001/api/email/test-connection';
    console.log('URL de l\'API de test SMTP:', apiUrl);

    // Envoyer la requête de test
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ smtpConfig })
    });

    // Récupérer le texte de la réponse
    const textData = await response.text();
    console.log('Réponse brute du serveur:', textData);

    // Tenter de parser la réponse JSON
    let responseData = null;
    try {
      if (textData) {
        responseData = JSON.parse(textData);
      }
    } catch (parseError) {
      console.error('Erreur lors du parsing de la réponse:', parseError);
      return { success: false, error: `Erreur de format dans la réponse du serveur: ${textData}` };
    }

    if (!response.ok) {
      const errorMessage = responseData?.error || `Erreur HTTP ${response.status}: ${response.statusText}`;
      console.error('Réponse d\'erreur du serveur:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('Test de connexion SMTP réussi');
    return { success: true };
  } catch (error) {
    console.error('Erreur lors du test de connexion SMTP:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// Fonction pour envoyer un email via l'API
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  from?: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Vérifier si la configuration SMTP est complète
    if (!smtpConfig.auth.pass) {
      console.error('Erreur: Mot de passe SMTP non configuré');
      return { success: false, error: 'Configuration SMTP incomplète' };
    }

    // Afficher les informations de configuration (sans le mot de passe)
    console.log('Tentative d\'envoi d\'email avec la configuration:', { 
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: { user: smtpConfig.auth.user, pass: '***' },
      from: smtpConfig.from
    });

    // Construire l'URL complète de l'API
    // Utiliser l'URL du serveur Express qui fonctionne sur le port 3001
    const apiUrl = 'http://localhost:3001/api/email/send';
    console.log('URL de l\'API d\'envoi d\'email:', apiUrl);

    // Envoyer l'email via l'API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || smtpConfig.from,
        to,
        subject,
        html,
        smtpConfig
      })
    });

    // Récupérer le texte de la réponse
    const textData = await response.text();
    console.log('Réponse brute du serveur:', textData);

    // Tenter de parser la réponse JSON
    let responseData = null;
    try {
      if (textData) {
        responseData = JSON.parse(textData);
      }
    } catch (parseError) {
      console.error('Erreur lors du parsing de la réponse:', parseError);
      return { success: false, error: `Erreur de format dans la réponse du serveur: ${textData}` };
    }

    if (!response.ok) {
      const errorMessage = responseData?.error || `Erreur HTTP ${response.status}: ${response.statusText}`;
      console.error('Réponse d\'erreur du serveur:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('Email envoyé avec succès:', responseData?.messageId);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// Fonction pour envoyer un email de confirmation de demande de devis
export const sendQuoteRequestConfirmation = async (quoteRequest: QuoteRequest): Promise<{ success: boolean; error?: any }> => {
  const { 
    first_name, 
    last_name, 
    email, 
    phone,
    company,
    customer_type,
    billing_address,
    billing_city,
    billing_postal_code,
    event_date,
    event_duration,
    event_start_time,
    event_end_time,
    guest_count,
    event_location,
    delivery_address,
    delivery_city,
    delivery_postal_code,
    delivery_date,
    delivery_time_slot,
    has_elevator,
    elevator_dimensions,
    floor_number,
    pickup_date,
    pickup_time_slot,
    additional_comments,
    items 
  } = quoteRequest;
  
  if (!email) {
    return { success: false, error: 'Adresse email manquante' };
  }

  // Formater les articles pour l'email
  const itemsList = items && items.length > 0
    ? items.map(item => 
      `<li>${item.name || 'Article'} - Quantité: ${item.quantity || 0} - Prix unitaire: ${(item.price || 0).toFixed(2)}€</li>`
    ).join('')
    : '<li>Aucun article spécifié</li>';

  // Calculer le total
  const total = items
    ? items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0).toFixed(2)
    : '0.00';

  // Créer le contenu HTML de l'email
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">ESIL Events</h1>
        <p style="margin: 5px 0 0;">Location de mobilier événementiel premium</p>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <h2>Confirmation de votre demande de devis</h2>
        
        <p>Bonjour ${first_name} ${last_name},</p>
        
        <p>Nous vous remercions pour votre demande de devis. Notre équipe va l'étudier dans les plus brefs délais et vous contactera prochainement.</p>
        
        <h3>Récapitulatif de votre demande :</h3>
        
        <h4>Informations personnelles :</h4>
        <ul>
          <li><strong>Nom complet :</strong> ${first_name} ${last_name}</li>
          <li><strong>Email :</strong> ${email}</li>
          <li><strong>Téléphone :</strong> ${phone || 'Non spécifié'}</li>
          <li><strong>Société :</strong> ${company || 'Non spécifié'}</li>
          <li><strong>Type de client :</strong> ${customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</li>
        </ul>
        
        <h4>Adresse de facturation :</h4>
        <p>
          ${billing_address || 'Non spécifiée'}<br>
          ${billing_postal_code || ''} ${billing_city || ''}
        </p>
        
        <h4>Détails de l'événement :</h4>
        <ul>
          <li><strong>Date :</strong> ${event_date || 'Non spécifiée'}</li>
          <li><strong>Durée :</strong> ${event_duration || 'Non spécifiée'}</li>
          <li><strong>Heure de début :</strong> ${event_start_time || 'Non spécifiée'}</li>
          <li><strong>Heure de fin :</strong> ${event_end_time || 'Non spécifiée'}</li>
          <li><strong>Nombre d'invités :</strong> ${guest_count || 'Non spécifié'}</li>
          <li><strong>Lieu :</strong> ${event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</li>
        </ul>
        
        <h4>Informations de livraison :</h4>
        <ul>
          <li><strong>Adresse :</strong> ${delivery_address || 'Non spécifiée'}</li>
          <li><strong>Code postal :</strong> ${delivery_postal_code || 'Non spécifié'}</li>
          <li><strong>Ville :</strong> ${delivery_city || 'Non spécifiée'}</li>
          <li><strong>Date de livraison :</strong> ${delivery_date || 'Non spécifiée'}</li>
          <li><strong>Créneau horaire :</strong> ${delivery_time_slot || 'Non spécifié'}</li>
          <li><strong>Présence d'ascenseur :</strong> ${has_elevator ? 'Oui' : 'Non'}</li>
          ${has_elevator ? `<li><strong>Dimensions de l'ascenseur :</strong> ${elevator_dimensions || 'Non spécifiées'}</li>` : ''}
          <li><strong>Étage :</strong> ${floor_number !== undefined ? floor_number : 'Non spécifié'}</li>
        </ul>
        
        <h4>Informations de reprise :</h4>
        <ul>
          <li><strong>Date de reprise :</strong> ${pickup_date || 'Non spécifiée'}</li>
          <li><strong>Créneau horaire :</strong> ${pickup_time_slot || 'Non spécifié'}</li>
        </ul>
        
        ${additional_comments ? `
        <h4>Commentaires supplémentaires :</h4>
        <p>${additional_comments}</p>
        ` : ''}
        
        <h4>Articles demandés :</h4>
        <ul>
          ${itemsList}
        </ul>
        
        <p><strong>Total estimatif : ${total}€</strong></p>
        
        <p style="font-style: italic; color: #6b7280; font-size: 0.9em;">
          Veuillez noter que ce montant est indicatif et ne comprend pas les frais de livraison et d'installation.
          Le devis final vous sera communiqué après étude de votre demande.
        </p>
        
        <p>Si vous avez des questions, n'hésitez pas à nous contacter :</p>
        <p>
          <strong>Téléphone :</strong> 01 23 45 67 89<br>
          <strong>Email :</strong> contact@esil-events.fr
        </p>
        
        <p>Cordialement,</p>
        <p>L'équipe ESIL Events</p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 0.8em; color: #6b7280;">
        <p>ESIL Events - L'élégance pour chaque événement</p>
        <p>© ${new Date().getFullYear()} ESIL Events. Tous droits réservés.</p>
      </div>
    </div>
  `;

  return sendEmail(
    email,
    'Confirmation de votre demande de devis - ESIL Events',
    html
  );
};

// Fonction pour envoyer une notification à l'administrateur
export const sendAdminNotification = async (quoteRequest: QuoteRequest): Promise<{ success: boolean; error?: any }> => {
  // Adresse email de l'administrateur (à configurer)
  const adminEmail = smtpConfig.from;
  
  // Formater les articles pour l'email
  const itemsList = quoteRequest.items && quoteRequest.items.length > 0
    ? quoteRequest.items.map(item => 
      `<li>${item.name || 'Article'} - Quantité: ${item.quantity || 0} - Prix unitaire: ${(item.price || 0).toFixed(2)}€</li>`
    ).join('')
    : '<li>Aucun article spécifié</li>';

  // Calculer le total
  const total = quoteRequest.items
    ? quoteRequest.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0).toFixed(2)
    : '0.00';

  // Créer le contenu HTML de l'email
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">ESIL Events - Administration</h1>
        <p style="margin: 5px 0 0;">Nouvelle demande de devis</p>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <h2>Nouvelle demande de devis reçue</h2>
        
        <h3>Informations client :</h3>
        <ul>
          <li><strong>Nom :</strong> ${quoteRequest.first_name} ${quoteRequest.last_name}</li>
          <li><strong>Email :</strong> ${quoteRequest.email || 'Non spécifié'}</li>
          <li><strong>Téléphone :</strong> ${quoteRequest.phone || 'Non spécifié'}</li>
          <li><strong>Société :</strong> ${quoteRequest.company || 'Non spécifié'}</li>
          <li><strong>Type de client :</strong> ${quoteRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</li>
        </ul>
        
        <h3>Adresse de facturation :</h3>
        <p>
          ${quoteRequest.billing_address || 'Non spécifiée'}<br>
          ${quoteRequest.billing_postal_code || ''} ${quoteRequest.billing_city || ''}
        </p>
        
        <h3>Détails de l'événement :</h3>
        <ul>
          <li><strong>Date :</strong> ${quoteRequest.event_date || 'Non spécifiée'}</li>
          <li><strong>Durée :</strong> ${quoteRequest.event_duration || 'Non spécifiée'}</li>
          <li><strong>Heure de début :</strong> ${quoteRequest.event_start_time || 'Non spécifiée'}</li>
          <li><strong>Heure de fin :</strong> ${quoteRequest.event_end_time || 'Non spécifiée'}</li>
          <li><strong>Nombre d'invités :</strong> ${quoteRequest.guest_count || 'Non spécifié'}</li>
          <li><strong>Lieu :</strong> ${quoteRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</li>
        </ul>
        
        <h3>Informations de livraison :</h3>
        <ul>
          <li><strong>Adresse :</strong> ${quoteRequest.delivery_address || 'Non spécifiée'}</li>
          <li><strong>Code postal :</strong> ${quoteRequest.delivery_postal_code || 'Non spécifié'}</li>
          <li><strong>Ville :</strong> ${quoteRequest.delivery_city || 'Non spécifiée'}</li>
          <li><strong>Date de livraison :</strong> ${quoteRequest.delivery_date || 'Non spécifiée'}</li>
          <li><strong>Créneau horaire :</strong> ${quoteRequest.delivery_time_slot || 'Non spécifié'}</li>
          <li><strong>Présence d'ascenseur :</strong> ${quoteRequest.has_elevator ? 'Oui' : 'Non'}</li>
          ${quoteRequest.has_elevator ? `<li><strong>Dimensions de l'ascenseur :</strong> ${quoteRequest.elevator_dimensions || 'Non spécifiées'}</li>` : ''}
          <li><strong>Étage :</strong> ${quoteRequest.floor_number !== undefined ? quoteRequest.floor_number : 'Non spécifié'}</li>
        </ul>
        
        <h3>Informations de reprise :</h3>
        <ul>
          <li><strong>Date de reprise :</strong> ${quoteRequest.pickup_date || 'Non spécifiée'}</li>
          <li><strong>Créneau horaire :</strong> ${quoteRequest.pickup_time_slot || 'Non spécifié'}</li>
        </ul>
        
        <h3>Articles demandés :</h3>
        <ul>
          ${itemsList}
        </ul>
        
        <p><strong>Total estimatif : ${total}€</strong></p>
        
        ${quoteRequest.additional_comments ? `
        <h3>Commentaires supplémentaires :</h3>
        <p>${quoteRequest.additional_comments}</p>
        ` : ''}
        
        <h3>Conditions acceptées :</h3>
        <ul>
          <li><strong>CGV :</strong> ${quoteRequest.terms_accepted ? 'Oui' : 'Non'}</li>
          <li><strong>Politique de confidentialité :</strong> ${quoteRequest.privacy_accepted ? 'Oui' : 'Non'}</li>
        </ul>
        
        <p>Veuillez vous connecter au <a href="https://esil-events.fr/admin/quote-requests">panneau d'administration</a> pour plus de détails et pour traiter cette demande.</p>
      </div>
    </div>
  `;

  return sendEmail(
    adminEmail,
    'Nouvelle demande de devis - ESIL Events',
    html
  );
};