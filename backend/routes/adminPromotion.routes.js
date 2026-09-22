import express from "express";

import {
  getAllPromotions,
  getActivePromotions,
  createPromotion,
  getPromotionById,
  updatePromotion,
  togglePromotion,
  deletePromotion,
} from "../controllers/adminPromotion.controller.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/active", getActivePromotions);

router.use(authenticateUser);
router.use(requireAdmin);

router.get("/", getAllPromotions);

router.post("/", createPromotion);

router.get("/:id", getPromotionById);

router.patch("/:id", updatePromotion);

router.patch("/:id/toggle", togglePromotion);

router.delete("/:id", deletePromotion);

export default router;