# Utiliser l'image Node.js officielle
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY src/package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY src/ ./

# Générer le client Prisma avec une DATABASE_URL temporaire pour le build
# Le schéma est dans /app/prisma/schema.prisma
RUN DATABASE_URL="postgresql://temp:temp@localhost:5432/temp?schema=public" npx prisma generate --schema=./prisma/schema.prisma

# Exposer le port
EXPOSE 3000

# Commande par défaut
CMD ["npm", "run", "dev"]
