# Rifle - Application de Billetterie et Scan

Application complète de gestion d'événements (Shotgun) avec Backend Node.js et Application Mobile React Native.

## 📁 Structure du Projet

- **backend/** : API REST (Node.js, Express, Prisma, SQLite/Postgres).
- **mobile/** : Application mobile (React Native, Expo) pour scanner les billets.

---

## 🚀 Installation et Lancement

### 1. Backend (API)

Pré-requis : [Node.js](https://nodejs.org/) installé.

1.  Allez dans le dossier backend :
    ```bash
    cd backend
    ```
2.  Installez les dépendances :
    ```bash
    npm install
    ```
3.  Configurez la base de données (SQLite par défaut) :
    ```bash
    npx prisma migrate dev --name init --schema=src/prisma/schema.prisma
    ```
4.  Lancez le serveur :
    ```bash
    npm run dev
    ```
    L'API sera accessible sur `http://localhost:3000`.

**Documentation API** :
Une fois le serveur lancé, accédez à la documentation Swagger ici :
👉 `http://localhost:3000/api-docs`

**Tests** :
```bash
npm run test
```

### 2. Application Mobile

Pré-requis : [Expo Go](https://expo.dev/client) sur votre téléphone.

1.  Allez dans le dossier mobile :
    ```bash
    cd mobile
    ```
2.  Installez les dépendances :
    ```bash
    npm install
    ```
3.  Configurez l'API :
    - Ouvrez `src/services/api.js`.
    - Remplacez l'URL par l'IP locale de votre PC (ex: `http://192.168.1.XX:3000/api`) ou utilisez le mode tunnel.
4.  Lancez l'application :
    ```bash
    npx expo start --tunnel
    ```
5.  Scannez le QR Code avec l'application Expo Go (Android/iOS).

---

## 🛠 Technologies

- **Backend** : Node.js, Express, Prisma, Swagger, Jest.
- **Mobile** : React Native, Expo, React Navigation, Expo Camera.
- **Base de données** : SQLite (Dev) / PostgreSQL (Prod).
