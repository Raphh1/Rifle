import app from "./src/app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

console.log("Attempting to start server on port", PORT);

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
