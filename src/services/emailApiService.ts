/**
 * Service d'API pour l'envoi d'emails
 * Ce service sert d'intermédiaire entre le frontend et le backend pour l'envoi d'emails
 */

/**
 * Configuration pour l'API d'envoi d'emails
 */
interface EmailApiConfig {
  apiUrl: string;
  apiKey?: string;
}

/**
 * Configuration par défaut pour l'API d'envoi d'emails
 */
const emailApiConfig: EmailApiConfig = {
  apiUrl: import.meta.env.VITE_EMAIL_API_URL || '/api',
  apiKey: import.meta.env.VITE_EMAIL_API_KEY
};

/**
 * Vérifie si toutes les variables d'environnement SMTP nécessaires sont définies
 * @returns Un objet indiquant si la configuration est valide et un message d'erreur si ce n'est pas le cas
 */
export const validateSmtpConfig = (): { isValid: boolean; missingVars: string[]; message: string } => {
  const requiredVars = [
    { name: 'VITE_EMAIL_HOST', value: import.meta.env.VITE_EMAIL_HOST },
    { name: 'VITE_EMAIL_PORT', value: import.meta.env.VITE_EMAIL_PORT },
    { name: 'VITE_EMAIL_USER', value: import.meta.env.VITE_EMAIL_USER },
    { name: 'VITE_EMAIL_PASSWORD', value: import.meta.env.VITE_EMAIL_PASSWORD }
  ];
  
  const missingVars = requiredVars.filter(v => !v.value).map(v => v.name);
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
    message: missingVars.length > 0 
      ? `Configuration SMTP incomplète. Variables manquantes: ${missingVars.join(', ')}` 
      : 'Configuration SMTP valide'
  };
};

/**
 * Données pour l'envoi d'un email
 */
interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
    }
  };
}

/**
 * Envoie un email via l'API backend
 * @param emailData - Les données de l'email à envoyer
 * @returns Une promesse avec le résultat de l'envoi
 */
/**
 * Configuration pour les tentatives d'envoi d'email
 */
interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // en millisecondes
}

/**
 * Configuration par défaut pour les tentatives d'envoi
 */
const retryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 2000 // 2 secondes
};

/**
 * Fonction utilitaire pour attendre un délai spécifié
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Envoie un email via l'API backend avec mécanisme de retry
 * @param emailData - Les données de l'email à envoyer
 * @returns Une promesse avec le résultat de l'envoi
 */
export const sendEmailViaApi = async (emailData: EmailData): Promise<{ success: boolean; message: string }> => {
  let retryCount = 0;
  let lastError: Error | null = null;
  
  // Journaliser les informations de l'email (sans données sensibles)
  console.log(`Tentative d'envoi d'email à ${emailData.to} avec sujet "${emailData.subject}"`);
  
  // Vérifier la validité de la configuration SMTP
  const smtpValidation = validateSmtpConfig();
  if (!smtpValidation.isValid) {
    console.error(smtpValidation.message);
    return {
      success: false,
      message: smtpValidation.message
    };
  }
  
  // Boucle de tentatives
  while (retryCount <= retryConfig.maxRetries) {
    try {
      // Vérifier si nous sommes en mode développement
      if (import.meta.env.DEV) {
        console.log('Mode développement: Simulation d\'envoi d\'email via API');
        console.log('Données de l\'email:', {
          to: emailData.to,
          subject: emailData.subject,
          from: emailData.from || 'default',
          smtpConfig: emailData.smtpConfig ? {
            host: emailData.smtpConfig.host,
            port: emailData.smtpConfig.port,
            secure: emailData.smtpConfig.secure,
            auth: { user: emailData.smtpConfig.auth.user }
          } : 'default'
        });
        
        return { 
          success: true, 
          message: 'Email simulé en mode développement' 
        };
      }
      
      // Vérifier que les données SMTP sont présentes
      if (!emailData.smtpConfig || !emailData.smtpConfig.host || !emailData.smtpConfig.auth.user) {
        console.error('Configuration SMTP incomplète:', emailData.smtpConfig);
        return {
          success: false,
          message: 'Configuration SMTP incomplète. Veuillez vérifier les variables d\'environnement.'
        };
      }
      
      // Préparer les headers avec l'API key si disponible
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (emailApiConfig.apiKey) {
        headers['X-API-Key'] = emailApiConfig.apiKey;
      }
      
      // Journaliser la tentative d'envoi
      if (retryCount > 0) {
        console.log(`Tentative d'envoi #${retryCount + 1} pour l'email à ${emailData.to}`);
      }
      
      // Faire la requête à l'API
      const response = await fetch(`${emailApiConfig.apiUrl}/send-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify(emailData),
      });
      
      // Vérifier si la réponse est OK
      if (!response.ok) {
        // Essayer de lire le corps de la réponse comme texte d'abord
        const responseText = await response.text();
        let errorMessage = 'Erreur lors de l\'envoi de l\'email';
        
        // Ajouter le code de statut HTTP dans le message d'erreur
        errorMessage = `Erreur HTTP ${response.status}: ${errorMessage}`;
        
        // Essayer de parser le texte comme JSON si possible
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message) {
            errorMessage = `${errorMessage} - ${errorData.message}`;
          }
          if (errorData.error) {
            errorMessage = `${errorMessage} (${errorData.error})`;
          }
        } catch (parseError) {
          // Si ce n'est pas du JSON, utiliser le texte brut ou un message par défaut
          if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
            errorMessage = `${errorMessage} - L'API a renvoyé une page HTML au lieu d'une réponse JSON. Vérifiez la configuration de l'API et les logs du serveur.`;
          } else if (responseText) {
            // Limiter la longueur du message d'erreur brut
            const maxLength = 200;
            const truncatedText = responseText.length > maxLength 
              ? responseText.substring(0, maxLength) + '...'
              : responseText;
            errorMessage = `${errorMessage} - ${truncatedText}`;
          }
        }
        
        console.error(`Tentative ${retryCount + 1}/${retryConfig.maxRetries + 1} - Détails de la réponse d'erreur:`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText
        });
        
        // Stocker l'erreur pour la réutiliser si toutes les tentatives échouent
        lastError = new Error(errorMessage);
        
        // Si c'est une erreur 5xx (erreur serveur), on peut réessayer
        // Si c'est une erreur 4xx (erreur client), inutile de réessayer
        if (response.status < 500 || response.status >= 600) {
          throw lastError; // Ne pas réessayer pour les erreurs client
        }
      } else {
        // Essayer de lire la réponse comme texte d'abord
        const responseText = await response.text();
        let result;
        
        // Essayer de parser le texte comme JSON
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Erreur lors du parsing de la réponse JSON:', parseError);
          throw new Error('La réponse du serveur n\'est pas au format JSON valide');
        }
        
        console.log(`Email envoyé avec succès à ${emailData.to}`);
        return { 
          success: true, 
          message: result.message || 'Email envoyé avec succès' 
        };
      }
    } catch (error) {
      // Stocker l'erreur pour la réutiliser si toutes les tentatives échouent
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Tentative ${retryCount + 1}/${retryConfig.maxRetries + 1} - Erreur lors de l'envoi de l'email:`, error);
    }
    
    // Si ce n'est pas la dernière tentative, attendre avant de réessayer
    if (retryCount < retryConfig.maxRetries) {
      const waitTime = retryConfig.retryDelay * Math.pow(2, retryCount); // Backoff exponentiel
      console.log(`Attente de ${waitTime}ms avant la prochaine tentative...`);
      await delay(waitTime);
    }
    
    retryCount++;
  }
  
  // Si on arrive ici, c'est que toutes les tentatives ont échoué
  console.error(`Échec de l'envoi d'email après ${retryConfig.maxRetries + 1} tentatives`);
  return { 
    success: false, 
    message: `Erreur d'envoi après ${retryConfig.maxRetries + 1} tentatives: ${lastError?.message || 'Erreur inconnue'}` 
  };
};

/**
 * Teste la connexion au serveur SMTP via l'API backend
 * @returns Une promesse avec le résultat du test
 */
export const testSmtpConnectionViaApi = async (): Promise<{ success: boolean; message: string }> => {
  let retryCount = 0;
  let lastError: Error | null = null;
  
  // Journaliser le début du test de connexion
  console.log('Démarrage du test de connexion SMTP');
  
  // Vérifier la validité de la configuration SMTP
  const smtpValidation = validateSmtpConfig();
  if (!smtpValidation.isValid) {
    console.error(smtpValidation.message);
    return {
      success: false,
      message: smtpValidation.message
    };
  }
  
  // Boucle de tentatives
  while (retryCount <= retryConfig.maxRetries) {
    try {
      // Vérifier si nous sommes en mode développement
      if (import.meta.env.DEV) {
        console.log('Mode développement: Simulation de test de connexion SMTP via API');
        
        return { 
          success: true, 
          message: 'Test de connexion SMTP simulé en mode développement' 
        };
      }
      
      // Vérifier que les variables d'environnement SMTP sont définies
      if (!import.meta.env.VITE_EMAIL_HOST || !import.meta.env.VITE_EMAIL_USER) {
        console.error('Configuration SMTP incomplète. Variables d\'environnement manquantes.');
        return {
          success: false,
          message: 'Configuration SMTP incomplète. Veuillez vérifier les variables d\'environnement.'
        };
      }
      
      // Préparer les headers avec l'API key si disponible
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (emailApiConfig.apiKey) {
        headers['X-API-Key'] = emailApiConfig.apiKey;
      }
      
      // Journaliser la tentative de test
      if (retryCount > 0) {
        console.log(`Tentative de test SMTP #${retryCount + 1}`);
      }
      
      // Faire la requête à l'API
      const response = await fetch(`${emailApiConfig.apiUrl}/test-smtp-connection`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          smtpConfig: {
            host: import.meta.env.VITE_EMAIL_HOST,
            port: Number(import.meta.env.VITE_EMAIL_PORT),
            secure: import.meta.env.VITE_EMAIL_SECURE === 'true',
            auth: {
              user: import.meta.env.VITE_EMAIL_USER
            }
          }
        }),
      });
      
      // Vérifier si la réponse est OK
      if (!response.ok) {
        // Essayer de lire le corps de la réponse comme texte d'abord
        const responseText = await response.text();
        let errorMessage = 'Erreur lors du test de connexion SMTP';
        
        // Ajouter le code de statut HTTP dans le message d'erreur
        errorMessage = `Erreur HTTP ${response.status}: ${errorMessage}`;
        
        // Essayer de parser le texte comme JSON si possible
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message) {
            errorMessage = `${errorMessage} - ${errorData.message}`;
          }
          if (errorData.error) {
            errorMessage = `${errorMessage} (${errorData.error})`;
          }
        } catch (parseError) {
          // Si ce n'est pas du JSON, utiliser le texte brut
          if (responseText) {
            const maxLength = 200;
            const truncatedText = responseText.length > maxLength 
              ? responseText.substring(0, maxLength) + '...'
              : responseText;
            errorMessage = `${errorMessage} - ${truncatedText}`;
          }
        }
        
        console.error(`Tentative ${retryCount + 1}/${retryConfig.maxRetries + 1} - Détails de la réponse d'erreur:`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText
        });
        
        // Stocker l'erreur pour la réutiliser si toutes les tentatives échouent
        lastError = new Error(errorMessage);
        
        // Si c'est une erreur 5xx (erreur serveur), on peut réessayer
        // Si c'est une erreur 4xx (erreur client), inutile de réessayer
        if (response.status < 500 || response.status >= 600) {
          throw lastError; // Ne pas réessayer pour les erreurs client
        }
      } else {
        // Essayer de lire la réponse comme texte d'abord
        const responseText = await response.text();
        let result;
        
        // Essayer de parser le texte comme JSON
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Erreur lors du parsing de la réponse JSON:', parseError);
          throw new Error('La réponse du serveur n\'est pas au format JSON valide');
        }
        
        console.log('Test de connexion SMTP réussi');
        return { 
          success: true, 
          message: result.message || 'Connexion au serveur SMTP établie avec succès' 
        };
      }
    } catch (error) {
      // Stocker l'erreur pour la réutiliser si toutes les tentatives échouent
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Tentative ${retryCount + 1}/${retryConfig.maxRetries + 1} - Erreur lors du test de connexion SMTP:`, error);
    }
    
    // Si ce n'est pas la dernière tentative, attendre avant de réessayer
    if (retryCount < retryConfig.maxRetries) {
      const waitTime = retryConfig.retryDelay * Math.pow(2, retryCount); // Backoff exponentiel
      console.log(`Attente de ${waitTime}ms avant la prochaine tentative...`);
      await delay(waitTime);
    }
    
    retryCount++;
  }
  
  // Si on arrive ici, c'est que toutes les tentatives ont échoué
  console.error(`Échec du test de connexion SMTP après ${retryConfig.maxRetries + 1} tentatives`);
  return { 
    success: false, 
    message: `Erreur de connexion après ${retryConfig.maxRetries + 1} tentatives: ${lastError?.message || 'Erreur inconnue'}` 
  };
};