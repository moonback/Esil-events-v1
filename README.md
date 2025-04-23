
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
  - [Demandes de devis](#demandes-de-devis)
- [Intégration Supabase](#intégration-supabase)
- [Initialisation de la base de données (Seed)](#initialisation-de-la-base-de-donnees-seed)
- [TODO / Améliorations Possibles](#todo--améliorations-possibles)
- [Licence](#licence)

---

## Description

**ESIL Events v1** est une application web permettant aux clients de parcourir un catalogue de matériel événementiel, d'ajouter des produits à une demande de devis et de soumettre cette demande. Une section d'administration protégée permet la gestion des produits, catégories, pages et clients.

## Fonctionnalités

### Partie Publique
- Navigation dans le catalogue par catégories/sous-catégories
- Fiches produits avec images, détails, et prix
- Ajout d’articles au panier pour demander un devis
- Formulaire de demande de devis avec détails de livraison et retrait
- Système de recherche et Mega Menu
- Pages informatives (CGV, À propos, etc.)

### Partie Authentifiée
- Authentification via Supabase (initialement admin)
- Historique basique des demandes de devis

### Partie Administration
- Interface admin protégée
- Gestion CRUD des produits, catégories, clients et pages
- Affichage des demandes de devis avec tous les détails (client, livraison, facturation, événement)
- Accès limité aux admins via RLS Supabase

## Stack Technique

- **Frontend** : React + TypeScript + Vite
- **Styling** : Tailwind CSS + Lucide Icons
- **Backend** : Supabase (auth, DB PostgreSQL, stockage)
- **Routing** : React Router DOM v6
- **State** : React Context API (panier, auth)
- **SEO** : React Helmet Async
- **Code Quality** : ESLint + Prettier

## Structure du Projet

```
src
├── App.tsx
├── components
│   ├── admin
│   ├── layouts
│   └── shared
├── context
├── hooks
├── pages
│   ├── admin
│   ├── public
│   └── user
├── services
├── types
└── config
```

## Prérequis

- Node.js v18+
- npm ou yarn

## Installation

```bash
git clone <URL_DU_DEPOT>
cd esil-events-v1
npm install
# ou
yarn install
```

## Configuration de l'environnement

Créer un fichier `.env` :

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

Géré par `react-router-dom` avec des routes imbriquées (`AdminRoute`, etc.).

### Gestion d'état (Panier)

Utilise `CartContext` + persistance `localStorage`.

### Authentification

Par Supabase Auth. Accès admin restreint via rôle.

### Accès Admin

Routes protégées + logique RLS côté Supabase.

### SEO

Ajout dynamique de balises meta via `react-helmet-async`.

### Demandes de devis

- Création de devis même pour utilisateur anonyme
- Saisie des infos client, événement, livraison/retrait, commentaires
- Enregistrement dans Supabase avec `user_id` et métadonnées
- Admin : vue liste + détails complets de chaque devis

## Intégration Supabase

- Auth utilisateur
- Stockage fichiers
- Tables : `products`, `categories`, `quote_requests`, `clients`, etc.
- RLS pour sécurité des données sensibles

## Initialisation de la base de données (Seed)

```ts
await seedDatabase() // Appel depuis `productService.ts`
```

## TODO / Améliorations Possibles

- Finaliser le tableau de bord utilisateur
- Export PDF pour les devis
- Ajout de notifications temps réel (supabase + toasts)
- Ajout de tests unitaires (Jest/React Testing Library)
- Internationalisation (i18n)

## Licence

À définir
