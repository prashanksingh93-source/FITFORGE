import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (
  req,
  res,
  next
) => {
  try {
    let token = null;

    /*
    ============================================
    1. GET TOKEN FROM COOKIE
    ============================================
    */

    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    /*
    ============================================
    2. GET TOKEN FROM AUTHORIZATION HEADER
    ============================================
    */

    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith(
        "Bearer "
      )
    ) {
      token =
        req.headers.authorization
          .split(" ")[1];
    }

    /*
    ============================================
    3. TOKEN REQUIRED
    ============================================
    */

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    /*
    ============================================
    4. VERIFY TOKEN
    ============================================
    */

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    /*
    ============================================
    5. GET USER ID
    ============================================
    */

    const userId =
      decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    /*
    ============================================
    6. FIND USER
    ============================================
    */

    const user = await User.findById(
      userId
    ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    /*
    ============================================
    7. CHECK BLOCKED ACCOUNT
    ============================================
    */

    if (
      user.isBlocked === true ||
      user.status === "blocked"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been blocked",
      });
    }

    /*
    ============================================
    8. ATTACH USER TO REQUEST
    ============================================
    */

    req.user = user;

    /*
    ============================================
    9. CONTINUE
    ============================================
    */

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error
    );

    /*
    ============================================
    EXPIRED TOKEN
    ============================================
    */

    if (
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token expired",
      });
    }

    /*
    ============================================
    INVALID TOKEN
    ============================================
    */

    if (
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token",
      });
    }

    /*
    ============================================
    OTHER AUTH ERROR
    ============================================
    */

    return res.status(401).json({
      success: false,
      message:
        "Authentication failed",
    });
  }
};