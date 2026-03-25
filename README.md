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

### Prérequis
- **Docker & Docker Compose** (recommandé) OU Node.js v18+ + PostgreSQL 15

---

### Option A — Docker Compose (recommandé)

Lance le backend + la base de données + Adminer en une seule commande.

```bash
# Depuis la racine du projet
docker-compose up --build
```

| Service   | URL                          | Description              |
|-----------|------------------------------|--------------------------|
| Backend   | http://localhost:3000/api    | API REST                 |
| Swagger   | http://localhost:3000/api-docs | Documentation API      |
| Adminer   | http://localhost:8080        | Interface base de données |

> **Note** : Le frontend n'est pas inclus dans Docker Compose. Lance-le séparément (voir ci-dessous).

Pour lancer le frontend en parallèle :

```bash
cd frontend
npm install
npm run dev
```

> Frontend : http://localhost:5173

Pour arrêter les conteneurs :

```bash
docker-compose down
# Pour supprimer aussi les données (volume PostgreSQL) :
docker-compose down -v
```

---

### Option B — Développement local (sans Docker)

Prérequis : Node.js v18+ et PostgreSQL 15 installés localement.

#### 1. Backend

```bash
cd backend
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env : remplacer DATABASE_URL par postgresql://USER:PASSWORD@localhost:5432/rifle_db?schema=public

# Appliquer les migrations Prisma
npm run migrate

# Lancer le serveur
npm run dev
```

> API : `http://localhost:3000` — Swagger : `http://localhost:3000/api-docs`

#### 2. Frontend (nouveau terminal)

```bash
cd frontend
npm install
npm run dev
```

> Application : `http://localhost:5173`

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
