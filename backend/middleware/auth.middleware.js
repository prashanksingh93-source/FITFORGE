import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticateUser = async (
  req,
  res,
  next
) => {
  try {
    // ==========================================
    // GET TOKEN FROM COOKIE
    // ==========================================

    let token = req.cookies?.token;

    // ==========================================
    // FALLBACK: AUTHORIZATION HEADER
    // ==========================================

    if (!token) {
      const authHeader =
        req.headers.authorization;

      if (
        authHeader &&
        authHeader.startsWith("Bearer ")
      ) {
        token = authHeader.split(" ")[1];
      }
    }

    // ==========================================
    // NO TOKEN
    // ==========================================

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ==========================================
    // VERIFY JWT
    // ==========================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId =
      decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // ==========================================
    // FIND USER
    // ==========================================

    const user =
      await User.findById(userId).select(
        "-password"
      );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================================
    // BLOCKED USER
    // ==========================================

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been blocked",
      });
    }

    // ==========================================
    // ATTACH USER
    // ==========================================

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error
    );

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// ==========================================
// ADMIN AUTHORIZATION
// ==========================================

export const requireAdmin = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};