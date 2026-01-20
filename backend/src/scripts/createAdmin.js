import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Charger les variables d'environnement pour avoir accès à JWT_SECRET
dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

async function main() {
  const email = "admin@rifle.com";
  const password = "adminpassword"; // Tu pourras changer ça plus tard
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: email },
    update: { role: "admin" }, // Si l'utilisateur existe, on le passe admin
    create: {
      email: email,
      password: hashedPassword,
      name: "Super Admin",
      role: "admin",
    },
  });

  // Générer un token pour cet admin
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "24h" } // Token valable 24h pour tes tests
  );

  console.log(`✅ Admin user ready: ${user.email}`);
  console.log(`🔑 Password: ${password}`);
  console.log(`\n🎫 VOICI TON TOKEN ADMIN (Copie-le pour tes tests) :`);
  console.log(`Bearer ${token}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
