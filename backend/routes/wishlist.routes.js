import express from "express";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
} from "../controllers/wishlist.controller.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getWishlist);

router.post(
  "/:productId",
  addToWishlist
);

router.delete(
  "/:productId",
  removeFromWishlist
);

router.post(
  "/:productId/toggle",
  toggleWishlist
);

router.delete(
  "/",
  clearWishlist
);

export default router;