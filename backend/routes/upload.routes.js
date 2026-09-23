import express from "express";

import {
  uploadProductImages,
  deleteProductImage,
} from "../controllers/upload.controller.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.middleware.js";

import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// All upload routes require admin authentication
router.use(authenticateUser);
router.use(requireAdmin);

// Upload multiple product images
router.post(
  "/product-images",
  upload.array("images", 10),
  uploadProductImages
);

// Delete Cloudinary image
router.delete(
  "/product-image",
  deleteProductImage
);

export default router;