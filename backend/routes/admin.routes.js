import express from "express";

import {
  getDashboardStats,
} from "../controllers/admin.controller.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  adminMiddleware,
} from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  adminMiddleware,
  getDashboardStats
);

export default router;