import express from "express";
import { register, login } from "../controllers/authController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", requireAuth, (req, res) => {
  res.json({ message: "You are logged in", user: req.user });
});

router.get("/admin-test", requireAuth, requireAdmin, (req, res) => {
  res.json({ message: "Welcome, admin" });
});

export default router;
