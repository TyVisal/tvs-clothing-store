import express from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, requireAdmin, getDashboard);

export default router;
