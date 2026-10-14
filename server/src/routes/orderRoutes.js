import express from "express";
import {
  checkout,
  getMyOrders,
  getMyOrderById,
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/admin/all", requireAdmin, getAllOrdersAdmin);
router.get("/admin/:id", requireAdmin, getOrderByIdAdmin);
router.put("/admin/:id/status", requireAdmin, updateOrderStatus);

router.post("/checkout", checkout);
router.get("/", getMyOrders);
router.get("/:id", getMyOrderById);

export default router;
