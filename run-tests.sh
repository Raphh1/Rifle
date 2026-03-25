#!/bin/bash

# Script de test rapide pour Rifle
# Exécute tous les tests du projet

echo "🧪 Lancement de la suite de tests Rifle..."
echo ""

# Check if we're in the root directory
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Frontend
echo -e "${YELLOW}📦 Tests Frontend${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📥 Installation des dépendances frontend..."
    npm install
fi

echo "🔍 Lancement des tests frontend..."
npm run test -- --run
FRONTEND_TEST_RESULT=$?

cd ..

# Test Backend
echo ""
echo -e "${YELLOW}⚙️  Tests Backend${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    echo "📥 Installation des dépendances backend..."
    npm install
fi

echo "🔍 Lancement des tests backend..."
npm run test -- --run
BACKEND_TEST_RESULT=$?

cd ..

# Results
echo ""
echo -e "${YELLOW}📊 Résumé des tests${NC}"
echo "─────────────────────────────────"

if [ $FRONTEND_TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Tests Frontend: PASSED${NC}"
else
    echo -e "${RED}❌ Tests Frontend: FAILED${NC}"
fi

if [ $BACKEND_TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Tests Backend: PASSED${NC}"
else
    echo -e "${RED}❌ Tests Backend: FAILED${NC}"
fi

# Final result
if [ $FRONTEND_TEST_RESULT -eq 0 ] && [ $BACKEND_TEST_RESULT -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Tous les tests sont passés!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  Certains tests ont échoué${NC}"
    exit 1
fi
