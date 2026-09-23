import express from "express";
import { validateCoupon } from "../controllers/coupon.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/validate", authenticateUser, validateCoupon);

export default router;