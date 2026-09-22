import express from "express";

import {
  getHomepage,
  getAdminHomepage,
  updateHomepage,
} from "../controllers/homepage.controller.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getHomepage);

router.get(
  "/admin",
  authenticateUser,
  requireAdmin,
  getAdminHomepage
);

router.patch(
  "/admin",
  authenticateUser,
  requireAdmin,
  updateHomepage
);

export default router;