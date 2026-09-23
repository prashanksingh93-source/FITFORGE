import crypto from "crypto";
import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import razorpay from "../services/razorpay.service.js";

/*
====================================================
CREATE RAZORPAY ORDER
POST /api/payments/razorpay/order
====================================================
*/

export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    console.log("\n========== RAZORPAY CREATE ORDER ==========");

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    /*
    --------------------------------------------
    Find order belonging to logged-in user
    --------------------------------------------
    */

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

    console.log("User:", req.user._id);
    console.log("FITFORGE order:", order.orderNumber);
    console.log("Order total:", order.totalAmount);

    /*
    --------------------------------------------
    Don't create another Razorpay order if
    payment is already completed
    --------------------------------------------
    */

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "This order has already been paid",
      });
    }

    /*
    --------------------------------------------
    Validate amount
    --------------------------------------------
    */

    const amount = Number(order.totalAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    /*
    --------------------------------------------
    Convert INR to paise
    ₹4499 → 449900 paise
    --------------------------------------------
    */

    const amountInPaise = Math.round(amount * 100);

    console.log("Amount INR:", amount);
    console.log("Amount paise:", amountInPaise);

    /*
    --------------------------------------------
    Create Razorpay order
    --------------------------------------------
    */

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",

      receipt:
        order.orderNumber ||
        `FITFORGE_${Date.now()}`,

      notes: {
        fitforgeOrderId: order._id.toString(),

        orderNumber:
          order.orderNumber || "",

        userId: req.user._id.toString(),
      },
    });

    /*
    --------------------------------------------
    Save Razorpay order ID temporarily
    --------------------------------------------
    */

    order.paymentId = razorpayOrder.id;

    await order.save();

    console.log(
      "Razorpay order created:",
      razorpayOrder.id
    );

    console.log(
      "============================================\n"
    );

    return res.status(200).json({
      success: true,

      message:
        "Razorpay order created successfully",

      razorpayOrder,

      keyId:
        process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log(
      "\n========== RAZORPAY CREATE ERROR =========="
    );

    console.log("Name:", error?.name);
    console.log("Message:", error?.message);
    console.log("Status:", error?.statusCode);
    console.log(
      "Description:",
      error?.error?.description
    );

    console.log(
      "Error object:",
      error
    );

    console.log(
      "============================================\n"
    );

    return res.status(
      error?.statusCode || 500
    ).json({
      success: false,

      message:
        error?.error?.description ||
        error?.message ||
        "Failed to create Razorpay order",
    });
  }
};


/*
====================================================
VERIFY RAZORPAY PAYMENT
POST /api/payments/razorpay/verify
====================================================
*/

export const verifyRazorpayPayment = async (
  req,
  res
) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    console.log(
      "\n========== RAZORPAY PAYMENT VERIFY =========="
    );

    console.log("Razorpay Order ID:", razorpay_order_id);
    console.log(
      "Razorpay Payment ID:",
      razorpay_payment_id
    );

    /*
    --------------------------------------------
    Validate required fields
    --------------------------------------------
    */

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment verification data is incomplete",
      });
    }

    /*
    --------------------------------------------
    Validate MongoDB order ID
    --------------------------------------------
    */

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    /*
    --------------------------------------------
    Find customer's order
    --------------------------------------------
    */

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

    /*
    --------------------------------------------
    Prevent duplicate payment processing
    --------------------------------------------
    */

    if (order.paymentStatus === "Paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order,
      });
    }

    /*
    --------------------------------------------
    Verify Razorpay signature
    --------------------------------------------

    Razorpay signature:

    HMAC SHA256
    razorpay_order_id + "|" + razorpay_payment_id

    --------------------------------------------
    */

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    /*
    --------------------------------------------
    Timing-safe signature comparison
    --------------------------------------------
    */

    const generatedBuffer =
      Buffer.from(generatedSignature);

    const receivedBuffer =
      Buffer.from(razorpay_signature);

    if (
      generatedBuffer.length !==
      receivedBuffer.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const signatureValid =
      crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      );

    if (!signatureValid) {
      console.log(
        "❌ Invalid Razorpay signature"
      );

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    console.log(
      "✅ Razorpay signature verified"
    );

    /*
    ====================================================
    IMPORTANT
    ====================================================

    Payment is now cryptographically verified.

    Only NOW should we reduce product stock.
    ====================================================
    */

    for (const item of order.items) {
      const product = await Product.findById(
        item.product
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message:
            "A product in this order no longer exists",
        });
      }

      /*
      --------------------------------------------
      Check stock again.
      --------------------------------------------
      */

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message:
            `${product.name} is no longer available in the requested quantity`,
        });
      }
    }

    /*
    ====================================================
    REDUCE STOCK
    ====================================================
    */

    for (const item of order.items) {
      const product = await Product.findById(
        item.product
      );

      if (!product) {
        continue;
      }

      product.stock =
        product.stock - item.quantity;

      await product.save();

      console.log(
        `Stock updated: ${product.name} → ${product.stock}`
      );
    }

    /*
    ====================================================
    UPDATE ORDER PAYMENT
    ====================================================
    */

    order.paymentStatus = "Paid";

    order.paymentId =
      razorpay_payment_id;

    /*
    --------------------------------------------
    Save Razorpay payment details if your
    Order schema supports these fields.
    --------------------------------------------
    */

    if (
      "razorpayOrderId" in order
    ) {
      order.razorpayOrderId =
        razorpay_order_id;
    }

    if (
      "razorpayPaymentId" in order
    ) {
      order.razorpayPaymentId =
        razorpay_payment_id;
    }

    if (
      "razorpaySignature" in order
    ) {
      order.razorpaySignature =
        razorpay_signature;
    }

    /*
    --------------------------------------------
    Confirm order
    --------------------------------------------
    */

    if (
      !order.orderStatus ||
      order.orderStatus === "Pending"
    ) {
      order.orderStatus = "Confirmed";
    }

    await order.save();

    console.log(
      "✅ Payment verified successfully"
    );

    console.log(
      "Order:",
      order.orderNumber
    );

    console.log(
      "============================================\n"
    );

    return res.status(200).json({
      success: true,

      message:
        "Payment verified successfully",

      order,
    });
  } catch (error) {
    console.error(
      "\n========== PAYMENT VERIFY ERROR =========="
    );

    console.error(error);

    console.error(
      "============================================\n"
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Payment verification failed",
    });
  }
};


/*
====================================================
GET PAYMENT STATUS
Optional helper endpoint
====================================================
*/

export const getPaymentStatus = async (
  req,
  res
) => {
  try {
    const { orderId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(orderId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    }).select(
      "orderNumber totalAmount paymentStatus paymentId orderStatus"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      paymentStatus:
        order.paymentStatus,

      paymentId:
        order.paymentId,

      orderStatus:
        order.orderStatus,

      order,
    });
  } catch (error) {
    console.error(
      "Get payment status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get payment status",
    });
  }
};