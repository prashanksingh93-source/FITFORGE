import express from "express";

import {
  getAdminReviews,
  getAdminReviewById,
  updateReviewStatus,
  toggleFeaturedReview,
  deleteReview,
} from "../controllers/adminReview.controller.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);
router.use(requireAdmin);

router.get("/", getAdminReviews);

router.get("/:id", getAdminReviewById);

router.patch(
  "/:id/status",
  updateReviewStatus
);

router.patch(
  "/:id/featured",
  toggleFeaturedReview
);

router.delete("/:id", deleteReview);

export default router;