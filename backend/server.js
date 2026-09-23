import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config();

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
// COUPON
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
// APP
// =====================================================

const app = express();

const PORT = Number(process.env.PORT) || 8000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Render / reverse proxy support
app.set("trust proxy", 1);

// =====================================================
// DATABASE CONNECTION
// =====================================================

connectDB();

// =====================================================
// SECURITY HEADERS
// =====================================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header.
      // Useful for curl, health checks and server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("Blocked CORS origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
  }),
);

// =====================================================
// BODY PARSERS
// =====================================================

app.use(
  express.json({
    limit: "2mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
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
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    console.log(
      `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    );
  });

  next();
});

// =====================================================
// ENVIRONMENT CHECK
// =====================================================

console.log("");
console.log("======================================");
console.log("          FITFORGE BACKEND");
console.log("======================================");

console.log("Environment:", NODE_ENV);
console.log("Port:", PORT);

console.log(
  "Frontend URL:",
  process.env.FRONTEND_URL || "Missing",
);

console.log(
  "MongoDB:",
  process.env.MONGO_URI ? "Loaded" : "Missing",
);

console.log(
  "JWT Secret:",
  process.env.JWT_SECRET ? "Loaded" : "Missing",
);

console.log(
  "Cloudinary Cloud Name:",
  process.env.CLOUDINARY_CLOUD_NAME
    ? "Loaded"
    : "Missing",
);

console.log(
  "Cloudinary API Key:",
  process.env.CLOUDINARY_API_KEY
    ? "Loaded"
    : "Missing",
);

console.log(
  "Cloudinary API Secret:",
  process.env.CLOUDINARY_API_SECRET
    ? "Loaded"
    : "Missing",
);

console.log(
  "Razorpay Key ID:",
  process.env.RAZORPAY_KEY_ID
    ? "Loaded"
    : "Missing",
);

console.log(
  "Razorpay Secret:",
  process.env.RAZORPAY_KEY_SECRET
    ? "Loaded"
    : "Missing",
);

console.log("======================================");
console.log("");

// =====================================================
// ROOT HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "FITFORGE API is running",
    version: "1.0.0",
    environment: NODE_ENV,
  });
});

// =====================================================
// API HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  return res.status(200).json({
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

app.post(
  "/api/coupons/validate",
  authenticateUser,
  validateCoupon,
);

console.log(
  "✅ POST /api/coupons/validate registered",
);

// Orders
app.use("/api/orders", orderRoutes);

// Payments
app.use("/api/payments", paymentRoutes);

// Homepage
app.use("/api/homepage", homepageRoutes);

// Store Settings
app.use("/api/settings", settingsRoutes);

// =====================================================
// ADMIN APIs
// =====================================================

// General Admin
app.use("/api/admin", adminRoutes);

// Products
app.use(
  "/api/admin/products",
  adminProductRoutes,
);

// Orders
app.use(
  "/api/admin/orders",
  adminOrderRoutes,
);

// Customers
app.use(
  "/api/admin/customers",
  adminCustomerRoutes,
);

// Inventory
app.use(
  "/api/admin/inventory",
  adminInventoryRoutes,
);

// Promotions
app.use(
  "/api/admin/promotions",
  adminPromotionRoutes,
);

// Coupons
app.use(
  "/api/admin/coupons",
  adminCouponRoutes,
);

// Reviews
app.use(
  "/api/admin/reviews",
  adminReviewRoutes,
);

// Payments
app.use(
  "/api/admin/payments",
  adminPaymentRoutes,
);

// =====================================================
// UPLOAD APIs
// =====================================================

app.use(
  "/api/uploads",
  uploadRoutes,
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  console.warn(
    `❌ Route not found: ${req.method} ${req.originalUrl}`,
  );

  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (error, req, res, next) => {
    console.error("");
    console.error("======================================");
    console.error("           SERVER ERROR");
    console.error("======================================");

    console.error(
      "Method:",
      req.method,
    );

    console.error(
      "URL:",
      req.originalUrl,
    );

    console.error(
      "Message:",
      error.message,
    );

    // Show stack only during development.
    if (
      NODE_ENV !== "production" &&
      error.stack
    ) {
      console.error(error.stack);
    }

    console.error("======================================");
    console.error("");

    // ---------------------------------------------
    // CORS ERROR
    // ---------------------------------------------

    if (
      error.message ===
      "Not allowed by CORS"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "CORS policy blocked this request",
      });
    }

    // ---------------------------------------------
    // INVALID JSON
    // ---------------------------------------------

    if (
      error instanceof SyntaxError &&
      error.status === 400 &&
      error.type === "entity.parse.failed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid JSON request body",
      });
    }

    // ---------------------------------------------
    // MULTER ERROR
    // ---------------------------------------------

    if (
      error.name === "MulterError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "File upload error",
      });
    }

    // ---------------------------------------------
    // MONGOOSE VALIDATION ERROR
    // ---------------------------------------------

    if (
      error.name === "ValidationError"
    ) {
      const errors =
        Object.values(
          error.errors || {},
        ).map(
          (item) => item.message,
        );

      return res.status(400).json({
        success: false,
        message:
          "Validation error",
        errors,
      });
    }

    // ---------------------------------------------
    // MONGOOSE CAST ERROR
    // ---------------------------------------------

    if (
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid resource ID",
      });
    }

    // ---------------------------------------------
    // DUPLICATE MONGODB KEY
    // ---------------------------------------------

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A record with this value already exists",
      });
    }

    // ---------------------------------------------
    // DEFAULT ERROR
    // ---------------------------------------------

    const statusCode =
      error.statusCode ||
      error.status ||
      500;

    return res.status(statusCode).json({
      success: false,
      message:
        NODE_ENV === "production"
          ? "Internal server error"
          : error.message ||
            "Internal server error",
    });
  },
);

// =====================================================
// START SERVER
// =====================================================

const server = app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log("");
    console.log("======================================");
    console.log("     🚀 FITFORGE BACKEND STARTED");
    console.log("======================================");

    console.log(
      `Environment: ${NODE_ENV}`,
    );

    console.log(
      `Port: ${PORT}`,
    );

    console.log(
      `❤️ Health: http://localhost:${PORT}/api/health`,
    );

    console.log(
      `🎟️ Coupon: POST http://localhost:${PORT}/api/coupons/validate`,
    );

    console.log(
      `☁️ Uploads: http://localhost:${PORT}/api/uploads/product-images`,
    );

    console.log("======================================");
    console.log("");
  },
);

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

const shutdown = (signal) => {
  console.log("");
  console.log(
    `⚠️ ${signal} received.`,
  );

  console.log(
    "Shutting down FITFORGE backend...",
  );

  server.close(() => {
    console.log(
      "HTTP server closed successfully.",
    );

    process.exit(0);
  });

  // Force shutdown after 10 seconds.
  setTimeout(() => {
    console.error(
      "❌ Forced shutdown after 10 seconds.",
    );

    process.exit(1);
  }, 10000).unref();
};

// Render deployment/restart
process.on(
  "SIGTERM",
  () => shutdown("SIGTERM"),
);

// Local Ctrl+C
process.on(
  "SIGINT",
  () => shutdown("SIGINT"),
);
