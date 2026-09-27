import express from "express";

import {
  register,
  login,
  logout,
  getMe,
  changePassword,
} from "../controllers/auth.controller.js";

import {
  authenticateUser,
} from "../middleware/auth.middleware.js";

const router =
  express.Router();

/* =====================================================
   REGISTER
===================================================== */

router.post(
  "/register",
  register
);

/* =====================================================
   LOGIN
===================================================== */

router.post(
  "/login",
  login
);

/* =====================================================
   LOGOUT
===================================================== */

router.post(
  "/logout",
  logout
);

/* =====================================================
   CURRENT USER
===================================================== */

router.get(
  "/me",
  authenticateUser,
  getMe
);

/* =====================================================
   CHANGE ADMIN PASSWORD
===================================================== */

router.patch(
  "/change-password",
  authenticateUser,
  changePassword
);

export default router;