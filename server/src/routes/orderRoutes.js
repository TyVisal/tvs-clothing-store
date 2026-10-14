import express from "express";
import {
  checkout,
  getMyOrders,
  getMyOrderById,
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.post("/checkout", checkout);
router.get("/", getMyOrders);
router.get("/:id", getMyOrderById);

export default router;
