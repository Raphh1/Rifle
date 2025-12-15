import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/index.js";
import { setupSwagger } from "./config/swagger.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use("/api", router);

app.get("/", (req, res) => {
  res.json({ message: "API Rifle en ligne 🚀" });
});

export default app;
