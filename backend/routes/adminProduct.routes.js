import express from "express";

import {
  getAllAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  toggleProduct,
  deleteProduct,
} from "../controllers/adminProduct.controller.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);
router.use(requireAdmin);

// Get all products
router.get("/", getAllAdminProducts);

// Create product
router.post("/", createProduct);

// Get single product
router.get("/:id", getAdminProductById);

// Update product
router.patch("/:id", updateProduct);

// Activate / deactivate product
router.patch("/:id/toggle", toggleProduct);

// Delete product
router.delete("/:id", deleteProduct);

export default router;