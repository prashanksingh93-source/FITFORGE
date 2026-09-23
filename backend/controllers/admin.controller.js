import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockProducts,
      outOfStockProducts,
      revenueResult,
    ] = await Promise.all([
      Product.countDocuments({
        isActive: true,
      }),

      User.countDocuments({
        role: "customer",
      }),

      Order.countDocuments(),

      Order.countDocuments({
        orderStatus: "Pending",
      }),

      Order.countDocuments({
        orderStatus: "Delivered",
      }),

      Order.countDocuments({
        orderStatus: "Cancelled",
      }),

      Product.countDocuments({
        isActive: true,
        stock: {
          $gt: 0,
          $lte: 5,
        },
      }),

      Product.countDocuments({
        isActive: true,
        stock: 0,
      }),

      Order.aggregate([
        {
          $match: {
            paymentStatus: "Paid",
            orderStatus: {
              $ne: "Cancelled",
            },
          },
        },

        {
          $group: {
            _id: null,

            totalRevenue: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    return res.status(200).json({
      success: true,

      stats: {
        totalProducts,
        totalCustomers,
        totalOrders,
        totalRevenue,

        pendingOrders,
        deliveredOrders,
        cancelledOrders,

        lowStockProducts,
        outOfStockProducts,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to load dashboard statistics",
    });
  }
};