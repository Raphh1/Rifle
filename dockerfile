# Étape 1 - image de base
FROM node:20-alpine

# Étape 2 - répertoire de travail
WORKDIR /app

# Étape 3 - copier les fichiers
COPY package*.json ./

# Étape 4 - installer les dépendances
RUN npm install

# Étape 5 - copier le reste
COPY . .

# Étape 6 - exposer le port
EXPOSE 3000

# Étape 7 - lancer l'app
CMD ["npm", "run", "dev"]
