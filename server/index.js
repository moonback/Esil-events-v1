import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Charger les variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
const formatQuoteHTML = (formData, items) => {
  const itemsList = items
    .map(
      item => `
      <tr>
        <td>${item.name || 'Non spécifié'}</td>
        <td>${item.quantity || 0}</td>
        <td>${(item.price !== undefined && item.price !== null) ? Number(item.price).toFixed(2) : '0.00'}€</td>
        <td>${(item.price !== undefined && item.price !== null && item.quantity) ? (Number(item.price) * Number(item.quantity)).toFixed(2) : '0.00'}€</td>
      </tr>
    `
    )
    .join('');

  const total = items
    .reduce((sum, item) => {
      const price = (item.price !== undefined && item.price !== null) ? Number(item.price) : 0;
      const quantity = item.quantity || 0;
      return sum + price * quantity;
    }, 0)
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

// Route pour envoyer un devis par email
app.post('/api/send-quote', async (req, res) => {
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
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur API démarré sur le port ${PORT}`);
});