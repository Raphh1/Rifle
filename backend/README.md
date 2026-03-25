# Rifle — Backend

API REST Node.js + Express + Prisma + PostgreSQL.

## Prérequis

- Node.js v18+
- PostgreSQL 15 (ou utiliser Docker Compose depuis la racine)

## Lancement

### Avec Docker Compose (recommandé)

Depuis la **racine du projet** :

```bash
docker-compose up --build
```

Le backend démarre automatiquement avec la base de données.

### En local

```bash
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env et adapter DATABASE_URL pour pointer vers localhost :
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rifle_db?schema=public"

# Appliquer les migrations
npm run migrate

# Lancer en mode développement
npm run dev
```

## Scripts disponibles

| Commande           | Description                                    |
|--------------------|------------------------------------------------|
| `npm run dev`      | Démarre le serveur avec hot reload (nodemon)   |
| `npm start`        | Démarre le serveur en production               |
| `npm run migrate`  | Applique les migrations Prisma                 |
| `npm run generate` | Régénère le client Prisma                      |
| `npm test`         | Lance les tests (Jest + Supertest)             |
| `npm run lint`     | Corrige les problèmes ESLint                   |
| `npm run format`   | Formate le code avec Prettier                  |

## Variables d'environnement

Voir `.env.example`. Les deux cas d'usage :

```env
# Pour Docker Compose (hostname = nom du service docker)
DATABASE_URL="postgresql://postgres:postgres@db:5432/rifle_db?schema=public"

# Pour local (PostgreSQL installé sur la machine)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rifle_db?schema=public"
```

## Endpoints

| Méthode | Route                         | Description                    | Auth requise |
|---------|-------------------------------|--------------------------------|--------------|
| GET     | /api/health                   | Health check                   | Non          |
| POST    | /api/auth/register            | Inscription                    | Non          |
| POST    | /api/auth/login               | Connexion                      | Non          |
| GET     | /api/events                   | Liste des événements           | Non          |
| GET     | /api/events/:id               | Détail d'un événement          | Non          |
| POST    | /api/events                   | Créer un événement             | Organisateur |
| PUT     | /api/events/:id               | Modifier un événement          | Organisateur |
| DELETE  | /api/events/:id               | Supprimer un événement         | Organisateur |
| GET     | /api/tickets                  | Mes billets                    | User         |
| POST    | /api/tickets/buy              | Acheter un billet              | User         |
| POST    | /api/tickets/:id/validate     | Valider un billet (QR)         | Organisateur |
| GET     | /api/dashboard/organizer      | Stats organisateur             | Organisateur |
| GET     | /api/dashboard/admin          | Stats admin                    | Admin        |

Documentation complète : `http://localhost:3000/api-docs` (Swagger)
