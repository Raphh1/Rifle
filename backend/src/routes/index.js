import express from "express";
import authRoutes from "./authRoutes.js";
import eventRoutes from "./eventRoutes.js";
import userRoutes from "./userRoutes.js";
import ticketRoutes from "./ticketRoutes.js";
import adminRoutes from "./adminRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import favoriteRoutes from "./favoriteRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import friendRoutes from "./friendRoutes.js";
import roomRoutes from "./roomRoutes.js";
import messageRoutes from "./messageRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import moderationRoutes from "./moderationRoutes.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/users", userRoutes);
router.use("/tickets", ticketRoutes);
router.use("/admin", adminRoutes);
router.use("/dashboard", dashboardRoutes);

// Social features
router.use("/", favoriteRoutes);
router.use("/events", reviewRoutes);
router.use("/friends", friendRoutes);
router.use("/", roomRoutes);
router.use("/", messageRoutes);
router.use("/notifications", notificationRoutes);
router.use("/", moderationRoutes);

export default router;
