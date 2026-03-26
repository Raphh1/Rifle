# Rifle — Plateforme de gestion d'événements

Application full-stack de gestion d'événements et de billetterie (web + mobile).

**Stack :** Node.js / Express / Prisma / PostgreSQL · React 19 / TypeScript · Expo (React Native)

---

## Lancement avec Docker (recommandé)

> Prérequis : Docker et Docker Compose installés.

```bash
# 1. Copier et configurer les variables d'environnement
cp backend/.env.example backend/.env

# 2. Lancer tous les services (backend + frontend + base de données)
docker-compose up --build
```

| Service   | URL                              |
|-----------|----------------------------------|
| Frontend  | http://localhost:5173            |
| API       | http://localhost:3000/api        |
| Swagger   | http://localhost:3000/api-docs   |
| Adminer   | http://localhost:8080            |

```bash
# Arrêter les conteneurs
docker-compose down

# Supprimer aussi les données (reset complet)
docker-compose down -v
```

---

## Lancement sans Docker

> Prérequis : Node.js v18+ et PostgreSQL 15 installés.

### Backend

```bash
cd backend
cp .env.example .env
# Modifier DATABASE_URL dans .env avec vos identifiants PostgreSQL

npm install
npm run migrate   # Applique les migrations Prisma
npm run dev       # Lance le serveur sur http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # Lance sur http://localhost:5173
```

---

## Application mobile (Expo)

> Prérequis : Node.js, Expo CLI (`npm install -g expo-cli`), et l'app **Expo Go** sur le téléphone.

```bash
cd mobile
npm install
```

Modifier `mobile/.env` pour pointer vers l'API backend :

```env
EXPO_PUBLIC_API_URL=http://<votre-ip-locale>:3000/api
```

```bash
npm start   # Scanner le QR code avec Expo Go
```

---

## Données de test (seed)

Pour peupler la base avec des données de démonstration :

```bash
cd backend
npm run seed
```

Comptes créés :

| Rôle        | Email                  | Mot de passe  |
|-------------|------------------------|---------------|
| Admin       | admin@rifle.com        | password123   |
| Organisateur| organizer@rifle.com    | password123   |
| Utilisateur | user@rifle.com         | password123   |

---

## Tests

```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && npm test
```
