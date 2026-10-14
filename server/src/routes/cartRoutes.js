import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../controllers/cartController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/items", addToCart);
router.put("/items/:itemId", updateCartItem);
router.delete("/items/:itemId", removeCartItem);

export default router;
