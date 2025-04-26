# Configuration du Service d'Email pour ESIL Events

## Introduction

Ce document explique comment configurer et utiliser le service d'email dans l'application ESIL Events. Le service d'email permet d'envoyer des notifications automatiques pour les demandes de devis.

## Architecture

Le service d'email utilise une architecture client-serveur pour contourner les limitations des navigateurs web :

1. **Frontend** : L'application React génère le contenu des emails et prépare les données à envoyer.
2. **API Backend** : Un service d'API intermédiaire reçoit les demandes d'envoi d'emails et les transmet à un serveur SMTP.

Cette architecture évite l'utilisation directe de modules Node.js comme `fs` et `nodemailer` dans le navigateur, qui ne sont pas compatibles avec l'environnement frontend.

## Configuration

### Variables d'Environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
# Configuration SMTP
VITE_EMAIL_HOST=smtp.votredomaine.com
VITE_EMAIL_PORT=587
VITE_EMAIL_SECURE=false
VITE_EMAIL_USER=votre_email@votredomaine.com
VITE_EMAIL_PASSWORD=votre_mot_de_passe
VITE_EMAIL_FROM="ESIL Events <contact@esil-events.com>"

# Configuration API Email (si vous utilisez un service d'API externe)
VITE_EMAIL_API_URL=/api
VITE_EMAIL_API_KEY=votre_cle_api
```

### Mode Développement

En mode développement, le service simule l'envoi d'emails et propose d'ouvrir un lien `mailto:` dans votre client email par défaut.

### Mode Production

En mode production, vous avez deux options :

1. **API Backend Personnalisée** : Implémentez un serveur backend qui expose les endpoints suivants :
   - `/api/send-email` : Pour envoyer des emails
   - `/api/test-smtp-connection` : Pour tester la connexion SMTP

2. **Service d'Email Tiers** : Utilisez un service comme SendGrid, Mailgun ou Amazon SES en configurant les variables d'environnement appropriées.

## Utilisation

### Envoi Automatique d'Emails

Le système peut envoyer automatiquement des emails récapitulatifs lorsqu'une nouvelle demande de devis est créée. Cette fonctionnalité est configurable via l'interface d'administration.

### Test de Configuration

Vous pouvez tester votre configuration SMTP en utilisant la fonction de test dans l'interface d'administration. Cela vous permettra de vérifier que les emails sont correctement envoyés.

## Dépannage

### Erreurs Courantes

1. **Erreur de connexion SMTP** : Vérifiez vos identifiants SMTP et assurez-vous que le serveur est accessible.
2. **Erreur de module 'fs'** : Cette erreur indique que vous essayez d'utiliser directement `nodemailer` dans le frontend. Assurez-vous d'utiliser le service d'API intermédiaire.

### Logs

Les erreurs d'envoi d'emails sont enregistrées dans la console du navigateur. En mode production, assurez-vous de configurer une journalisation appropriée sur votre serveur backend.

## Sécurité

Pour des raisons de sécurité, les mots de passe et les clés API ne doivent jamais être exposés dans le frontend. Utilisez toujours un backend sécurisé pour gérer les informations d'identification sensibles.