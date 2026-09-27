import express from "express";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/payment.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// All payment routes require the user to be logged in
router.use(authenticateUser);

// Create Razorpay order
router.post(
  "/razorpay/create-order",
  createRazorpayOrder
);

// Verify Razorpay payment
router.post(
  "/razorpay/verify",
  verifyRazorpayPayment
);

export default router;