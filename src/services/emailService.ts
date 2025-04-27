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

// Valeurs par défaut pour la configuration SMTP
let smtpConfig: SmtpConfig = {
  host: 'neurocode.fr',
  port: 465,
  secure: true, // true pour 465, false pour les autres ports
  auth: {
    user: 'contact@neurocode.fr',
    pass: '' // Le mot de passe sera défini via la page de configuration
  },
  from: 'contact@neurocode.fr'
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

    // Envoyer l'email via l'API
    const response = await fetch('/api/email/send', {
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'envoi de l\'email');
    }

    const result = await response.json();
    console.log('Email envoyé:', result.messageId);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error };
  }
};

// Fonction pour envoyer un email de confirmation de demande de devis
export const sendQuoteRequestConfirmation = async (quoteRequest: QuoteRequest): Promise<{ success: boolean; error?: any }> => {
  const { first_name, last_name, email, items } = quoteRequest;
  
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
        
        <h3>Détails de l'événement :</h3>
        <ul>
          <li><strong>Date :</strong> ${quoteRequest.event_date || 'Non spécifiée'}</li>
          <li><strong>Durée :</strong> ${quoteRequest.event_duration || 'Non spécifiée'}</li>
          <li><strong>Nombre d'invités :</strong> ${quoteRequest.guest_count || 'Non spécifié'}</li>
          <li><strong>Lieu :</strong> ${quoteRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</li>
        </ul>
        
        <h3>Articles demandés :</h3>
        <ul>
          ${itemsList}
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