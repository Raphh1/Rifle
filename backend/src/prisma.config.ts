import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma", // 👈 corrige ici !
  migrations: {
    path: "./prisma/migrations",   // 👈 idem
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
