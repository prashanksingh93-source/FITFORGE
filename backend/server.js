import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// =====================================================
// DATABASE
// =====================================================

import connectDB from "./config/db.js";

// =====================================================
// CUSTOMER ROUTES
// =====================================================

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import homepageRoutes from "./routes/homepage.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

// =====================================================
// COUPON CONTROLLER + AUTH
// =====================================================

import { validateCoupon } from "./controllers/coupon.controller.js";
import { authenticateUser } from "./middleware/auth.middleware.js";

// =====================================================
// ADMIN ROUTES
// =====================================================

import adminRoutes from "./routes/admin.routes.js";
import adminProductRoutes from "./routes/adminProduct.routes.js";
import adminOrderRoutes from "./routes/adminOrder.routes.js";
import adminCustomerRoutes from "./routes/adminCustomer.routes.js";
import adminInventoryRoutes from "./routes/adminInventory.routes.js";
import adminPromotionRoutes from "./routes/adminPromotion.routes.js";
import adminCouponRoutes from "./routes/adminCoupon.routes.js";
import adminReviewRoutes from "./routes/adminReview.routes.js";
import adminPaymentRoutes from "./routes/adminPayment.routes.js";

// =====================================================
// UPLOAD ROUTES
// =====================================================

import uploadRoutes from "./routes/upload.routes.js";

// =====================================================
// ENVIRONMENT
// =====================================================

dotenv.config();

// =====================================================
// APP
// =====================================================

const app = express();

const PORT = process.env.PORT || 8000;

// =====================================================
// DATABASE
// =====================================================

connectDB();

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
  }),
);

// =====================================================
// BODY PARSERS
// =====================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// =====================================================
// COOKIE PARSER
// =====================================================

app.use(cookieParser());

// =====================================================
// REQUEST LOGGER
// =====================================================

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);

  next();
});

// =====================================================
// ENVIRONMENT CHECK
// =====================================================

console.log("");
console.log("======================================");
console.log("FITFORGE BACKEND");
console.log("======================================");

console.log("Environment:", process.env.NODE_ENV || "development");

console.log("Port:", PORT);

console.log("Frontend URL:", process.env.FRONTEND_URL || "Not configured");

console.log("MongoDB URI:", process.env.MONGO_URI ? "Loaded" : "Missing");

console.log("JWT Secret:", process.env.JWT_SECRET ? "Loaded" : "Missing");

console.log(
  "Cloudinary Cloud Name:",
  process.env.CLOUDINARY_CLOUD_NAME ? "Loaded" : "Missing",
);

console.log(
  "Cloudinary API Key:",
  process.env.CLOUDINARY_API_KEY ? "Loaded" : "Missing",
);

console.log(
  "Cloudinary API Secret:",
  process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Missing",
);

console.log(
  "Razorpay Key ID:",
  process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID : "Missing",
);

console.log(
  "Razorpay Secret:",
  process.env.RAZORPAY_KEY_SECRET ? "Loaded" : "Missing",
);

console.log("======================================");
console.log("");

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FITFORGE API is running",
    version: "1.0.0",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FITFORGE backend is healthy",
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// CUSTOMER APIs
// =====================================================

// Authentication

app.use("/api/auth", authRoutes);

// Products

app.use("/api/products", productRoutes);

// Categories

app.use("/api/categories", categoryRoutes);

// Cart

app.use("/api/cart", cartRoutes);

// Wishlist

app.use("/api/wishlist", wishlistRoutes);

// =====================================================
// CUSTOMER COUPON
// =====================================================
//
// POST /api/coupons/validate
//
// This is registered directly here instead of through
// coupon.routes.js so there is no router ambiguity.
//

app.post("/api/coupons/validate", authenticateUser, validateCoupon);

console.log("✅ POST /api/coupons/validate registered");

// Orders

app.use("/api/orders", orderRoutes);

// Payments

app.use("/api/payments", paymentRoutes);

// Homepage

app.use("/api/homepage", homepageRoutes);

// =====================================================
// ADMIN APIs
// =====================================================

// General Admin

app.use("/api/admin", adminRoutes);

// Admin Products

app.use("/api/admin/products", adminProductRoutes);

// Admin Orders

app.use("/api/admin/orders", adminOrderRoutes);

// Admin Customers

app.use("/api/admin/customers", adminCustomerRoutes);

// Admin Inventory

app.use("/api/admin/inventory", adminInventoryRoutes);

// Admin Promotions

app.use("/api/admin/promotions", adminPromotionRoutes);

// Admin Coupons

app.use("/api/admin/coupons", adminCouponRoutes);

// Admin Reviews

app.use("/api/admin/reviews", adminReviewRoutes);

app.use("/api/admin/payments", adminPaymentRoutes);

// =====================================================
// UPLOAD APIs
// =====================================================

app.use("/api/uploads", uploadRoutes);

app.use("/api/settings", settingsRoutes);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {
  console.error("");
  console.error("======================================");
  console.error("SERVER ERROR");
  console.error("======================================");

  console.error("Message:", error.message);

  if (error.stack) {
    console.error(error.stack);
  }

  console.error("======================================");
  console.error("");

  // CORS error

  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy blocked this request",
    });
  }

  // JSON parsing error

  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    error.type === "entity.parse.failed"
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  // Multer error

  if (error.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: error.message || "File upload error",
    });
  }

  // Default error

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log("");
  console.log(`🚀 FITFORGE backend running on port ${PORT}`);

  console.log(`🌐 http://localhost:${PORT}`);

  console.log(`❤️ Health: http://localhost:${PORT}/api/health`);

  console.log(
    `🎟️ Coupon API: POST http://localhost:${PORT}/api/coupons/validate`,
  );

  console.log(
    `☁️ Upload API: http://localhost:${PORT}/api/uploads/product-images`,
  );

  console.log("");
});
