```markdown
# ESIL Events v1

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/supabase-3fc889?style=for-the-badge&logo=supabase&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-black?style=for-the-badge&logo=framer&logoColor=white)

Plateforme de location de matériel événementiel et de gestion de devis pour **ESIL Events**, construite avec **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **Supabase** et **Framer Motion**.

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
- [Fonctionnalités Clés et Concepts](#fonctionnalités-clés-et-concepts)
  - [Routing](#routing)
  - [Gestion d'état (Panier)](#gestion-detat-panier)
  - [Authentification et Rôles](#authentification-et-roles)
  - [Accès Admin](#acces-admin)
  - [Gestion des Données (Services)](#gestion-des-données-services)
  - [Formulaires Complexes](#formulaires-complexes)
  - [SEO](#seo)
- [Intégration Supabase](#intégration-supabase)
- [Initialisation de la base de données (Seed)](#initialisation-de-la-base-de-donnees-seed)
- [TODO / Améliorations Possibles](#todo--améliorations-possibles)
- [Licence](#licence)

---

## Description

**ESIL Events v1** est une application web permettant aux clients de parcourir un catalogue de matériel événementiel et d'artistes, d'ajouter des produits à une demande de devis et de soumettre cette demande via un formulaire détaillé. Une section d'administration protégée permet la gestion des produits, catégories (produits et artistes), artistes, pages statiques, clients et demandes de devis.

## Fonctionnalités

### Partie Publique
- Page d'accueil avec vidéo et présentation des services (`HomePage`)
- Catalogue de produits avec navigation par catégories/sous-catégories/sous-sous-catégories (`ProductListPage`)
- Pages produits détaillées (images, description, spécifications techniques, prix) (`ProductPage`)
- Catalogue d'artistes avec navigation par catégories (`ArtistPage`)
- Pages artistes détaillées (`ArtistDetailPage`)
- Système de demande de devis (panier) (`CartContext`, `CartPage`)
- Formulaire de devis détaillé en plusieurs étapes (`CheckoutForm`)
- Formulaire de contact (`ContactPage`)
- Pages d'information (À propos, Livraison, CGV, Politique de confidentialité) (`AboutPage`, `DeliveryPage`, `TermsPage`, `PrivacyPage`)
- Page dédiée à l'agence événementielle (`EventsPage`)
- Barre de recherche avec suggestions de produits (`SearchBar`, `SearchResults`)
- Mega Menu dynamique pour la navigation des produits (basé sur les catégories en BDD) (`MegaMenu`)
- Design responsive avec Tailwind CSS
- Animations avec Framer Motion (ex: `AboutPage`)

### Partie Utilisateur (Authentifié - Actuellement orienté Admin)
- Connexion / Inscription (`LoginForm`, `RegisterForm` - enregistre un admin)
- Accès aux pages `/profile` et `/orders` (basiques, actuellement protégées par `AdminRoute`)

### Partie Administration (Protégée par `AdminRoute`)
- Tableau de bord (Dashboard) avec statistiques (`Dashboard`)
- Gestion des Produits (CRUD : création, lecture, mise à jour, suppression) avec upload d'images vers Supabase Storage (`AdminProducts`, `ProductForm`, `productService`)
- Gestion des Catégories de Produits (CRUD pour Catégories, Sous-catégories, Sous-sous-catégories) (`AdminCategories`, `categoryService`)
- Gestion des Catégories d'Artistes (CRUD) (`AdminArtistCategories`, `artistCategoryService`)
- Gestion des Artistes (CRUD) (`AdminArtists`, `artistService`)
- Gestion des Demandes de Devis (Lecture, Mise à jour du statut) (`QuoteRequestsAdmin`, `quoteRequestService`)
- Gestion des Clients (basique, à développer) (`AdminCustomers`)
- Gestion des Pages (basique, à développer) (`AdminPages`)
- Layout spécifique pour l'administration avec menu latéral (`AdminLayout`, `AdminHeader`)
- Fonctionnalité d'initialisation de la base de données (via `productService.seedDatabase`)

## Stack Technique

### Frontend
- **React 18+** : Bibliothèque JavaScript pour construire des interfaces utilisateur
- **TypeScript** : Ajoute des types statiques à JavaScript pour une meilleure maintenabilité
- **Vite** : Outil de build ultra-rapide pour les applications modernes
- **Framer Motion**: Bibliothèque d'animation pour React

### Routing
- **React Router DOM v6** : Gestion des routes côté client avec système de routes imbriquées

### Styling
- **Tailwind CSS v3** : Framework CSS utility-first pour des designs personnalisables
- **Lucide Icons** : Collection d'icônes open-source

### Backend & Base de Données
- **Supabase** : Backend-as-a-Service avec :
  - **Authentification** : Gestion des utilisateurs et des sessions
  - **Base de données PostgreSQL** : Stockage des données (produits, catégories, artistes, devis, etc.)
  - **Stockage de fichiers** : Hébergement des images produits

### Gestion d'état
- **React Context API** :
  - `CartContext` : Gestion du panier d'achat (persiste dans `localStorage`)
- **Hooks personnalisés** :
  - `useAuth` : Gestion de l'état d'authentification et du statut admin
  - `useCheckoutForm` : Gestion de l'état et de la logique du formulaire de devis

### SEO
- **React Helmet Async** : Gestion dynamique des balises meta pour le référencement (`SEO.tsx`)
- **Configuration SEO centralisée** (`config/seo.ts`)

### Qualité de code
- **ESLint** : Analyse statique du code
- **Prettier** : Formatage automatique du code (supposé, basé sur les bonnes pratiques)

### Dépendances principales (extrait)
```json
 {
  "dependencies": {
    "@supabase/supabase-js": "^2.39.7",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-helmet-async": "^2.0.5",
    "react-router-dom": "^6.22.3",
    "react-slick": "^0.30.2", // Note: react-slick seems present but maybe not heavily used in provided files? Confirm usage.
    "slick-carousel": "^1.8.1", // Note: react-slick seems present but maybe not heavily used in provided files? Confirm usage.
    "framer-motion": "latest" // Added based on AboutPage usage
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
*(Note: La dépendance `framer-motion` a été ajoutée ici car elle est utilisée dans `AboutPage.tsx`)*

## Structure du Projet

```
src
├── App.tsx             # Configuration principale des routes de l'application
├── components          # Composants UI réutilisables
│   ├── admin          # Composants spécifiques à l'interface d'administration (ex: AdminHeader)
│   ├── cart           # Composants liés au panier et au processus de devis (ItemList, Form, Summary...)
│   ├── layouts        # Composants de mise en page (ex: AdminLayout)
│   ├── AdminRoute.tsx # HOC pour protéger les routes admin
│   ├── Footer.tsx     # Pied de page global
│   ├── Header.tsx     # En-tête global (inclut navigation, recherche, menu utilisateur)
│   ├── Layout.tsx     # Mise en page principale pour les pages publiques/utilisateur
│   ├── LoginForm.tsx  # Formulaire de connexion
│   ├── MegaMenu.tsx   # Menu de navigation avancé pour les produits (dynamique)
│   ├── MobileSidebar.tsx # Menu latéral pour mobile
│   ├── ProductForm.tsx # Formulaire de création/modification de produit (complexe)
│   ├── RegisterForm.tsx# Formulaire d'inscription (actuellement pour admin)
│   ├── SearchBar.tsx  # Barre de recherche
│   ├── SearchResults.tsx# Affichage des résultats de recherche
│   ├── SEO.tsx        # Composant pour gérer les balises meta SEO
│   └── UserMenu.tsx   # Menu déroulant pour l'utilisateur connecté
├── config             # Fichiers de configuration
│   └── seo.ts         # Configuration centralisée pour le SEO
├── context            # Contextes React pour la gestion d'état global
│   └── CartContext.tsx# Contexte pour le panier d'achat
├── data               # (Vide dans l'aperçu fourni) Données statiques éventuelles
├── hooks              # Hooks personnalisés pour encapsuler la logique
│   ├── useAuth.ts     # Hook pour gérer l'état d'authentification
│   └── useCheckoutForm.ts # Hook pour gérer le formulaire de devis
├── index.css          # Fichier CSS principal (inclut Tailwind directives)
├── main.tsx           # Point d'entrée de l'application React (rendu racine)
├── pages              # Composants représentant les vues/pages de l'application
│   ├── admin         # Pages spécifiques à l'interface d'administration (Dashboard, Products, Categories...)
│   ├── AboutPage.tsx
│   ├── ArtistDetailPage.tsx
│   ├── ArtistPage.tsx
│   ├── CartPage.tsx
│   ├── ContactPage.tsx
│   ├── DeliveryPage.tsx
│   ├── EventsPage.tsx # Page "Agence événementielle"
│   ├── HomePage.tsx
│   ├── NotFoundPage.tsx
│   ├── OrdersPage.tsx # Page commandes utilisateur (basique)
│   ├── PrivacyPage.tsx
│   ├── ProductListPage.tsx # Page liste des produits (avec filtres/tri)
│   ├── ProductPage.tsx    # Page détail d'un produit
│   ├── ProfilePage.tsx  # Page profil utilisateur (basique)
│   └── TermsPage.tsx
├── services           # Modules pour interagir avec les APIs externes (Supabase)
│   ├── artistCategoryService.ts
│   ├── artistService.ts
│   ├── authService.ts # Logique d'authentification
│   ├── categoryService.ts # CRUD Catégories de produits
│   ├── productService.ts # CRUD Produits, upload image, seed
│   ├── quoteRequestService.ts # CRUD Demandes de devis
│   └── supabaseClient.ts # Initialisation du client Supabase
├── styles             # (Vide dans l'aperçu fourni) Styles CSS/SCSS spécifiques éventuels
├── types              # Définitions de types TypeScript globaux
│   └── Product.ts     # Types liés aux produits et catégories (dynamiques)
└── vite-env.d.ts      # Définitions de types pour Vite
```

## Prérequis

- Node.js (version 18.x ou supérieure recommandée)
- npm ou yarn

## Installation

1.  **Cloner le dépôt :**
    ```bash
    git clone <URL_DU_DEPOT>
    cd esil-events-v1
    ```
2.  **Installer les dépendances :**
    ```bash
    npm install
    # ou
    yarn install
    ```

## Configuration de l'environnement

1.  Créer un fichier `.env` à la racine du projet.
2.  Ajouter les clés suivantes obtenues depuis votre projet Supabase :
    ```env
    VITE_SUPABASE_URL=VOTRE_URL_SUPABASE
    VITE_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_SUPABASE
    ```
    *(Ces variables sont utilisées dans `src/services/supabaseClient.ts`)*

## Lancement du projet

### Développement
Pour lancer le serveur de développement Vite :
```bash
npm run dev
# ou
yarn dev
```
L'application sera généralement accessible sur `http://localhost:5173` (ou un port similaire indiqué par Vite).

## Fonctionnalités Clés et Concepts

### Routing
- Géré par `react-router-dom` v6.
- Configuration principale dans `src/App.tsx`.
- Utilisation de routes imbriquées (`<Outlet />` dans `src/components/Layout.tsx`).
- Routes protégées pour l'administration via `src/components/AdminRoute.tsx`.

### Gestion d'état (Panier)
- Le panier est géré globalement via `src/context/CartContext.tsx`.
- Utilise `React Context API` et persiste l'état dans le `localStorage` du navigateur.
- Le hook `useCart` permet d'accéder et de modifier le panier depuis n'importe quel composant enfant du `CartProvider`.

### Authentification et Rôles
- Gérée via **Supabase Auth**.
- Logique encapsulée dans `src/services/authService.ts`.
- Le hook `src/hooks/useAuth.ts` fournit l'état de l'utilisateur (`user`), l'état de chargement (`loading`) et un booléen indiquant si l'utilisateur est admin (`isAdminUser`).
- La détermination du rôle admin (`isAdmin`) se base sur une table `profiles` dans Supabase qui lie l'ID utilisateur à un rôle.
- Les formulaires de connexion (`LoginForm`) et d'inscription (`RegisterForm`) interagissent avec `authService`. L'inscription crée un profil `admin` par défaut.

### Accès Admin
- Les routes nécessitant des privilèges d'administrateur sont enveloppées par le composant `src/components/AdminRoute.tsx`.
- Ce composant utilise la fonction `isAdmin` de `authService` pour vérifier le rôle avant d'autoriser l'accès.
- Redirige vers `/login` si l'utilisateur n'est pas authentifié ou n'est pas admin.

### Gestion des Données (Services)
- Toute interaction avec la base de données Supabase (PostgreSQL) et le stockage Supabase est centralisée dans le répertoire `src/services/`.
- Chaque module de service (ex: `productService.ts`, `categoryService.ts`, `artistService.ts`, `quoteRequestService.ts`) expose des fonctions pour les opérations CRUD (Create, Read, Update, Delete) spécifiques à une ressource.
- Utilise le client Supabase initialisé dans `src/services/supabaseClient.ts`.

### Formulaires Complexes
- Le projet contient des formulaires avancés pour la gestion des données :
  - `src/components/ProductForm.tsx` : Gère la création/modification de produits, incluant l'upload d'images, la gestion dynamique des catégories, les spécifications techniques, les couleurs, etc.
  - `src/components/cart/CheckoutForm.tsx` : Formulaire multi-étapes pour la demande de devis, gérant de nombreuses informations client, événementielles et logistiques. Son état est géré par le hook `src/hooks/useCheckoutForm.ts`.

### SEO
- Optimisation pour les moteurs de recherche gérée par `react-helmet-async`.
- Le composant `src/components/SEO.tsx` permet de définir dynamiquement les balises `title`, `meta description`, `keywords`, `canonical`, Open Graph, etc.
- Une configuration SEO de base est centralisée dans `src/config/seo.ts`.
- Le composant `Layout` intègre `SEO` pour définir les métadonnées par défaut ou spécifiques à la page.

## Intégration Supabase
Supabase est utilisé comme backend principal pour :
- **Authentification** : Gestion des utilisateurs, connexion, inscription, sessions.
- **Base de données PostgreSQL** : Stockage structuré des données (produits, catégories, artistes, utilisateurs, devis, etc.). Les services interagissent avec les tables via l'API Supabase.
- **Stockage (Storage)** : Hébergement et gestion des images produits uploadées via le formulaire d'administration.

## Initialisation de la base de données (Seed)
- Une fonction `seedDatabase` est disponible dans `src/services/productService.ts`.
- Elle permet de peupler la base de données avec des données de produits initiales (mock data).
- *Attention : L'exécution de cette fonction nécessite une authentification et peut supprimer les produits existants liés à l'utilisateur.*

## TODO / Améliorations Possibles
- **Finaliser la gestion des devis côté admin** : Compléter le workflow de traitement des devis dans `QuoteRequestsAdmin.tsx`.
- **Finaliser les pages Profil et Commandes utilisateur** (`ProfilePage`, `OrdersPage`) : Implémenter la logique de récupération et de mise à jour des données utilisateur réelles.
- **Séparation des rôles User/Admin** : Revoir `AdminRoute` si les pages profil/commandes sont destinées aux utilisateurs non-admin. Créer un `UserRoute` si nécessaire.
- **Tests** : Ajouter des tests unitaires et d'intégration pour assurer la robustesse de l'application.
- **Optimisation des performances** : Analyser et optimiser le chargement des données, le rendu des composants, la taille des bundles.
- **Dark Mode** : Finaliser l'implémentation du toggle Dark Mode (semble commenté dans `Header.tsx`).
- **Gestion des erreurs** : Améliorer la gestion et l'affichage des erreurs côté client.
- **Internationalisation (i18n)** : Ajouter le support multi-langues si nécessaire.

## Licence
À définir.
```