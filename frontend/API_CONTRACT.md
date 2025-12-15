# API Contract - Frontend Requirements

Ce document décrit les endpoints API que le frontend attend du backend.

## Base URL

```
http://localhost:3000/api
```

Tous les endpoints nécessitent le header `Content-Type: application/json`

## Authentication

### POST /auth/login

Login l'utilisateur

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user" | "organizer" | "admin"
    },
    "accessToken": "jwt_token_here"
  }
}
```

### POST /auth/register

Crée un nouvel utilisateur

**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):** Même que `/auth/login`

### POST /auth/refresh-token

Renouvelle le token d'accès

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token_here"
  }
}
```

## Events

### GET /events

Récupère la liste des événements

**Query params:**
- `page` (default: 1)
- `limit` (default: 10)
- `category` (optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "title": "Event Title",
        "description": "Event description",
        "date": "2025-12-15T10:00:00Z",
        "location": "Paris, France",
        "price": 25.99,
        "capacity": 100,
        "remaining": 45,
        "imageUrl": "https://...",
        "organizer": {
          "id": "uuid",
          "name": "Organizer Name"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "totalPages": 5
    }
  }
}
```

### GET /events/:id

Récupère les détails d'un événement

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Event Title",
    "description": "Event description",
    "date": "2025-12-15T10:00:00Z",
    "location": "Paris, France",
    "price": 25.99,
    "capacity": 100,
    "remaining": 45,
    "imageUrl": "https://...",
    "organizer": {
      "id": "uuid",
      "name": "Organizer Name"
    }
  }
}
```

### POST /events

Crée un nouvel événement

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "title": "Event Title",
  "description": "Event description",
  "date": "2025-12-15T10:00:00Z",
  "location": "Paris, France",
  "price": 25.99,
  "capacity": 100,
  "imageUrl": "https://..."
}
```

**Response (201):** Retourne l'événement créé

## Tickets

### GET /tickets

Récupère les billets de l'utilisateur connecté

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "eventId": "uuid",
      "status": "paid" | "pending" | "used",
      "qrCode": "base64_or_url",
      "event": {
        "id": "uuid",
        "title": "Event Title",
        "date": "2025-12-15T10:00:00Z",
        "location": "Paris, France"
      }
    }
  ]
}
```

### GET /tickets/:id

Récupère les détails d'un billet

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "eventId": "uuid",
    "status": "paid" | "pending" | "used",
    "qrCode": "base64_or_url",
    "event": { ... }
  }
}
```

### POST /tickets/buy

Achète un billet pour un événement

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "eventId": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://payment-gateway.com/checkout/session_id"
  }
}
```

### POST /tickets/:id/validate

Valide un billet (organisateur)

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ticketId": "uuid",
    "valid": true
  }
}
```

## Dashboard

### GET /dashboard/organizer

Récupère les stats du tableau de bord organisateur

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "eventsCount": 5,
    "ticketsSold": 150,
    "revenues": 3750.50,
    "events": [
      {
        "id": "uuid",
        "title": "Event Title",
        "ticketsSold": 30,
        "capacity": 100,
        "revenues": 750
      }
    ]
  }
}
```

### GET /dashboard/admin

Récupère les stats du tableau de bord admin

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": 156,
    "events": 45,
    "ticketsSold": 2340,
    "revenues": 58500.99
  }
}
```

## Error Responses

Tous les erreurs doivent retourner un JSON structuré :

```json
{
  "success": false,
  "error": "Error message"
}
```

### Codes HTTP attendus

- `200 OK` - Succès
- `201 Created` - Ressource créée
- `400 Bad Request` - Données invalides
- `401 Unauthorized` - Token manquant/expiré
- `403 Forbidden` - Accès refusé (rôle insuffisant)
- `404 Not Found` - Ressource non trouvée
- `500 Internal Server Error` - Erreur serveur

## Authentication Flow

1. **Login/Register** → Reçoit `accessToken`
2. **Stockage** → `localStorage.setItem("accessToken", token)`
3. **Requêtes** → Header `Authorization: Bearer {token}`
4. **Expiration (401)** → Appelle `/auth/refresh-token`
5. **Refresh** → Reçoit nouveau `accessToken`
6. **Retry** → Réessaye la requête originale

## Notes

- Les timestamps doivent être en ISO 8601 (UTC)
- Tous les IDs sont des UUIDs (v4)
- Les prix sont en euros (EUR)
- Les images peuvent être des URLs complètes ou des chemins relatifs
- Le JWT doit être signé avec un secret sécurisé
- Implémentez les CORS pour permettre les requêtes depuis `http://localhost:5173`
