const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

beforeAll(async () => {
  // Optionnel: Connexion ou setup global
});

afterAll(async () => {
  await prisma.$disconnect();
});