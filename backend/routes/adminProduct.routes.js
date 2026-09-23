import express from "express";

import {
  getAllAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
} from "../controllers/adminProduct.controller.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Every route below requires logged-in admin
router.use(protect);
router.use(adminMiddleware);

// GET /api/admin/products
router.get("/", getAllAdminProducts);

// GET /api/admin/products/:id
router.get("/:id", getAdminProductById);

// POST /api/admin/products
router.post("/", createProduct);

// PATCH /api/admin/products/:id
router.patch("/:id", updateProduct);

// DELETE /api/admin/products/:id
router.delete("/:id", deleteProduct);

// PATCH /api/admin/products/:id/toggle
router.patch("/:id/toggle", toggleProduct);

export default router;