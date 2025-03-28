# ESIL Events v1

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/supabase-3fc889?style=for-the-badge&logo=supabase&logoColor=white)

Plateforme de location de matériel événementiel et de gestion de devis pour **ESIL Events**, construite avec **React**, **TypeScript**, **Vite**, **Tailwind CSS** et **Supabase**.

## Table des matières

- [Description](#description)
- [Fonctionnalités](#fonctionnalités)
- [Stack Technique](#stack-technique)
- [Structure du Projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration de l'environnement](#configuration-de-lenvironnement)
- [Lancement du projet](#lancement-du-projet)
  - [Développement](#développement)
  - [Production](#production)
- [Fonctionnalités Clés et Concepts](#fonctionnalités-clés-et-concepts)
  - [Routing](#routing)
  - [Gestion d'état (Panier)](#gestion-detat-panier)
  - [Authentification](#authentification)
  - [Accès Admin](#acces-admin)
  - [SEO](#seo)
- [Intégration Supabase](#intégration-supabase)
- [Initialisation de la base de données (Seed)](#initialisation-de-la-base-de-donnees-seed)
- [TODO / Améliorations Possibles](#todo--améliorations-possibles)
- [Licence](#licence)

---

## Description

**ESIL Events v1** est une application web permettant aux clients de parcourir un catalogue de matériel événementiel, d'ajouter des produits à une demande de devis et de soumettre cette demande. Une section d'administration protégée permet la gestion des produits, catégories, pages et clients.

## Fonctionnalités

### Partie Publique
- Page d'accueil avec vidéo et présentation des services
- Catalogue de produits avec navigation par catégories/sous-catégories
- Pages produits détaillées (images, description, spécifications techniques, prix)
- Système de demande de devis (panier)
- Formulaire de contact
- Pages d'information (À propos, Livraison, CGV, Politique de confidentialité)
- Barre de recherche avec suggestions
- Mega Menu pour une navigation avancée
- Design responsive avec Tailwind CSS

### Partie Utilisateur (Authentifié)
- Connexion / Inscription (initialement pour admin)
- Accès à la page de profil (basique)
- Accès à l'historique des commandes/devis (basique)

### Partie Administration (Protégée)
- Tableau de bord (Dashboard)
- Gestion des Produits (CRUD : création, lecture, mise à jour, suppression) avec upload d'images
- Gestion des Catégories (Catégories, Sous-catégories, Sous-sous-catégories)
- Gestion des Pages (basique)
- Gestion des Clients (basique)
- Route protégée pour l'accès admin (`AdminRoute`)
- Fonctionnalité d'initialisation de la base de données (`seedDatabase`)

## Stack Technique

### Frontend
- **React 18+** : Bibliothèque JavaScript pour construire des interfaces utilisateur
- **TypeScript** : Ajoute des types statiques à JavaScript pour une meilleure maintenabilité
- **Vite** : Outil de build ultra-rapide pour les applications modernes

### Routing
- **React Router DOM v6** : Gestion des routes côté client avec système de nested routes

### Styling
- **Tailwind CSS v3** : Framework CSS utility-first pour des designs personnalisables
- **Lucide Icons** : Collection d'icônes open-source

### Backend
- **Supabase** : Backend-as-a-service avec:
  - Authentification
  - Base de données PostgreSQL en temps réel
  - Stockage de fichiers

### Gestion d'état
- **React Context API** : Gestion d'état global pour:
  - `CartContext` : Panier d'achat
  - `useAuth` : Authentification utilisateur

### SEO
- **React Helmet Async** : Gestion dynamique des balises meta pour le référencement

### Qualité de code
- **ESLint** : Analyse statique du code
- **Prettier** : Formatage automatique du code

### Dépendances principales
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.7",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-helmet-async": "^2.0.5",
    "react-router-dom": "^6.22.3",
    "react-slick": "^0.30.2",
    "slick-carousel": "^1.8.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@types/react-slick": "^0.23.13",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2"
  }
}
```

## Structure du Projet

```
src
├── App.tsx             # Configuration principale des routes
├── components          # Composants réutilisables UI
│   ├── admin          # Composants spécifiques à l'admin
│   ├── layouts        # Layouts spécifiques (ex: AdminLayout)
│   └── ...           # Autres composants (Header, Footer, Forms, etc.)
├── config             # Fichiers de configuration (ex: SEO)
├── context            # Contextes React (ex: CartContext)
├── hooks              # Hooks personnalisés (ex: useAuth)
├── pages              # Composants de page (vues)
│   ├── admin         # Pages spécifiques à l'administration
│   └── ...           # Pages publiques et utilisateur
├── services           # Logique métier, appels API/Supabase
├── types              # Définitions de types TypeScript
└── vite-env.d.ts      # Définitions de types pour Vite
```

## Prérequis

- Node.js (version 18.x ou supérieure recommandée)
- npm ou yarn

## Installation

1. **Cloner le dépôt :**
   ```bash
   git clone <URL_DU_DEPOT>
   cd esil-events-v1
   ```
2. **Installer les dépendances :**
   ```bash
   npm install
   # ou
   yarn install
   ```

## Configuration de l'environnement

1. Créer un fichier `.env` à la racine du projet.
2. Ajouter les clés suivantes obtenues depuis votre projet Supabase :
   ```env
   VITE_SUPABASE_URL=VOTRE_URL_SUPABASE
   VITE_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_SUPABASE
   ```

## Lancement du projet

### Développement
```bash
npm run dev
# ou
yarn dev
```

## Fonctionnalités Clés et Concepts

### Routing
Géré par `react-router-dom`. Les routes principales sont définies dans `src/App.tsx`.

### Gestion d'état (Panier)
Géré via `CartContext.tsx`, persiste dans le `localStorage`.

### Authentification
Gérée via Supabase Auth (`useAuth.ts`).

### Accès Admin
Protégé par `AdminRoute.tsx`, vérification du rôle `admin`.

### SEO
Assuré via `react-helmet-async` (`SEO.tsx`).

## Intégration Supabase
Utilisé pour :
- Authentification
- Base de données PostgreSQL
- Stockage des images

## Initialisation de la base de données (Seed)
Disponible dans `productService.ts`.

## TODO / Améliorations Possibles
- Implémentation complète de la soumission des devis
- Finalisation des pages Profil et Commandes utilisateur
- Tests unitaires et intégration
- Optimisation des performances

## Licence
À définir.

