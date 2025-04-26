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
export const sendEmailViaApi = async (emailData: EmailData): Promise<{ success: boolean; message: string }> => {
  try {
    // Vérifier si nous sommes en mode développement
    if (import.meta.env.DEV) {
      console.log('Mode développement: Simulation d\'envoi d\'email via API');
      console.log('Données de l\'email:', emailData);
      
      return { 
        success: true, 
        message: 'Email simulé en mode développement' 
      };
    }
    
    // Préparer les headers avec l'API key si disponible
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (emailApiConfig.apiKey) {
      headers['X-API-Key'] = emailApiConfig.apiKey;
    }
    
    // Faire la requête à l'API
    const response = await fetch(`${emailApiConfig.apiUrl}/send-email`, {
      method: 'POST',
      headers,
      body: JSON.stringify(emailData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de l\'envoi de l\'email');
    }
    
    const result = await response.json();
    return { 
      success: true, 
      message: result.message || 'Email envoyé avec succès' 
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email via API:', error);
    return { 
      success: false, 
      message: `Erreur d'envoi: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    };
  }
};

/**
 * Teste la connexion au serveur SMTP via l'API backend
 * @returns Une promesse avec le résultat du test
 */
export const testSmtpConnectionViaApi = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Vérifier si nous sommes en mode développement
    if (import.meta.env.DEV) {
      console.log('Mode développement: Simulation de test de connexion SMTP via API');
      
      return { 
        success: true, 
        message: 'Test de connexion SMTP simulé en mode développement' 
      };
    }
    
    // Préparer les headers avec l'API key si disponible
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (emailApiConfig.apiKey) {
      headers['X-API-Key'] = emailApiConfig.apiKey;
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
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors du test de connexion SMTP');
    }
    
    const result = await response.json();
    return { 
      success: true, 
      message: result.message || 'Connexion au serveur SMTP établie avec succès' 
    };
  } catch (error) {
    console.error('Erreur lors du test de connexion SMTP via API:', error);
    return { 
      success: false, 
      message: `Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    };
  }
};