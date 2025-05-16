# 🎪 ESIL Events

> **Une plateforme événementielle complète avec intelligence artificielle intégrée**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://gemini.google.com/)

ESIL Events est une application web complète pour la gestion et présentation de services événementiels, avec des fonctionnalités avancées propulsées par l'IA pour simplifier l'administration et optimiser le SEO.

<div align="center">
<img src="/api/placeholder/800/400" alt="Aperçu de l'application ESIL Events" />
</div>

## ✨ Points Forts

- 🛒 **Catalogue produits** avec navigation par catégories multiniveaux et filtres avancés
- 👨‍🎤 **Gestion d'artistes** et portfolio de réalisations événementielles
- 🤖 **Fonctionnalités IA** pour générer descriptions, contenus SEO et emails
- 📈 **Suivi SEO intégré** avec tracking de positionnement via SerpAPI
- 🔐 **Interface d'administration** complète et sécurisée
- 🗂️ **Gestion des devis** avec réponses assistées par IA

## 📚 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
  - [Interface Publique](#interface-publique)
  - [Interface d'Administration](#interface-dadministration)
- [Technologies Utilisées](#-technologies-utilisées)
- [Architecture du Projet](#-architecture-du-projet)
- [Installation et Configuration](#-installation-et-configuration)
  - [Prérequis](#prérequis)
  - [Environnement](#environnement)
  - [Lancement](#lancement)
- [Services et API](#-services-et-api)
- [Contributions Possibles](#-contributions-possibles)
- [Licence](#-licence)

## 🚀 Fonctionnalités

### Interface Publique

<details>
<summary>Cliquez pour voir toutes les fonctionnalités publiques</summary>

#### Catalogue de Produits
- Navigation par catégories, sous-catégories et sous-sous-catégories
- Filtres avancés (prix, couleurs, disponibilité)
- Affichage en grille ou en liste
- Pages produits détaillées avec images multiples, spécifications, vidéos et documents

#### Panier et Devis
- Système de panier complet
- Processus de demande de devis intuitif

#### Artistes et Réalisations
- Catalogue d'artistes par catégorie
- Portfolio de réalisations avec filtrage

#### Pages Informatives
- Accueil dynamique
- Page Agence Événementielle
- À Propos, Contact (avec formulaire et carte interactive)
- Livraison, Mentions Légales, CGU, Politique de Confidentialité

#### Fonctionnalités Avancées
- Recherche de produits avec suggestions en temps réel
- TopBar d'annonces dynamiques
- SEO optimisé (balises méta, URLs conviviales, Schema.org)
- Inscription newsletter
</details>

### Interface d'Administration

<details>
<summary>Cliquez pour voir toutes les fonctionnalités d'administration</summary>

#### Tableau de Bord
- Statistiques clés et actions rapides
- Vue d'ensemble des performances

#### Gestion des Produits
- CRUD complet avec gestion d'images multiples
- **✨ Génération de descriptions par IA** (Google Gemini)
- **✨ Optimisation SEO automatique** (titres, méta-descriptions, mots-clés)
- Duplication rapide de produits
- Gestion des spécifications techniques

#### Gestion des Catégories
- Structure hiérarchique à trois niveaux
- **✨ Optimisation SEO par IA** pour les catégories

#### Traitement des Devis
- Liste filtrable et triable
- **✨ Générateur de réponses IA** avec options de ton
- Export PDF et impressions

#### Gestion des Artistes
- CRUD pour artistes et catégories d'artistes
- Organisation par typologie de prestation

#### Réalisations et Annonces
- Gestion des portfolios événementiels
- Configuration des annonces pour la TopBar

#### Newsletter
- Gestion des abonnés avec export CSV
- **✨ Génération de contenu HTML par IA**
- Système d'envoi intégré

#### Outils SEO
- **✨ Générateur de mots-clés IA**
- **✨ Suivi des positions SEO** avec historique et graphiques
- Gestion du sitemap.xml
</details>

## 💻 Technologies Utilisées

### Frontend
| Technologie | Usage |
|-------------|-------|
| **React 18+** | Bibliothèque UI avec Hooks et Context API |
| **TypeScript** | Typage statique pour une meilleure maintenabilité |
| **Vite** | Bundler et serveur de développement rapide |
| **React Router DOM** | Gestion du routing |
| **Tailwind CSS** | Framework CSS utilitaire |
| **Framer Motion** | Animations fluides |
| **Recharts** | Visualisation de données pour le SEO |
| **React Leaflet** | Cartes interactives |
| **React Helmet Async** | Gestion des balises `<head>` pour le SEO |

### Backend & Services
| Technologie | Usage |
|-------------|-------|
| **Supabase** | Base de données PostgreSQL, Auth, Storage |
| **Node.js / Express** | Serveur local pour API proxy et services |

### APIs Externes
| API | Usage |
|-----|-------|
| **Google Gemini** | Génération de contenu IA |
| **SerpApi** | Suivi des positions SEO |

## 🏗️ Architecture du Projet

```
esil-events/
├── public/                 # Ressources statiques
├── src/
│   ├── components/         # Composants UI réutilisables
│   │   ├── admin/          # Interface d'administration
│   │   ├── cart/           # Panier et checkout
│   │   ├── product-list/   # Liste des produits
│   │   ├── realization/    # Section réalisations
│   │   └── layouts/        # Layouts principaux
│   ├── config/             # Configuration (API keys, SEO defaults)
│   ├── constants/          # Constantes de l'application
│   ├── context/            # Contextes React
│   ├── hooks/              # Hooks personnalisés
│   ├── pages/              # Pages principales
│   │   └── admin/          # Pages d'administration
│   ├── services/           # Services API et logique métier
│   ├── styles/             # CSS global et animations
│   ├── types/              # Types TypeScript
│   ├── utils/              # Fonctions utilitaires
│   ├── App.tsx             # Composant racine
│   └── main.tsx            # Point d'entrée React
├── server/                 # Serveur Express pour API locale
├── .env.example            # Exemple de variables d'environnement
└── ...                     # Autres fichiers de configuration
```

## 🔧 Installation et Configuration

### Prérequis
- Node.js v18.x ou supérieur
- npm ou yarn

### Installation

```bash
# Cloner le dépôt
git clone <url_du_depot>
cd esil-events

# Installer les dépendances
npm install
# ou
yarn install
```

### Environnement

Créez un fichier `.env` à la racine du projet:

```env
# Supabase
VITE_SUPABASE_URL=VOTRE_URL_SUPABASE
VITE_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_SUPABASE

# Google Gemini API
VITE_GOOGLE_GEMINI_API_KEY=VOTRE_CLE_API_GEMINI

# SerpApi (pour le suivi SEO)
VITE_SERP_API_KEY=VOTRE_CLE_API_SERPAPI

# Configuration SMTP (pour l'envoi d'emails)
VITE_SMTP_HOST=smtp.example.com
VITE_SMTP_PORT=465
VITE_SMTP_SECURE=true
VITE_SMTP_USER=votre_email@example.com
VITE_SMTP_PASS=VOTRE_MOT_DE_PASSE_SMTP
VITE_SMTP_FROM="ESIL Events <contact@esil-events.fr>"
```

### Lancement

**Frontend (Vite)**
```bash
npm run dev
# ou
yarn dev
```
👉 Accès sur `http://localhost:5173`

**Backend Local (Express)**
```bash
npm run server
# ou
yarn server
```
👉 Accès sur `http://localhost:3001`

## 🔄 Services et API

| Service | Description |
|---------|-------------|
| **Supabase** | Backend principal pour l'authentification, la base de données PostgreSQL et le stockage de fichiers. |
| **Google Gemini** | Moteur d'IA pour la génération de contenu: descriptions produits, réponses aux devis, optimisation SEO. |
| **SerpApi** | Récupération des classements dans les résultats de recherche Google pour le suivi SEO. |
| **Serveur Express** | Proxy pour les appels API externes, gestion du sitemap, envoi d'emails via SMTP (Nodemailer). |

## 🤝 Contributions Possibles

- [ ] Tests unitaires et d'intégration
- [ ] Amélioration de l'accessibilité (A11Y)
- [ ] Internationalisation (i18n)
- [ ] Optimisation des performances
- [ ] Documentation détaillée des composants
- [ ] Système de cache avancé
- [ ] Dashboard avec analytics avancés

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).

---

<div align="center">
<p>Développé avec ❤️ par l'équipe ESIL Events</p>
</div>
