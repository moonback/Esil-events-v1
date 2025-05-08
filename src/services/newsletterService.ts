import { sendEmail } from './emailService';
import { supabase } from './supabaseClient';

export interface NewsletterSubscription {
  email: string;
  status?: string;
  created_at?: Date;
}

// Fonction pour sauvegarder un abonné dans la base de données
export const saveSubscriber = async (email: string): Promise<{ success: boolean; error?: any }> => {
  try {
    // Vérifier si l'email existe déjà
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, status')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erreur lors de la vérification de l\'email:', checkError);
      return { success: false, error: checkError };
    }

    // Si l'abonné existe déjà et est actif, on ne fait rien
    if (existingSubscriber && existingSubscriber.status === 'active') {
      return { success: true };
    }

    // Si l'abonné existe mais est désabonné, on le réactive
    if (existingSubscriber && existingSubscriber.status === 'unsubscribed') {
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ status: 'active', updated_at: new Date() })
        .eq('id', existingSubscriber.id);

      if (updateError) {
        console.error('Erreur lors de la réactivation de l\'abonné:', updateError);
        return { success: false, error: updateError };
      }

      return { success: true };
    }

    // Sinon, on crée un nouvel abonné
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, status: 'active' }]);

    if (insertError) {
      console.error('Erreur lors de l\'enregistrement de l\'abonné:', insertError);
      return { success: false, error: insertError };
    }

    return { success: true };
  } catch (err) {
    console.error('Erreur lors de la sauvegarde de l\'abonné:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
};

// Fonction pour envoyer un email de confirmation d'inscription à la newsletter
export const subscribeToNewsletter = async (email: string): Promise<{ success: boolean; error?: any }> => {
  try {
    // Sauvegarder l'abonné dans la base de données
    const saveResult = await saveSubscriber(email);
    
    if (!saveResult.success) {
      // S'assurer que l'erreur est une chaîne de caractères
      return { 
        success: false, 
        error: typeof saveResult.error === 'object' && saveResult.error !== null
          ? (saveResult.error.message || JSON.stringify(saveResult.error))
          : saveResult.error 
      };
    }
    
    // Adresse email de destination (administrateur)
    const adminEmail = 'contact@esil-events.fr';
    
    // Créer le contenu HTML de l'email pour l'administrateur
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #000000; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">ESIL Events - Nouvelle inscription</h1>
          <p style="margin: 5px 0 0;">Inscription à la newsletter</p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2>Nouvelle inscription à la newsletter</h2>
          
          <p><strong>Email :</strong> ${email}</p>
          
          <p style="margin-top: 30px;">Cette inscription a été effectuée depuis le formulaire du site web.</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 14px; color: #6b7280;">
          <p>© ${new Date().getFullYear()} ESIL Events - Tous droits réservés</p>
        </div>
      </div>
    `;
    
    // Créer le contenu HTML de l'email pour l'utilisateur
    const userHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #000000; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">ESIL Events</h1>
          <p style="margin: 5px 0 0;">Confirmation d'inscription</p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2>Merci pour votre inscription !</h2>
          
          <p>Votre inscription à notre newsletter a bien été prise en compte.</p>
          
          <p>Vous recevrez désormais nos actualités et offres exclusives directement dans votre boîte mail.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="https://esil-events.fr" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visiter notre site</a>
          </div>
          
          <p>Si vous n'êtes pas à l'origine de cette inscription, veuillez nous contacter à l'adresse suivante : <a href="mailto:contact@esil-events.fr">contact@esil-events.fr</a></p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 14px; color: #6b7280;">
          <p>© ${new Date().getFullYear()} ESIL Events - Tous droits réservés</p>
          <p>7 Rue de la Cellophane, 78711 Mantes-la-Ville, Île-de-France</p>
          <p>
            <a href="https://esil-events.fr/privacy" style="color: #8b5cf6; text-decoration: none;">Politique de confidentialité</a> | 
            <a href="https://esil-events.fr/cgu" style="color: #8b5cf6; text-decoration: none;">CGU</a> | 
            <a href="https://esil-events.fr/legal" style="color: #8b5cf6; text-decoration: none;">Mentions légales</a>
          </p>
        </div>
      </div>
    `;
    
    // Envoyer l'email à l'administrateur
    const adminEmailResult = await sendEmail(
      adminEmail,
      'Nouvelle inscription à la newsletter',
      adminHtml
    );
    
    // Envoyer l'email de confirmation à l'utilisateur
    const userEmailResult = await sendEmail(
      email,
      'Confirmation d\'inscription à la newsletter ESIL Events',
      userHtml
    );
    
    // Vérifier si les deux emails ont été envoyés avec succès
    if (adminEmailResult.success && userEmailResult.success) {
      return { success: true };
    } else {
      // Si l'un des emails a échoué, renvoyer l'erreur
      const error = adminEmailResult.error || userEmailResult.error;
      console.error('Erreur lors de l\'envoi des emails de newsletter:', error);
      return { success: false, error };
    }
  } catch (err) {
    console.error('Erreur lors de l\'inscription à la newsletter:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
};

// Fonction pour récupérer tous les abonnés à la newsletter
export const getAllSubscribers = async (status?: string): Promise<{ data: NewsletterSubscription[] | null; error?: any }> => {
  try {
    let query = supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Filtrer par statut si spécifié
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erreur lors de la récupération des abonnés:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Erreur lors de la récupération des abonnés:', err);
    return { data: null, error: err instanceof Error ? err.message : String(err) };
  }
};

// Fonction pour désabonner un utilisateur
export const unsubscribeUser = async (email: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed', updated_at: new Date() })
      .eq('email', email);
    
    if (error) {
      console.error('Erreur lors du désabonnement:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Erreur lors du désabonnement:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
};

// Fonction pour envoyer une newsletter à tous les abonnés actifs
export const sendNewsletterToSubscribers = async (
  subject: string,
  htmlContent: string,
  testEmail?: string
): Promise<{ success: boolean; error?: any; sentCount?: number }> => {
  try {
    // Si un email de test est fourni, envoyer uniquement à cet email
    if (testEmail) {
      const result = await sendEmail(testEmail, subject, htmlContent);
      return { 
        success: result.success, 
        error: result.error,
        sentCount: result.success ? 1 : 0
      };
    }

    // Récupérer tous les abonnés actifs
    const { data: subscribers, error: fetchError } = await getAllSubscribers('active');
    
    if (fetchError || !subscribers) {
      console.error('Erreur lors de la récupération des abonnés:', fetchError);
      return { success: false, error: fetchError, sentCount: 0 };
    }
    
    if (subscribers.length === 0) {
      return { success: true, sentCount: 0 };
    }
    
    // Envoyer l'email à chaque abonné
    let successCount = 0;
    let errors = [];
    
    for (const subscriber of subscribers) {
      const result = await sendEmail(subscriber.email, subject, htmlContent);
      
      if (result.success) {
        successCount++;
      } else {
        errors.push({ email: subscriber.email, error: result.error });
      }
    }
    
    // Si tous les emails ont été envoyés avec succès
    if (errors.length === 0) {
      return { success: true, sentCount: successCount };
    } else {
      // Si certains emails ont échoué
      console.error(`Erreur lors de l'envoi de la newsletter à ${errors.length} abonnés:`, errors);
      return { 
        success: successCount > 0, 
        error: `Échec d'envoi à ${errors.length} abonnés sur ${subscribers.length}`,
        sentCount: successCount
      };
    }
  } catch (err) {
    console.error('Erreur lors de l\'envoi de la newsletter:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err), sentCount: 0 };
  }
};