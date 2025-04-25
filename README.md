
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
  - [Gestion des Catégories/Produits](#gestion-des-catégoriesproduits)
  - [Gestion des Artistes](#gestion-des-artistes)
  - [Demandes de devis](#demandes-de-devis)
  - [Announcements (Top Bar)](#announcements-top-bar)
- [Intégration Supabase](#intégration-supabase)
- [Initialisation de la base de données (Seed)](#initialisation-de-la-base-de-donnees-seed)
- [TODO / Améliorations Possibles](#todo--améliorations-possibles)
- [Licence](#licence)

---

## Description

**ESIL Events v1** est une application web permettant aux clients de parcourir un catalogue de matériel événementiel et d'artistes, d'ajouter des produits à une demande de devis et de soumettre cette demande. Une section d'administration protégée permet la gestion des produits, catégories (produits et artistes), artistes, demandes de devis, annonces et autres contenus.

## Fonctionnalités

### Partie Publique
-   Navigation dans le catalogue produits par catégories/sous-catégories via Mega Menu.
-   Fiches produits détaillées avec images, description, caractéristiques, prix.
-   Ajout d’articles au panier pour générer une demande de devis.
-   Formulaire de demande de devis complet (informations client, événement, livraison/retrait, commentaires).
-   Liste et pages de détail pour les artistes.
-   Pages informatives (À propos, Livraison, Contact, CGV, Politique de confidentialité, Agence événementielle).
-   Système de recherche de produits.
-   Barre d'annonces en haut de page.

### Partie Utilisateur (Protégée)
-   Accès aux pages Profil (`/profile`) et Commandes (`/orders`) après connexion (actuellement protégé par `AdminRoute`).

### Partie Administration
-   Interface admin protégée (`/admin/*`).
-   Tableau de bord avec statistiques basiques.
-   Gestion CRUD complète des produits (ajout, modification, suppression).
-   Gestion CRUD des catégories de produits (Catégories, Sous-catégories, Sous-sous-catégories).
-   Gestion CRUD des catégories d'artistes.
-   Gestion CRUD des artistes.
-   Affichage et gestion des demandes de devis avec détails complets.
-   Suggestion de réponse IA pour les demandes de devis (Deepseek API).
-   Gestion des annonces (Top Bar).
-   Gestion basique des clients et des pages (moins développée).

## Stack Technique

-   **Frontend** : React 18+ (avec Hooks) + TypeScript
-   **Build Tool** : Vite
-   **Styling** : Tailwind CSS v3 + `index.css` (polices) + `animations.css`
-   **UI Icons** : Lucide React
-   **Backend & Database** : Supabase (Authentication, PostgreSQL Database, Storage)
-   **Routing** : React Router DOM v6
-   **State Management** : React Context API (`CartContext`, `useAuth`)
-   **SEO** : React Helmet Async
-   **Code Quality** : ESLint (implicite via setup standard), Prettier (implicite)
-   **API Externe** : Deepseek (pour génération de réponse IA)

## Structure du Projet

```
src
├── App.tsx             # Configuration principale des routes
├── components          # Composants UI réutilisables
│   ├── admin           # Composants spécifiques à l'admin (Header, ResponseEditor...)
│   ├── cart            # Composants du panier et du checkout
│   ├── layouts         # Mises en page (Layout principal, AdminLayout)
│   └── (autres)        # Composants partagés (Header, Footer, Forms, SEO...)
├── config              # Configuration (seo.ts)
├── constants           # Constantes (images.ts)
├── context             # Contextes React (CartContext)
├── hooks               # Hooks personnalisés (useAuth, useCheckoutForm)
├── pages               # Composants de page (vues)
│   ├── admin           # Pages de la section admin (Dashboard, Products, Categories...)
│   └── (autres)        # Pages publiques (HomePage, ProductPage, CartPage, ArtistPage...)
├── services            # Logique métier, appels API/Supabase
├── styles              # Styles CSS additionnels (animations.css)
├── types               # Définitions TypeScript (Product.ts, etc.)
├── index.css           # Styles globaux Tailwind et polices
├── main.tsx            # Point d'entrée de l'application React
└── vite-env.d.ts       # Types pour Vite
```

## Prérequis

-   Node.js v18+
-   npm (v9+) ou yarn (v1.22+)

## Installation

```bash
git clone <URL_DU_DEPOT>
cd esil-events-v1
npm install
# ou
yarn install
```

## Configuration de l'environnement

Créer un fichier `.env` à la racine du projet avec les variables suivantes :

```env
VITE_SUPABASE_URL=VOTRE_URL_SUPABASE
VITE_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_SUPABASE
VITE_DEEPSEEK_API_KEY=VOTRE_CLE_API_DEEPSEEK # Requis pour la génération de réponses IA
```

Remplacez les valeurs par vos clés Supabase et Deepseek.

## Lancement du projet

### Développement

```bash
npm run dev
# ou
yarn dev
```

Le serveur de développement démarrera généralement sur `http://localhost:5173`.

### Production

1.  **Build:**
    ```bash
    npm run build
    # ou
    yarn build
    ```
    Ceci crée un répertoire `dist` avec les fichiers optimisés pour la production.

2.  **Preview (local):**
    ```bash
    npm run preview
    # ou
    yarn preview
    ```

3.  **Déploiement:** Déployez le contenu du répertoire `dist` sur votre plateforme d'hébergement (Vercel, Netlify, serveur statique, etc.).

## Fonctionnalités Clés et Concepts

### Routing

-   Géré par `react-router-dom` v6 dans `App.tsx`.
-   Utilisation de `Layout` pour les routes publiques/utilisateurs et `AdminLayout` pour les routes admin.
-   `AdminRoute` protège l'accès aux sections nécessitant des droits admin.
-   `AdminRoutes` regroupe les routes spécifiques à l'administration.

### Gestion d'état (Panier)

-   `CartContext` (`src/context/CartContext.tsx`) gère l'état du panier.
-   Les fonctions `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart` sont fournies par le contexte.
-   Le contenu du panier est persisté dans `localStorage`.

### Authentification

-   Gérée via `supabase.auth` dans `src/services/authService.ts`.
-   Le hook `useAuth` (`src/hooks/useAuth.ts`) fournit l'état de l'utilisateur et son statut admin.
-   Les composants `LoginForm.tsx` et `RegisterForm.tsx` gèrent la connexion/inscription (inscription crée un profil admin).

### Accès Admin

-   Le composant `AdminRoute.tsx` vérifie si l'utilisateur est admin en utilisant `isAdmin()` du `authService`.
-   Les règles de sécurité au niveau des lignes (RLS) dans Supabase devraient être configurées pour protéger les données sensibles (produits, commandes, clients) contre les accès non autorisés.

### SEO

-   Le composant `SEO.tsx` (`src/components/SEO.tsx`) utilise `react-helmet-async` pour gérer dynamiquement les balises `<head>` (titre, description, meta tags Open Graph, etc.).
-   Configuration centralisée dans `src/config/seo.ts`.

### Gestion des Catégories/Produits

-   Le service `categoryService.ts` gère les opérations CRUD pour les catégories, sous-catégories et sous-sous-catégories.
-   Le service `productService.ts` gère les opérations CRUD pour les produits, y compris l'upload d'images vers Supabase Storage.
-   `ProductForm.tsx` est un composant réutilisable pour créer et modifier des produits, incluant la gestion dynamique des catégories/sous-catégories chargées depuis la base de données.
-   La page `AdminProducts.tsx` affiche la liste des produits avec pagination, recherche et filtres (basiques).
-   La page `AdminCategories.tsx` permet de gérer la hiérarchie des catégories.

### Gestion des Artistes

-   `artistService.ts` et `artistCategoryService.ts` gèrent les données des artistes et de leurs catégories.
-   Les pages `AdminArtists.tsx` et `AdminArtistCategories.tsx` permettent leur gestion.
-   Les pages publiques `ArtistPage.tsx` et `ArtistDetailPage.tsx` affichent les artistes aux visiteurs.

### Demandes de devis

-   Le processus commence par l'ajout de produits au panier (`CartContext`).
-   Le composant `CheckoutForm.tsx` collecte toutes les informations nécessaires (client, événement, livraison, etc.).
-   `quoteRequestService.ts` formate et envoie les données à la table `quote_requests` de Supabase.
-   La page `AdminQuoteRequests.tsx` permet aux administrateurs de visualiser, filtrer, trier et gérer les demandes.
-   Intégration avec l'API Deepseek pour suggérer des réponses aux demandes de devis.
-   Possibilité de modifier le statut d'une demande (`pending`, `approved`, `rejected`, `completed`).

### Announcements (Top Bar)

-   Le composant `TopBar.tsx` affiche les annonces actives.
-   `localStorageAnnouncementService.ts` gère le stockage et la récupération des annonces via localStorage.
-   La page `AdminAnnouncements.tsx` permet la gestion CRUD des annonces.

## Intégration Supabase

-   **Authentication:** Gestion des utilisateurs et des sessions.
-   **Database (PostgreSQL):** Stockage des données pour les produits, catégories, artistes, demandes de devis, profils utilisateurs, etc.
-   **Storage:** Hébergement des images des produits.
-   **Row Level Security (RLS):** Essentiel pour sécuriser l'accès aux données en fonction des rôles utilisateurs (non implémenté dans le code fourni mais fortement recommandé).
-   **Client Supabase:** configuré dans `src/services/supabaseClient.ts`.

## Initialisation de la base de données (Seed)

-   Une fonction `seedDatabase()` existe dans `src/services/productService.ts` pour potentiellement remplir la base de données avec des données de produits de test (utilise `mockProducts`). Cette fonction n'est pas appelée automatiquement et nécessiterait un mécanisme pour être déclenchée (par exemple, un bouton dans l'interface admin ou un script séparé).

## TODO / Améliorations Possibles

-   **Gestion des Rôles:** Affiner la distinction entre utilisateur connecté standard et administrateur. `AdminRoute` pourrait être renommé ou une `UserRoute` ajoutée si des fonctionnalités non-admin nécessitent une connexion.
-   **Profil Utilisateur:** Implémenter la sauvegarde des modifications du profil utilisateur (`ProfilePage.tsx`).
-   **Commandes Utilisateur:** Afficher les détails réels des commandes/devis dans `OrdersPage.tsx`.
-   **Sécurité Supabase:** Mettre en place des politiques RLS robustes pour toutes les tables.
-   **Gestion des Images:** Ajouter la suppression des images du Supabase Storage lors de la suppression d'un produit ou d'une image spécifique.
-   **Gestion des Erreurs:** Améliorer la gestion et l'affichage des erreurs pour l'utilisateur final (ex: Toasts/Notifications).
-   **Formulaires:** Ajouter une validation plus robuste côté client (ex: avec Zod ou React Hook Form).
-   **Optimisations:** Code splitting, optimisation des images, amélioration des performances de chargement.
-   **Tests:** Ajouter des tests unitaires et d'intégration (ex: avec Vitest, React Testing Library).
-   **Admin UI/UX:** Améliorer l'interface admin (ex: drag-and-drop pour réordonner, éditeurs plus riches).
-   **Export Devis:** Fonctionnalité d'export en PDF pour les demandes de devis côté admin.
-   **Internationalisation (i18n):** Si nécessaire, rendre l'application multilingue.

