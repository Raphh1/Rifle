import { createServer } from "http";
import app from "./app.js";
import { setupWebSocket } from "./websocket/index.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

// Setup Socket.io
const io = setupWebSocket(httpServer);

// Make io accessible in routes via app
app.set("io", io);

httpServer.listen(PORT, () => {
  console.log(`Serveur lance sur le port ${PORT}`);
});
