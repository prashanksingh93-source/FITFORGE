import express from "express";

import {
  getCategories,
  getActiveCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  toggleCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/active", getActiveCategories);

router.use(authenticateUser);
router.use(requireAdmin);

router.get("/", getCategories);
router.post("/", createCategory);
router.get("/:id", getCategoryById);
router.patch("/:id", updateCategory);
router.patch("/:id/toggle", toggleCategory);
router.delete("/:id", deleteCategory);

export default router;