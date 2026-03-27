import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createReport,
  blockUser,
  unblockUser,
  getReports,
  resolveReport,
} from "../controllers/moderationController.js";

const router = express.Router();

// User actions
router.post("/reports", authenticate, createReport);
router.post("/blocks/:userId", authenticate, blockUser);
router.delete("/blocks/:userId", authenticate, unblockUser);

// Admin actions
router.get("/admin/reports", authenticate, authorize("admin"), getReports);
router.put("/admin/reports/:id/resolve", authenticate, authorize("admin"), resolveReport);

export default router;
