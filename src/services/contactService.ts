import { sendEmail } from './emailService';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  eventDate: string;
  eventDuration: string;
  description: string;
}

// Fonction pour envoyer un email à partir du formulaire de contact
export const sendContactFormEmail = async (formData: ContactFormData): Promise<{ success: boolean; error?: any }> => {
  // Adresse email de destination (administrateur)
  const adminEmail = 'contact@esil-events.fr';
  
  // Créer le contenu HTML de l'email
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #000000; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">ESIL Events - Nouveau message</h1>
        <p style="margin: 5px 0 0;">Formulaire de contact</p>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <h2>Nouveau message reçu</h2>
        
        <h3>Informations du contact :</h3>
        <ul>
          <li><strong>Prénom :</strong> ${formData.firstName}</li>
          <li><strong>Nom :</strong> ${formData.lastName}</li>
          <li><strong>Email :</strong> ${formData.email}</li>
          <li><strong>Téléphone :</strong> ${formData.phone}</li>
          <li><strong>Raison sociale :</strong> ${formData.company}</li>
        </ul>
        
        <h3>Détails de l'événement :</h3>
        <ul>
          <li><strong>Date de l'événement :</strong> ${formData.eventDate}</li>
          <li><strong>Durée de l'événement :</strong> ${formData.eventDuration}</li>
        </ul>
        
        <h3>Description du projet :</h3>
        <p style="background-color: #f9fafb; padding: 15px; border-radius: 5px;">${formData.description}</p>
        
        <p style="margin-top: 30px;">Ce message a été envoyé depuis le formulaire de contact du site web.</p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 0.8em; color: #6b7280;">
        <p>ESIL Events - L'élégance pour chaque événement</p>
        <p>© ${new Date().getFullYear()} ESIL Events. Tous droits réservés.</p>
      </div>
    </div>
  `;

  // Envoyer l'email à l'administrateur
  const adminResult = await sendEmail(
    adminEmail,
    `Nouveau message de contact - ${formData.firstName} ${formData.lastName}`,
    html
  );
  
  // Si l'envoi à l'admin échoue, retourner l'erreur
  if (!adminResult.success) {
    return adminResult;
  }
  
  // Envoyer un email de confirmation au client
  const clientHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #000000; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">ESIL Events</h1>
        <p style="margin: 5px 0 0;">Confirmation de votre message</p>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <h2>Merci pour votre message</h2>
        
        <p>Bonjour ${formData.firstName} ${formData.lastName},</p>
        
        <p>Nous vous remercions pour votre message. Notre équipe va l'étudier dans les plus brefs délais et vous contactera prochainement.</p>
        
        <h3>Récapitulatif de votre message :</h3>
        
        <p><strong>Date de l'événement :</strong> ${formData.eventDate}</p>
        <p><strong>Durée de l'événement :</strong> ${formData.eventDuration}</p>
        
        <p><strong>Description de votre projet :</strong></p>
        <p style="background-color: #f9fafb; padding: 15px; border-radius: 5px;">${formData.description}</p>
        
        <p>Si vous avez des questions, n'hésitez pas à nous contacter :</p>
        <p>
          <strong>Téléphone :</strong> 06 20 46 13 85<br>
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
    formData.email,
    'Confirmation de votre message - ESIL Events',
    clientHtml
  );
};