import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";

import adminRoutes from "./routes/admin.routes.js";
import adminProductRoutes from "./routes/adminProduct.routes.js";
import adminOrderRoutes from "./routes/adminOrder.routes.js";
import adminCustomerRoutes from "./routes/adminCustomer.routes.js";
import adminInventoryRoutes from "./routes/adminInventory.routes.js";
import adminPromotionRoutes from "./routes/adminPromotion.routes.js";

import homepageRoutes from "./routes/homepage.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import adminCouponRoutes from "./routes/adminCoupon.routes.js";
import adminReviewRoutes from "./routes/adminReview.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FITFORGE API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/admin/inventory", adminInventoryRoutes);
app.use("/api/admin/promotions", adminPromotionRoutes);

app.use("/api/homepage", homepageRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin/coupons", adminCouponRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/payments", paymentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`FITFORGE server running on port ${PORT}`);
});
