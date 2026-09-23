import express from "express";

import {
  getStoreSettings,
  updateStoreSettings,
} from "../controllers/settings.controller.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Customer/public
router.get("/", getStoreSettings);

// Admin only
router.patch(
  "/",
  authenticateUser,
  requireAdmin,
  updateStoreSettings
);

export default router;

