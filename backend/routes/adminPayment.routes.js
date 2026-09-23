import express from "express";

import {
  getAdminPayments,
  getAdminPaymentById,
} from "../controllers/adminPayment.controller.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);
router.use(requireAdmin);

router.get("/", getAdminPayments);
router.get("/:id", getAdminPaymentById);

export default router;