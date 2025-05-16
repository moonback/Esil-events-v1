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
  host: import.meta.env.VITE_SMTP_HOST || 'smtp.ionos.fr',
  port: Number(import.meta.env.VITE_SMTP_PORT) || 465,
  secure: import.meta.env.VITE_SMTP_SECURE === 'false' ? false : true, // true pour 465, false pour les autres ports comme 587
  auth: {
    user: import.meta.env.VITE_SMTP_USER || 'contact@esil-events.fr',
    pass: import.meta.env.VITE_SMTP_PASS || '' // Le mot de passe doit être défini dans les variables d'environnement
  },
  from: import.meta.env.VITE_SMTP_FROM || 'contact@esil-events.fr'
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
    city,
    postal_code,
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
    exterior_access,
    interior_access,
    elevator_width,
    elevator_height,
    elevator_depth,
    pickup_return_date,
    pickup_return_start_time,
    pickup_return_end_time,
    comments,
    items,
    description,
    delivery_type,
    terms_accepted
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
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de Devis - ESIL Events</title>
  <style>
    :root {
      --primary: #4361ee;
      --secondary: #3f37c9;
      --light: #f8f9fa;
      --dark: #212529;
      --gray: #6c757d;
      --light-gray: #e9ecef;
      --border-radius: 8px;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: var(--dark);
      background-color: #f5f7fa;
    }
    
    .container {
      max-width: 650px;
      margin: 0 auto;
      background-color: white;
      border-radius: var(--border-radius);
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      padding: 30px 20px;
      text-align: center;
      color: white;
    }
    
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: 1px;
    }
    
    .header p {
      margin: 5px 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    
    .content {
      padding: 30px;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      color: var(--primary);
      font-size: 20px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--light-gray);
    }
    
    .subsection {
      margin-bottom: 20px;
    }
    
    .subsection-title {
      font-size: 17px;
      color: var(--dark);
      margin-bottom: 10px;
    }
    
    .info-list {
      list-style: none;
      padding-left: 5px;
    }
    
    .info-list li {
      margin-bottom: 8px;
      display: flex;
      align-items: flex-start;
    }
    
    .info-list li:last-child {
      margin-bottom: 0;
    }
    
    .info-label {
      font-weight: 600;
      min-width: 140px;
      padding-right: 10px;
    }
    
    .info-value {
      flex: 1;
    }
    
    .address {
      padding: 5px 0 5px 5px;
      line-height: 1.5;
    }
    
    .total-section {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: var(--border-radius);
      margin-top: 15px;
      margin-bottom: 25px;
      text-align: right;
    }
    
    .total-amount {
      font-size: 18px;
      font-weight: 600;
      color: var(--primary);
    }
    
    .disclaimer {
      font-style: italic;
      color: var(--gray);
      font-size: 0.9em;
      margin-top: 10px;
      padding: 10px;
      background-color: var(--light-gray);
      border-radius: var(--border-radius);
    }
    
    .contact-info {
      margin-top: 25px;
      padding: 15px;
      background-color: var(--light);
      border-radius: var(--border-radius);
    }
    
    .signature {
      margin-top: 25px;
    }
    
    .footer {
      background-color: var(--light);
      padding: 20px;
      text-align: center;
      font-size: 0.9em;
      color: var(--gray);
    }
    
    .footer p {
      margin: 5px 0;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    
    .items-table th {
      background-color: var(--light-gray);
      padding: 10px;
      text-align: left;
    }
    
    .items-table td {
      padding: 10px;
      border-bottom: 1px solid var(--light-gray);
    }
    
    .items-table tr:last-child td {
      border-bottom: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color:rgb(112, 4, 103); font-size: 2.5em; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">ESIL EVENTS</h1>
      <p style="color:rgb(8, 8, 8); font-size: 1.2em; margin-top: 10px; font-style: italic;">Location, Installation, Régie Son & Lumière, Mobilier, Animation ...</p>
    
    </div>
    
    <div class="content">
      <div class="section">
        <h2 class="section-title">Confirmation de votre demande de devis</h2>
        
        <p>Bonjour ${first_name} ${last_name},</p>
        <p style="margin-top: 10px;">Nous vous remercions pour votre demande de devis. Notre équipe va l'étudier dans les plus brefs délais et vous contactera prochainement.</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">Récapitulatif de votre demande</h3>
        
        <div class="subsection">
          <h4 class="subsection-title">Informations personnelles</h4>
          <ul class="info-list">
            <li><span class="info-label">Nom complet :</span> <span class="info-value">${first_name} ${last_name}</span></li>
            <li><span class="info-label">Email :</span> <span class="info-value">${email}</span></li>
            <li><span class="info-label">Téléphone :</span> <span class="info-value">${phone || 'Non spécifié'}</span></li>
            <li><span class="info-label">Société :</span> <span class="info-value">${company || 'Non spécifié'}</span></li>
            <li><span class="info-label">Type de client :</span> <span class="info-value">${customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</span></li>
          </ul>
        </div>
        
        <div class="subsection">
          <h4 class="subsection-title">Adresse de facturation</h4>
          <div class="address">
            ${billing_address || 'Non spécifiée'}<br>
            ${postal_code || ''} ${city || ''}
          </div>
        </div>
        
        <div class="subsection">
          <h4 class="subsection-title">Détails de l'événement</h4>
          <ul class="info-list">
            <li><span class="info-label">Date :</span> <span class="info-value">${event_date || 'Non spécifiée'}</span></li>
            <li><span class="info-label">Durée :</span> <span class="info-value">${event_duration || 'Non spécifiée'}</span></li>
            <li><span class="info-label">Heure de début :</span> <span class="info-value">${event_start_time || 'Non spécifiée'}</span></li>
            <li><span class="info-label">Heure de fin :</span> <span class="info-value">${event_end_time || 'Non spécifiée'}</span></li>
            <li><span class="info-label">Nombre d'invités :</span> <span class="info-value">${guest_count || 'Non spécifié'}</span></li>
            <li><span class="info-label">Lieu :</span> <span class="info-value">${event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</span></li>
          </ul>
        </div>
        
        <div class="subsection">
          <h4 class="subsection-title">Informations de livraison</h4>
          <ul class="info-list">
            <li><span class="info-label">Adresse :</span> <span class="info-value">${delivery_address || 'Non spécifiée'}</span></li>
            <li><span class="info-label">Code postal :</span> <span class="info-value">${delivery_postal_code || 'Non spécifié'}</span></li>
            <li><span class="info-label">Ville :</span> <span class="info-value">${delivery_city || 'Non spécifiée'}</span></li>
            <li><span class="info-label">Date de livraison :</span> <span class="info-value">${delivery_date || 'Non spécifiée'}</span></li>
            <li><span class="info-label">Créneau horaire :</span> <span class="info-value">${delivery_time_slot || 'Non spécifié'}</span></li>
          </ul>
        </div>
        
        <div class="subsection">
          <h4 class="subsection-title">Informations de reprise</h4>
          <ul class="info-list">
            <li><span class="info-label">Date de reprise :</span> <span class="info-value">${pickup_return_date || 'Non spécifiée'}</span></li>
            <li><span class="info-label">Heure de début :</span> <span class="info-value">${pickup_return_start_time || 'Non spécifiée'}</span></li>
            <li><span class="info-label">Heure de fin :</span> <span class="info-value">${pickup_return_end_time || 'Non spécifiée'}</span></li>
          </ul>
        </div>
        
        <div class="subsection">
          <h4 class="subsection-title">Informations d'accès</h4>
          <ul class="info-list">
            <li><span class="info-label">Accès extérieur :</span> <span class="info-value">${exterior_access || 'Non spécifié'}</span></li>
            <li><span class="info-label">Accès intérieur :</span> <span class="info-value">${interior_access || 'Non spécifié'}</span></li>
            <li><span class="info-label">Dimensions de l'ascenseur :</span> <span class="info-value">L: ${elevator_width || 'N/A'} × H: ${elevator_height || 'N/A'} × P: ${elevator_depth || 'N/A'}</span></li>
          </ul>
        </div>
        
        ${comments ? `
        <div class="subsection">
          <h4 class="subsection-title">Commentaires supplémentaires</h4>
          <p>${comments}</p>
        </div>
        ` : ''}
        
        <div class="subsection">
          <h4 class="subsection-title">Articles demandés</h4>
          <table class="items-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          
          <div class="total-section">
            <span class="total-amount">Total estimatif : ${total}€</span>
            <div class="disclaimer">
              Veuillez noter que ce montant est indicatif et ne comprend pas les frais de livraison et d'installation.
              Le devis final vous sera communiqué après étude de votre demande.
            </div>
          </div>
        </div>
        
        <div class="contact-info">
          <p>Si vous avez des questions, n'hésitez pas à nous contacter :</p>
          <ul class="info-list" style="margin-top: 8px;">
            <li><span class="info-label">Adresse :</span> <span class="info-value">7 rue de la cellophane, 78711 Mantes-la-Ville</span></li>
            <li><span class="info-label">Service commercial :</span> <span class="info-value">07 85 95 97 23</span></li>
            <li><span class="info-label">Service technique :</span> <span class="info-value">06 20 46 13 85</span></li>
            <li><span class="info-label">Email :</span> <span class="info-value">contact@esil-events.fr</span></li>
          </ul>
        </div>
        
        <div class="signature">
          <p>Cordialement,</p>
          <p style="margin-top: 5px;"><strong>L'équipe ESIL Events</strong></p>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>ESIL Events - L'élégance pour chaque événement</p>
      <p>© ${new Date().getFullYear()} ESIL Events. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
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
  const adminEmail = 'contact@esil-events.fr';
  
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
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle demande de devis - ESIL Events Administration</title>
  <style>
    :root {
      --primary: #4361ee;
      --secondary: #3f37c9;
      --light: #f8f9fa;
      --dark: #212529;
      --gray: #6c757d;
      --light-gray: #e9ecef;
      --border-radius: 8px;
      --accent: #4338ca;
      --warning: #dc2626;
      --highlight: #f0f7ff;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: var(--dark);
      background-color: #f5f7fa;
    }
    
    .container {
      max-width: 650px;
      margin: 0 auto;
      background-color: white;
      border-radius: var(--border-radius);
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      padding: 30px 20px;
      text-align: center;
      color: white;
    }
    
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 1px;
    }
    
    .header p {
      margin: 5px 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    
    .content {
      padding: 30px;
    }
    
    .notification-badge {
      background-color: var(--warning);
      color: white;
      padding: 8px 15px;
      border-radius: 4px;
      font-weight: 500;
      margin-bottom: 20px;
      display: inline-block;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      color: var(--primary);
      font-size: 20px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--light-gray);
    }
    
    .info-list {
      list-style: none;
      padding-left: 5px;
    }
    
    .info-list li {
      margin-bottom: 8px;
      display: flex;
      align-items: flex-start;
    }
    
    .info-list li:last-child {
      margin-bottom: 0;
    }
    
    .info-label {
      font-weight: 600;
      min-width: 150px;
      padding-right: 10px;
    }
    
    .info-value {
      flex: 1;
    }
    
    .address {
      padding: 10px;
      background-color: var(--light);
      border-radius: var(--border-radius);
      line-height: 1.5;
      margin-top: 10px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      border: 1px solid var(--light-gray);
    }
    
    .items-table th {
      background-color: var(--primary);
      color: white;
      padding: 10px;
      text-align: left;
    }
    
    .items-table td {
      padding: 10px;
      border-bottom: 1px solid var(--light-gray);
    }
    
    .items-table tr:last-child td {
      border-bottom: none;
    }
    
    .items-table tr:nth-child(even) {
      background-color: var(--light);
    }
    
    .total-section {
      background-color: var(--highlight);
      padding: 15px;
      border-radius: var(--border-radius);
      margin-top: 15px;
      margin-bottom: 25px;
      text-align: right;
      border-left: 4px solid var(--primary);
    }
    
    .total-amount {
      font-size: 18px;
      font-weight: 600;
      color: var(--primary);
    }
    
    .comments {
      background-color: var(--light);
      padding: 15px;
      border-radius: var(--border-radius);
      margin-top: 10px;
      border-left: 4px solid var(--gray);
    }
    
    .action-button {
      display: inline-block;
      background-color: var(--primary);
      color: white;
      padding: 12px 25px;
      text-decoration: none;
      border-radius: var(--border-radius);
      font-weight: 500;
      margin-top: 20px;
      text-align: center;
    }
    
    .action-button:hover {
      background-color: var(--secondary);
    }
    
    .footer {
      background-color: var(--light);
      padding: 20px;
      text-align: center;
      font-size: 0.9em;
      color: var(--gray);
      border-top: 1px solid var(--light-gray);
    }
    
    .footer p {
      margin: 5px 0;
    }
    
    .dimensions {
      display: flex;
      margin-top: 5px;
    }
    
    .dimension {
      padding: 5px 10px;
      background-color: var(--light);
      border-radius: 4px;
      margin-right: 10px;
      font-size: 0.9em;
    }
    
    .terms-accepted {
      display: inline-block;
      background-color: #10b981;
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.8em;
    }
    
    .terms-rejected {
      display: inline-block;
      background-color: var(--warning);
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.8em;
    }
    
    .priority-high {
      background-color: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 10px;
      border-radius: var(--border-radius);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ESIL EVENTS - ADMINISTRATION</h1>
      <p>Portail de gestion des demandes</p>
    </div>
    
    <div class="content">
      <div class="notification-badge">
        Nouvelle demande de devis
      </div>
      
      <div class="section">
        <h2 class="section-title">Informations client</h2>
        <ul class="info-list">
          <li><span class="info-label">Nom complet :</span> <span class="info-value">${quoteRequest.first_name} ${quoteRequest.last_name}</span></li>
          <li><span class="info-label">Email :</span> <span class="info-value">${quoteRequest.email}</span></li>
          <li><span class="info-label">Téléphone :</span> <span class="info-value">${quoteRequest.phone}</span></li>
          <li><span class="info-label">Société :</span> <span class="info-value">${quoteRequest.company}</span></li>
          <li><span class="info-label">Type de client :</span> <span class="info-value">${quoteRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</span></li>
        </ul>
        
        <h3 class="section-title">Adresse de facturation</h3>
        <div class="address">
          ${quoteRequest.billing_address || 'Non spécifiée'}<br>
          ${quoteRequest.postal_code || ''} ${quoteRequest.city || ''}
        </div>
      </div>
      
      <div class="section">
        <h3 class="section-title">Détails de l'événement</h3>
        <ul class="info-list">
          <li><span class="info-label">Date :</span> <span class="info-value">${quoteRequest.event_date}</span></li>
          <li><span class="info-label">Durée :</span> <span class="info-value">${quoteRequest.event_duration}</span></li>
          <li><span class="info-label">Description :</span> <span class="info-value">${quoteRequest.description}</span></li>
          <li><span class="info-label">Heure de début :</span> <span class="info-value">${quoteRequest.event_start_time || 'Non spécifiée'}</span></li>
          <li><span class="info-label">Heure de fin :</span> <span class="info-value">${quoteRequest.event_end_time || 'Non spécifiée'}</span></li>
          <li><span class="info-label">Nombre d'invités :</span> <span class="info-value">${quoteRequest.guest_count || 'Non spécifié'}</span></li>
          <li><span class="info-label">Lieu :</span> <span class="info-value">${quoteRequest.event_location || 'Non spécifié'}</span></li>
        </ul>
      </div>
      
      <div class="section">
        <h3 class="section-title">Informations de livraison</h3>
        <ul class="info-list">
          <li><span class="info-label">Type de livraison :</span> <span class="info-value">${quoteRequest.delivery_type || 'Non spécifié'}</span></li>
          <li><span class="info-label">Adresse :</span> <span class="info-value">${quoteRequest.delivery_address || 'Non spécifiée'}</span></li>
          <li><span class="info-label">Code postal :</span> <span class="info-value">${quoteRequest.delivery_postal_code || 'Non spécifié'}</span></li>
          <li><span class="info-label">Ville :</span> <span class="info-value">${quoteRequest.delivery_city || 'Non spécifiée'}</span></li>
          <li><span class="info-label">Date de livraison :</span> <span class="info-value">${quoteRequest.delivery_date || 'Non spécifiée'}</span></li>
          <li><span class="info-label">Créneau horaire :</span> <span class="info-value">${quoteRequest.delivery_time_slot || 'Non spécifié'}</span></li>
          <li><span class="info-label">Accès extérieur :</span> <span class="info-value">${quoteRequest.exterior_access || 'Non spécifié'}</span></li>
          <li><span class="info-label">Accès intérieur :</span> <span class="info-value">${quoteRequest.interior_access || 'Non spécifié'}</span></li>
          <li>
            <span class="info-label">Dimensions ascenseur :</span>
            <span class="info-value">
              <div class="dimensions">
                <div class="dimension">Larg.: ${quoteRequest.elevator_width || 'N/A'}</div>
                <div class="dimension">Haut.: ${quoteRequest.elevator_height || 'N/A'}</div>
                <div class="dimension">Prof.: ${quoteRequest.elevator_depth || 'N/A'}</div>
              </div>
            </span>
          </li>
        </ul>
      </div>
      
      <div class="section">
        <h3 class="section-title">Informations de reprise</h3>
        <ul class="info-list">
          <li><span class="info-label">Date de reprise :</span> <span class="info-value">${quoteRequest.pickup_return_date || 'Non spécifiée'}</span></li>
          <li><span class="info-label">Heure de début :</span> <span class="info-value">${quoteRequest.pickup_return_start_time || 'Non spécifiée'}</span></li>
          <li><span class="info-label">Heure de fin :</span> <span class="info-value">${quoteRequest.pickup_return_end_time || 'Non spécifiée'}</span></li>
        </ul>
      </div>
      
      <div class="section">
        <h3 class="section-title">Articles demandés</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>
        
        <div class="total-section">
          <span class="total-amount">Total estimatif : ${total}€</span>
        </div>
      </div>
      
      ${quoteRequest.comments ? `
      <div class="section">
        <h3 class="section-title">Commentaires supplémentaires</h3>
        <div class="comments">
          ${quoteRequest.comments}
        </div>
      </div>
      ` : ''}
      
      <div class="section">
        <h3 class="section-title">Conditions acceptées</h3>
        <ul class="info-list">
          <li>
            <span class="info-label">CGV :</span> 
            <span class="info-value">
              ${quoteRequest.terms_accepted ? 
                '<span class="terms-accepted">Acceptées</span>' : 
                '<span class="terms-rejected">Non acceptées</span>'}
            </span>
          </li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://esil-events.fr/admin/quote-requests" class="action-button">
          Accéder au panneau d'administration
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p>Email automatique généré par le système ESIL Events</p>
      <p>© ${new Date().getFullYear()} ESIL Events. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail(
    adminEmail,
    'Nouvelle demande de devis - ESIL Events',
    html
  );
};