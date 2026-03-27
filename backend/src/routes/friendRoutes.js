import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
  getFriendEvents,
  searchUsers,
} from "../controllers/friendController.js";

const router = express.Router();

router.get("/", authenticate, getFriends);
router.get("/requests", authenticate, getPendingRequests);
router.get("/search", authenticate, searchUsers);
router.post("/request/:userId", authenticate, sendFriendRequest);
router.put("/request/:friendshipId/accept", authenticate, acceptFriendRequest);
router.put("/request/:friendshipId/decline", authenticate, declineFriendRequest);
router.delete("/:userId", authenticate, removeFriend);
router.get("/:userId/events", authenticate, getFriendEvents);

export default router;
