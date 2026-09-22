import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

export const getDashboardStats = async (
  req,
  res
) => {
  try {
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      revenueResult,
      pendingOrders,
      lowStockProducts,
    ] = await Promise.all([
      Product.countDocuments({
        isActive: true,
      }),

      User.countDocuments({
        role: "customer",
      }),

      Order.countDocuments(),

      Order.aggregate([
        {
          $match: {
            orderStatus: {
              $ne: "Cancelled",
            },
            paymentStatus: {
              $in: ["Paid", "Pending"],
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),

      Order.countDocuments({
        orderStatus: {
          $in: [
            "Pending",
            "Confirmed",
            "Processing",
          ],
        },
      }),

      Product.countDocuments({
        isActive: true,
        $expr: {
          $lte: [
            "$stock",
            "$lowStockThreshold",
          ],
        },
      }),
    ]);

    const revenue =
      revenueResult.length > 0
        ? revenueResult[0].total
        : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalCustomers,
        totalOrders,
        revenue,
        pendingOrders,
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch dashboard statistics",
    });
  }
};

export const getRecentOrders = async (
  req,
  res
) => {
  try {
    const orders = await Order.find()
      .populate(
        "user",
        "fullName email"
      )
      .sort({
        createdAt: -1,
      })
      .limit(10);

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "Recent orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch recent orders",
    });
  }
};

export const getLowStockProducts = async (
  req,
  res
) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: {
        $lte: [
          "$stock",
          "$lowStockThreshold",
        ],
      },
    })
      .populate("category")
      .sort({
        stock: 1,
      });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(
      "Low stock products error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch low stock products",
    });
  }
};