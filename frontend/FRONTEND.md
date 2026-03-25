# Frontend - Rifle Event Management Platform

## 📋 Vue d'ensemble

Frontend moderne pour la plateforme de gestion d'événements **Rifle**, construit avec React 19, TypeScript, Vite et React Query.

## 🚀 Démarrage rapide

### Prerequisites

- Node.js 18+
- npm ou yarn

### Installation

```bash
cd frontend
npm install
```

### Configuration

Créez un fichier `.env.local` :

```env
VITE_API_URL=http://localhost:3000/api
```

### Développement

```bash
npm run dev
```

Le frontend sera disponible sur `http://localhost:5173`

### Build

```bash
npm run build
```

## 📁 Structure du projet

```
src/
├── api/
│   ├── axiosClient.ts          # Instance Axios configurée
│   ├── axiosInterceptor.ts     # Intercepteurs pour tokens
│   └── queries.ts               # Hooks React Query pour API
├── components/
│   ├── Layout.tsx               # Layout principal avec navbar
│   ├── Layout.css
│   ├── ProtectedRoute.tsx       # Routes protégées par authentification
│   └── ProtectedRoute.tsx
├── context/
│   └── AuthContext.tsx          # Context d'authentification
├── hooks/
│   └── useForm.ts               # Hook personnalisé pour formulaires
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── auth.css
│   ├── events/
│   │   ├── EventList.tsx        # Affiche tous les événements
│   │   ├── EventDetail.tsx      # Détails d'un événement
│   │   ├── CreateEvent.tsx      # Créer un nouvel événement
│   │   └── events.css
│   ├── tickets/
│   │   ├── TicketsList.tsx      # Liste des billets de l'utilisateur
│   │   ├── TicketValidate.tsx   # Valider un billet
│   │   └── tickets.css
│   ├── dashboard/
│   │   ├── OrganizerDashboard.tsx  # Dashboard organisateur
│   │   ├── AdminDashboard.tsx      # Dashboard admin
│   │   └── dashboard.css
├── router/
│   └── index.tsx                # Configuration routes react-router-dom
├── types/
│   └── api.ts                   # Types TypeScript pour API
├── utils/
│   └── validation.ts            # Schémas Zod pour validation
├── App.tsx                      # Composant racine
├── main.tsx                     # Point d'entrée
├── index.css                    # Styles globaux
└── App.css

```

## 🔐 Authentification

### AuthContext

Le contexte gère :

- État utilisateur (`user`)
- Jetons JWT stockés en localStorage
- Méthodes : `login()`, `register()`, `logout()`
- Loading et gestion d'erreurs

```tsx
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { user, login, isLoading, error } = useAuth();

  // Utilisation...
}
```

### Routes protégées

```tsx
<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />
```

## 🛣️ Routes disponibles

| Route                   | Description            | Authentification      |
| ----------------------- | ---------------------- | --------------------- |
| `/login`                | Page de connexion      | ❌                    |
| `/register`             | Page d'inscription     | ❌                    |
| `/events`               | Liste des événements   | ❌                    |
| `/events/:id`           | Détails d'un événement | ❌                    |
| `/create-event`         | Créer un événement     | ✅ Organisateur       |
| `/tickets`              | Mes billets            | ✅                    |
| `/tickets/:id/validate` | Valider un billet      | ✅ Organisateur       |
| `/dashboard`            | Tableau de bord        | ✅ Organisateur/Admin |

## 🧪 API Client

### React Query hooks

```tsx
import { useEvents, useEventDetail, useCreateEvent } from "@/api/queries";

// Récupérer la liste des événements
const { data, isLoading, error } = useEvents(page, limit);

// Récupérer un événement spécifique
const { data: event } = useEventDetail(eventId);

// Créer un événement (mutation)
const createEventMutation = useCreateEvent();
await createEventMutation.mutateAsync(eventData);
```

### Axios interceptors

- Ajoute automatiquement le token Authorization
- Gère les réponses 401 (token expiré)
- Redirection vers `/login` si rechargement de token échoue

## ✅ Validation des formulaires

Utilise **Zod** pour la validation côté client :

```tsx
import { loginSchema } from "@/utils/validation";

const validData = loginSchema.parse(formData);
```

Schémas disponibles :

- `loginSchema`
- `registerSchema`

## 🎨 Styling

- **CSS Vanilla** - Pas de framework CSS
- Responsive design (mobile-first)
- Thème cohérent avec couleurs principales

### Couleurs principales

- Primaire: `#667eea`
- Secondaire: `#764ba2`
- Background: `#f5f5f5`
- Text: `#333`

## 📦 Dépendances principales

- **react**: UI library
- **react-router-dom**: Routage
- **@tanstack/react-query**: State management / fetch
- **axios**: HTTP client
- **zod**: Validation de schémas TypeScript
- **typescript**: Type safety

## 🔄 Workflow de développement

### Créer une nouvelle page

1. Créer le composant dans `src/pages/[feature]/`
2. Ajouter les routes dans `src/router/index.tsx`
3. Créer les styles dans `src/pages/[feature].css`
4. Implémenter les hooks API si nécessaire dans `src/api/queries.ts`

### Ajouter une nouvelle fonctionnalité API

1. Créer le hook React Query dans `src/api/queries.ts`
2. Ajouter les types TypeScript dans `src/types/api.ts`
3. Utiliser le hook dans les composants

### Ajouter une validation de formulaire

1. Créer le schéma Zod dans `src/utils/validation.ts`
2. Importer et utiliser dans le composant

## 🧠 Architecture

### Pattern utilisé : Container / Presentational

- **Containers** : pages avec logique métier
- **Presentational** : composants réutilisables

### State management

- **React Context** : authentification utilisateur
- **React Query** : cache API et synchronisation
- **Local state** : formulaires avec `useState`

## 🐛 Dépannage

### CORS errors

Assurez-vous que le backend est configuré pour accepter les requêtes depuis `http://localhost:5173`

### Token expiré

Les 401 sont gérés automatiquement par les interceptors. Vérifiez le endpoint `/auth/refresh-token` du backend.

### Erreurs TypeScript

Vérifiez que tous les types sont exportés dans `src/types/api.ts`

## 📝 Commits

Convention :

```
feat(front): add login page
fix(front): correct axios interceptor
docs(front): update README
```

## 🚀 Deployment

### Build for production

```bash
npm run build
```

### Preview

```bash
npm run preview
```

Le dossier `dist/` contient les fichiers prêts pour le déploiement.

---

**Développé avec ❤️ pour Rifle**
