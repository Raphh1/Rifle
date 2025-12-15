# Rifle - Event Management Platform

Plateforme moderne de gestion d'événements avec système de billetterie.

## 🎯 Objectifs

- ✅ **Affichage d'événements** - Liste et détails des événements
- ✅ **Système de billetterie** - Achat et gestion des billets
- ✅ **Dashboard** - Statistiques pour organisateurs et administrateurs
- ✅ **Authentification** - Système de login/register
- ✅ **Gestion des rôles** - User, Organizer, Admin

## 🏗️ Architecture

```
Rifle (Monorepo)
├── backend/          # API Node.js/Express + Prisma
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── frontend/         # React 19 + TypeScript + Vite
    ├── src/
    ├── pages/
    ├── components/
    └── vite.config.ts
```

## 🚀 Démarrage rapide

### Backend

```bash
cd backend
npm install
npm run dev
```

> Backend sur `http://localhost:3000`

Voir `backend/README.md` ou `backend/Dockerfile`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> Frontend sur `http://localhost:5173`

## 📚 Documentation

### Backend
- `backend/README.md` - Configuration backend
- `backend/Dockerfile` - Conteneurisation

### Frontend
- `frontend/FRONTEND.md` - Documentation complète
- `frontend/CONFIGURATION.md` - Guide de configuration
- `frontend/API_CONTRACT.md` - Spécification des endpoints API
- `frontend/EXAMPLES.md` - Exemples d'utilisation
- `frontend/IMPLEMENTATION_SUMMARY.md` - Résumé implémentation

## 🔗 API Endpoints

Voir `frontend/API_CONTRACT.md` pour la liste complète des endpoints.

### Exemples principaux

```
POST   /api/auth/login              - Connexion
POST   /api/auth/register           - Inscription
GET    /api/events                  - Liste d'événements
GET    /api/events/:id              - Détails d'un événement
POST   /api/events                  - Créer un événement
GET    /api/tickets                 - Mes billets
POST   /api/tickets/buy             - Acheter un billet
POST   /api/tickets/:id/validate    - Valider un billet
GET    /api/dashboard/organizer     - Stats organisateur
GET    /api/dashboard/admin         - Stats admin
```

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Docker/Docker Compose

### Frontend
- React 19
- TypeScript
- Vite
- React Router v7
- React Query v5
- Axios
- Zod

## 🔐 Authentification

### Flow

1. **Register** - Créer un compte
2. **Login** - Obtenir JWT token
3. **Token Storage** - Stocké en localStorage
4. **Auto Headers** - Axios ajoute automatiquement le token
5. **Token Refresh** - Renouvellement automatique si expiré
6. **Logout** - Suppression du token

### Rôles

- **user** - Peut acheter des billets
- **organizer** - Peut créer des événements et valider les billets
- **admin** - Accès à toutes les données et statistiques

## 📱 Pages disponibles

### Public
- `/login` - Connexion
- `/register` - Inscription
- `/events` - Liste des événements
- `/events/:id` - Détails d'un événement

### Protected (User)
- `/tickets` - Mes billets
- `/tickets/:id/validate` - Valider un billet (Org)

### Protected (Organizer/Admin)
- `/create-event` - Créer un événement
- `/dashboard` - Tableau de bord

## 🔄 Workflow

### Utilisateur classique
1. Inscription → `/register`
2. Connexion → `/login`
3. Voir événements → `/events`
4. Acheter billet → `/events/:id` → Paiement
5. Voir billets → `/tickets`

### Organisateur
1. Inscription en tant qu'organisateur
2. Créer un événement → `/create-event`
3. Voir le dashboard → `/dashboard`
4. Valider les billets → `/tickets/:id/validate`
5. Consulter les stats

### Admin
1. Connexion avec rôle admin
2. Accès au dashboard global → `/dashboard`
3. Vue sur toutes les stats

## 📦 Installation et Déploiement

### Local Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (nouveau terminal)
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker-compose up --build
```

### Production

```bash
# Backend build
cd backend
npm run build

# Frontend build
cd frontend
npm run build
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🐛 Troubleshooting

### CORS Error
- Vérifier que backend CORS est configuré
- URL frontend doit être dans la liste blanche

### Token Expired
- Frontend gère automatiquement le refresh
- Vérifier que `/auth/refresh-token` est implémenté

### Port déjà utilisé
- Backend: `npm run dev -- --port 3001`
- Frontend: `npm run dev -- --port 3000`

## 📋 Checklist de développement

- [ ] Backend API démarrée
- [ ] Frontend démarrée
- [ ] Login/Register fonctionne
- [ ] Événements s'affichent
- [ ] Achat de billets fonctionne
- [ ] Dashboards visibles
- [ ] Tests passent
- [ ] CORS configuré
- [ ] Documentation à jour

## 🚀 Next Steps

1. **Intégration Payment** - Stripe/PayPal pour les paiements
2. **Email Notifications** - Confirmation de billet
3. **QR Code Scanner** - Application mobile pour scanner
4. **Analytics** - Graphiques avancés
5. **Search & Filters** - Recherche d'événements
6. **Favorites** - Événements favoris
7. **Reviews** - Commentaires et notes

## 📞 Support

Pour toute question :
1. Vérifier la documentation `frontend/FRONTEND.md`
2. Consulter les exemples `frontend/EXAMPLES.md`
3. Vérifier le contract API `frontend/API_CONTRACT.md`

## 📄 License

Propriétaire - Rifle Event Management

---

**Status:** ✅ Production Ready

**Dernière mise à jour:** 5 Novembre 2025
