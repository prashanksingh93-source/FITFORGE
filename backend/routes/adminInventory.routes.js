import express from "express";

import {
  getInventory,
  updateProductStock,
  adjustProductStock,
} from "../controllers/adminInventory.controller.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);
router.use(requireAdmin);

router.get("/", getInventory);

router.patch("/:id/stock", updateProductStock);

router.patch("/:id/adjust-stock", adjustProductStock);

export default router;