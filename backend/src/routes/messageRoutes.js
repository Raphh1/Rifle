import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getRoomMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/rooms/:roomId/messages", authenticate, getRoomMessages);
router.post("/rooms/:roomId/messages", authenticate, sendMessage);
router.put("/messages/:messageId", authenticate, editMessage);
router.delete("/messages/:messageId", authenticate, deleteMessage);
router.post("/messages/:messageId/reactions", authenticate, addReaction);

export default router;
