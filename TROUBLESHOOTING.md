# 🔧 Dépannage Frontend - Guide de résolution

Guide complet pour résoudre les problèmes courants du frontend Rifle.

## 🚀 Installation & Démarrage

### Problème: Module not found / npm ERR!

**Symptômes:**
```
npm ERR! code E404
npm ERR! 404 Not Found - GET...
```

**Solution:**
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Alternative:**
```bash
npm install --legacy-peer-deps
```

---

### Problème: Port 5173 déjà utilisé

**Symptômes:**
```
EADDRINUSE: address already in use :::5173
```

**Solutions:**

1. **Utiliser un autre port**
```bash
npm run dev -- --port 3000
```

2. **Tuer le processus existant**
```bash
# MacOS/Linux
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

### Problème: npm run dev ne démarre pas

**Symptômes:**
- Rien ne s'affiche
- Erreurs cryptiques
- Page blanche

**Solutions:**

1. **Vérifier la version Node**
```bash
node --version  # Doit être 18+
npm --version   # Doit être 9+
```

2. **Vérifier .env.local**
```bash
cat .env.local
# Doit avoir: VITE_API_URL=http://localhost:3000/api
```

3. **Rebuild complet**
```bash
npm run build    # Vérifie les erreurs TypeScript
npm run dev      # Démarre après correction
```

---

## 🔐 Authentification

### Problème: Login ne fonctionne pas

**Symptômes:**
- Bouton login qui ne répond pas
- Erreur "401 Unauthorized"
- Redirection infinie

**Solutions:**

1. **Vérifier que le backend est lancé**
```bash
curl http://localhost:3000/api/auth/login
# Doit retourner une réponse (pas connection refused)
```

2. **Vérifier .env.local**
```bash
# Doit être:
VITE_API_URL=http://localhost:3000/api

# PAS:
VITE_API_URL=http://localhost:3000
```

3. **Vérifier CORS côté backend**
```javascript
// Backend doit avoir:
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

4. **Vérifier la réponse du backend**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Doit retourner:
# {"success":true,"data":{"user":{...},"accessToken":"jwt..."}}
```

---

### Problème: Token expiré / 401 Unauthorized

**Symptômes:**
- Logout inattendu
- Erreur 401 constant
- Redirection vers /login

**Solutions:**

1. **Backend doit implémenter /auth/refresh-token**
```bash
# Test du refresh
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Authorization: Bearer {token}"

# Doit retourner: {"success":true,"data":{"accessToken":"new_jwt"}}
```

2. **Vérifier les interceptors**
- Les interceptors gèrent automatiquement le 401
- Si problème persiste: check browser console (F12)

3. **Effacer le localStorage**
```javascript
// Dans la console du navigateur
localStorage.clear();
location.reload();
```

---

## 📡 API & Réseau

### Problème: CORS Error

**Symptômes:**
```
Access to XMLHttpRequest blocked by CORS policy
Origin http://localhost:5173 not allowed
```

**Solutions:**

1. **Configurer CORS côté backend**
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

2. **Vérifier l'URL de l'API**
```bash
# Frontend .env.local:
VITE_API_URL=http://localhost:3000/api

# Backend doit écouter sur:
PORT=3000
```

3. **Redémarrer le backend**
```bash
# Si CORS changé
npm run dev
# ou
npm restart
```

---

### Problème: 404 Not Found

**Symptômes:**
```
404 - GET /api/events
```

**Solutions:**

1. **Vérifier que l'endpoint existe au backend**
```bash
curl http://localhost:3000/api/events
# Doit retourner une réponse, pas 404
```

2. **Vérifier le chemin exact**
```javascript
// Frontend appelle:
api.get('/events')

// Qui devient:
http://localhost:3000/api/events

// Backend doit avoir:
app.get('/api/events', ...)
// OU
router.get('/events', ...)  // Si router préfixé
```

3. **Vérifier les routes du backend**
```bash
# Terminal du backend
# Doit afficher les routes disponibles au démarrage
```

---

### Problème: Timeout / Pas de réponse

**Symptômes:**
- Page qui charge indéfiniment
- Network tab: requête en attente
- Console: "Failed to fetch" après timeout

**Solutions:**

1. **Vérifier que le backend est actif**
```bash
ps aux | grep node
# Doit montrer le processus node en cours d'exécution

curl http://localhost:3000/api/health
# Si endpoint existe
```

2. **Augmenter le timeout d'Axios**
```javascript
// src/api/axiosClient.ts
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,  // 30 secondes au lieu de 10
  headers: { "Content-Type": "application/json" }
});
```

3. **Redémarrer le backend**
```bash
cd backend
npm run dev
```

---

## 🎨 Interface & Styling

### Problème: Styles ne s'appliquent pas

**Symptômes:**
- Page blanche ou mal stylisée
- CSS ne charge pas
- Tailwind/Bootstrap ne fonctionne pas

**Solutions:**

1. **Vérifier imports CSS**
```tsx
// App.tsx doit avoir:
import './App.css'
import './index.css'

// Pages doivent importer leurs CSS:
import './events.css'
```

2. **Vérifier Vite config**
```javascript
// vite.config.ts
import css from '@vitejs/plugin-css'
export default {
  plugins: [css()]
}
```

3. **Recharger la page (hard refresh)**
```
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

---

### Problème: Navbar/Layout disparue

**Symptômes:**
- Navigation n'apparaît pas
- Layout cassé

**Solutions:**

1. **Vérifier l'import du Layout**
```tsx
// router/index.tsx
import { Layout } from "../components/Layout"

// Utilisation:
<Layout><Outlet /></Layout>
```

2. **Vérifier le CSS**
```bash
# Layout.css doit avoir .navbar, .main-content, .footer
grep "\.navbar\|\.main-content\|\.footer" src/components/Layout.css
```

---

## 🐛 TypeScript & Compilation

### Problème: TypeScript Error

**Symptômes:**
```
error TS2307: Cannot find module
error TS2322: Type not assignable
```

**Solutions:**

1. **Vérifier les types**
```bash
# Régénérer les types
npm run build  # Affiche les erreurs

# Ou directement:
npx tsc --noEmit
```

2. **Importer les types correctement**
```tsx
import type { User, Event } from '@/types/api'

// PAS:
import { User } from '@/types/api'  // User est une interface
```

3. **Ajouter les types manquants**
```typescript
// src/types/api.ts

export interface MonType {
  id: string
  name: string
}
```

---

### Problème: Module not found (TypeScript)

**Symptômes:**
```
Cannot find module '@/pages/events/EventList'
```

**Solutions:**

1. **Vérifier l'import**
```tsx
// ✅ Correct
import { EventList } from '@/pages/events/EventList'

// ❌ Incorrect
import { EventList } from '@pages/events'
import EventList from '@/pages/events/EventList'  // sans {}
```

2. **Vérifier que le fichier existe**
```bash
ls -la src/pages/events/EventList.tsx
```

3. **Vérifier tsconfig.json**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## 🧪 React Query

### Problème: Les données ne se rechargent pas

**Symptômes:**
- Données en cache stale
- Mutations ne déclenchent pas la maj

**Solutions:**

1. **Forcer le refetch**
```tsx
const { refetch } = useEvents()
<button onClick={() => refetch()}>Actualiser</button>
```

2. **Vérifier l'invalidation**
```tsx
// mutations doivent invalider les queries:
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['events'] })
}
```

3. **Vérifier le staleTime**
```tsx
useQuery({
  queryKey: ['events'],
  queryFn: ...,
  staleTime: 5 * 60 * 1000,  // 5 minutes
})
```

---

### Problème: Loading/Error infinite

**Symptômes:**
- Page toujours "Chargement..."
- Erreur qui ne disparaît pas

**Solutions:**

1. **Vérifier que le backend répond**
```bash
curl http://localhost:3000/api/events
```

2. **Vérifier les logs du frontend**
```javascript
// Browser console (F12)
// Doit montrer la requête + réponse
```

3. **Vérifier la réponse du backend**
```javascript
// Réponse doit avoir le format:
{
  "success": true,
  "data": [...]
}
// Pas:
[...]  // Direct sans wrapper
```

---

## 🔍 Debugging

### Ouvrir la console du navigateur

```
F12 (Windows/Linux)
Cmd + Option + I (Mac)
```

Onglets utiles:
- **Console** - Erreurs et logs
- **Network** - Requêtes HTTP
- **Application** - localStorage, cookies
- **Sources** - Debugger TypeScript

### Afficher les logs API

```tsx
// src/api/axiosClient.ts

api.interceptors.request.use((config) => {
  console.log('🚀 Request:', config.method?.toUpperCase(), config.url)
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.data)
    return response
  },
  (error) => {
    console.log('❌ Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)
```

### Déboguer React

```javascript
// React DevTools: installer l'extension
// Chrome: React DevTools
// Firefox: React DevTools

// Props d'un composant:
// Clic droit → Inspect → React tab
```

---

## 🆘 Problèmes difficiles

### Problème: Page blanche

**Diagnostic:**
```bash
# 1. Ouvrir console (F12)
# 2. Chercher les erreurs rouges
# 3. Vérifier le Network
# 4. Vérifier le terminal npm
```

**Solutions générales:**
```bash
# Rebuild complet
rm -rf node_modules dist .vite
npm install
npm run build

# Si erreur build:
npm run build 2>&1 | head -50
# Affiche les premières 50 lignes d'erreur
```

### Problème: Composant ne render pas

**Solutions:**
```tsx
// ✅ Render simple
export function MyComponent() {
  return <div>Hello</div>
}

// ❌ Oubli export
function MyComponent() { }  // manque export

// ❌ Export default manquant
export MyComponent  // manque default
```

---

## 📞 Besoin de plus d'aide?

1. **Vérifier la documentation**
   - `FRONTEND.md` - Vue d'ensemble
   - `API_CONTRACT.md` - Specs API

2. **Vérifier les logs**
   - Terminal npm (erreurs build)
   - Console navigateur (F12)
   - Network tab (requêtes)

3. **Vérifier le backend**
   - APIs disponibles?
   - CORS configuré?
   - Données valides?

4. **Redémarrer complètement**
   ```bash
   # Frontend
   npm run dev

   # Backend (nouveau terminal)
   npm run dev
   ```

---

**Dernière mise à jour:** 5 Novembre 2025
**Status:** Guidance complète
