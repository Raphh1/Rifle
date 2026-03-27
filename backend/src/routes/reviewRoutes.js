import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createReview,
  getEventReviews,
  getEventRating,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/:eventId/reviews", getEventReviews);
router.get("/:eventId/rating", getEventRating);
router.post("/:eventId/reviews", authenticate, createReview);
router.put("/:eventId/reviews", authenticate, updateReview);
router.delete("/:eventId/reviews", authenticate, deleteReview);

export default router;
