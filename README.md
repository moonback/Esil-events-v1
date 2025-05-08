```markdown
# ESIL Events v1 🚀

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/supabase-3fc889?style=for-the-badge&logo=supabase&logoColor=white)
![Lucide Icons](https://img.shields.io/badge/Lucide-Icons-orange?style=for-the-badge&logo=lucide)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer-Motion-black?style=for-the-badge&logo=framer&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-blue?style=for-the-badge&logo=recharts)

Plateforme complète de **location de matériel événementiel**, **gestion de devis**, **présentation de réalisations**, et **outils SEO avancés** pour **ESIL Events**. Développée avec une stack moderne incluant **React**, **TypeScript**, **Vite**, **Tailwind CSS** et **Supabase**.

---

## 📝 Table des matières

- [Description](#description-)
- [Fonctionnalités ✨](#fonctionnalités-)
- [Stack Technique 🛠️](#stack-technique-)
- [Structure du Projet 📂](#structure-du-projet-)
- [Prérequis 📋](#prérequis-)
- [Installation ⚙️](#installation-)
- [Configuration de l'environnement 🔑](#configuration-de-lenvironnement-)
- [Lancement du projet ▶️](#lancement-du-projet-)
  - [Développement](#développement-)
  - [Production](#production-)
- [Fonctionnalités Clés et Concepts 💡](#fonctionnalités-clés-et-concepts-)
  - [Routing](#routing)
  - [Gestion d'état (Panier)](#gestion-detat-panier-)
  - [Authentification](#authentification-)
  - [Accès Admin](#acces-admin-)
  - [Gestion des Produits/Catégories](#gestion-des-produitscatégories-)
  - [Gestion des Artistes](#gestion-des-artistes-)
  - [Gestion des Réalisations](#gestion-des-réalisations-)
  - [Demandes de devis](#demandes-de-devis-)
  - [Génération de contenu IA](#génération-de-contenu-ia-)
  - [Outils SEO](#outils-seo-)
  - [Gestion des Annonces](#gestion-des-annonces-)
  - [Gestion de la Newsletter](#gestion-de-la-newsletter-)
  - [Gestion du Sitemap](#gestion-du-sitemap-)
- [Intégration Supabase ☁️](#intégration-supabase-)
- [Initialisation de la base de données (Seed) 🌱](#initialisation-de-la-base-de-donnees-seed-)
- [TODO / Améliorations Possibles 🔮](#todo--améliorations-possibles-)
- [Licence 📜](#licence-)

---

## Description 📄

**ESIL Events v1** est une application web robuste conçue pour répondre aux besoins d'une entreprise de location de matériel événementiel et d'organisation d'événements. Elle offre une interface publique élégante pour la découverte de produits, d'artistes et de réalisations, ainsi qu'une section d'administration complète et sécurisée pour la gestion de l'ensemble du contenu, des devis, des clients, et des outils marketing/SEO.

---

## Fonctionnalités ✨

### Partie Publique
-   🛍️ **Catalogue Produits :** Navigation intuitive par catégories/sous-catégories via Mega Menu, recherche avancée.
-   📄 **Fiches Produits :** Détails complets : images multiples, description riche, caractéristiques techniques, couleurs, prix (HT/TTC), disponibilité.
-   🛒 **Panier Devis :** Ajout d'articles et gestion des quantités pour générer une demande de devis détaillée.
-   📝 **Formulaire Devis :** Collecte complète des informations client, événement, livraison/retrait, commentaires via un processus de checkout guidé.
-   🎤 **Catalogue Artistes :** Présentation des artistes par catégorie, avec pages de détail individuelles.
-   🌟 **Galerie Réalisations :** Mise en avant des projets passés avec photos, descriptions, objectifs et témoignages.
-   ℹ️ **Pages Informatites :** À propos (avec équipe), Livraison (détail des formules), Contact, CGU, Politique de confidentialité, Agence événementielle.
-   📢 **Annonces :** Barre d'annonces dynamique et configurable en haut de page.
-   🎨 **Design Moderne :** Interface utilisateur soignée avec animations (Framer Motion) et micro-interactions.

### Partie Utilisateur (Protégée)
-   👤 **Profil :** Accès à la page `/profile` (actuellement protégé par `AdminRoute`, potentiellement à adapter).
-   📦 **Commandes :** Accès à la page `/orders` (actuellement protégé par `AdminRoute`, potentiellement à adapter).

### Partie Administration
-   🛡️ **Interface Sécurisée :** Accès à `/admin/*` protégé par authentification Supabase et rôle admin (`AdminRoute`).
-   📊 **Tableau de Bord :** Vue d'ensemble avec statistiques clés (produits, catégories, devis, etc.) et actions rapides.
-   🔩 **Gestion Produits :** CRUD complet : gestion images (upload Supabase Storage), couleurs, specs techniques, SEO dédié (titre, desc, keywords), documentation, vidéo, gestion de l'image principale.
-   📚 **Gestion Catégories (Produits) :** CRUD complet pour la hiérarchie Catégories → Sous-catégories → Sous-sous-catégories, avec gestion de l'ordre et SEO intégré.
-   🎭 **Gestion Artistes :** CRUD pour les artistes et leurs catégories respectives.
-   🏆 **Gestion Réalisations :** CRUD pour les projets événementiels (titre, lieu, objectif, mission, images, catégorie, date, témoignage).
-   📋 **Gestion Devis :** Interface avancée : visualisation liste/détails, filtrage/tri (statut, client, date, etc.), mise à jour du statut, export PDF, impression.
-   🤖 **Génération Contenu IA (Google Gemini) :**
    *   **Réponse Devis :** Suggestion de réponses personnalisées pour les demandes de devis.
    *   **Description Produit :** Génération automatique de descriptions produits optimisées.
    *   **Contenu SEO (Produits/Catégories) :** Génération de titre, description et mots-clés SEO.
    *   **Contenu Newsletter :** Génération de contenu HTML pour les campagnes email.
-   🔍 **Outils SEO :**
    *   **Générateur Mots-clés :** Outil IA pour trouver des mots-clés pertinents (avec options avancées, sauvegarde BDD).
    *   **Suivi Positions :** Surveillance du classement Google pour des mots-clés ciblés (via API SerpApi + proxy).
-   📣 **Gestion Annonces :** CRUD pour les annonces de la Top Bar (message, lien, dates, couleurs, activation).
-   📧 **Gestion Newsletter :** Visualisation des abonnés, désabonnement, outil d'envoi de newsletter avec éditeur/aperçu et génération de contenu IA.
-   🗺️ **Gestion Sitemap :** Génération, édition et sauvegarde du fichier `sitemap.xml` (incluant pages statiques et produits).
-   ⚙️ **Configuration Email :** Paramétrage et test de la configuration SMTP (via API backend non incluse).
-   👥 **Gestion Clients (Basique) :** Interface pour visualiser les clients (peut être étendue).
-   📄 **Gestion Pages (Basique) :** Interface pour gérer le contenu de certaines pages (peut être étendue).

---

## Stack Technique 🛠️

-   **Frontend** : React 18+ (Hooks) + TypeScript
-   **Build Tool & Dev Server** : Vite
-   **Styling** : Tailwind CSS v3 + CSS personnalisé (`index.css`, `animations.css`, `map.css`, etc.)
-   **Routing** : React Router DOM v6
-   **UI Components & Icons** : Lucide React
-   **Animations** : Framer Motion
-   **Charts** : Recharts (pour historique SEO)
-   **State Management** : React Context API (`CartContext`, `useAuth`)
-   **Backend & Database** : Supabase (Authentication, PostgreSQL Database, Storage)
-   **SEO Management** : React Helmet Async
-   **API Externe (IA)** : Google Gemini API (pour génération de contenu)
-   **API Externe (SEO)** : SerpApi (pour suivi de positions, via proxy Node.js/Express local)
-   **Emailing** : `emailService.ts` (conçu pour interagir avec une API backend utilisant Nodemailer - *API non fournie*)
-   **Code Quality** : ESLint, Prettier (via setup standard)
-   **Utilitaires** : `jsPDF`, `html2canvas` (pour export PDF devis)

---

## Structure du Projet 📂

```plaintext
src/
├── App.tsx                     # Configuration principale des routes React Router v6
├── components/                 # Composants UI réutilisables
│   ├── admin/                  # Composants spécifiques à l'interface d'administration
│   │   ├── quoteRequests/      # Composants pour la gestion des devis (liste, détails, actions, IA...)
│   │   ├── AdminHeader.tsx     # En-tête de l'admin
│   │   ├── KeywordGeneratorTool.tsx # Outil de génération de mots-clés
│   │   ├── KeywordRankingTool.tsx # Outil de suivi de positions SEO
│   │   ├── ProductFilterPanel.tsx # Panneau de filtres produits (admin)
│   │   ├── ResponseEditor.tsx  # Éditeur de réponse (devis)
│   │   └── StatCard.tsx        # Carte statistique pour le dashboard
│   ├── cart/                   # Composants liés au panier et au processus de devis
│   ├── layouts/                # Mises en page globales (Public, Admin)
│   ├── product-list/           # Composants pour l'affichage des listes de produits publiques
│   ├── realization/            # Composants pour la section Réalisations
│   ├── AdminRoute.tsx          # HOC pour protéger les routes admin
│   ├── AdminRoutes.tsx         # Regroupement des routes admin
│   ├── Footer.tsx              # Pied de page public
│   ├── Header.tsx              # En-tête public (avec MegaMenu, SearchBar, UserMenu...)
│   ├── LoginForm.tsx           # Formulaire de connexion
│   ├── MegaMenu.tsx            # Menu de navigation principal avec catégories
│   ├── MobileSidebar.tsx       # Menu latéral pour mobile
│   ├── ProductDescriptionGenerator.tsx # Bouton/logique pour générer description produit via IA
│   ├── ProductForm.tsx         # Formulaire CRUD pour les produits (admin)
│   ├── RegisterForm.tsx        # Formulaire d'inscription (crée un admin par défaut)
│   ├── SearchBar.tsx           # Barre de recherche globale
│   ├── SearchResults.tsx       # Affichage des résultats de recherche
│   ├── SEO.tsx                 # Composant pour gérer les balises meta SEO
│   ├── SeoContentGenerator.tsx # Bouton/logique pour générer contenu SEO via IA
│   └── TopBar.tsx              # Barre d'annonces en haut de page
├── config/                     # Fichiers de configuration
│   ├── googleSearchApi.ts      # Configuration pour l'API SerpApi
│   └── seo.ts                  # Configuration SEO par défaut
├── constants/                  # Constantes globales (ex: images par défaut)
├── context/                    # Contextes React (ex: CartContext)
├── hooks/                      # Hooks personnalisés (auth, filtres, pagination, actions...)
├── pages/                      # Composants de page (vues principales)
│   ├── admin/                  # Pages spécifiques à l'administration (Dashboard, Products, Categories, etc.)
│   └── (autres)                # Pages publiques (HomePage, ProductPage, CartPage, Contact, etc.)
├── services/                   # Logique métier et appels API/Supabase
│   ├── aiResponseService.ts    # Service pour générer réponses devis (Gemini)
│   ├── announcementService.ts  # CRUD Annonces (Supabase)
│   ├── artistService.ts        # CRUD Artistes
│   ├── authService.ts          # Authentification Supabase
│   ├── categoryService.ts      # CRUD Catégories (hiérarchique)
│   ├── contactService.ts       # Envoi email formulaire contact (via emailService)
│   ├── emailService.ts         # Interface pour l'envoi d'emails (nécessite API backend)
│   ├── keywordGenerationService.ts # Génération mots-clés (Gemini)
│   ├── keywordRankingService.ts  # Suivi positions (SerpApi) + Sauvegarde BDD
│   ├── newsletterContentService.ts # Génération contenu newsletter (Gemini)
│   ├── newsletterService.ts    # Gestion abonnés (Supabase) + Envoi (via emailService)
│   ├── productDescriptionService.ts # Génération description produit (Gemini)
│   ├── productSeoService.ts    # Génération SEO produit (Gemini)
│   ├── productService.ts       # CRUD Produits, upload images
│   ├── quoteRequestService.ts  # CRUD Demandes de devis
│   ├── realizationService.ts   # CRUD Réalisations
│   ├── savedKeywordsService.ts # CRUD Mots-clés sauvegardés (BDD)
│   ├── seoContentService.ts    # Génération SEO catégories (Gemini)
│   ├── sitemapService.ts       # Génération/Sauvegarde Sitemap (via API backend)
│   ├── storageService.ts       # Upload/Delete fichiers Supabase Storage
│   └── supabaseClient.ts       # Initialisation client Supabase
├── styles/                     # Fichiers CSS additionnels
├── types/                      # Définitions TypeScript globales (ex: Product.ts)
├── utils/                      # Fonctions utilitaires (ex: slugUtils.ts)
├── index.css                   # Styles globaux Tailwind & polices
├── main.tsx                    # Point d'entrée de l'application React
└── vite-env.d.ts               # Types pour Vite
```

---

## Prérequis 📋

-   Node.js : v18.x ou supérieur
-   npm : v9.x ou supérieur (ou Yarn v1.22+)

---

## Installation ⚙️

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

---

## Configuration de l'environnement 🔑

Créez un fichier `.env` à la racine du projet et ajoutez les variables suivantes :

```env
# Supabase Configuration
VITE_SUPABASE_URL=VOTRE_URL_SUPABASE
VITE_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_SUPABASE

# Google Gemini API (pour génération de contenu IA)
VITE_GOOGLE_GEMINI_API_KEY=VOTRE_CLE_API_GOOGLE_GEMINI

# SerpApi (pour le suivi des positions SEO)
VITE_SERP_API_KEY=VOTRE_CLE_API_SERPAPI

# --- Configuration SMTP (pour envoi d'emails via API backend) ---
# Ces variables sont utilisées par le service `emailService.ts`.
# L'API backend n'est pas fournie dans ce repo et doit être développée séparément.
# Si vous mettez en place une API backend, configurez ces variables.
VITE_SMTP_HOST=votre_serveur_smtp
VITE_SMTP_PORT=votre_port_smtp
VITE_SMTP_SECURE=true # ou false
VITE_SMTP_USER=votre_utilisateur_smtp
VITE_SMTP_PASS=votre_mot_de_passe_smtp
VITE_SMTP_FROM=votre_adresse_expediteur # Email expéditeur par défaut
```

Remplacez les placeholders par vos clés et informations réelles.

---

## Lancement du projet ▶️

### Développement 💻

1.  **(Optionnel mais recommandé pour le suivi SEO) Démarrer le serveur proxy SerpApi :**
    *   Assurez-vous que `VITE_SERP_API_KEY` est configurée dans `.env`.
    *   Ouvrez un terminal séparé à la racine du projet et exécutez :
        ```bash
        npm run server
        ```
    *   Laissez ce serveur tourner pendant que vous développez. Il écoute sur `http://localhost:3001`.

2.  **Démarrer le serveur de développement Vite :**
    ```bash
    npm run dev
    # ou
    yarn dev
    ```
    L'application sera généralement disponible sur `http://localhost:5173`.

### Production 🏭

1.  **Build de l'application :**
    ```bash
    npm run build
    # ou
    yarn build
    ```
    Ceci génère le répertoire `dist` optimisé pour la production.

2.  **Prévisualisation locale (optionnel) :**
    ```bash
    npm run preview
    # ou
    yarn preview
    ```

3.  **Déploiement :**
    *   Déployez le contenu du répertoire `dist` sur votre plateforme d'hébergement (Vercel, Netlify, serveur statique...).
    *   Assurez-vous que les variables d'environnement (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_GEMINI_API_KEY`, `VITE_SERP_API_KEY`) sont correctement configurées dans les paramètres de votre hébergeur.
    *   **Important :** Le serveur proxy SerpApi (`npm run server`) n'est conçu que pour le développement local. Pour la production, vous devrez soit déployer ce serveur proxy séparément (sur une plateforme comme Render, Heroku, etc.), soit trouver une autre solution pour gérer les appels SerpApi (ex: fonction serverless).

---

## Fonctionnalités Clés et Concepts 💡

### Routing
-   Utilisation de `react-router-dom` v6 configuré dans `App.tsx`.
-   Layouts distincts : `<Layout>` pour les pages publiques/utilisateur, `<AdminLayout>` pour l'administration.
-   Protection des routes admin via le composant `<AdminRoute>` qui utilise le hook `useAuth`.
-   Regroupement des routes admin dans `<AdminRoutes>` pour une meilleure organisation.

### Gestion d'état (Panier) 🛒
-   `CartContext` (`src/context/CartContext.tsx`) gère l'état du panier.
-   Utilisation de l'`localStorage` pour la persistance du panier entre les sessions.

### Authentification 🔐
-   Gérée par Supabase Auth (`src/services/authService.ts`).
-   Le hook `useAuth` fournit l'état `user` et `isAdminUser`.
-   Les composants `LoginForm` et `RegisterForm` gèrent l'accès. L'inscription crée par défaut un profil `admin`.

### Accès Admin 🛡️
-   `<AdminRoute>` vérifie le rôle admin via `isAdmin()` du `authService`.
-   **Sécurité Essentielle :** La mise en place de **Row Level Security (RLS)** dans Supabase est **critique** pour protéger les données sensibles (produits, devis, clients...) contre les accès non autorisés, même si la protection front-end est contournée.

### Gestion des Produits/Catégories 📦
-   Services dédiés (`productService.ts`, `categoryService.ts`) pour le CRUD complet.
-   Gestion hiérarchique des catégories (Catégorie → Sous-catégorie → Sous-sous-catégorie) dans l'admin.
-   `ProductForm.tsx` permet la création/modification avec upload d'images vers Supabase Storage, gestion des couleurs, specs, SEO, etc.
-   `AdminProducts.tsx` offre une liste paginée et filtrable des produits.
-   Génération de slugs automatique et utilitaire de régénération des slugs manquants (`productService.ts`, `utils/slugUtils.ts`).

### Gestion des Artistes 🎤
-   CRUD complet pour les artistes et leurs catégories via les services et pages admin dédiées (`artistService.ts`, `artistCategoryService.ts`, `AdminArtists.tsx`, `AdminArtistCategories.tsx`).
-   Affichage public sur `ArtistPage.tsx` et `ArtistDetailPage.tsx`.

### Gestion des Réalisations 🌟
-   CRUD pour les projets événementiels (`realizationService.ts`, `AdminRealizations.tsx`).
-   Affichage public via une galerie filtrable (`RealisationPage.tsx`) et une modale de détails (`RealizationDetails.tsx`).

### Demandes de devis 📋
-   Flux utilisateur : Panier → Formulaire de checkout complet (`CheckoutForm.tsx`) → Soumission (`quoteRequestService.ts`).
-   Stockage dans Supabase et envoi d'emails de confirmation/notification via `emailService.ts` (nécessite API backend).
-   Interface admin (`AdminQuoteRequests.tsx`) :
    *   Liste paginée et filtrable (hooks `useQuoteRequestFilters`, `usePagination`).
    *   Vue détaillée du devis sélectionné (`QuoteRequestDetails.tsx`).
    *   Actions : mise à jour statut, suppression, export PDF, impression (hook `useQuoteRequestActions`, `QuoteRequestUtils.tsx`).
    *   Intégration de l'IA pour la suggestion de réponses.

### Génération de contenu IA (Google Gemini) 🤖
-   **Réponses Devis:** `<AIResponseGenerator>` et `<ResponseEditor>` utilisent `aiResponseService.ts` pour suggérer et éditer des réponses.
-   **Descriptions Produits:** `<ProductDescriptionGenerator>` utilise `productDescriptionService.ts`.
-   **Contenu SEO:** `<SeoContentGenerator>` utilise `seoContentService.ts` (pour catégories) et `productSeoService.ts` (pour produits).
-   **Contenu Newsletter:** Utilisation de `newsletterContentService.ts` dans `AdminNewsletter.tsx`.

### Outils SEO 🔎
-   **Gestion SEO par Page/Produit/Catégorie:** Champs dédiés (titre, description, mots-clés) dans les formulaires admin, utilisés par le composant `<SEO>` (`react-helmet-async`) et `seo.ts`.
-   **Générateur Mots-clés:** (`KeywordGeneratorTool.tsx`, `keywordGenerationService.ts`) Outil IA (Gemini) pour trouver des idées de mots-clés, avec options avancées et sauvegarde (`savedKeywordsService.ts`).
-   **Suivi Positions:** (`KeywordRankingTool.tsx`, `keywordRankingService.ts`) Surveillance du classement Google via SerpApi (proxy local nécessaire en dev), historique des positions (Recharts), sauvegarde en BDD.

### Gestion des Annonces 📢
-   `<TopBar>` affiche les annonces actives récupérées depuis Supabase (`announcementService.ts`).
-   `AdminAnnouncements.tsx` permet le CRUD complet des annonces (message, lien, dates, couleurs, statut actif).

### Gestion de la Newsletter 📧
-   `AdminNewsletter.tsx` permet de visualiser les abonnés (actifs/désabonnés), d'exporter la liste, et d'envoyer des newsletters.
-   L'outil d'envoi inclut un éditeur HTML, un aperçu, et la génération de contenu via IA (`newsletterContentService.ts`).
-   La gestion des abonnés se fait via `newsletterService.ts` (Supabase).
-   L'envoi réel nécessite l'API backend configurée via `emailService.ts`.

### Gestion du Sitemap 🗺️
-   `AdminSitemap.tsx` permet de visualiser, ajouter, modifier et supprimer des entrées du sitemap.
-   Fonctionnalité pour ajouter automatiquement les URLs des produits.
-   Sauvegarde du fichier `sitemap.xml` via une API backend (`sitemapService.ts`).

---

## Intégration Supabase ☁️

-   **Authentication:** Gestion des utilisateurs (email/password), sessions JWT, et rôles (via table `profiles`).
-   **Database (PostgreSQL):** Utilisation intensive pour stocker produits, catégories (3 niveaux), artistes, catégories d'artistes, réalisations, demandes de devis, abonnés newsletter, mots-clés sauvegardés, classements SEO, annonces, profils utilisateurs. Relations gérées via clés étrangères.
-   **Storage:** Bucket `product-images` (configurable dans `storageService.ts`) pour héberger les images des produits et réalisations. Les permissions du bucket doivent être configurées pour l'accès public et les uploads authentifiés.
-   **Row Level Security (RLS):** **ABSOLUMENT CRUCIAL** pour la sécurité des données en production. Configurez des politiques RLS dans Supabase pour :
    *   Limiter les écritures (INSERT, UPDATE, DELETE) aux utilisateurs authentifiés avec le rôle `admin`.
    *   Permettre aux utilisateurs authentifiés de lire/modifier leurs propres données (profil, etc.).
    *   Restreindre l'accès anonyme aux seules données publiques nécessaires (produits, catégories, artistes, réalisations visibles).
    *   Protéger les données sensibles comme les devis, les informations clients, les configurations.
-   **Client Supabase:** Instance unique configurée dans `src/services/supabaseClient.ts` utilisant les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.

---

## Initialisation de la base de données (Seed) 🌱

-   Une fonction `seedDatabase()` (commentée) existe dans `src/services/productService.ts` utilisant des données `mockProducts`.
-   **Attention :** Cette fonction de test supprime d'abord les produits existants créés par l'utilisateur courant. À utiliser avec *extrême précaution* et uniquement en environnement de développement.
-   Elle n'est pas appelée automatiquement. Son intégration nécessiterait un bouton admin ou un script dédié.

---

## TODO / Améliorations Possibles 🔮

-   🔒 **Sécurité Supabase RLS :** **Priorité absolue.** Implémenter et tester rigoureusement les politiques RLS pour toutes les tables sensibles.
-   👤 **Gestion des Rôles Utilisateur :** Différencier 'Utilisateur connecté' de 'Admin' si des fonctionnalités spécifiques non-admin sont ajoutées (ex: modifier son propre profil/commandes). Créer/utiliser une `<UserRoute>` si nécessaire.
-   💾 **Profil Utilisateur :** Implémenter la logique de sauvegarde des modifications du profil dans `ProfilePage.tsx` (appel API Supabase).
-   🧾 **Commandes Utilisateur :** Connecter `OrdersPage.tsx` aux données réelles (probablement liées aux `quote_requests` avec statut `approved` ou `completed`).
-   🗑️ **Gestion Stockage Supabase :** Implémenter la suppression des fichiers dans Supabase Storage lors de la suppression d'un produit, d'une réalisation, ou d'une image individuelle via les formulaires admin.
-   ❗ **Notifications UI :** Remplacer les `alert()` et `console.log` par un système de notifications/toasts plus robuste et centralisé (ex: utiliser `AdminNotification.tsx` de manière globale ou intégrer `react-toastify`).
-   ✔️ **Validation Formulaires :** Intégrer une librairie comme `Zod` avec `React Hook Form` pour une validation des formulaires plus robuste, centralisée et avec de meilleurs messages d'erreur.
-   ⚡ **Optimisations Performance :**
    *   **Code Splitting:** Utiliser `React.lazy` pour charger les pages/composants lourds (surtout admin) à la demande.
    *   **Images:** Optimiser la taille/format des images (WebP), utiliser des images responsives (`srcset`), placeholders de chargement.
    *   **Requêtes Supabase:** Optimiser les requêtes (sélectionner uniquement les colonnes nécessaires), utiliser la mise en cache si pertinent, indexer les colonnes fréquemment filtrées/triées.
-   🧪 **Tests :** Ajouter des tests unitaires (Vitest), d'intégration (React Testing Library), et potentiellement E2E (Cypress/Playwright).
-   ✨ **Admin UI/UX :**
    *   **Réordonnancement:** Implémenter le drag-and-drop pour réorganiser les catégories/produits/images.
    *   **Éditeur Riche (WYSIWYG):** Utiliser un éditeur comme TipTap ou TinyMCE pour les descriptions (produits, pages, réalisations, newsletter).
    *   **Feedback Visuel:** Améliorer le retour visuel pendant les opérations longues (sauvegarde, génération IA, etc.).
-   🌐 **Internationalisation (i18n) :** Préparer l'application pour le support multilingue si nécessaire (ex: `i18next`).
-   ⚙️ **API Backend (Email, Sitemap, Proxy) :** Développer et déployer l'API backend nécessaire pour l'envoi d'emails, la sauvegarde du sitemap, et potentiellement pour gérer les appels SerpApi en production de manière sécurisée.
-   📈 **Dashboard Admin :** Enrichir le tableau de bord avec des graphiques (ex: évolution des devis, produits populaires) et des statistiques plus pertinentes.
-   🔄 **Gestion des Slugs :** Affiner la gestion des slugs uniques, potentiellement gérer les redirections en cas de changement de slug.

---

## Licence 📜

Ce projet est sous licence [MIT](./LICENSE) (Ajouter un fichier LICENSE si ce n'est pas déjà fait).
```
