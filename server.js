import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
const app = express();

app.use(cors());

// Middleware pour parser le JSON
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    // Stocker le corps brut de la requête pour les endpoints qui ont besoin du XML
    if (req.originalUrl === '/api/admin/sitemap') {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  }
}));

// Middleware pour parser le texte brut (pour le XML)
app.use(express.text({ type: 'application/xml' }));

// Endpoint pour tester la connexion SMTP
app.post('/api/email/test-connection', async (req, res) => {
  console.log('Requête reçue sur /api/email/test-connection');
  try {
    const { smtpConfig } = req.body;

    // Vérifier si la configuration SMTP est complète
    if (!smtpConfig?.auth?.pass) {
      console.error('Configuration SMTP incomplète');
      return res.status(400).json({ error: 'Configuration SMTP incomplète' });
    }

    console.log('Configuration SMTP reçue:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: { user: smtpConfig.auth.user, pass: '***' }
    });

    // Créer un transporteur SMTP réutilisable
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass
      },
      // Ajouter des options de timeout pour éviter les longs délais d'attente
      connectionTimeout: 10000, // 10 secondes
      greetingTimeout: 10000,   // 10 secondes
      socketTimeout: 15000      // 15 secondes
    });

    // Vérifier la connexion au serveur SMTP
    try {
      console.log('Vérification de la connexion au serveur SMTP...');
      await transporter.verify();
      console.log('Connexion au serveur SMTP réussie');
      return res.json({ success: true, message: 'Connexion au serveur SMTP réussie' });
    } catch (verifyError) {
      console.error('Erreur de connexion au serveur SMTP:', verifyError);
      return res.status(500).json({ 
        error: `Erreur de connexion au serveur SMTP: ${verifyError.message}`,
        details: verifyError.toString()
      });
    }
  } catch (error) {
    console.error('Erreur lors du test de connexion SMTP:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.toString(),
      stack: error.stack
    });
  }
});

app.post('/api/email/send', async (req, res) => {
  console.log('Requête reçue sur /api/email/send');
  try {
    const { from, to, subject, html, smtpConfig } = req.body;

    // Vérifier si tous les champs nécessaires sont présents
    if (!from || !to || !subject || !html) {
      console.error('Champs manquants dans la requête:', { from: !!from, to: !!to, subject: !!subject, html: !!html });
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    // Vérifier si la configuration SMTP est complète
    if (!smtpConfig?.auth?.pass) {
      console.error('Configuration SMTP incomplète');
      return res.status(400).json({ error: 'Configuration SMTP incomplète' });
    }

    console.log('Configuration SMTP reçue:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: { user: smtpConfig.auth.user, pass: '***' }
    });

    // Créer un transporteur SMTP réutilisable
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass
      },
      // Ajouter des options de timeout pour éviter les longs délais d'attente
      connectionTimeout: 10000, // 10 secondes
      greetingTimeout: 10000,   // 10 secondes
      socketTimeout: 15000      // 15 secondes
    });

    // Vérifier la connexion au serveur SMTP
    try {
      console.log('Vérification de la connexion au serveur SMTP...');
      await transporter.verify();
      console.log('Connexion au serveur SMTP réussie');
    } catch (verifyError) {
      console.error('Erreur de connexion au serveur SMTP:', verifyError);
      return res.status(500).json({ 
        error: `Erreur de connexion au serveur SMTP: ${verifyError.message}`,
        details: verifyError.toString()
      });
    }

    // Envoyer l'email
    console.log(`Tentative d'envoi d'email à ${to}...`);
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html
    });

    console.log('Email envoyé avec succès:', info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.toString(),
      stack: error.stack
    });
  }
});

// Endpoint pour sauvegarder le sitemap
app.post('/api/admin/sitemap', async (req, res) => {
  console.log('Requête reçue sur /api/admin/sitemap');
  try {
    // Récupérer le contenu XML du corps de la requête
    let sitemapXml = '';
    
    // Vérifier le type de contenu et extraire le XML
    if (req.is('application/xml') || req.is('text/xml')) {
      // Si le contenu est déjà sous forme de texte/XML
      sitemapXml = req.body;
    } else if (req.rawBody) {
      // Utiliser le corps brut si disponible
      sitemapXml = req.rawBody;
    } else if (typeof req.body === 'string') {
      // Si le corps est une chaîne
      sitemapXml = req.body;
    } else {
      // Dernier recours: tenter de convertir l'objet en chaîne
      sitemapXml = JSON.stringify(req.body);
    }
    
    // Vérifier que nous avons bien un contenu XML valide
    if (!sitemapXml.includes('<?xml') || !sitemapXml.includes('<urlset')) {
      throw new Error('Le contenu ne semble pas être un XML de sitemap valide');
    }
    
    const fs = await import('fs');
    const path = await import('path');
    
    // Chemin vers le fichier sitemap.xml dans le dossier public
    const sitemapPath = path.resolve('./public/sitemap.xml');
    
    // Écrire le contenu XML dans le fichier
    fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
    
    console.log('Sitemap sauvegardé avec succès');
    res.json({ success: true, message: 'Sitemap mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du sitemap:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la sauvegarde',
      details: error.toString()
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});