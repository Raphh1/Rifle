FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Génération du client Prisma (important)
RUN npx prisma generate --schema=./src/prisma/schema.prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate --schema=src/prisma/schema.prisma && npm run dev"]
