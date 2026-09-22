import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// Database
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import homepageRoutes from "./routes/homepage.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminProductRoutes from "./routes/adminProduct.routes.js";
import adminOrderRoutes from "./routes/adminOrder.routes.js";
import adminCustomerRoutes from "./routes/adminCustomer.routes.js";
import adminInventoryRoutes from "./routes/adminInventory.routes.js";
import adminPromotionRoutes from "./routes/adminPromotion.routes.js";
import adminCouponRoutes from "./routes/adminCoupon.routes.js";
import adminReviewRoutes from "./routes/adminReview.routes.js";

// Load environment variables
dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

connectDB();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as Postman/server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(
        "Blocked CORS origin:",
        origin
      );

      return callback(
        new Error("Not allowed by CORS")
      );
    },
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| BODY PARSERS
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/*
|--------------------------------------------------------------------------
| COOKIES
|--------------------------------------------------------------------------
*/

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| REQUEST LOGGER
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} ${req.method} ${req.originalUrl}`
  );

  next();
});

/*
|--------------------------------------------------------------------------
| ENVIRONMENT CHECK
|--------------------------------------------------------------------------
*/

console.log("");
console.log("======================================");
console.log("FITFORGE BACKEND");
console.log("======================================");

console.log(
  "Environment:",
  process.env.NODE_ENV || "development"
);

console.log(
  "Port:",
  PORT
);

console.log(
  "Frontend URL:",
  process.env.FRONTEND_URL
);

console.log(
  "MongoDB URI:",
  process.env.MONGO_URI
    ? "Loaded"
    : "Missing"
);

console.log(
  "JWT Secret:",
  process.env.JWT_SECRET
    ? "Loaded"
    : "Missing"
);

console.log(
  "Razorpay Key ID:",
  process.env.RAZORPAY_KEY_ID
    ? process.env.RAZORPAY_KEY_ID
    : "Missing"
);

console.log(
  "Razorpay Secret:",
  process.env.RAZORPAY_KEY_SECRET
    ? "Loaded"
    : "Missing"
);

console.log("======================================");
console.log("");

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| CUSTOMER APIs
|--------------------------------------------------------------------------
*/

/*
  Authentication

  POST /api/auth/register
  POST /api/auth/login
  POST /api/auth/logout
  GET  /api/auth/me
*/
app.use(
  "/api/auth",
  authRoutes
);

/*
  Products

  GET /api/products
  GET /api/products/:id
*/
app.use(
  "/api/products",
  productRoutes
);

/*
  Categories

  GET /api/categories
*/
app.use(
  "/api/categories",
  categoryRoutes
);

/*
  Orders

  POST /api/orders
  GET  /api/orders
  GET  /api/orders/:id
*/
app.use(
  "/api/orders",
  orderRoutes
);

/*
  Payments

  POST /api/payments/razorpay/order
  POST /api/payments/razorpay/verify
*/
app.use(
  "/api/payments",
  paymentRoutes
);

/*
  Homepage

  GET /api/homepage
*/
app.use(
  "/api/homepage",
  homepageRoutes
);

/*
|--------------------------------------------------------------------------
| ADMIN APIs
|--------------------------------------------------------------------------
*/

/*
  General admin APIs
*/
app.use(
  "/api/admin",
  adminRoutes
);

/*
  Admin products
*/
app.use(
  "/api/admin/products",
  adminProductRoutes
);

/*
  Admin orders
*/
app.use(
  "/api/admin/orders",
  adminOrderRoutes
);

/*
  Admin customers
*/
app.use(
  "/api/admin/customers",
  adminCustomerRoutes
);

/*
  Admin inventory
*/
app.use(
  "/api/admin/inventory",
  adminInventoryRoutes
);

/*
  Admin promotions
*/
app.use(
  "/api/admin/promotions",
  adminPromotionRoutes
);

/*
  Admin coupons
*/
app.use(
  "/api/admin/coupons",
  adminCouponRoutes
);

/*
  Admin reviews
*/
app.use(
  "/api/admin/reviews",
  adminReviewRoutes
);

/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use(
  (error, req, res, next) => {
    console.error("");
    console.error(
      "======================================"
    );
    console.error("SERVER ERROR");
    console.error(
      "======================================"
    );

    console.error(
      "Message:",
      error.message
    );

    if (error.stack) {
      console.error(error.stack);
    }

    console.error(
      "======================================"
    );
    console.error("");

    /*
      CORS error
    */
    if (
      error.message ===
      "Not allowed by CORS"
    ) {
      return res.status(403).json({
        success: false,
        message: "CORS policy blocked this request",
      });
    }

    /*
      JSON parsing error
    */
    if (
      error instanceof SyntaxError &&
      error.status === 400 &&
      error.type ===
        "entity.parse.failed"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON request body",
      });
    }

    /*
      Default server error
    */
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Internal server error",
    });
  }
);

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  console.log("");
  console.log(
    `🚀 FITFORGE backend running on port ${PORT}`
  );

  console.log(
    `🌐 http://localhost:${PORT}`
  );

  console.log(
    `❤️  Health: http://localhost:${PORT}/api/health`
  );

  console.log("");
});