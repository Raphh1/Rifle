# Suite de Tests - Rifle

## Vue d'ensemble

Cette suite de tests complète couvre le backend et le frontend de l'application Rifle avec des tests unitaires, d'intégration et de composants.

## Structure des Tests

### Frontend Tests (`frontend/src/`)

#### Tests Unitaires
- **`utils/validation.test.ts`** - Tests des schémas de validation Zod
  - Validation des schémas de login, register, et création d'événements
  - Tests des limites et contraintes de saisie
  - Coercion de types
  - Cas limites (zéro, très grandes valeurs, etc.)

- **`services/authService.test.ts`** - Tests du service d'authentification
  - Enregistrement d'utilisateur
  - Connexion utilisateur
  - Rafraîchissement de token
  - Récupération de l'utilisateur courant
  - Gestion des erreurs

#### Tests de Contexte
- **`context/AuthContext.test.tsx`** - Tests du contexte d'authentification React
  - État initial du provider
  - Gestion du localStorage
  - Logout et nettoyage

#### Tests de Composants
- **`pages/auth/Login.test.tsx`** - Tests du formulaire de connexion
  - Rendu du formulaire
  - Validation des entrées
  - Gestion des erreurs
  - Types d'inputs
  - Navigation

- **`pages/auth/Register.test.tsx`** - Tests du formulaire d'inscription
  - Rendu du formulaire
  - Validation de tous les champs
  - Gestion des erreurs
  - Navigation

- **`pages/events/EventList.test.tsx`** - Tests de la liste des événements
  - Rendu de la liste
  - États de chargement et d'erreur
  - Affichage des détails d'événements
  - Prix et billets restants
  - Pagination

- **`pages/dashboard/AdminDashboard.test.tsx`** - Tests du tableau de bord admin
  - Affichage des statistiques (utilisateurs, événements, billets, revenus)
  - États de chargement
  - Formatage des nombres
  - Gestion des valeurs nulles

- **`pages/tickets/TicketsList.test.tsx`** - Tests de la liste des billets
  - Rendu de la liste
  - Affichage des QR codes
  - Badges de statut
  - Localisation des événements
  - Prix des billets

### Backend Tests (`backend/tests/`)

#### Tests de Santé
- **`health.test.js`** - Tests de base de l'API
  - Réponse du chemin racine
  - Documentation Swagger
  - Gestion des routes non définies
  - Types de contenu
  - Format de réponse

#### Tests d'Authentification
- **`auth.test.js`** - Tests complets du système d'authentification
  - Enregistrement utilisateur
  - Validation des champs
  - Prévention des doublons d'emails
  - Hachage des mots de passe
  - Génération de JWT
  - Connexion avec identifiants valides/invalides
  - Middleware d'authentification
  - Intégrité des données utilisateur

#### Tests des Événements
- **`events.test.js`** - Tests des routes d'événements (CRUD)
  - Récupération de tous les événements
  - Filtrage et pagination
  - Création d'événement (avec authentification)
  - Récupération par ID
  - Mise à jour d'événement
  - Suppression d'événement
  - Validation des données
  - Vérification des permissions
  - Gestion des erreurs

#### Tests des Billets
- **`tickets.test.js`** - Tests des routes de billets
  - Récupération des billets utilisateur
  - Achat de billets
  - Récupération de billets spécifiques
  - Validation des billets
  - Génération de QR codes
  - Workflows de statut (pending → paid → used)
  - Gestion de la capacité d'événement
  - Isolation des données utilisateur

## Exécution des Tests

### Frontend
```bash
cd frontend
npm run test                 # Lancer les tests une fois
npm run test -- --watch     # Mode watch
npm run test -- --ui        # Interface utilisateur Vitest
```

### Backend
```bash
cd backend
npm run test                 # Lancer les tests une fois
npm run test -- --watch     # Mode watch
```

## Couverture

### Frontend
- ✅ Services d'authentification
- ✅ Contexte React
- ✅ Composants de formulaires
- ✅ Pages d'authentification
- ✅ Pages d'événements
- ✅ Tableaux de bord
- ✅ Pages de billets
- ✅ Schémas de validation

### Backend
- ✅ Routes d'authentification (register, login)
- ✅ Middleware d'authentification
- ✅ Routes d'événements (CRUD complet)
- ✅ Routes de billets (achat, validation, consultation)
- ✅ Validation des données
- ✅ Permissions et rôles
- ✅ Intégrité de la base de données

## Meilleures Pratiques Utilisées

1. **Tests isolés** - Chaque test est indépendant et utilise des données de test propres
2. **Nettoyage** - Les données de test sont supprimées après chaque test
3. **Mocks** - Les dépendances externes sont mockées pour une isolation complète
4. **Assertions claires** - Chaque test vérifie une seule chose
5. **Noms descriptifs** - Les noms de tests expliquent exactement ce qui est testé
6. **Cas limites** - Tests des scénarios normaux ET des cas d'erreur

## À Ajouter à l'Avenir

- [ ] Tests de performance (e2e avec Playwright)
- [ ] Tests d'accessibilité
- [ ] Tests visuels (snapshot tests)
- [ ] Tests d'intégration complets (frontend + backend)
- [ ] Tests de sécurité (injection SQL, XSS, etc.)
- [ ] Tests des dashboards d'organisateur
- [ ] Tests de gestion des erreurs réseau
- [ ] Tests de pagination avancée

## Dépannage

### Les tests échouent avec "Cannot find module"
```bash
npm install  # Assurez-vous que toutes les dépendances sont installées
```

### Erreurs de connexion à la base de données (backend)
- Assurez-vous que votre `.env` est configuré correctement
- Vérifiez que la base de données est accessible
- Vérifiez les migrations Prisma

### Timeout des tests
- Augmentez le timeout dans `vitest.config.ts` ou `jest.config.js`
- Vérifiez que votre serveur de test est assez rapide

## Configuration

Les tests utilisent :
- **Frontend** : Vitest + React Testing Library + @testing-library/user-event
- **Backend** : Vitest + Supertest + Prisma (SQLite de test)

Voir les fichiers de configuration :
- `frontend/vitest.config.ts`
- `backend/jest.config.js`
