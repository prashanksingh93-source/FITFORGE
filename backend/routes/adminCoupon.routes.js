import express from "express";

import {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  toggleCoupon,
  deleteCoupon,
} from "../controllers/adminCoupon.controller.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);
router.use(requireAdmin);

router.get("/", getCoupons);

router.post("/", createCoupon);

router.get("/:id", getCouponById);

router.patch("/:id", updateCoupon);

router.patch("/:id/toggle", toggleCoupon);

router.delete("/:id", deleteCoupon);

export default router;