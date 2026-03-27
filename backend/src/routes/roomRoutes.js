import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createRoom,
  getEventRooms,
  getRoomDetail,
  joinRoom,
  joinRoomByCode,
  inviteToRoom,
  leaveRoom,
  deleteRoom,
  kickMember,
  getMyRooms,
} from "../controllers/roomController.js";

const router = express.Router();

// My rooms
router.get("/rooms/me", authenticate, getMyRooms);

// Event rooms
router.post("/events/:eventId/rooms", authenticate, createRoom);
router.get("/events/:eventId/rooms", authenticate, getEventRooms);

// Room actions
router.get("/rooms/:roomId", authenticate, getRoomDetail);
router.post("/rooms/:roomId/join", authenticate, joinRoom);
router.post("/rooms/join/:inviteCode", authenticate, joinRoomByCode);
router.post("/rooms/:roomId/invite", authenticate, inviteToRoom);
router.delete("/rooms/:roomId/leave", authenticate, leaveRoom);
router.delete("/rooms/:roomId", authenticate, deleteRoom);
router.delete("/rooms/:roomId/members/:userId", authenticate, kickMember);

export default router;
