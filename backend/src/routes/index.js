import express from "express";
import authRoutes from "./authRoutes.js";
import eventRoutes from "./eventRoutes.js";
import userRoutes from "./userRoutes.js";
import ticketRoutes from "./ticketRoutes.js";
import adminRoutes from "./adminRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";

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

export default router;
