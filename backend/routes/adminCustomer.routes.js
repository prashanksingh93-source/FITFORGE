import express from "express";

import {
  getAllCustomers,
  getCustomerById,
  updateCustomerStatus,
} from "../controllers/adminCustomer.controller.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);
router.use(requireAdmin);

router.get("/", getAllCustomers);

router.get("/:id", getCustomerById);

router.patch(
  "/:id/status",
  updateCustomerStatus
);

export default router;