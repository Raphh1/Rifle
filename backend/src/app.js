import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";
import { setupSwagger } from "./config/swagger.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Setup pour servir les fichiers statiques (images uploadées)
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

setupSwagger(app);

app.use("/api", router);

app.get("/", (req, res) => {
  res.json({ message: "API Rifle en ligne 🚀" });
});

export default app;
