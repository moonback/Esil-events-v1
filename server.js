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
      console.log('Contenu XML reçu directement du body');
    } else if (req.rawBody) {
      // Utiliser le corps brut si disponible
      sitemapXml = req.rawBody;
      console.log('Contenu XML extrait de rawBody');
    } else if (typeof req.body === 'string') {
      // Si le corps est une chaîne
      sitemapXml = req.body;
      console.log('Contenu XML extrait comme chaîne');
    } else {
      // Dernier recours: tenter de convertir l'objet en chaîne
      sitemapXml = JSON.stringify(req.body);
      console.log('Contenu converti de JSON à chaîne');
    }
    
    console.log('Type de contenu reçu:', req.get('Content-Type'));
    console.log('Longueur du contenu XML:', sitemapXml?.length || 0);
    
    // Vérifier que nous avons bien un contenu XML valide
    if (!sitemapXml || !sitemapXml.includes('<?xml') || !sitemapXml.includes('<urlset')) {
      console.error('Contenu XML invalide:', sitemapXml?.substring(0, 100));
      return res.status(400).json({ 
        success: false, 
        message: 'Le contenu ne semble pas être un XML de sitemap valide' 
      });
    }
    
    const fs = await import('fs');
    const path = await import('path');
    
    // Obtenir le chemin absolu du répertoire courant
    const currentDir = process.cwd();
    console.log('Répertoire courant:', currentDir);
    
    // Chemin vers le dossier public et le fichier sitemap.xml
    const publicDir = path.join(currentDir, 'public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    
    console.log('Chemin du sitemap:', sitemapPath);
    
    // Vérifier si le dossier public existe
    if (!fs.existsSync(publicDir)) {
      console.log('Le dossier public n\'existe pas, création du dossier...');
      try {
        fs.mkdirSync(publicDir, { recursive: true });
      } catch (dirError) {
        console.error('Erreur lors de la création du dossier public:', dirError);
        return res.status(500).json({ 
          success: false, 
          message: `Erreur lors de la création du dossier: ${dirError.message}` 
        });
      }
    }
    
    // Écrire le contenu XML dans le fichier
    try {
      fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
      console.log('Sitemap sauvegardé avec succès');
      return res.status(200).json({ success: true, message: 'Sitemap mis à jour avec succès' });
    } catch (writeError) {
      console.error('Erreur lors de l\'écriture du fichier sitemap:', writeError);
      return res.status(500).json({ 
        success: false, 
        message: `Erreur lors de l'écriture du fichier: ${writeError.message}` 
      });
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du sitemap:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la sauvegarde',
      details: error.toString()
    });
  }
});

// Endpoint proxy pour SerpApi pour contourner les problèmes CORS
app.get('/api/serpapi/search', async (req, res) => {
  console.log('Requête reçue sur le proxy SerpApi');
  try {
    // Récupérer les paramètres de la requête
    const params = req.query;
    
    // Vérifier si la clé API est présente
    if (!params.api_key) {
      return res.status(400).json({ 
        error: 'Clé API SerpApi manquante', 
        message: 'La clé API SerpApi est requise pour effectuer une recherche' 
      });
    }
    
    // Construire l'URL de l'API SerpApi
    const searchUrl = new URL('https://serpapi.com/search');
    
    // Ajouter tous les paramètres à l'URL
    Object.entries(params).forEach(([key, value]) => {
      searchUrl.searchParams.append(key, value.toString());
    });
    
    console.log('Envoi de la requête à SerpApi...');
    // Masquer la clé API dans les logs
    const searchUrlForLog = new URL(searchUrl.toString());
    searchUrlForLog.searchParams.delete('api_key');
    console.log('URL de recherche (sans clé API):', searchUrlForLog.toString());
    
    // Effectuer la requête à l'API SerpApi
    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      timeout: 30000 // 30 secondes de timeout
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur API SerpApi:', errorData);
      return res.status(response.status).json(errorData);
    }
    
    // Récupérer les données et les renvoyer au client
    const data = await response.json();
    console.log('Réponse de SerpApi reçue avec succès');
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la requête proxy SerpApi:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la requête proxy', 
      message: error.message,
      details: error.toString()
    });
  }
});

// Endpoint pour sauvegarder la configuration SMTP
app.post('/api/email/config', async (req, res) => {
  console.log('Requête reçue sur /api/email/config');
  try {
    const { config } = req.body;

    // Vérifier si la configuration est présente
    if (!config) {
      console.error('Configuration SMTP manquante');
      return res.status(400).json({ error: 'Configuration SMTP manquante' });
    }

    // Sauvegarder la configuration dans un fichier
    const fs = await import('fs');
    const path = await import('path');
    
    // Obtenir le chemin absolu du répertoire courant
    const currentDir = process.cwd();
    const configDir = path.join(currentDir, 'config');
    const configPath = path.join(configDir, 'smtp.json');
    
    // Créer le dossier config s'il n'existe pas
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Sauvegarder la configuration
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    
    console.log('Configuration SMTP sauvegardée avec succès');
    res.json({ success: true, message: 'Configuration SMTP sauvegardée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la configuration SMTP:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.toString()
    });
  }
});

// Endpoint pour récupérer la configuration SMTP
app.get('/api/email/config', async (req, res) => {
  console.log('Requête reçue sur /api/email/config (GET)');
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    // Obtenir le chemin absolu du répertoire courant
    const currentDir = process.cwd();
    const configPath = path.join(currentDir, 'config', 'smtp.json');
    
    // Vérifier si le fichier de configuration existe
    if (!fs.existsSync(configPath)) {
      console.log('Aucune configuration SMTP trouvée');
      return res.status(404).json({ error: 'Configuration SMTP non trouvée' });
    }
    
    // Lire la configuration
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    console.log('Configuration SMTP récupérée avec succès');
    res.json(config);
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration SMTP:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.toString()
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});