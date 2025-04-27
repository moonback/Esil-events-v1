```markdown
# ESIL Events v1 🚀

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/supabase-3fc889?style=for-the-badge&logo=supabase&logoColor=white)
![Lucide Icons](https://img.shields.io/badge/Lucide-Icons-orange?style=for-the-badge&logo=lucide)

Plateforme de location de matériel événementiel et de gestion de devis pour **ESIL Events**, construite avec **React**, **TypeScript**, **Vite**, **Tailwind CSS** et **Supabase**.

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
  - [SEO](#seo-)
  - [Gestion des Catégories/Produits](#gestion-des-catégoriesproduits-)
  - [Gestion des Artistes](#gestion-des-artistes-)
  - [Demandes de devis](#demandes-de-devis-)
  - [Announcements (Top Bar)](#announcements-top-bar-)
  - [Génération de Réponse IA](#génération-de-réponse-ia-)
- [Intégration Supabase ☁️](#intégration-supabase-)
- [Initialisation de la base de données (Seed) 🌱](#initialisation-de-la-base-de-donnees-seed-)
- [TODO / Améliorations Possibles 🔮](#todo--améliorations-possibles-)
- [Licence 📜](#licence-)

---

## Description 📄

**ESIL Events v1** est une application web permettant aux clients de parcourir un catalogue de matériel événementiel et d'artistes, d'ajouter des produits à une demande de devis et de soumettre cette demande. Une section d'administration protégée permet la gestion des produits, catégories (produits et artistes), artistes, demandes de devis, annonces et autres contenus.

## Fonctionnalités ✨

### Partie Publique
-   🛍️ **Catalogue Produits :** Navigation par catégories/sous-catégories via Mega Menu.
-   📄 **Fiches Produits :** Détails complets avec images, description, caractéristiques techniques, prix (HT/TTC).
-   🛒 **Panier Devis :** Ajout d’articles pour générer une demande de devis.
-   📝 **Formulaire Devis :** Collecte complète des informations (client, événement, livraison/retrait, commentaires).
-   🎤 **Catalogue Artistes :** Liste et pages de détail pour les artistes.
-   ℹ️ **Pages Informatites :** À propos, Livraison, Contact, CGV, Politique de confidentialité, Agence événementielle.
-   🔍 **Recherche :** Fonctionnalité de recherche de produits.
-   📢 **Annonces :** Barre d'annonces dynamique en haut de page.

### Partie Utilisateur (Protégée)
-   👤 **Profil :** Accès à la page `/profile` (actuellement protégé par `AdminRoute`, à ajuster).
-   📦 **Commandes :** Accès à la page `/orders` (actuellement protégé par `AdminRoute`, à ajuster).

### Partie Administration
-   🛡️ **Interface Sécurisée :** Accès à `/admin/*` protégé par authentification et rôle admin.
-   📊 **Tableau de Bord :** Statistiques clés (nombre de produits, catégories, devis).
-   🔩 **Gestion Produits :** CRUD complet des produits avec gestion des images, couleurs, spécifications, etc.
-   📚 **Gestion Catégories (Produits) :** CRUD pour Catégories, Sous-catégories, Sous-sous-catégories.
-   🎭 **Gestion Artistes :** CRUD pour les catégories d'artistes et les artistes eux-mêmes.
-   📋 **Gestion Devis :** Visualisation, filtrage, tri et gestion des demandes. Détails complets, mise à jour du statut, suppression.
-   🤖 **Réponse IA :** Suggestion de réponse pour les devis via l'API Deepseek.
-   📣 **Gestion Annonces :** Création, modification, activation/désactivation des annonces de la Top Bar.
-   ⚙️ **Configuration Email :** Paramétrage et test de la configuration SMTP pour l'envoi d'emails.
-   👥 **Gestion Clients :** Fonctionnalité basique (peut être étendue).
-   📄 **Gestion Pages :** Fonctionnalité basique (peut être étendue).

## Stack Technique 🛠️

-   **Frontend** : React 18+ (avec Hooks) + TypeScript
-   **Build Tool** : Vite
-   **Styling** : Tailwind CSS v3 + `index.css` (polices) + `animations.css` / `admin-animations.css`
-   **UI Icons** : Lucide React
-   **Backend & Database** : Supabase (Authentication, PostgreSQL Database, Storage)
-   **Routing** : React Router DOM v6
-   **State Management** : React Context API (`CartContext`, `useAuth`)
-   **SEO** : React Helmet Async
-   **Code Quality** : ESLint (implicite via setup standard), Prettier (implicite)
-   **API Externe** : Deepseek (pour génération de réponse IA)
-   **Emailing** : Nodemailer (via API backend *non fournie dans ce repo*, configurée via `emailService.ts`)

## Structure du Projet 📂

```
src
├── App.tsx             # Configuration principale des routes
├── components          # Composants UI réutilisables
│   ├── admin           # Composants spécifiques à l'admin (Header, ResponseEditor, Forms...)
│   │   └── quoteRequests # Composants dédiés à la gestion des devis admin
│   ├── cart            # Composants du panier et du checkout
│   ├── layouts         # Mises en page (Layout principal, AdminLayout)
│   └── (autres)        # Composants partagés (Header, Footer, Forms, SEO...)
├── config              # Configuration (seo.ts)
├── constants           # Constantes (images.ts)
├── context             # Contextes React (CartContext)
├── hooks               # Hooks personnalisés (useAuth, useCheckoutForm, usePagination, etc.)
├── pages               # Composants de page (vues)
│   ├── admin           # Pages de la section admin (Dashboard, Products, Categories...)
│   └── (autres)        # Pages publiques (HomePage, ProductPage, CartPage, ArtistPage...)
├── services            # Logique métier, appels API/Supabase (auth, product, category, quote, email...)
├── styles              # Styles CSS additionnels (animations, map...)
├── types               # Définitions TypeScript (Product.ts, etc.)
├── index.css           # Styles globaux Tailwind et polices
├── main.tsx            # Point d'entrée de l'application React
└── vite-env.d.ts       # Types pour Vite
```

## Prérequis 📋

-   Node.js v18+
-   npm (v9+) ou yarn (v1.22+)

## Installation ⚙️

```bash
# 1. Cloner le dépôt
git clone <URL_DU_DEPOT>
cd esil-events-v1

# 2. Installer les dépendances
npm install
# ou
yarn install
```

## Configuration de l'environnement 🔑

Créer un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Supabase Configuration
VITE_SUPABASE_URL=VOTRE_URL_SUPABASE
VITE_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_SUPABASE

# Deepseek API (pour suggestion de réponse IA)
VITE_DEEPSEEK_API_KEY=VOTRE_CLE_API_DEEPSEEK

# SMTP Configuration (pour envoi d'emails via API backend)
# Ces variables sont utilisées par le service `emailService.ts` mais l'API backend n'est pas incluse ici.
# Elles peuvent être utilisées pour configurer une API séparée ou une fonction serverless.
VITE_SMTP_HOST=votre_serveur_smtp
VITE_SMTP_PORT=votre_port_smtp
VITE_SMTP_SECURE=true # ou false
VITE_SMTP_USER=votre_utilisateur_smtp
VITE_SMTP_PASS=votre_mot_de_passe_smtp
VITE_SMTP_FROM=votre_adresse_expediteur
```

Remplacez les valeurs par vos clés Supabase, Deepseek et vos informations SMTP si vous mettez en place l'envoi d'email.

## Lancement du projet ▶️

### Développement 💻

```bash
npm run dev
# ou
yarn dev
```

Le serveur de développement démarrera généralement sur `http://localhost:5173`.

### Production 🏭

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

3.  **Déploiement:** Déployez le contenu du répertoire `dist` sur votre plateforme d'hébergement (Vercel, Netlify, serveur statique, etc.). Assurez-vous que les variables d'environnement sont correctement configurées sur la plateforme.

## Fonctionnalités Clés et Concepts 💡

### Routing
-   Géré par `react-router-dom` v6 dans `App.tsx`.
-   Utilisation de `<Layout>` pour les routes publiques/utilisateurs et `<AdminLayout>` pour les routes admin.
-   `<AdminRoute>` protège l'accès aux sections nécessitant des droits admin via le hook `useAuth`.
-   `<AdminRoutes>` regroupe les routes spécifiques à l'administration pour une meilleure organisation.

### Gestion d'état (Panier) 🛒
-   `CartContext` (`src/context/CartContext.tsx`) gère l'état du panier (ajout, suppression, mise à jour quantité).
-   Le panier est persisté dans `localStorage` pour maintenir l'état entre les sessions.

### Authentification 🔐
-   Gérée via `supabase.auth` dans `src/services/authService.ts`.
-   Le hook `useAuth` (`src/hooks/useAuth.ts`) fournit l'état de l'utilisateur (`user`) et son statut admin (`isAdminUser`).
-   `LoginForm.tsx` et `RegisterForm.tsx` gèrent la connexion/inscription. L'inscription crée automatiquement un profil `admin` (peut nécessiter ajustement selon la logique métier).

### Accès Admin 🛡️
-   Le composant `<AdminRoute>` vérifie si l'utilisateur est admin en utilisant `isAdmin()` du `authService`.
-   **Important :** Des politiques de sécurité au niveau des lignes (RLS) dans Supabase sont **essentielles** pour protéger les données sensibles (produits, commandes, devis, etc.) contre les accès non autorisés, même si l'utilisateur parvient à contourner la protection front-end.

### SEO 🔎
-   Le composant `<SEO>` (`src/components/SEO.tsx`) utilise `react-helmet-async` pour gérer dynamiquement les balises `<head>` (titre, description, mots-clés, balises Open Graph/Twitter).
-   Configuration centralisée dans `src/config/seo.ts`.

### Gestion des Catégories/Produits 📦
-   Le service `categoryService.ts` gère les opérations CRUD pour la hiérarchie complète des catégories (Catégorie -> Sous-catégorie -> Sous-sous-catégorie).
-   Le service `productService.ts` gère le CRUD des produits et l'upload d'images vers Supabase Storage.
-   `<ProductForm>` est un composant clé pour la création/modification, avec gestion dynamique des menus déroulants de catégories basés sur les données de la base de données.
-   `AdminProducts.tsx` affiche la liste des produits avec pagination, recherche, filtres par catégorie et tri.
-   `AdminCategories.tsx` permet la gestion visuelle de la hiérarchie des catégories.

### Gestion des Artistes 🎤
-   `artistService.ts` et `artistCategoryService.ts` gèrent les données des artistes et de leurs catégories respectives.
-   Les pages `AdminArtists.tsx` et `AdminArtistCategories.tsx` permettent leur gestion.
-   Les pages publiques `ArtistPage.tsx` (liste) et `ArtistDetailPage.tsx` (détail) affichent les artistes aux visiteurs.

### Demandes de devis 📋
-   **Flux :** Ajout produits au panier -> Finalisation via `<CheckoutForm>` -> Envoi via `quoteRequestService.ts` -> Stockage dans Supabase -> Emails de confirmation/notification via `emailService.ts`.
-   **Admin :** La page `AdminQuoteRequests.tsx` est le centre de gestion :
    -   Utilise les hooks `useQuoteRequestFilters`, `usePagination`, `useQuoteRequestActions`.
    -   Affiche la liste des devis, les détails du devis sélectionné.
    -   Permet de filtrer, trier, mettre à jour le statut, supprimer.
    -   Intègre `<AIResponseGenerator>` pour suggérer des réponses.
    -   Permet l'export PDF et l'impression (via `<QuoteRequestActions>` et `ExportUtils.tsx`/`QuoteRequestUtils.tsx`).

### Announcements (Top Bar) 📢
-   Le composant `<TopBar>` affiche les annonces actives (récupérées depuis localStorage).
-   `localStorageAnnouncementService.ts` fournit les fonctions CRUD pour gérer les annonces stockées localement.
-   La page `AdminAnnouncements.tsx` permet la gestion complète de ces annonces via une interface modale.

### Génération de Réponse IA 🤖
-   Le composant `<AIResponseGenerator>` (`src/components/admin/quoteRequests/`) permet de générer une suggestion de réponse pour un devis sélectionné.
-   Le service `aiResponseService.ts` prépare le prompt et interagit avec l'API Deepseek (nécessite `VITE_DEEPSEEK_API_KEY`).
-   Possibilité d'utiliser un mode "raisonnement avancé" (si l'API le supporte).

## Intégration Supabase ☁️

-   **Authentication:** Gestion des utilisateurs, sessions, et rôles (via la table `profiles`).
-   **Database (PostgreSQL):** Tables pour `products`, `categories`, `subcategories`, `subsubcategories`, `artists`, `artist_categories`, `quote_requests`, `profiles`. Les relations sont gérées via les ID (ex: `category_id` dans `subcategories`).
-   **Storage:** Bucket `product-images` pour héberger les images des produits. Les permissions doivent être configurées correctement dans Supabase.
-   **Row Level Security (RLS):** **Crucial** pour la sécurité. À configurer dans Supabase pour s'assurer que :
    -   Seuls les admins peuvent modifier/supprimer des produits, catégories, artistes, devis, annonces.
    -   Les utilisateurs ne peuvent voir/modifier que leurs propres données (profil, potentiellement commandes futures).
    -   L'accès anonyme est limité aux données publiques (produits, catégories publiques, artistes).
-   **Client Supabase:** Instance unique configurée dans `src/services/supabaseClient.ts`.

## Initialisation de la base de données (Seed) 🌱

-   Une fonction `seedDatabase()` est présente dans `src/services/productService.ts`. Elle utilise des données `mockProducts` (commentées dans le code fourni) pour remplir la table `products`.
-   **Attention:** Cette fonction supprime d'abord les produits existants créés par l'utilisateur authentifié avant d'insérer les données de test.
-   Elle n'est pas appelée automatiquement. Pour l'utiliser, il faudrait l'intégrer dans l'interface admin (par exemple, un bouton sur le dashboard) ou l'exécuter via un script séparé, **avec précaution**.

## TODO / Améliorations Possibles 🔮

-   🔒 **Sécurité Supabase RLS :** Implémenter et tester rigoureusement les politiques RLS.
-   👤 **Gestion des Rôles Affinée :** Distinguer clairement 'Utilisateur Connecté' vs 'Admin' si des fonctionnalités spécifiques utilisateur (non-admin) sont ajoutées hors `/profile` et `/orders`. Renommer ou ajouter des routes protégées (`UserRoute`).
-   💾 **Profil Utilisateur :** Implémenter la logique de sauvegarde des modifications du profil dans `ProfilePage.tsx`.
-   🧾 **Commandes Utilisateur :** Connecter `OrdersPage.tsx` à des données réelles (probablement liées aux `quote_requests` approuvées/complétées).
-   🗑️ **Gestion Images Storage :** Ajouter la suppression des images du bucket Supabase lors de la suppression d'un produit ou d'une image individuelle dans le formulaire.
-   ❗ **Gestion des Erreurs UI :** Utiliser un système de notifications/toasts plus robuste pour les erreurs et succès (ex: react-toastify).
-   ✔️ **Validation Formulaires :** Intégrer une librairie comme `Zod` ou `React Hook Form` pour une validation plus poussée et des messages d'erreur spécifiques.
-   ⚡ **Optimisations :**
    -   **Code Splitting :** Utiliser `React.lazy` pour charger les pages/composants lourds (notamment admin) à la demande.
    -   **Images :** Optimiser la taille et le format des images (ex: WebP). Utiliser des placeholders de chargement.
    -   **Requêtes :** Optimiser les requêtes Supabase, utiliser la mise en cache si pertinent.
-   🧪 **Tests :** Ajouter des tests unitaires (Vitest) et d'intégration (React Testing Library) pour assurer la fiabilité.
-   ✨ **Admin UI/UX :**
    -   **Réordonnancement :** Implémenter le drag-and-drop pour réordonner les catégories/produits.
    -   **Éditeur Riche :** Utiliser un éditeur WYSIWYG pour les descriptions de produits/pages.
    -   **Feedback Visuel :** Améliorer le feedback lors des opérations (chargement, succès, erreur).
-   🌐 **Internationalisation (i18n) :** Préparer l'application pour plusieurs langues si nécessaire.
-   📧 **Backend Email :** Le service `emailService.ts` suppose une API backend (ex: Express) pour envoyer les emails via Nodemailer. Ce backend n'est pas inclus et doit être développé séparément si l'envoi direct depuis le client n'est pas souhaité/possible.

## Licence 📜

Ce projet est sous licence [MIT](./LICENSE) (ou spécifier une autre licence si applicable).
```
