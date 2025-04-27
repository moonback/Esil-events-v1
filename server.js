const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/email/send', async (req, res) => {
  try {
    const { from, to, subject, html, smtpConfig } = req.body;

    // Vérifier si la configuration SMTP est complète
    if (!smtpConfig?.auth?.pass) {
      return res.status(400).json({ error: 'Configuration SMTP incomplète' });
    }

    // Créer un transporteur SMTP réutilisable
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass
      }
    });

    // Envoyer l'email
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});