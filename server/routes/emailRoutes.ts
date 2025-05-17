import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Chemin vers le fichier de configuration SMTP
const CONFIG_FILE = path.join(__dirname, '../config/smtp.json');

// Fonction pour lire la configuration SMTP
const readSmtpConfig = (): any => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la lecture de la configuration SMTP:', error);
    return null;
  }
};

// Fonction pour sauvegarder la configuration SMTP
const saveSmtpConfig = (config: any): boolean => {
  try {
    // Créer le répertoire de configuration s'il n'existe pas
    const configDir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Sauvegarder la configuration
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la configuration SMTP:', error);
    return false;
  }
};

// Route pour récupérer la configuration SMTP
router.get('/config', (req: Request, res: Response) => {
  const config = readSmtpConfig();
  if (config) {
    // Ne pas renvoyer le mot de passe
    const { auth, ...safeConfig } = config;
    res.json({
      ...safeConfig,
      auth: { user: auth.user }
    });
  } else {
    res.status(404).json({ error: 'Configuration SMTP non trouvée' });
  }
});

// Route pour sauvegarder la configuration SMTP
router.post('/config', (req: Request, res: Response) => {
  const { config } = req.body;
  if (!config || !config.host || !config.port || !config.auth || !config.auth.user || !config.auth.pass) {
    return res.status(400).json({ error: 'Configuration SMTP invalide' });
  }

  if (saveSmtpConfig(config)) {
    res.json({ message: 'Configuration SMTP sauvegardée avec succès' });
  } else {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde de la configuration SMTP' });
  }
});

// Route pour tester la connexion SMTP
router.post('/test-connection', async (req: Request, res: Response) => {
  const { smtpConfig } = req.body;
  if (!smtpConfig || !smtpConfig.host || !smtpConfig.port || !smtpConfig.auth || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
    return res.status(400).json({ error: 'Configuration SMTP invalide' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass
      }
    });

    await transporter.verify();
    res.json({ success: true, message: 'Connexion SMTP réussie' });
  } catch (error) {
    console.error('Erreur lors du test de connexion SMTP:', error);
    res.status(500).json({ error: 'Erreur de connexion SMTP: ' + (error instanceof Error ? error.message : String(error)) });
  }
});

// Route pour envoyer un email
router.post('/send', async (req: Request, res: Response) => {
  const { from, to, subject, html, smtpConfig } = req.body;
  if (!smtpConfig || !smtpConfig.host || !smtpConfig.port || !smtpConfig.auth || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
    return res.status(400).json({ error: 'Configuration SMTP invalide' });
  }

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Paramètres d\'email manquants' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass
      }
    });

    const info = await transporter.sendMail({
      from: from || smtpConfig.from,
      to,
      subject,
      html
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email: ' + (error instanceof Error ? error.message : String(error)) });
  }
});

export default router; 