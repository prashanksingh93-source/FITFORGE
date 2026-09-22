import express from "express";

import {
  getAllAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  updatePaymentStatus,
} from "../controllers/adminOrder.controller.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);
router.use(requireAdmin);

router.get("/", getAllAdminOrders);

router.get("/:id", getAdminOrderById);

router.patch(
  "/:id/status",
  updateOrderStatus
);

router.patch(
  "/:id/payment-status",
  updatePaymentStatus
);

export default router;