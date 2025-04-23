# Serveur API pour Esil Events

Ce serveur Express gère les fonctionnalités d'API pour l'application Esil Events, notamment l'envoi d'emails pour les devis.

## Configuration

1. Assurez-vous que les variables d'environnement sont correctement configurées dans le fichier `.env` à la racine du projet.

2. Installez les dépendances du serveur :

```bash
cd server
npm install
```

## Démarrage du serveur

Pour démarrer le serveur en mode développement :

```bash
cd server
npm run dev
```

Pour démarrer le serveur en mode production :

```bash
cd server
npm start
```

Le serveur démarrera par défaut sur le port 3001. Vous pouvez modifier ce port en définissant une variable d'environnement `PORT` dans le fichier `.env`.

## Endpoints API

### POST /api/send-quote

Envoie un devis par email.

**Corps de la requête :**
```json
{
  "formData": {
    "customerType": "professional",
    "company": "Nom de l'entreprise",
    "firstName": "Prénom",
    "lastName": "Nom",
    "email": "email@example.com",
    "phone": "0123456789",
    "billingAddress": "Adresse de facturation",
    "postalCode": "75000",
    "city": "Ville",
    "eventDate": "2023-12-31",
    "eventStartTime": "18:00",
    "eventEndTime": "23:00",
    "guestCount": 50,
    "eventLocation": "indoor",
    "description": "Description de l'événement",
    "deliveryType": "pickup",
    "pickupDate": "2023-12-30",
    "comments": "Commentaires additionnels"
  },
  "items": [
    {
      "id": "1",
      "name": "Produit 1",
      "quantity": 2,
      "price": 100
    }
  ]
}
```

**Réponse en cas de succès :**
```json
{
  "success": true
}
```

**Réponse en cas d'erreur :**
```json
{
  "success": false,
  "error": "Message d'erreur"
}
```