import express from "express";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/payment.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);

router.post("/razorpay/order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);

export default router;