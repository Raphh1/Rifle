# Configuration Frontend

Cette section explique comment configurer le frontend pour un développement local ou un déploiement en production.

## Variables d'environnement

### Development (.env.local)

Créez un fichier `.env.local` à la racine du dossier `frontend/` :

```env
# API Backend
VITE_API_URL=http://localhost:3000/api

# Optional: Debug mode
# VITE_DEBUG=true
```

### Production (.env.production)

```env
VITE_API_URL=https://api.rifle-app.com/api
```

### Staging (.env.staging)

```env
VITE_API_URL=https://staging-api.rifle-app.com/api
```

## Accès aux variables d'environnement

Dans le code TypeScript/React :

```tsx
const apiUrl = import.meta.env.VITE_API_URL;
```

## Checklist de configuration

- [ ] `.env.local` créé avec `VITE_API_URL`
- [ ] Backend API URL correcte
- [ ] `npm install` exécuté
- [ ] Dépendances installées sans erreur
- [ ] `npm run dev` fonctionne sans erreur
- [ ] Frontend accessible sur `http://localhost:5173`
- [ ] Navigation vers `/events` fonctionne
- [ ] Connexion/Inscription accessible

## Checklist de déploiement

- [ ] `.env.production` configuré
- [ ] `npm run build` réussit
- [ ] `dist/` généré correctement
- [ ] Tailles des fichiers acceptables
- [ ] `npm run lint` sans erreurs
- [ ] Tests passent (`npm run test` si configuré)
- [ ] Backend URL valide en production
- [ ] CORS configuré côté backend

## Troubleshooting

### Port 5173 déjà utilisé
```bash
npm run dev -- --port 3001
```

### Module not found errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
npm run build
```

Vérifie les erreurs de compilation avant le déploiement.
