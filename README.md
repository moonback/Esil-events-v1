**DOCUMENTATION DU PROJET : ESIL-EVENTS-V1**

**Date de génération :** [Date Actuelle]

**Version :** 1.0

---

**TABLE DES MATIÈRES**

1.  [Introduction et Objectif du Projet](#1-introduction-et-objectif-du-projet)
2.  [Technologies Utilisées](#2-technologies-utilisées)
3.  [Architecture du Projet](#3-architecture-du-projet)
    *   [Structure des Dossiers Principaux](#31-structure-des-dossiers-principaux)
4.  [Description Détaillée des Modules et Composants](#4-description-détaillée-des-modules-et-composants)
    *   [4.1 Fichiers à la Racine de `src`](#41-fichiers-à-la-racine-de-src)
    *   [4.2 Composants (`src/components/`)](#42-composants-srccomponents)
        *   [4.2.1 Composants d'Administration (`admin/`)](#421-composants-dadministration-admin)
        *   [4.2.2 Composants du Panier (`cart/`)](#422-composants-du-panier-cart)
        *   [4.2.3 Composants de Liste de Produits (`product-list/`)](#423-composants-de-liste-de-produits-product-list)
        *   [4.2.4 Composants de Réalisations (`realization/`)](#424-composants-de-réalisations-realization)
        *   [4.2.5 Composants Communs](#425-composants-communs)
    *   [4.3 Configuration (`src/config/`)](#43-configuration-srcconfig)
    *   [4.4 Constantes (`src/constants/`)](#44-constantes-srcconstants)
    *   [4.5 Contexte (`src/context/`)](#45-contexte-srccontext)
    *   [4.6 Hooks (`src/hooks/`)](#46-hooks-srchooks)
    *   [4.7 Pages (`src/pages/`)](#47-pages-srcpages)
        *   [4.7.1 Pages Publiques](#471-pages-publiques)
        *   [4.7.2 Pages d'Administration](#472-pages-dadministration)
    *   [4.8 Services (`src/services/`)](#48-services-srcservices)
    *   [4.9 Styles (`src/styles/`)](#49-styles-srcstyles)
    *   [4.10 Types (`src/types/`)](#410-types-srctypes)
    *   [4.11 Utilitaires (`src/utils/`)](#411-utilitaires-srcutils)
5.  [Fonctionnalités Principales](#5-fonctionnalités-principales)
    *   [5.1 Côté Client/Utilisateur](#51-côté-clientutilisateur)
    *   [5.2 Côté Administration](#52-côté-administration)
6.  [Base de Données (Supabase)](#6-base-de-données-supabase)
7.  [Déploiement](#7-déploiement)
8.  [Pistes d'Amélioration et Prochaines Étapes](#8-pistes-damélioration-et-prochaines-étapes)
9.  [Conclusion](#9-conclusion)

---

## 1. Introduction et Objectif du Projet

**Esil-events-v1** est une application web complète conçue pour la gestion d'événements et la location de matériel événementiel. Elle offre une interface client pour la navigation, la sélection de produits, la demande de devis, et une interface d'administration robuste pour la gestion des produits, des catégories, des clients, des demandes de devis, et d'autres aspects opérationnels et marketing du site.

L'objectif principal est de fournir une plateforme intuitive et efficace pour :
*   **Les clients :** Parcourir le catalogue de produits et services, composer un panier, et soumettre des demandes de devis personnalisées.
*   **Les administrateurs :** Gérer l'ensemble du contenu du site, suivre les demandes, optimiser le référencement (SEO), et administrer les aspects techniques et commerciaux de l'entreprise.

Le projet intègre des fonctionnalités avancées telles que la génération de contenu assistée par IA, le suivi de positionnement des mots-clés, et une gestion fine des produits et des catégories.

## 2. Technologies Utilisées

*   **Frontend :**
    *   React (avec TypeScript)
    *   Vite (Bundler)
    *   React Router DOM (Routage)
    *   Tailwind CSS (Styling)
    *   Lucide React (Icônes)
    *   Framer Motion (Animations)
    *   React Helmet Async (Gestion des balises `<head>` pour le SEO)
    *   Leaflet & React-Leaflet (Cartographie pour la page contact)
*   **Backend & Base de Données :**
    *   Supabase (Base de données PostgreSQL, Authentification, Stockage)
*   **Services Externes / APIs :**
    *   SerpApi (via un proxy local pour `getKeywordPosition`) pour le suivi de positionnement des mots-clés.
    *   Google Gemini (via `generativelanguage.googleapis.com`) pour la génération de contenu IA (descriptions de produits, réponses aux devis, contenu SEO).
*   **Serveur Local (pour proxy et emails) :**
    *   Node.js / Express (suggéré par l'URL `http://localhost:3001/api/...` dans `emailService.ts` et `keywordRankingService.ts` pour le proxy SerpApi et l'envoi d'emails).
*   **Outillage :**
    *   ESLint, Prettier (probablement, pour la qualité du code)

## 3. Architecture du Projet

L'application est structurée en modules distincts, favorisant la maintenabilité et la séparation des préoccupations.

### 3.1 Structure des Dossiers Principaux (`src/`)

*   **`App.tsx`**: Point d'entrée principal de l'application React, gère le routage global.
*   **`main.tsx`**: Initialise l'application React et la monte dans le DOM.
*   **`components/`**: Contient tous les composants réutilisables de l'interface utilisateur.
    *   **`admin/`**: Composants spécifiques à l'interface d'administration.
        *   **`quoteRequests/`**: Sous-module dédié à la gestion des demandes de devis.
    *   **`cart/`**: Composants relatifs à la fonctionnalité du panier et du processus de devis.
    *   **`layouts/`**: Composants de mise en page (ex: `AdminLayout`).
    *   **`product-list/`**: Composants pour l'affichage des listes de produits.
    *   **`realization/`**: Composants pour la section "Réalisations".
*   **`config/`**: Fichiers de configuration pour les services externes (ex: API Google, SEO).
*   **`constants/`**: Constantes globales (ex: chemins d'images par défaut).
*   **`context/`**: Gestion de l'état global avec React Context (ex: `CartContext`).
*   **`hooks/`**: Hooks personnalisés pour encapsuler la logique réutilisable.
*   **`pages/`**: Composants de niveau supérieur représentant les différentes pages de l'application.
    *   **`admin/`**: Pages spécifiques à l'interface d'administration.
*   **`services/`**: Logique métier, interactions avec les API et Supabase.
*   **`styles/`**: Fichiers CSS globaux et spécifiques.
*   **`types/`**: Définitions TypeScript pour les structures de données.
*   **`utils/`**: Fonctions utilitaires.

## 4. Description Détaillée des Modules et Composants

### 4.1 Fichiers à la Racine de `src`

*   **`App.tsx`**:
    *   Initialise `BrowserRouter` pour le routage.
    *   Utilise `ScrollToTop` pour remonter en haut de page à chaque navigation.
    *   Enveloppe l'application avec `CartProvider` pour la gestion du panier.
    *   Définit les routes publiques (avec `Layout`) et les routes d'administration (protégées par `AdminRoute` et utilisant `AdminLayout` via `AdminRoutes`).
    *   Gère les routes pour les produits avec des paramètres dynamiques (catégorie, sous-catégorie, sous-sous-catégorie).
    *   Inclut des pages statiques (Contact, Livraison, CGU, etc.) et des pages dynamiques (Produit, Liste de produits).
    *   Dirige les routes `/admin/*` vers le composant `AdminRoutes`.
    *   Possède une route "fourre-tout" `*` pour la page `NotFoundPage`.
*   **`main.tsx`**:
    *   Point d'entrée de l'application.
    *   Utilise `ReactDOM.createRoot` pour le rendu.
    *   Enveloppe `<App />` dans `<React.StrictMode>` et `<HelmetProvider>`.
    *   Importe les fichiers CSS globaux (`index.css`, `admin-animations.css`).
*   **`index.css`**: Contient les imports Tailwind CSS et des styles globaux personnalisés, incluant des définitions de polices (`Komoda`, `Code Pro`) et des classes utilitaires (`btn-primary`, `btn-secondary`, etc.).
*   **`vite-env.d.ts`**: Fichier de déclaration de types pour Vite.

### 4.2 Composants (`src/components/`)

#### 4.2.1 Composants d'Administration (`admin/`)

*   **`AdminHeader.tsx`**:
    *   Affiche le titre de la page admin actuelle et une icône optionnelle.
    *   Gère l'affichage du menu utilisateur (nom, email, rôle "Administrateur").
    *   Permet la déconnexion (`handleSignOut`).
    *   Possède une barre de recherche (bien que les notifications et le dark mode soient commentés).
    *   Contient un bouton pour basculer la sidebar en mode mobile (`onToggleSidebar`).
    *   Affiche un fil d'Ariane simple.
*   **`AdminNotification.tsx`**:
    *   Fournit un composant `AdminNotification` pour afficher des messages de feedback (info, succès, avertissement, erreur) avec des icônes et couleurs adaptées.
    *   Inclut un `NotificationContainer` pour gérer et afficher une liste de notifications en haut à droite de l'écran.
    *   Les notifications peuvent se fermer automatiquement.
*   **`KeywordGeneratorTool.tsx`**:
    *   Outil SEO permettant de générer des mots-clés via une API (probablement Google Gemini, via `keywordGenerationService`).
    *   Prend en entrée un sujet, secteur, public cible, localisation, nombre de mots-clés.
    *   Peut inclure des métriques estimées (difficulté, volume, pertinence).
    *   Affiche les mots-clés générés dans un tableau avec options de copie, sauvegarde (`savedKeywordsService`), et ajout à l'outil de suivi.
    *   Gère l'état de génération, les erreurs, et les messages de succès.
    *   Possède des options avancées pour affiner la génération.
    *   Utilise `framer-motion` pour les animations.
*   **`KeywordRankingTool.tsx`**:
    *   Outil SEO pour suivre la position d'un site web pour un mot-clé donné sur Google (via SerpApi et le `keywordRankingService`).
    *   Permet de rechercher pour un mot-clé unique ou plusieurs mots-clés en lot.
    *   Permet de sauvegarder les résultats de positionnement.
    *   Affiche l'historique des positions sauvegardées, avec la possibilité de relancer une recherche ou de supprimer un classement.
    *   Intègre la gestion des mots-clés sauvegardés (chargement, filtrage, utilisation, suppression).
    *   Affiche un graphique de l'historique des positions pour un mot-clé sélectionné.
    *   Gère l'état de recherche (simple ou multiple), les erreurs, les messages de succès.
*   **`ProductFilterPanel.tsx`**:
    *   Panneau de filtres dédié à la liste des produits dans l'interface d'administration.
    *   Permet de filtrer par : terme de recherche, catégorie, plage de prix, disponibilité, stock, couleurs.
    *   Les catégories et couleurs sont dynamiquement extraites des produits fournis.
    *   Possède un bouton pour réinitialiser les filtres et un bouton pour afficher/masquer le panneau de filtres.
*   **`ResponseEditor.tsx`**:
    *   Un éditeur de texte simple (textarea) pour modifier une réponse (probablement une réponse à une demande de devis).
    *   Sauvegarde automatiquement un brouillon dans `localStorage` (`draftResponse_${requestId}`).
    *   Permet de copier le contenu et d'ouvrir le client mail avec la réponse.
    *   Affiche le statut de sauvegarde (non enregistré, brouillon sauvegardé, etc.).
*   **`StatCard.tsx`**:
    *   Composant réutilisable pour afficher une statistique clé (titre, valeur, icône).
    *   Peut afficher une tendance (hausse/baisse) et une description.
    *   Supporte différents schémas de couleurs (`blue`, `green`, `purple`, `amber`, `red`).
    *   Utilisé dans le tableau de bord de l'administration.

    **Sous-dossier `quoteRequests/`**:
    *   **`AIResponseGenerator.tsx`**:
        *   Intégré à la page de gestion des devis, il permet de générer une réponse personnalisée à une demande de devis en utilisant une IA (probablement Google Gemini via `aiResponseService`).
        *   Affiche un résumé de la demande de devis.
        *   Permet de configurer des options pour la génération (ton, promotion, détails, longueur).
        *   Gère un historique des réponses générées/sauvegardées (via `localStorage`).
        *   Permet d'éditer la réponse générée, de la copier, de l'envoyer par email ou de la télécharger.
    *   **`FeedbackMessage.tsx`**:
        *   Affiche des messages de succès ou d'erreur de manière temporaire en haut à droite de l'écran.
    *   **`FilterPanel.tsx`** (Note: existe aussi un `ProductFilterPanel.tsx`. Celui-ci est spécifique aux devis):
        *   Panneau de filtres pour les demandes de devis.
        *   Permet de filtrer par : terme de recherche, statut, type de client, type de livraison, période.
    *   **`FilterSearchBar.tsx`**: Semble être une autre version ou un composant plus simple pour la recherche et le filtrage rapide des demandes de devis, incluant un tri par date.
    *   **`index.ts`**: Exporte tous les composants du dossier `quoteRequests`.
    *   **`Pagination.tsx`**:
        *   Composant de pagination générique et stylisé, utilisé pour naviguer dans la liste des demandes de devis.
        *   Affiche le nombre de résultats et les boutons pour naviguer entre les pages.
    *   **`QuoteRequestActions.tsx`**:
        *   Affiche les actions possibles pour une demande de devis sélectionnée (Approuver, Rejeter, Terminer, Réouvrir, Exporter PDF, Imprimer).
        *   Les actions de changement de statut sont conditionnelles en fonction du statut actuel de la demande.
    *   **`QuoteRequestDetails.tsx`**:
        *   Affiche les détails complets d'une demande de devis sélectionnée.
        *   Inclut les informations client, détails de l'événement, articles demandés (avec total), informations de livraison/retrait, accès et commentaires.
        *   Utilise des fonctions utilitaires de `QuoteRequestUtils` pour le formatage.
    *   **`QuoteRequestList.tsx`**:
        *   Affiche une liste des demandes de devis sous forme de cartes.
        *   Chaque carte montre un résumé de la demande (nom, email, statut, dates) et des boutons pour voir les détails ou supprimer.
        *   Intègre une pagination simplifiée.
    *   **`QuoteRequestUtils.tsx`**:
        *   Contient des fonctions utilitaires pour :
            *   Formater les dates (`formatDate`).
            *   Obtenir la couleur et le libellé du statut (`getStatusColor`, `getStatusLabel`).
            *   Obtenir les libellés pour type de livraison, créneau horaire, accès (`getDeliveryTypeLabel`, `getTimeSlotLabel`, `getAccessLabel`).
            *   Calculer le montant total (`calculateTotalAmount`).
            *   Formater les détails des articles (`formatItemsDetails`).
            *   Exporter en PDF (`exportToPDF`) en utilisant `jsPDF` et `html2canvas`.
            *   Imprimer une demande (`printQuoteRequest`).

#### 4.2.2 Composants du Panier (`cart/`)

*   **`CartItemList.tsx`**: Affiche la liste des produits dans le panier sous forme de tableau, avec des options pour modifier la quantité ou supprimer un article. Calcule et affiche le total TTC. Utilise `framer-motion` pour les animations.
*   **`CartSummary.tsx`**: Affiche un résumé du panier avec le total TTC et des boutons pour "Continuer mes achats" et "Demander un devis".
*   **`CartSummaryPreview.tsx`**: Affiche un aperçu détaillé des articles du panier et du total, probablement utilisé sur la page de finalisation du devis.
*   **`CheckoutForm.tsx`**: Formulaire multi-étapes pour la finalisation de la demande de devis. Collecte les informations client, détails de l'événement, livraison/retrait, et commentaires. Intègre `CartSummaryPreview`.
*   **`EmptyCart.tsx`**: Message affiché lorsque le panier est vide, avec un lien pour découvrir les produits.
*   **`index.ts`**: Exporte tous les composants et types du dossier `cart`.
*   **`SuccessMessage.tsx`**: Message affiché après la soumission réussie d'une demande de devis.
*   **`types.ts`**: Définit les interfaces TypeScript pour les articles du panier (`CartItem`) et les données du formulaire de devis (`FormData`), ainsi que les props des composants du panier.

#### 4.2.3 Composants de Liste de Produits (`product-list/`)

*   **`Breadcrumb.tsx`**: Affiche le fil d'Ariane pour la navigation dans les catégories de produits.
*   **`CategoryHeader.tsx`**: Affiche le nom et la description de la catégorie actuelle.
*   **`FilterButton.tsx`**: Bouton pour afficher/masquer les filtres en mode mobile.
*   **`ProductFilters.tsx`**: Panneau de filtres pour la liste des produits côté client (prix, tri, couleurs, disponibilité, catégories).
*   **`ProductGrid.tsx`**: Affiche les produits sous forme de grille de cartes. Gère l'affichage en cas d'erreur ou si aucun produit n'est trouvé. Chaque `ProductCard` affiche l'image, le nom, la référence, le prix et la disponibilité.

#### 4.2.4 Composants de Réalisations (`realization/`)

*   **`FilterButton.tsx`**: Bouton pour afficher/masquer les filtres en mode mobile pour la section des réalisations.
*   **`index.ts`**: Exporte les composants de ce dossier.
*   **`RealizationDetails.tsx`**: Affiche les détails d'une réalisation sélectionnée dans une modale (images, objectif, mission, témoignage, etc.). Gère la navigation dans la galerie d'images.
*   **`RealizationFilters.tsx`**: Panneau de filtres pour les réalisations (catégorie, période, tri).
*   **`RealizationGrid.tsx`**: Affiche les réalisations sous forme de grille de cartes. Chaque carte montre une image, le titre, le lieu et la catégorie.

#### 4.2.5 Composants Communs

*   **`Footer.tsx`**: Pied de page du site avec liens de navigation, informations de contact, réseaux sociaux, et un formulaire d'inscription à la newsletter.
*   **`Header.tsx`**:
    *   Entête principal du site. Gère son apparence en fonction du défilement (`isScrolled`).
    *   Inclut `TopBar` pour les annonces, le logo, `SearchBar` (et `SearchResults`), des liens de contact rapide et réseaux sociaux.
    *   La navigation principale utilise `MegaMenu` pour les catégories de produits.
    *   Affiche le bouton du panier avec le nombre d'articles et un menu utilisateur (si connecté).
    *   Gère l'ouverture/fermeture du `MobileSidebar`.
*   **`Layout.tsx`**:
    *   Structure de mise en page principale pour les pages publiques.
    *   Inclut `Header`, `Footer` et `Outlet` pour afficher le contenu des routes enfants.
    *   Intègre le composant `SEO` pour gérer les métadonnées de la page en fonction de l'URL.
*   **`LoginForm.tsx`**: Formulaire de connexion pour les administrateurs.
*   **`MegaMenu.tsx`**:
    *   Menu déroulant complexe affichant les catégories, sous-catégories et sous-sous-catégories de produits.
    *   Charge les catégories dynamiquement depuis `categoryService` et utilise un cache `localStorage`.
    *   Gère l'affichage dynamique du contenu en fonction de la catégorie active.
*   **`MobileSidebar.tsx`**:
    *   Menu de navigation latéral pour les appareils mobiles.
    *   S'ouvre par-dessus le contenu et bloque le défilement du corps de la page.
    *   Contient des liens de navigation, des informations utilisateur (si connecté) et des options de déconnexion.
    *   Utilise `framer-motion` pour les animations d'ouverture/fermeture.
*   **`ProductDescriptionGenerator.tsx`**: Bouton permettant de générer une description de produit via IA (probablement Google Gemini, via `productDescriptionService`). Utilisé dans `ProductForm`.
*   **`ProductForm.tsx`**:
    *   Formulaire complet pour créer ou modifier un produit.
    *   Gère tous les champs d'un produit (nom, référence, catégories, description, prix, stock, images, couleurs, specs techniques, SEO, etc.).
    *   Charge dynamiquement les catégories/sous-catégories/sous-sous-catégories depuis `categoryService`.
    *   Permet le téléchargement d'images (`uploadProductImage` du `productService`) avec prévisualisation et gestion de l'image principale.
    *   Inclut `ProductDescriptionGenerator` et un bouton pour générer le contenu SEO via `generateProductSeo` du `productSeoService`.
    *   Valide les fichiers image (taille, type).
*   **`RegisterForm.tsx`**: Formulaire d'inscription (probablement pour les administrateurs, étant donné qu'il appelle `register` du `authService` qui crée un profil admin).
*   **`ScrollToTop.tsx`**: Composant utilitaire qui assure que la page est remontée en haut à chaque changement de route.
*   **`SearchBar.tsx`**: Barre de recherche réutilisable avec gestion du focus et bouton d'effacement.
*   **`SearchResults.tsx`**: Affiche les résultats de la recherche (produits) de manière dynamique sous la barre de recherche.
*   **`SEO.tsx`**: Composant utilisant `react-helmet-async` pour gérer dynamiquement les balises meta SEO (`title`, `description`, `keywords`, Open Graph, Twitter cards, données structurées JSON-LD).
*   **`SeoContentGenerator.tsx`**: Bouton permettant de générer du contenu SEO (titre, description, mots-clés) pour les catégories/sous-catégories via IA (probablement Google Gemini, via `seoContentService`).
*   **`TopBar.tsx`**: Affiche une barre d'annonce en haut de la page, avec la possibilité de faire défiler plusieurs annonces. Charge les annonces depuis `announcementService`.
*   **`UserMenu.tsx`**: Menu déroulant pour l'utilisateur connecté, offrant des liens vers le profil, les commandes, la liste d'envies, les paramètres, et l'administration (si admin). *Note : ce composant est présent mais semble être commenté dans `Header.tsx`, le menu utilisateur y est directement implémenté.*

### 4.3 Configuration (`src/config/`)

*   **`googleSearchApi.ts`**:
    *   Configure les paramètres pour l'API SerpApi (utilisée pour simuler les recherches Google et obtenir des positions de mots-clés).
    *   Définit `API_KEY`, `BASE_URL`, `MAX_RESULTS`, `THROTTLE_DELAY`, et des paramètres par défaut (`engine`, `google_domain`, `gl`, `hl`).
    *   Inclut une fonction `isGoogleSearchConfigValid` pour vérifier la présence de la clé API.
*   **`seo.ts`**:
    *   Définit la configuration SEO par défaut pour le site (titre, description, mots-clés, URL du site, image par défaut, informations d'organisation pour les données structurées).

### 4.4 Constantes (`src/constants/`)

*   **`images.ts`**: Définit `DEFAULT_PRODUCT_IMAGE`, l'URL de l'image par défaut pour les produits.

### 4.5 Contexte (`src/context/`)

*   **`CartContext.tsx`**:
    *   Fournit un contexte React pour gérer l'état du panier (liste d'articles).
    *   Offre des fonctions pour ajouter (`addToCart`), supprimer (`removeFromCart`), mettre à jour la quantité (`updateQuantity`), et vider le panier (`clearCart`).
    *   Persiste l'état du panier dans `localStorage` (`CART_STORAGE_KEY`).

### 4.6 Hooks (`src/hooks/`)

*   **`useAdminProductFilters.ts`**: Hook personnalisé pour gérer la logique de filtrage, de tri et de pagination des produits dans l'interface d'administration.
*   **`useAuth.ts`**: Hook pour gérer l'état d'authentification de l'utilisateur. Fournit l'objet `user`, l'état de chargement, et un booléen `isAdminUser`.
*   **`useCheckoutForm.ts`**: Hook pour gérer l'état et la logique du formulaire de demande de devis (`CheckoutForm.tsx`).
*   **`usePagination.ts`**: Hook générique pour gérer la logique de pagination pour n'importe quelle liste d'éléments.
*   **`useProductFilters.ts`**: Hook personnalisé pour la logique de filtrage, de tri, de mode d'affichage (grille/liste) et de pagination des produits côté client.
*   **`useQuoteRequestActions.ts`**: Encapsule la logique des actions sur les demandes de devis (mise à jour de statut, suppression, génération de réponse IA, export PDF, impression). Gère également les messages de feedback et les erreurs.
*   **`useQuoteRequestFilters.ts`**: Hook pour la logique de filtrage des demandes de devis (terme de recherche, statut, type de client, type de livraison, date).
*   **`useRealizationFilters.ts`**: Hook pour la logique de filtrage des réalisations (catégorie, période, tri).

### 4.7 Pages (`src/pages/`)

#### 4.7.1 Pages Publiques

*   **`AboutPage.tsx`**: Page "À propos" présentant l'entreprise, l'équipe, les services, et potentiellement des réalisations récentes.
*   **`ArtistDetailPage.tsx`**: Affiche les détails d'un artiste spécifique (nom, catégorie, image, description).
*   **`ArtistPage.tsx`**: Liste les artistes disponibles, avec possibilité de filtrer par catégorie.
*   **`CartPage.tsx`**: Page du panier, permettant de voir les articles ajoutés, de modifier les quantités, et de passer à la finalisation du devis (affiche `CheckoutForm`).
*   **`CguPage.tsx`**: Affiche les Conditions Générales d'Utilisation du site.
*   **`ContactPage.tsx`**: Page de contact avec un formulaire pour envoyer un message, et des informations de contact (adresse, téléphone, email, horaires), ainsi qu'une carte Leaflet.
*   **`DeliveryPage.tsx`**: Page d'information sur les options et conditions de livraison et d'installation.
*   **`EventsPage.tsx`**: Page présentant les services de l'agence événementielle.
*   **`HomePage.tsx`**: Page d'accueil du site, probablement avec une section hero (vidéo), présentation des services/produits, et des appels à l'action.
*   **`NotFoundPage.tsx`**: Page affichée lorsque une URL demandée n'existe pas (erreur 404).
*   **`OrdersPage.tsx`**: Page où l'utilisateur connecté peut voir l'historique de ses commandes/devis.
*   **`PrivacyPage.tsx`**: Affiche la politique de confidentialité du site.
*   **`ProductListPage.tsx`**: Affiche la liste des produits, potentiellement filtrée par catégorie/sous-catégorie. Utilise `ProductFilters` et `ProductGrid`.
*   **`ProductPage.tsx`**: Affiche les détails d'un produit spécifique (images, description, prix, caractéristiques, produits similaires).
*   **`ProfilePage.tsx`**: Page où l'utilisateur connecté peut voir et modifier ses informations de profil.
*   **`RealisationPage.tsx`**: Page listant les réalisations/projets passés de l'entreprise.
*   **`TermsPage.tsx`**: Affiche les mentions légales du site.

#### 4.7.2 Pages d'Administration (`admin/`)

*   **`Announcements.tsx`**: Gère les annonces affichées dans la `TopBar` (création, modification, suppression, activation/désactivation).
*   **`ArtistCategories.tsx`**: Permet de gérer les catégories d'artistes (CRUD).
*   **`Artists.tsx`**: Permet de gérer les artistes (CRUD), en les associant à des catégories.
*   **`Categories.tsx`**:
    *   Interface pour gérer la hiérarchie des catégories de produits (catégories, sous-catégories, sous-sous-catégories).
    *   Permet d'ajouter, modifier, supprimer chaque niveau de catégorie.
    *   Intègre `SeoContentGenerator` pour générer du contenu SEO pour chaque catégorie.
    *   Gère l'expansion/réduction des niveaux pour une meilleure lisibilité.
*   **`Customers.tsx`**: Page pour la gestion des clients (semble être un placeholder pour le moment).
*   **`Dashboard.tsx`**:
    *   Tableau de bord principal de l'administration.
    *   Affiche des statistiques clés (nombre de produits, catégories, demandes de devis) via `StatCard`.
    *   Propose des actions rapides (ajouter produit, nouvelle catégorie, voir devis, etc.).
    *   Gère le chargement des données et les erreurs.
*   **`EmailConfig.tsx`**:
    *   Permet de configurer les paramètres SMTP pour l'envoi d'emails (serveur, port, sécurité, identifiants, email d'expédition).
    *   Offre une fonctionnalité pour envoyer un email de test afin de vérifier la configuration.
*   **`KeywordRankings.tsx`**:
    *   Page intégrant les outils SEO `KeywordRankingTool` et `KeywordGeneratorTool` sous forme d'onglets.
    *   Affiche une alerte si l'API SerpApi n'est pas configurée.
    *   Permet de passer un mot-clé d'un outil à l'autre.
*   **`Newsletter.tsx`**:
    *   Gère les abonnés à la newsletter (affichage, filtrage, désabonnement, réactivation, export CSV).
    *   Permet de créer et d'envoyer des newsletters :
        *   Saisie du sujet et du contenu HTML.
        *   Génération de contenu HTML assistée par IA (`generateNewsletterContent`), avec options de thème, ton, produits à inclure.
        *   Sélecteur de produits à inclure dans la newsletter.
        *   Prévisualisation du HTML.
        *   Envoi d'emails de test ou envoi à tous les abonnés actifs.
*   **`Pages.tsx`**: Page pour la gestion des pages statiques du site (semble être un placeholder/mockup pour le moment, utilisant `mockPages`).
*   **`Products.tsx`**:
    *   Page principale pour la gestion des produits.
    *   Affiche des statistiques sur les produits (total, stock, etc.).
    *   Utilise `ProductFilterPanel` pour les filtres avancés.
    *   Permet d'ajouter, modifier (`ProductForm`), dupliquer, et supprimer des produits.
    *   Permet de régénérer les slugs manquants pour les produits.
    *   Affiche les produits dans un tableau avec tri et pagination.
    *   Inclut une modale d'aperçu rapide (`QuickViewProduct`).
*   **`QuoteRequests.tsx`**:
    *   Interface complète pour la gestion des demandes de devis.
    *   Affiche un résumé (nombre total de devis).
    *   Utilise `FilterPanel` pour filtrer les demandes.
    *   Affiche la liste des demandes (`QuoteRequestList`) et les détails d'une demande sélectionnée (`QuoteRequestDetails`).
    *   Intègre `AIResponseGenerator` pour générer des réponses.
    *   Utilise les hooks `useQuoteRequestFilters`, `usePagination`, `useQuoteRequestActions` pour gérer la logique.
*   **`Realizations.tsx`**: Page pour gérer les réalisations (portfolio) de l'entreprise, permettant l'ajout, la modification et la suppression de projets.
*   **`Sitemap.tsx`**:
    *   Interface pour gérer le fichier `sitemap.xml` du site.
    *   Charge le sitemap existant (ou un sitemap par défaut).
    *   Permet d'ajouter, modifier, et supprimer manuellement des URLs.
    *   Permet d'ajouter automatiquement les URLs des produits.
    *   Offre un aperçu du XML généré avant la sauvegarde.
    *   Sauvegarde le sitemap sur le serveur (via une API locale Node.js/Express).

### 4.8 Services (`src/services/`)

*   **`aiResponseService.ts`**:
    *   Génère des réponses aux demandes de devis en utilisant l'API Google Gemini.
    *   Prépare un prompt détaillé basé sur les informations de la demande et des options (ton, longueur, etc.).
    *   Gère les appels à l'API Gemini, y compris les tentatives de re-essai en cas d'erreur.
*   **`announcementService.ts`**: Gère le CRUD des annonces (TopBar) via Supabase, incluant la vérification des droits admin.
*   **`artistCategoryService.ts`**: CRUD pour les catégories d'artistes (Supabase).
*   **`artistService.ts`**: CRUD pour les artistes (Supabase).
*   **`authService.ts`**: Gère l'authentification (connexion, déconnexion, inscription, récupération de l'utilisateur actuel, vérification du statut admin) via Supabase Auth et la table `profiles`.
*   **`categoryService.ts`**: CRUD pour les catégories, sous-catégories et sous-sous-catégories de produits, incluant la gestion de l'ordre (Supabase).
*   **`contactService.ts`**: Envoie les données du formulaire de contact par email (à l'admin et confirmation au client) en utilisant `emailService`.
*   **`emailService.ts`**:
    *   Service centralisé pour l'envoi d'emails.
    *   Permet de configurer les paramètres SMTP (hôte, port, identifiants, email d'expédition).
    *   Contient des fonctions pour tester la connexion SMTP et envoyer des emails formatés en HTML.
    *   Utilisé par `contactService` et `quoteRequestService` pour envoyer des emails de confirmation et de notification.
    *   Communique avec un backend local (`http://localhost:3001/api/email/...`) pour effectuer l'envoi réel, afin de ne pas exposer les identifiants SMTP côté client.
*   **`keywordGenerationService.ts`**:
    *   Génère des suggestions de mots-clés SEO en utilisant l'API Google Gemini.
    *   Prépare un prompt pour l'IA basé sur un sujet, secteur, public cible, etc.
    *   Formate la réponse de l'IA en une structure JSON de mots-clés avec des métriques (pertinence, difficulté, volume).
*   **`keywordRankingService.ts`**:
    *   Récupère la position d'un mot-clé dans les résultats de recherche Google en utilisant l'API SerpApi (via un proxy local).
    *   Gère la sauvegarde, la récupération, la suppression, et l'historique des classements de mots-clés dans Supabase.
*   **`newsletterContentService.ts`**:
    *   Génère du contenu HTML pour les newsletters en utilisant l'API Google Gemini.
    *   Prend en compte des options comme le thème, le ton, les produits à inclure, et la longueur du contenu.
    *   Formate la réponse de l'IA en HTML prêt à l'emploi pour les emails.
*   **`newsletterService.ts`**:
    *   Gère les abonnements à la newsletter (sauvegarde, récupération, désabonnement) via Supabase.
    *   Envoie les emails de confirmation d'inscription.
    *   Permet d'envoyer une newsletter à tous les abonnés actifs (en utilisant `emailService`).
*   **`productDescriptionService.ts`**:
    *   Génère des descriptions de produits détaillées et persuasives en utilisant l'API Google Gemini.
    *   Prépare un prompt basé sur les données du produit (nom, catégorie, prix, etc.) et des instructions SEO.
    *   Vise une longueur maximale de 1500 caractères pour la description.
*   **`productSeoService.ts`**:
    *   Génère du contenu SEO (titre, méta-description, mots-clés) pour les produits en utilisant l'API Google Gemini.
    *   Prend en compte les informations du produit, les catégories, et des options SEO (mots-clés focus, longueur, etc.).
    *   Formate la réponse de l'IA en une structure JSON.
*   **`productService.ts`**:
    *   Gère le CRUD (Create, Read, Update, Delete) des produits avec Supabase.
    *   Inclut des fonctions pour récupérer tous les produits, par catégorie, sous-catégorie, sous-sous-catégorie, par ID/slug, et pour rechercher des produits.
    *   Gère le téléchargement des images de produits vers Supabase Storage (`uploadProductImage`).
    *   Fonctionnalité pour dupliquer un produit.
    *   Fonctionnalité pour régénérer les slugs manquants.
    *   Fonction `getSimilarProducts` avancée pour trouver des produits similaires avec un système de scoring basé sur la catégorie, le prix, les specs, les couleurs, la disponibilité et la récence.
*   **`productVerificationService.ts`**: Contient une fonction `checkProductExists` pour vérifier si un produit existe dans la base de données (Supabase).
*   **`quoteRequestService.ts`**:
    *   Gère le CRUD des demandes de devis avec Supabase.
    *   Convertit les données du formulaire (`FormData`) en structure `QuoteRequest` pour la base de données.
    *   Envoie des emails de confirmation au client et de notification à l'admin lors de la création d'une demande (via `emailService`).
*   **`realizationService.ts`**:
    *   Gère le CRUD des "Réalisations" (portfolio) avec Supabase.
    *   Gère le téléchargement et la suppression des images associées aux réalisations dans Supabase Storage (via `storageService`).
*   **`savedKeywordsService.ts`**:
    *   Gère la sauvegarde, la récupération (avec filtres), et la suppression des mots-clés SEO générés dans la base de données Supabase.
*   **`seoContentService.ts`**:
    *   Génère du contenu SEO (titre, méta-description, mots-clés) pour les catégories/sous-catégories en utilisant l'API Google Gemini.
    *   Prépare un prompt spécifique pour l'optimisation SEO des pages de catégories.
*   **`sitemapService.ts`**:
    *   Gère la génération, la récupération, le parsing et la sauvegarde du `sitemap.xml`.
    *   Permet de générer des entrées de sitemap pour les produits.
    *   Sauvegarde le sitemap via une API locale Node.js/Express et dans la table `site_config` de Supabase.
*   **`storageService.ts`**:
    *   Service centralisé pour interagir avec Supabase Storage.
    *   Fournit des fonctions pour télécharger (`uploadFile`) et supprimer (`deleteFile`) des fichiers dans un bucket spécifié (par défaut `product-images`).
    *   Inclut un utilitaire `fileToBase64` pour la prévisualisation.
*   **`supabaseClient.ts`**: Initialise et exporte le client Supabase pour l'ensemble de l'application.

### 4.9 Styles (`src/styles/`)

*   **`admin-animations.css`**: Animations spécifiques pour l'interface d'administration (ex: `slideInRight`, `pulse-slow`).
*   **`animations.css`**: Animations générales pour l'interface utilisateur (ex: `fadeIn`, `fadeOut`, `copySuccess`).
*   **`header-animations.css`**: Animations spécifiques pour le header (ex: `pulseSlow` pour les badges de notification).
*   **`map.css`**: Styles personnalisés pour la carte Leaflet utilisée sur la page de contact.

### 4.10 Types (`src/types/`)

*   **`Product.ts`**: Définit l'interface `Product` (structure des données d'un produit) et `ProductFormData` (pour les formulaires), ainsi que des interfaces pour `Category`, `SubCategory`, `SubSubCategory` (celles-ci pourraient être centralisées dans `categoryService.ts` ou un fichier de types global).

### 4.11 Utilitaires (`src/utils/`)

*   **`slugUtils.ts`**:
    *   Contient des fonctions pour générer des slugs à partir de chaînes de caractères (`generateSlug`).
    *   Génère des slugs uniques en ajoutant un suffixe numérique si nécessaire pour éviter les conflits (`generateUniqueSlug`).

## 5. Fonctionnalités Principales

### 5.1 Côté Client/Utilisateur

*   Navigation dans le catalogue de produits par catégories, sous-catégories.
*   Filtrage et tri des produits.
*   Affichage détaillé des informations produits.
*   Ajout de produits à un panier pour demande de devis.
*   Soumission de demandes de devis via un formulaire détaillé.
*   Consultation de pages d'information (À propos, Livraison, Contact, Mentions légales, etc.).
*   Consultation des réalisations de l'entreprise.
*   Consultation des artistes proposés.
*   Inscription à la newsletter.
*   (Potentiellement) Compte utilisateur pour suivre les commandes/devis et gérer le profil.

### 5.2 Côté Administration

*   **Tableau de bord :** Vue d'ensemble avec statistiques clés et actions rapides.
*   **Gestion des Produits :** CRUD complet, gestion des images, couleurs, spécifications techniques, SEO. Duplication de produits. Régénération de slugs.
*   **Gestion des Catégories :** CRUD pour catégories, sous-catégories, et sous-sous-catégories avec gestion de l'ordre et du SEO.
*   **Gestion des Demandes de Devis :**
    *   Visualisation et filtrage des demandes.
    *   Mise à jour des statuts.
    *   Génération de réponses assistée par IA.
    *   Export PDF et impression des devis.
*   **Gestion des Artistes :** CRUD pour les artistes et leurs catégories.
*   **Gestion des Réalisations :** CRUD pour le portfolio de l'entreprise.
*   **Gestion des Annonces :** Création et gestion des bannières d'annonces du site.
*   **Gestion de la Newsletter :** Gestion des abonnés, création et envoi de newsletters (avec génération de contenu IA).
*   **Gestion des Pages Statiques :** (Fonctionnalité prévue/mockup).
*   **Configuration Email :** Paramétrage SMTP et envoi d'emails de test.
*   **Gestion du Sitemap :** Édition et sauvegarde du `sitemap.xml`.
*   **Outils SEO :**
    *   Générateur de mots-clés avec suggestions IA.
    *   Suivi de positionnement des mots-clés.

## 6. Base de Données (Supabase)

Supabase est utilisé comme backend principal, fournissant :
*   Une base de données PostgreSQL.
*   Un service d'authentification.
*   Un service de stockage pour les images (ex: `product-images`).
*   Des API auto-générées pour interagir avec la base de données.

Les tables principales inférées sont :
*   `products`
*   `categories`, `subcategories`, `subsubcategories`
*   `quote_requests`
*   `profiles` (pour les rôles utilisateurs, notamment admin)
*   `announcements`
*   `artists`, `artist_categories`
*   `realizations`
*   `keyword_rankings` (pour le suivi SEO)
*   `saved_keywords` (pour les mots-clés générés et sauvegardés)
*   `newsletter_subscribers`
*   `site_config` (pour stocker des configurations comme le sitemap)

## 7. Déploiement

(Cette section nécessiterait des informations sur l'hébergement et le processus de build/déploiement, non fournies.)
Typiquement, une application Vite/React peut être déployée sur des plateformes comme Vercel, Netlify, AWS Amplify, ou un serveur VPS configuré. Le backend local (Node.js/Express) pour le proxy SerpApi et l'envoi d'email devrait également être déployé sur un service adapté (ex: Heroku, Render, AWS EC2).

## 8. Pistes d'Amélioration et Prochaines Étapes

*   **Finaliser la gestion des pages statiques** côté admin.
*   **Compléter la gestion des clients** côté admin.
*   **Interface utilisateur client :**
    *   Mettre en place un véritable système de compte client (profil, historique des devis/commandes).
    *   Fonctionnalité de paiement en ligne si les devis se transforment en commandes directes.
*   **Améliorations SEO :**
    *   Génération automatique de données structurées plus riches pour les produits et catégories.
    *   Optimisation continue des performances (Core Web Vitals).
*   **Internationalisation (i18n)** si le site doit être multilingue.
*   **Tests :** Mettre en place des tests unitaires, d'intégration et end-to-end.
*   **Monitoring et Logs :** Intégrer des outils de suivi des erreurs et de performance.
*   **Sécurité :** Audits de sécurité réguliers, notamment pour les interactions API et la gestion des données utilisateur.
*   **Optimisation des performances des requêtes Supabase.**
*   **Déploiement et CI/CD :** Mettre en place un pipeline de déploiement continu.

## 9. Conclusion

Esil-events-v1 est une application web ambitieuse et riche en fonctionnalités, couvrant à la fois les besoins des clients et des administrateurs d'une entreprise de location et d'organisation d'événements. L'utilisation de technologies modernes comme React, TypeScript, Supabase, et l'intégration d'outils IA pour le contenu et le SEO, en font une plateforme potentiellement très puissante. La structure modulaire et la séparation claire des services et composants facilitent sa maintenance et son évolution future.

---
