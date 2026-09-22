import express from "express";

import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
} from "../controllers/order.controller.js";

import {
  authenticateUser,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);

router.post("/", createOrder);

router.get("/", getMyOrders);

router.get("/:id", getMyOrderById);

router.patch(
  "/:id/cancel",
  cancelMyOrder
);

export default router;