import express from "express";
import {
  getCustomers,
  getCustomerOrders,
  setCustomerStatus,
} from "../controllers/customerController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/", getCustomers);
router.get("/:id/orders", getCustomerOrders);
router.put("/:id/status", setCustomerStatus);

export default router;
