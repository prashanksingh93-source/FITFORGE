import express from "express";

import {
  getAllAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminCategories,
} from "../controllers/adminProduct.controller.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);
router.use(requireAdmin);

router.get("/", getAllAdminProducts);

router.get(
  "/categories",
  getAdminCategories
);

router.get("/:id", getAdminProductById);

router.post("/", createProduct);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

export default router;