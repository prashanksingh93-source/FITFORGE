import crypto from "crypto";

import getRazorpay from "../services/razorpay.service.js";
import Order from "../models/Order.js";

// CREATE RAZORPAY ORDER
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentMethod !== "RAZORPAY") {
      return res.status(400).json({
        success: false,
        message: "This order is not a Razorpay order",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    // Create Razorpay instance only when needed
    const razorpay = getRazorpay();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    return res.status(200).json({
      success: true,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to create Razorpay payment order",
    });
  }
};

// VERIFY RAZORPAY PAYMENT
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data is incomplete",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order,
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "RAZORPAY_KEY_SECRET is missing in .env",
      });
    }

    // Generate signature using Razorpay secret
    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    // Prevent timingSafeEqual from throwing on different lengths
    const generatedBuffer = Buffer.from(
      generatedSignature,
      "utf8"
    );

    const receivedBuffer = Buffer.from(
      razorpay_signature,
      "utf8"
    );

    const signatureValid =
      generatedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      );

    if (!signatureValid) {
      order.paymentStatus = "Failed";

      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Payment verified successfully
    order.paymentStatus = "Paid";
    order.paymentId = razorpay_payment_id;
    order.orderStatus = "Confirmed";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Verify Razorpay payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};