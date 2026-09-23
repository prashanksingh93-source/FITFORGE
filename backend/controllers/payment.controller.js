import crypto from "crypto";
import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import Payment from "../models/Payment.js";
import razorpay from "../services/razorpay.service.js";

/*
====================================================
HELPERS
====================================================
*/

const normalizeCouponCode = (code) => {
  if (!code) return "";

  return String(code)
    .trim()
    .toUpperCase();
};

/*
====================================================
CREATE RAZORPAY ORDER
POST /api/payments/razorpay/order
====================================================
*/

export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    console.log(
      "\n========== RAZORPAY CREATE ORDER =========="
    );

    /*
    --------------------------------------------
    Validate order ID
    --------------------------------------------
    */

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

    console.log(
      "User:",
      req.user._id.toString()
    );

    console.log(
      "FITFORGE order:",
      order.orderNumber
    );

    console.log(
      "Order total:",
      order.totalAmount
    );

    /*
    --------------------------------------------
    Only Razorpay orders
    --------------------------------------------
    */

    if (order.paymentMethod !== "RAZORPAY") {
      return res.status(400).json({
        success: false,
        message:
          "This order is not a Razorpay order",
      });
    }

    /*
    --------------------------------------------
    Prevent duplicate payment
    --------------------------------------------
    */

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message:
          "This order has already been paid",
      });
    }

    /*
    --------------------------------------------
    Validate order amount
    --------------------------------------------
    */

    const amount = Number(
      order.totalAmount
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    const amountInPaise =
      Math.round(amount * 100);

    /*
    ====================================================
    EXISTING RAZORPAY ORDER
    ====================================================
    */

    if (order.razorpayOrderId) {
      /*
      --------------------------------------------
      Make sure a Payment record exists
      --------------------------------------------
      */

      await Payment.findOneAndUpdate(
        {
          order: order._id,
        },
        {
          $setOnInsert: {
            order: order._id,
            user: req.user._id,
            provider: "Razorpay",
            razorpayOrderId:
              order.razorpayOrderId,
            amount,
            currency: "INR",
            status: "created",
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Existing Razorpay order returned",

        razorpayOrder: {
          id: order.razorpayOrderId,
          amount: amountInPaise,
          currency: "INR",
        },

        keyId:
          process.env.RAZORPAY_KEY_ID,
      });
    }

    /*
    ====================================================
    CREATE RAZORPAY ORDER
    ====================================================
    */

    const razorpayOrder =
      await razorpay.orders.create({
        amount: amountInPaise,

        currency: "INR",

        receipt:
          order.orderNumber ||
          `FITFORGE_${Date.now()}`,

        notes: {
          fitforgeOrderId:
            order._id.toString(),

          orderNumber:
            order.orderNumber || "",

          userId:
            req.user._id.toString(),
        },
      });

    /*
    --------------------------------------------
    Store Razorpay order ID in Order
    --------------------------------------------
    */

    order.razorpayOrderId =
      razorpayOrder.id;

    await order.save();

    /*
    ====================================================
    CREATE PAYMENT RECORD
    ====================================================
    */

    await Payment.findOneAndUpdate(
      {
        order: order._id,
      },
      {
        $set: {
          user: req.user._id,

          provider: "Razorpay",

          razorpayOrderId:
            razorpayOrder.id,

          amount,

          currency: "INR",

          status: "created",
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log(
      "Razorpay order created:",
      razorpayOrder.id
    );

    console.log(
      "Payment record created"
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
    console.error(
      "\n========== RAZORPAY CREATE ERROR =========="
    );

    console.error(
      "Name:",
      error?.name
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Status:",
      error?.statusCode
    );

    console.error(
      "Description:",
      error?.error?.description
    );

    console.error(
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

    /*
    ====================================================
    VALIDATE REQUEST
    ====================================================
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

    if (
      !mongoose.Types.ObjectId.isValid(
        orderId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    /*
    ====================================================
    FIND CUSTOMER ORDER
    ====================================================
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
    ====================================================
    VERIFY RAZORPAY ORDER ID
    ====================================================
    */

    if (
      order.razorpayOrderId &&
      order.razorpayOrderId !==
        razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay order mismatch",
      });
    }

    /*
    ====================================================
    VERIFY PAYMENT METHOD
    ====================================================
    */

    if (
      order.paymentMethod !== "RAZORPAY"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This order does not use Razorpay",
      });
    }

    /*
    ====================================================
    PREVENT DUPLICATE PROCESSING
    ====================================================
    */

    if (
      order.paymentStatus === "Paid"
    ) {
      /*
      --------------------------------------------
      Make sure Payment record also exists
      --------------------------------------------
      */

      await Payment.findOneAndUpdate(
        {
          order: order._id,
        },
        {
          $set: {
            user: req.user._id,

            provider: "Razorpay",

            razorpayOrderId:
              razorpay_order_id,

            razorpayPaymentId:
              razorpay_payment_id,

            razorpaySignature:
              razorpay_signature,

            amount:
              Number(order.totalAmount),

            currency: "INR",

            status: "captured",

            paidAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Payment already verified",
        order,
      });
    }

    /*
    ====================================================
    VERIFY RAZORPAY SECRET
    ====================================================
    */

    const secret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      console.error(
        "RAZORPAY_KEY_SECRET is missing"
      );

      return res.status(500).json({
        success: false,
        message:
          "Payment configuration is incomplete",
      });
    }

    /*
    ====================================================
    GENERATE SIGNATURE
    ====================================================
    */

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          secret
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    const generatedBuffer =
      Buffer.from(
        generatedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        String(razorpay_signature),
        "utf8"
      );

    /*
    --------------------------------------------
    Prevent timingSafeEqual length error
    --------------------------------------------
    */

    if (
      generatedBuffer.length !==
      receivedBuffer.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment signature",
      });
    }

    /*
    --------------------------------------------
    Compare signatures securely
    --------------------------------------------
    */

    const signatureValid =
      crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      );

    if (!signatureValid) {
      console.error(
        "❌ Invalid Razorpay signature"
      );

      return res.status(400).json({
        success: false,
        message:
          "Payment verification failed",
      });
    }

    console.log(
      "✅ Razorpay signature verified"
    );

    /*
    ====================================================
    FETCH PAYMENT FROM RAZORPAY
    ====================================================
    */

    let razorpayPayment;

    try {
      razorpayPayment =
        await razorpay.payments.fetch(
          razorpay_payment_id
        );
    } catch (paymentError) {
      console.error(
        "Unable to fetch Razorpay payment:",
        paymentError?.message
      );

      return res.status(400).json({
        success: false,
        message:
          "Unable to verify Razorpay payment",
      });
    }

    /*
    ====================================================
    PAYMENT MUST BELONG TO RAZORPAY ORDER
    ====================================================
    */

    if (
      razorpayPayment.order_id !==
      razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment does not belong to this order",
      });
    }

    /*
    ====================================================
    VERIFY PAYMENT AMOUNT
    ====================================================
    */

    const expectedAmount =
      Math.round(
        Number(order.totalAmount) *
          100
      );

    const receivedAmount =
      Number(
        razorpayPayment.amount
      );

    if (
      !Number.isFinite(
        receivedAmount
      ) ||
      receivedAmount !==
        expectedAmount
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment amount does not match order amount",
      });
    }

    /*
    ====================================================
    VERIFY CURRENCY
    ====================================================
    */

    if (
      razorpayPayment.currency !==
      "INR"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment currency",
      });
    }

    /*
    ====================================================
    PAYMENT MUST BE CAPTURED
    ====================================================
    */

    if (
      razorpayPayment.status !==
      "captured"
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Payment is not captured. Current status: ${razorpayPayment.status}`,
      });
    }

    /*
    ====================================================
    CHECK STOCK AGAIN
    ====================================================
    */

    for (const item of order.items) {
      const product =
        await Product.findById(
          item.product
        );

      if (!product) {
        return res.status(400).json({
          success: false,
          message:
            "A product in this order no longer exists",
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message:
            `${product.name} is no longer available`,
        });
      }

      if (
        Number(product.stock) <
        Number(item.quantity)
      ) {
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
      const product =
        await Product.findById(
          item.product
        );

      if (!product) {
        continue;
      }

      product.stock =
        Number(product.stock) -
        Number(item.quantity);

      await product.save();

      console.log(
        `Stock updated: ${product.name} → ${product.stock}`
      );
    }

    /*
    ====================================================
    UPDATE ORDER
    ====================================================
    */

    order.paymentStatus = "Paid";

    order.paymentId =
      razorpay_payment_id;

    order.razorpayOrderId =
      razorpay_order_id;

    order.razorpayPaymentId =
      razorpay_payment_id;

    order.razorpaySignature =
      razorpay_signature;

    if (
      !order.orderStatus ||
      order.orderStatus === "Pending"
    ) {
      order.orderStatus =
        "Confirmed";
    }

    await order.save();

    /*
    ====================================================
    SAVE PAYMENT RECORD
    ====================================================
    */

    const paymentAmount =
      Number(order.totalAmount);

    const paymentStatus =
      razorpayPayment.status ===
      "captured"
        ? "captured"
        : "authorized";

    const payment = await Payment.findOneAndUpdate(
      {
        order: order._id,
      },
      {
        $set: {
          user: req.user._id,

          provider: "Razorpay",

          razorpayOrderId:
            razorpay_order_id,

          razorpayPaymentId:
            razorpay_payment_id,

          razorpaySignature:
            razorpay_signature,

          amount: paymentAmount,

          currency:
            razorpayPayment.currency ||
            "INR",

          status: paymentStatus,

          method:
            razorpayPayment.method ||
            "",

          paidAt:
            paymentStatus === "captured"
              ? new Date()
              : null,

          failureReason: "",
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    /*
    ====================================================
    COUPON USAGE
    ====================================================

    Coupon usage increases ONLY after successful
    Razorpay payment verification.
    ====================================================
    */

    if (order.couponCode) {
      const couponCode =
        normalizeCouponCode(
          order.couponCode
        );

      if (couponCode) {
        const coupon =
          await Coupon.findOne({
            code: couponCode,
          });

        if (coupon) {
          /*
          --------------------------------------------
          Prevent usage from exceeding usageLimit
          --------------------------------------------
          */

          if (
            coupon.usageLimit === null ||
            coupon.usedCount <
              coupon.usageLimit
          ) {
            await Coupon.updateOne(
              {
                _id: coupon._id,

                $or: [
                  {
                    usageLimit: null,
                  },
                  {
                    $expr: {
                      $lt: [
                        "$usedCount",
                        "$usageLimit",
                      ],
                    },
                  },
                ],
              },
              {
                $inc: {
                  usedCount: 1,
                },
              }
            );
          }
        }
      }
    }

    /*
    ====================================================
    SUCCESS LOGS
    ====================================================
    */

    console.log(
      "✅ Payment verified successfully"
    );

    console.log(
      "Order:",
      order.orderNumber
    );

    console.log(
      "Payment:",
      razorpay_payment_id
    );

    console.log(
      "Payment MongoDB ID:",
      payment._id.toString()
    );

    console.log(
      "Amount:",
      payment.amount
    );

    console.log(
      "Method:",
      payment.method
    );

    console.log(
      "============================================\n"
    );

    /*
    ====================================================
    RESPONSE
    ====================================================
    */

    return res.status(200).json({
      success: true,

      message:
        "Payment verified successfully",

      order,

      payment: {
        _id: payment._id,

        razorpayOrderId:
          payment.razorpayOrderId,

        razorpayPaymentId:
          payment.razorpayPaymentId,

        amount:
          payment.amount,

        currency:
          payment.currency,

        status:
          payment.status,

        method:
          payment.method,

        paidAt:
          payment.paidAt,
      },
    });
  } catch (error) {
    console.error(
      "\n========== PAYMENT VERIFY ERROR =========="
    );

    console.error(
      "Name:",
      error?.name
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error(
      "============================================\n"
    );

    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Payment verification failed",
    });
  }
};

/*
====================================================
GET PAYMENT STATUS
GET /api/payments/status/:orderId
====================================================
*/

export const getPaymentStatus = async (
  req,
  res
) => {
  try {
    const { orderId } = req.params;

    /*
    --------------------------------------------
    Validate order ID
    --------------------------------------------
    */

    if (
      !mongoose.Types.ObjectId.isValid(
        orderId
      )
    ) {
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

    const order =
      await Order.findOne({
        _id: orderId,
        user: req.user._id,
      }).select(
        [
          "orderNumber",
          "totalAmount",
          "paymentMethod",
          "paymentStatus",
          "paymentId",
          "razorpayOrderId",
          "razorpayPaymentId",
          "razorpaySignature",
          "orderStatus",
        ].join(" ")
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
    --------------------------------------------
    Get Payment document
    --------------------------------------------
    */

    const payment =
      await Payment.findOne({
        order: order._id,
      }).select(
        [
          "provider",
          "razorpayOrderId",
          "razorpayPaymentId",
          "amount",
          "currency",
          "status",
          "method",
          "paidAt",
          "createdAt",
          "updatedAt",
        ].join(" ")
      );

    /*
    --------------------------------------------
    Response
    --------------------------------------------
    */

    return res.status(200).json({
      success: true,

      paymentStatus:
        order.paymentStatus,

      paymentId:
        order.paymentId,

      razorpayOrderId:
        order.razorpayOrderId,

      razorpayPaymentId:
        order.razorpayPaymentId,

      orderStatus:
        order.orderStatus,

      order,

      payment,
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

