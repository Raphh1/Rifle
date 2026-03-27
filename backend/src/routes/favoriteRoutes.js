import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  getFriendsFavorites,
  getFavoriteStatus,
} from "../controllers/favoriteController.js";

const router = express.Router();

// User favorites list
router.get("/me/favorites", authenticate, getMyFavorites);

// Event-specific favorites
router.post("/events/:eventId/favorite", authenticate, addFavorite);
router.delete("/events/:eventId/favorite", authenticate, removeFavorite);
router.get("/events/:eventId/favorite/status", authenticate, getFavoriteStatus);
router.get("/events/:eventId/favorites/friends", authenticate, getFriendsFavorites);

export default router;
