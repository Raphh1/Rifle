# Rifle — Contexte projet pour Claude Code

> Ce fichier est lu automatiquement par Claude Code au démarrage de chaque conversation.
> Il sert de base de connaissance partagée entre tous les développeurs du projet.

## Instructions pour Claude

Avant d'écrire du code :
1. Vérifie dans la roadmap ci-dessous si la tâche demandée correspond à un item existant
2. Vérifie que la tâche est dans le domaine du dev qui la demande (voir répartition équipe)
3. Analyse le problème et propose l'approche avant de coder
4. Quand c'est terminé, coche l'item dans la roadmap si applicable

Règles :
- Toujours lire les fichiers concernés avant de les modifier
- Respecter les conventions de code listées ci-dessous
- Ne pas toucher aux fichiers de l'autre dev sans le signaler
- Proposer des PR courtes et ciblées, pas des refactors massifs
- Mets à jour ce fichier en fonction de ce qui est fait a chaque fois
- **Refactoring continu** : à chaque développement, refactoriser le code touché (simplifier, supprimer le code mort, extraire les duplications, améliorer le nommage). Le refactoring doit rester dans le périmètre des fichiers modifiés — ne pas partir en refactor global non demandé.

## Projet

Rifle est une plateforme de billetterie événementielle full-stack en français.

### Stack technique

| Couche | Techno |
|--------|--------|
| Backend | Node.js + Express.js + Prisma ORM + PostgreSQL |
| Frontend | React + TypeScript + Tailwind CSS + React Query + Vite |
| Mobile | React Native + Expo |
| Temps réel | Socket.io (chat, typing, réactions, notifications) |
| Email | Nodemailer + PDFKit (billets PDF avec QR) |
| Auth | JWT Bearer token (2h expiry) |
| Infra | Docker Compose (backend, frontend, mobile, db, adminer) |

### Ports

- Frontend : `5173`
- Backend : `3000`
- PostgreSQL : `5432`
- Adminer : `8080`

### Rôles utilisateur

- **user** : browse events, acheter billets, social (amis, rooms, favoris, avis)
- **organizer** : créer/gérer events, dashboard ventes, scanner billets QR
- **admin** : dashboard global, gestion utilisateurs, modération

### Comptes de test (seed)

- `admin@rifle.com` / `password123`
- `organizer@rifle.com` / `password123`
- `user@rifle.com` / `password123`

## Setup

```bash
./setup.sh
```

Lance docker compose, attend la BDD, exécute les migrations Prisma et le seed.

## Équipe & répartition du travail

### Membres
- **Cesar** — Dev A
- **Raphael** (Raphh1) — Dev B

### Domaines de responsabilité

Chaque dev est **owner vertical** (backend + frontend) de ses domaines pour éviter les conflits git :

| Domaine | Dev A (Cesar) | Dev B (Raphael) |
|---------|:---:|:---:|
| Events (list, detail, create, edit, filtres) | x | |
| Tickets (achat, transfer, cancel, scanner) | x | |
| Dashboards (admin, organizer) | x | |
| Social (amis, rooms, chat, notifications) | | x |
| Auth + Profil (login, register, onboarding) | | x |
| Landing page | | x |

### Fichiers par dev (éviter les conflits)

- **Dev A** : `pages/events/`, `pages/tickets/`, `pages/dashboard/`, `pages/admin/`, `ticketController`, `eventController`, `dashboardRoutes`, `adminController`
- **Dev B** : `pages/social/`, `pages/auth/`, `pages/profile/`, `components/Layout.tsx`, `friendController`, `roomController`, `messageController`, `AuthContext`

### Fichiers partagés (coordination requise)

Ces fichiers sont touchés par les deux devs — **un seul le modifie par sprint**, l'autre fait la review :
- `router/index.tsx`
- `types/api.ts` / `types/social.ts`
- `api/queries.ts` / `api/socialQueries.ts`
- `prisma/schema.prisma`

### Répartition Phase 1

**Dev A (Cesar) — Flow transactionnel :**
- [x] Modal confirmation achat + page post-achat (`/tickets/:id/success`)
- [x] "Plus que X places !" sur EventCard (badge rouge < 20% capacité)
- [x] CTA "Acheter" sticky bottom mobile (visible < lg)

**Dev B (Raphael) — Infrastructure UX :**
- [ ] Système de toasts (composant partagé + remplacer les `alert()`)
- [ ] Redirect post-login vers page d'origine
- [ ] Landing page

### Règles de collaboration

1. **Branches par feature** : `feat/purchase-confirmation`, `feat/toast-system`, etc.
2. **PR courtes** : merge souvent sur `develop`, pas de branches > 3 jours
3. **Sync quotidien** : `git pull origin develop` avant de commencer
4. **Fichiers partagés** : prévenir l'autre avant de toucher à `router/index.tsx`, `types/`, `queries.ts` ou `schema.prisma`
5. **PR review croisée** : chaque PR est review par l'autre dev avant merge

## Conventions de code

- **Langue** : interface et messages en français, code (variables, fonctions) en anglais
- **JSX** : écrire les caractères accentués directement (é, è, ê, à, ô...), JAMAIS d'escape Unicode (\u00e9)
- **Commits** : messages en français ou anglais, concis
- **Styles** : Tailwind CSS, dark theme (slate/indigo), pas de CSS custom sauf exceptions
- **Validation** : Zod côté frontend, vérifications manuelles côté backend
- **API** : préfixe `/api`, React Query pour le fetching frontend
- **Temps réel** : Socket.io pour chat/notifications, REST pour le reste

## Structure du projet

```
Rifle/
├── backend/
│   └── src/
│       ├── controllers/     # Logique métier
│       ├── routes/          # Définition des endpoints
│       ├── middleware/       # auth (JWT), upload (multer)
│       ├── services/        # mail, PDF
│       ├── websocket/       # Socket.io events
│       ├── prisma/          # schema.prisma, seed.js, client
│       ├── constants/       # ticket statuses
│       └── config/          # swagger
├── frontend/
│   └── src/
│       ├── pages/           # auth, events, tickets, dashboard, admin, social, profile
│       ├── components/      # Layout, ProtectedRoute, LoadingScreen
│       ├── api/             # queries.ts, socialQueries.ts, axiosClient
│       ├── context/         # AuthContext, SocketContext
│       ├── types/           # api.ts, social.ts
│       └── router/          # routes + guards
├── mobile/                  # React Native + Expo
├── docker-compose.yml
└── setup.sh
```

## Roadmap produit (priorisée)

### Phase 1 — Fondations (frictions critiques)
- [x] Modal confirmation achat + page post-achat "Merci" (QR + actions)
- [ ] Système de toasts (remplacer tous les alert() natifs)
- [ ] Redirect post-login vers la page d'origine
- [x] "Plus que X places !" sur events < 20% capacité restante
- [x] CTA "Acheter" sticky bottom mobile sur EventDetail

### Phase 2 — Activation (visiteurs → utilisateurs)
- [ ] Landing page avec events populaires + social proof
- [ ] Onboarding post-inscription (profil, catégories, découverte)
- [ ] "X amis y vont" sur les EventCards
- [ ] Suggestion de rooms après achat de billet
- [ ] Bouton "Ajouter au calendrier" (ICS) sur les tickets

### Phase 3 — Rétention
- [ ] Notifications de rappel event (J-7, J-1)
- [ ] Post-event flow : notification J+1 "Laissez un avis"
- [ ] Recommandations "Pour vous" (catégories + amis)
- [ ] Wallet de billets / historique visuel events passés
- [ ] Skeleton loaders sur toutes les listes

### Phase 4 — Viralité
- [ ] Partage social avec image OG dynamique
- [ ] Système de referral
- [ ] Groupes d'achat (4+ = réduction)
- [ ] Rooms visibles avant achat (FOMO)
- [ ] Digest hebdomadaire email

### Phase 5 — Monétisation
- [ ] Intégration Stripe
- [ ] Commissions organisateur
- [ ] Events sponsorisés
- [ ] Analytics organisateur avancées
- [ ] PWA installable

## Frictions UX connues (à corriger)

### 🔴 Critiques
1. ~~Achat billet en 1 clic sans confirmation ni récap prix~~ ✅ Modale de confirmation avec récap
2. ~~Pas de page post-achat (aucun feedback, pas de QR affiché)~~ ✅ Page `/tickets/:id/success` avec QR
3. `alert()` natifs partout (achat, annulation, transfert, suppression) — achat corrigé, reste les autres
4. Pas de landing page (visiteur tombe sur /events sans contexte)
5. Pas d'onboarding post-inscription
6. Redirect post-login ne ramène pas sur la page d'origine
7. ~~CTA achat pas assez visible sur EventDetail~~ ✅ CTA sticky bottom mobile + badge urgence

### 🟠 Importants
8. Transfert billet par email uniquement (pas de sélection d'amis)
9. Features sociales déconnectées du flow principal
10. Dashboard admin sans tendances temporelles
11. Pas de suggestions d'amis contextuelles
12. Scanner accessible uniquement depuis la navbar
13. Pas de skeleton loaders (spinners basiques)

## Idées rétention & viralité

**Rétention** : rappels event, post-event flow (avis J+1), recommandations perso, wallet billets, digest hebdo
**Viralité** : referral invite ami, partage "J'y vais !", groupes d'achat, classement top fans, rooms visibles avant achat
**Micro-UX rapides** : aria-label sur boutons icône, prix en gros sur EventCard, compteur caractères description, date relative sur tickets
