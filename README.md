# Rifle - Event Management Platform

Plateforme web "Full-Stack" de gestion d'événements et de billetterie, réalisée dans le cadre du projet final.

## 🎯 Objectifs & Fonctionnalités

Cette application permet aux utilisateurs de s'inscrire, gérer des événements et acheter des billets.

### Fonctionnalités Principales
- **Authentification & Sécurité** : Inscription, Connexion (JWT), Hachage de mot de passe, Protection des routes.
- **Gestion des Événements** (CRUD) : Création, modification, suppression et affichage d'événements.
- **Billetterie** : Achat de billets, validation (QR Code simulé/logique), et historique.
- **Tableaux de Bord** : Vues spécifiques pour les Organisateurs et Administrateurs.

## 🛠️ Stack Technique

### Backend
- **Framework** : Node.js + Express
- **Base de Données** : PostgreSQL via Prisma ORM
- **Documentation API** : Swagger (`/api-docs`)
- **Tests** : Jest + Supertest (Setup)

### Frontend
- **Framework** : React 19 + TypeScript (Vite)
- **Routing** : React Router
- **State Management** : React Query + Context API
- **UI** : Chakra UI + CSS Modules
- **Tests** : Vitest + React Testing Library

### DevOps
- **CI/CD** : GitHub Actions (Tests automatisés à chaque push)
- **Déploiement** : Vercel (Frontend & Backend Serverless)

## 🚀 Installation et Lancement

### Préoccupations
- Node.js (v18+)
- PostgreSQL (Local ou Docker)

### 1. Installation du Backend

```bash
cd backend
npm install
# Configuration de la DB
cp .env.example .env # (Si présent, sinon créer .env avec DATABASE_URL)
npx prisma migrate dev --name init
# Lancement
npm run dev
```
> API accessible sur `http://localhost:3000`
> Documentation Swagger : `http://localhost:3000/api-docs`

### 2. Installation du Frontend

```bash
cd frontend
npm install
npm run dev
```
> Application accessible sur `http://localhost:5173`

---

## ✅ Qualité et Tests

Le projet inclut des tests unitaires et d'intégration.

### Lancer les tests Frontend
```bash
cd frontend
npm test
```

### Lancer les tests Backend
```bash
cd backend
npm test
```

### CI/CD Pipeline
Un workflow GitHub Actions (`.github/workflows/ci.yml`) est configuré pour :
1. Installer les dépendances
2. Linter le code
3. Exécuter les tests unitaires (Frontend & Backend)
4. Vérifier la compilation

---

## 🌍 Déploiement

Le projet est configuré pour être déployé sur **Vercel**.

**URL de Production** : `https://votre-projet-rifle.vercel.app` (À remplacer après déploiement)

Architecture de déploiement :
- **Frontend** : Hébergé comme site statique (SPA).
- **Backend** : Hébergé comme Serverless Function (`api/index.js`).
