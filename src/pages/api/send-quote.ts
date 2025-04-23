import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { FormData } from '../../components/cart/types';
import { CartItem } from '../../context/CartContext';

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Fonction pour formater le contenu HTML du devis
const formatQuoteHTML = (formData: FormData, items: CartItem[]) => {
  const itemsList = items
    .map(
      item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price.toFixed(2)}€</td>
        <td>${(item.price * item.quantity).toFixed(2)}€</td>
      </tr>
    `
    )
    .join('');

  const total = items
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  return `
    <h2>Nouvelle demande de devis</h2>
    
    <h3>Informations client</h3>
    <p>
      <strong>Type de client:</strong> ${formData.customerType === 'professional' ? 'Professionnel' : 'Particulier'}<br>
      ${formData.company ? `<strong>Société:</strong> ${formData.company}<br>` : ''}
      <strong>Nom:</strong> ${formData.firstName} ${formData.lastName}<br>
      <strong>Email:</strong> ${formData.email}<br>
      <strong>Téléphone:</strong> ${formData.phone}<br>
      <strong>Adresse:</strong> ${formData.billingAddress}, ${formData.postalCode} ${formData.city}
    </p>

    <h3>Détails de l'événement</h3>
    <p>
      <strong>Date:</strong> ${formData.eventDate}<br>
      <strong>Horaires:</strong> ${formData.eventStartTime} - ${formData.eventEndTime}<br>
      <strong>Nombre d'invités:</strong> ${formData.guestCount}<br>
      <strong>Lieu:</strong> ${formData.eventLocation === 'indoor' ? 'Intérieur' : 'Extérieur'}<br>
      <strong>Description:</strong> ${formData.description}
    </p>

    <h3>Articles demandés</h3>
    <table border="1" cellpadding="5" style="border-collapse: collapse;">
      <tr>
        <th>Article</th>
        <th>Quantité</th>
        <th>Prix unitaire</th>
        <th>Total</th>
      </tr>
      ${itemsList}
      <tr>
        <td colspan="3"><strong>Total</strong></td>
        <td><strong>${total}€</strong></td>
      </tr>
    </table>

    <h3>Livraison</h3>
    <p>
      <strong>Type:</strong> ${formData.deliveryType === 'pickup' ? 'Retrait' : 'Livraison'}<br>
      ${formData.deliveryType === 'pickup' ?
        `<strong>Date de retrait:</strong> ${formData.pickupDate}` :
        `<strong>Date de livraison:</strong> ${formData.deliveryDate}<br>
        <strong>Créneau:</strong> ${formData.deliveryTimeSlot}<br>
        <strong>Adresse:</strong> ${formData.deliveryAddress}, ${formData.deliveryPostalCode} ${formData.deliveryCity}`
      }
    </p>

    ${formData.comments ? `
    <h3>Commentaires</h3>
    <p>${formData.comments}</p>
    ` : ''}
  `;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { formData, items } = req.body;
    const htmlContent = formatQuoteHTML(formData, items);

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: process.env.QUOTE_EMAIL_TO,
      subject: `Nouvelle demande de devis - ${formData.firstName} ${formData.lastName}`,
      html: htmlContent,
      replyTo: formData.email
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du devis:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de l\'envoi du devis' });
  }
}