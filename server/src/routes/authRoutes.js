import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", requireAuth, getProfile);
router.put("/me", requireAuth, updateProfile);
router.put("/password", requireAuth, changePassword);

router.get("/admin-test", requireAuth, requireAdmin, (req, res) => {
  res.json({ message: "Welcome, admin" });
});

export default router;
