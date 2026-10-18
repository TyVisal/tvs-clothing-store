import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  getAllProductsAdmin,
  updateProduct,
  updateVariantStock,
  addVariant,
  addProductImage,
  deleteProductImage,
} from "../controllers/productController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/admin/all", requireAuth, requireAdmin, getAllProductsAdmin);
router.put(
  "/variants/:variantId",
  requireAuth,
  requireAdmin,
  updateVariantStock,
);
router.delete(
  "/images/:imageId",
  requireAuth,
  requireAdmin,
  deleteProductImage,
);

router.get("/:id", getProductById);
router.post("/", requireAuth, requireAdmin, createProduct);
router.put("/:id", requireAuth, requireAdmin, updateProduct);
router.post("/:id/variants", requireAuth, requireAdmin, addVariant);
router.post(
  "/:id/images",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  addProductImage,
);

export default router;
