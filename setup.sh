#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Rifle - Setup & Seed               ${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. Lancer docker compose
echo -e "\n${YELLOW}[1/4] Lancement de docker compose...${NC}"
docker compose up -d --build

# 2. Attendre que la BDD soit prête
echo -e "\n${YELLOW}[2/4] Attente que la base de données soit prête...${NC}"
until docker exec rifle-db pg_isready -U postgres > /dev/null 2>&1; do
  echo -e "  ${YELLOW}En attente de PostgreSQL...${NC}"
  sleep 2
done
echo -e "  ${GREEN}PostgreSQL est prêt !${NC}"

# 3. Attendre que le backend ait fini d'installer ses dépendances
echo -e "\n${YELLOW}[3/4] Attente que le backend soit prêt...${NC}"
until docker exec rifle-backend sh -c "test -f node_modules/.package-lock.json" > /dev/null 2>&1; do
  echo -e "  ${YELLOW}Installation des dépendances backend...${NC}"
  sleep 3
done
echo -e "  ${GREEN}Backend prêt !${NC}"

# 4. Exécuter les migrations et le seed
echo -e "\n${YELLOW}[4/4] Migrations et seed...${NC}"

echo -e "  ${BLUE}-> Prisma generate...${NC}"
docker exec rifle-backend npx prisma generate --schema=src/prisma/schema.prisma

echo -e "  ${BLUE}-> Prisma migrate...${NC}"
docker exec rifle-backend npx prisma migrate dev --schema=src/prisma/schema.prisma --skip-generate

echo -e "  ${BLUE}-> Seed...${NC}"
docker exec rifle-backend node src/prisma/seed.js

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   Setup terminé !${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e ""
echo -e "  Frontend : ${BLUE}http://localhost:5173${NC}"
echo -e "  Backend  : ${BLUE}http://localhost:3000${NC}"
echo -e "  Adminer  : ${BLUE}http://localhost:8080${NC}"
echo -e ""
echo -e "  Comptes de test :"
echo -e "    ${YELLOW}admin@rifle.com${NC}     / password123"
echo -e "    ${YELLOW}organizer@rifle.com${NC} / password123"
echo -e "    ${YELLOW}user@rifle.com${NC}      / password123"
echo -e ""
