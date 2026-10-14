import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  getAllProductsAdmin,
  updateProduct,
  updateVariantStock,
  addVariant,
} from "../controllers/productController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/admin/all", requireAuth, requireAdmin, getAllProductsAdmin);
router.put(
  "/variants/:variantId",
  requireAuth,
  requireAdmin,
  updateVariantStock,
);

router.get("/:id", getProductById);
router.post("/", requireAuth, requireAdmin, createProduct);
router.put("/:id", requireAuth, requireAdmin, updateProduct);
router.post("/:id/variants", requireAuth, requireAdmin, addVariant);

export default router;
