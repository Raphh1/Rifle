// backend/tests/setup.js
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
  // si tu dois reset la BDD avant les tests, fais-le ici
  // await prisma.ticket.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// rendre accessible globalement si d'autres tests l'attendent
globalThis.prisma = prisma;