import express from "express";
import { checkout } from "../controllers/orderController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.post("/checkout", checkout);

export default router;
