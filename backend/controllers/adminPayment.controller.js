import mongoose from "mongoose";
import Payment from "../models/Payment.js";

export const getAdminPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      status = "",
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      filter.$or = [
        { razorpayOrderId: searchRegex },
        { razorpayPaymentId: searchRegex },
        { provider: searchRegex },
      ];
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("user", "name email phone")
        .populate(
          "order",
          "orderNumber totalAmount orderStatus paymentStatus createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Payment.countDocuments(filter),
    ]);

    const [
      totalPayments,
      capturedPayments,
      failedPayments,
      totalRevenueResult,
    ] = await Promise.all([
      Payment.countDocuments(),

      Payment.countDocuments({
        status: "captured",
      }),

      Payment.countDocuments({
        status: "failed",
      }),

      Payment.aggregate([
        {
          $match: {
            status: "captured",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]),
    ]);

    const totalRevenue =
      totalRevenueResult[0]?.total || 0;

    return res.status(200).json({
      success: true,
      payments,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
      summary: {
        totalPayments,
        capturedPayments,
        failedPayments,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("ADMIN PAYMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};

export const getAdminPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findById(id)
      .populate("user", "name email phone")
      .populate(
        "order",
        "orderNumber items totalAmount subtotal discountAmount shippingAmount taxAmount orderStatus paymentStatus shippingAddress createdAt"
      );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error(
      "ADMIN PAYMENT DETAILS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
    });
  }
};

