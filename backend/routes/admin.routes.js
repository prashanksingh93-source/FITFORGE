import express from "express";

import {
  getDashboardStats,
  getRecentOrders,
  getLowStockProducts,
} from "../controllers/admin.controller.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);
router.use(requireAdmin);

router.get(
  "/dashboard",
  getDashboardStats
);

router.get(
  "/recent-orders",
  getRecentOrders
);

router.get(
  "/low-stock",
  getLowStockProducts
);

export default router;