import crypto from "crypto";
import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Payment from "../models/Payment.js";
import Coupon from "../models/Coupon.js";

import razorpay from "../services/razorpay.service.js";

/* =========================================================
   HELPERS
========================================================= */

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const roundMoney = (value) => {
  return Number(Number(value || 0).toFixed(2));
};

/*
  Razorpay works in the smallest currency unit.

  For INR:
  ₹100 = 10000 paise
*/
const rupeesToPaise = (amount) => {
  return Math.round(Number(amount) * 100);
};

const paiseToRupees = (amount) => {
  return Number(Number(amount || 0) / 100);
};

/* =========================================================
   CREATE RAZORPAY ORDER
========================================================= */

export const createRazorpayOrder = async (
  req,
  res
) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order =
      await Order.findOne({
        _id: orderId,
        user: req.user._id,
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /* =====================================================
       CHECK ORDER STATUS
    ===================================================== */

    if (
      [
        "Cancelled",
        "Refunded",
        "Delivered",
      ].includes(order.orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment cannot be created for this order",
      });
    }

    /* =====================================================
       ALREADY PAID
    ===================================================== */

    if (
      order.paymentMethod === "Razorpay" &&
      order.paymentStatus === "Paid"
    ) {
      return res.status(400).json({
        success: false,
        message: "Order has already been paid",
      });
    }

    if (
      order.paymentMethod === "COD" &&
      order.advancePaymentStatus === "Paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "COD advance payment has already been completed",
      });
    }

    /* =====================================================
       CHECK PAYMENT METHOD
    ===================================================== */

    if (
      order.paymentMethod !== "Razorpay" &&
      order.paymentMethod !== "COD"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    /* =====================================================
       DETERMINE PAYMENT AMOUNT
    ===================================================== */

    let paymentAmount = 0;

    if (order.paymentMethod === "Razorpay") {
      /*
        Full prepaid order
      */
      paymentAmount = roundMoney(
        order.totalAmount
      );
    } else {
      /*
        COD:
        Customer pays only the advance online.
      */

      paymentAmount = roundMoney(
        order.advanceAmount
      );

      if (paymentAmount <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "No online advance payment is required for this COD order",
        });
      }
    }

    if (paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    /* =====================================================
       EXISTING RAZORPAY ORDER
    ===================================================== */

    if (order.razorpayOrderId) {
      try {
        const existingRazorpayOrder =
          await razorpay.orders.fetch(
            order.razorpayOrderId
          );

        const expectedPaise =
          rupeesToPaise(paymentAmount);

        /*
          Only reuse the Razorpay order if the amount
          exactly matches the current backend amount.
        */

        if (
          Number(existingRazorpayOrder.amount) ===
          expectedPaise &&
          existingRazorpayOrder.currency ===
            "INR"
        ) {
          return res.status(200).json({
            success: true,
            message:
              "Razorpay order already exists",

            razorpayOrder:
              existingRazorpayOrder,

            keyId:
              process.env.RAZORPAY_KEY_ID,

            amount:
              paymentAmount,

            paymentAmount,

            paymentType:
              order.paymentMethod ===
              "COD"
                ? "COD_ADVANCE"
                : "FULL_PAYMENT",
          });
        }
      } catch (error) {
        console.warn(
          "Existing Razorpay order could not be fetched. Creating a new one."
        );
      }
    }

    /* =====================================================
       CREATE RAZORPAY ORDER
    ===================================================== */

    const razorpayOrder =
      await razorpay.orders.create({
        amount:
          rupeesToPaise(paymentAmount),

        currency: "INR",

        receipt:
          order.orderNumber,

        notes: {
          fitforgeOrderId:
            order._id.toString(),

          orderNumber:
            order.orderNumber,

          paymentType:
            order.paymentMethod === "COD"
              ? "COD_ADVANCE"
              : "FULL_PAYMENT",

          customerId:
            req.user._id.toString(),
        },
      });

    /* =====================================================
       SAVE RAZORPAY ORDER ID
    ===================================================== */

    order.razorpayOrderId =
      razorpayOrder.id;

    await order.save();

    /* =====================================================
       CREATE / UPDATE PAYMENT RECORD
    ===================================================== */

    await Payment.findOneAndUpdate(
      {
        order: order._id,
      },
      {
        $set: {
          user: req.user._id,
          order: order._id,

          amount: paymentAmount,

          currency: "INR",

          status: "created",

          razorpayOrderId:
            razorpayOrder.id,

          paymentMethod:
            order.paymentMethod,

          paymentType:
            order.paymentMethod === "COD"
              ? "COD_ADVANCE"
              : "FULL_PAYMENT",
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(201).json({
      success: true,

      message:
        order.paymentMethod === "COD"
          ? "COD advance payment created"
          : "Razorpay payment created",

      razorpayOrder,

      keyId:
        process.env.RAZORPAY_KEY_ID,

      amount:
        paymentAmount,

      paymentAmount,

      paymentType:
        order.paymentMethod === "COD"
          ? "COD_ADVANCE"
          : "FULL_PAYMENT",

      order: {
        _id: order._id,
        orderNumber:
          order.orderNumber,

        totalAmount:
          order.totalAmount,

        advanceAmount:
          order.advanceAmount,

        remainingAmount:
          order.remainingAmount,
      },
    });
  } catch (error) {
    console.error(
      "Create Razorpay order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create Razorpay payment",
    });
  }
};

/* =========================================================
   VERIFY RAZORPAY PAYMENT
========================================================= */

export const verifyRazorpayPayment = async (
  req,
  res
) => {
  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  try {
    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Incomplete Razorpay payment information",
      });
    }

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order =
      await Order.findOne({
        _id: orderId,
        user: req.user._id,
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /* =====================================================
       DUPLICATE PAYMENT PROTECTION
    ===================================================== */

    if (
      order.paymentMethod === "Razorpay" &&
      order.paymentStatus === "Paid"
    ) {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        alreadyPaid: true,
        order,
      });
    }

    if (
      order.paymentMethod === "COD" &&
      order.advancePaymentStatus === "Paid"
    ) {
      return res.status(200).json({
        success: true,
        message:
          "COD advance payment already verified",
        alreadyPaid: true,
        order,
      });
    }

    /* =====================================================
       VERIFY RAZORPAY ORDER ID
    ===================================================== */

    if (
      order.razorpayOrderId !==
      razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay order does not match FITFORGE order",
      });
    }

    /* =====================================================
       DETERMINE EXPECTED AMOUNT
    ===================================================== */

    let expectedAmount;

    if (
      order.paymentMethod === "COD"
    ) {
      expectedAmount =
        roundMoney(
          order.advanceAmount
        );
    } else {
      expectedAmount =
        roundMoney(
          order.totalAmount
        );
    }

    if (expectedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid expected payment amount",
      });
    }

    /* =====================================================
       VERIFY SIGNATURE
    ===================================================== */

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

    const generatedBuffer =
      Buffer.from(
        generatedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        razorpay_signature,
        "utf8"
      );

    if (
      generatedBuffer.length !==
      receivedBuffer.length ||
      !crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Razorpay payment signature",
      });
    }

    /* =====================================================
       FETCH PAYMENT FROM RAZORPAY
    ===================================================== */

    const razorpayPayment =
      await razorpay.payments.fetch(
        razorpay_payment_id
      );

    if (
      razorpayPayment.order_id !==
      razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay payment order mismatch",
      });
    }

    if (
      razorpayPayment.currency !==
      "INR"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Unsupported payment currency",
      });
    }

    const actualPaidAmount =
      paiseToRupees(
        razorpayPayment.amount
      );

    if (
      roundMoney(actualPaidAmount) !==
      roundMoney(expectedAmount)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment amount does not match order amount",
      });
    }

    if (
      razorpayPayment.status !==
      "captured"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment has not been captured",
      });
    }

    /* =====================================================
       TRANSACTION
    ===================================================== */

    const session =
      await mongoose.startSession();

    let transactionOrder;

    try {
      await session.withTransaction(
        async () => {
          /*
            Re-read order inside transaction.
          */

          transactionOrder =
            await Order.findOne({
              _id: order._id,
              user: req.user._id,
            }).session(session);

          if (!transactionOrder) {
            throw new Error(
              "ORDER_NOT_FOUND"
            );
          }

          /*
            Protect against duplicate requests.
          */

          if (
            transactionOrder.paymentMethod ===
              "Razorpay" &&
            transactionOrder.paymentStatus ===
              "Paid"
          ) {
            return;
          }

          if (
            transactionOrder.paymentMethod ===
              "COD" &&
            transactionOrder.advancePaymentStatus ===
              "Paid"
          ) {
            return;
          }

          /* ===============================================
             FINAL STOCK CHECK + DEDUCTION
          =============================================== */

          for (
            const item of
              transactionOrder.items
          ) {
            const updatedProduct =
              await Product.findOneAndUpdate(
                {
                  _id: item.product,

                  isActive: true,

                  stock: {
                    $gte:
                      Number(
                        item.quantity
                      ),
                  },
                },
                {
                  $inc: {
                    stock:
                      -Number(
                        item.quantity
                      ),
                  },
                },
                {
                  new: true,
                  session,
                }
              );

            if (!updatedProduct) {
              throw new Error(
                "STOCK_UNAVAILABLE"
              );
            }
          }

          /* ===============================================
             COUPON VALIDATION
          =============================================== */

          if (
            transactionOrder.couponCode
          ) {
            const coupon =
              await Coupon.findOne({
                code:
                  transactionOrder.couponCode,
              }).session(session);

            if (!coupon) {
              throw new Error(
                "COUPON_NOT_FOUND"
              );
            }

            if (!coupon.isActive) {
              throw new Error(
                "COUPON_INACTIVE"
              );
            }

            const now = new Date();

            if (
              coupon.startDate &&
              now < coupon.startDate
            ) {
              throw new Error(
                "COUPON_NOT_STARTED"
              );
            }

            if (
              coupon.endDate &&
              now > coupon.endDate
            ) {
              throw new Error(
                "COUPON_EXPIRED"
              );
            }

            /* =============================================
               GLOBAL COUPON LIMIT
            ============================================= */

            if (
              coupon.usageLimit !==
                null &&
              coupon.usedCount >=
                coupon.usageLimit
            ) {
              throw new Error(
                "COUPON_USAGE_LIMIT"
              );
            }

            /* =============================================
               PER USER LIMIT
            ============================================= */

            if (
              coupon.perUserLimit !==
                null &&
              coupon.perUserLimit !==
                undefined
            ) {
              const previousUses =
                await Order.countDocuments(
                  {
                    user:
                      req.user._id,

                    couponCode:
                      coupon.code,

                    _id: {
                      $ne:
                        transactionOrder._id,
                    },

                    $or: [
                      {
                        paymentStatus:
                          "Paid",
                      },

                      {
                        paymentMethod:
                          "COD",

                        advancePaymentStatus:
                          "Paid",

                        orderStatus: {
                          $nin: [
                            "Cancelled",
                            "Refunded",
                          ],
                        },
                      },
                    ],

                    orderStatus: {
                      $nin: [
                        "Cancelled",
                        "Refunded",
                      ],
                    },
                  }
                ).session(session);

              if (
                previousUses >=
                Number(
                  coupon.perUserLimit
                )
              ) {
                throw new Error(
                  "COUPON_USER_LIMIT"
                );
              }
            }

            /* =============================================
               INCREMENT COUPON USAGE
            ============================================= */

            const couponUpdate =
              await Coupon.findOneAndUpdate(
                {
                  _id: coupon._id,

                  $or: [
                    {
                      usageLimit: null,
                    },

                    {
                      usageLimit: {
                        $gt:
                          coupon.usedCount,
                      },
                    },
                  ],
                },
                {
                  $inc: {
                    usedCount: 1,
                  },
                },
                {
                  new: true,
                  session,
                }
              );

            if (!couponUpdate) {
              throw new Error(
                "COUPON_USAGE_LIMIT"
              );
            }
          }

          /* ===============================================
             UPDATE ORDER
          =============================================== */

          if (
            transactionOrder.paymentMethod ===
            "COD"
          ) {
            transactionOrder.advancePaymentStatus =
              "Paid";

            transactionOrder.paymentStatus =
              "Pending";

            transactionOrder.orderStatus =
              "Confirmed";

            transactionOrder.razorpayPaymentId =
              razorpay_payment_id;

            transactionOrder.razorpaySignature =
              razorpay_signature;

            transactionOrder.paymentId =
              razorpay_payment_id;
          } else {
            transactionOrder.paymentStatus =
              "Paid";

            transactionOrder.orderStatus =
              "Confirmed";

            transactionOrder.razorpayPaymentId =
              razorpay_payment_id;

            transactionOrder.razorpaySignature =
              razorpay_signature;

            transactionOrder.paymentId =
              razorpay_payment_id;

            transactionOrder.advanceAmount =
              transactionOrder.totalAmount;

            transactionOrder.remainingAmount =
              0;
          }

          await transactionOrder.save({
            session,
          });

          /* ===============================================
             PAYMENT RECORD
          =============================================== */

          await Payment.findOneAndUpdate(
            {
              order:
                transactionOrder._id,
            },
            {
              $set: {
                user:
                  req.user._id,

                order:
                  transactionOrder._id,

                amount:
                  expectedAmount,

                currency: "INR",

                status:
                  "captured",

                razorpayOrderId:
                  razorpay_order_id,

                razorpayPaymentId:
                  razorpay_payment_id,

                paymentMethod:
                  transactionOrder.paymentMethod,

                paymentType:
                  transactionOrder.paymentMethod ===
                  "COD"
                    ? "COD_ADVANCE"
                    : "FULL_PAYMENT",
              },
            },
            {
              upsert: true,
              new: true,
              session,

              setDefaultsOnInsert:
                true,
            }
          );
        }
      );
    } finally {
      await session.endSession();
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    return res.status(200).json({
      success: true,

      message:
        order.paymentMethod === "COD"
          ? "COD advance payment verified successfully"
          : "Payment verified successfully",

      order: transactionOrder,

      payment: {
        amount: expectedAmount,

        paymentType:
          order.paymentMethod === "COD"
            ? "COD_ADVANCE"
            : "FULL_PAYMENT",

        razorpayOrderId:
          razorpay_order_id,

        razorpayPaymentId:
          razorpay_payment_id,

        status: "captured",
      },
    });
  } catch (error) {
    console.error(
      "Verify Razorpay payment error:",
      error
    );

    /* =====================================================
       ERROR MESSAGES
    ===================================================== */

    const errorMessages = {
      ORDER_NOT_FOUND:
        "Order no longer exists",

      STOCK_UNAVAILABLE:
        "One or more products are no longer available in the requested quantity",

      COUPON_NOT_FOUND:
        "The coupon used for this order is no longer available",

      COUPON_INACTIVE:
        "The coupon used for this order is inactive",

      COUPON_NOT_STARTED:
        "The coupon used for this order is not active yet",

      COUPON_EXPIRED:
        "The coupon used for this order has expired",

      COUPON_USAGE_LIMIT:
        "The coupon usage limit has been reached",

      COUPON_USER_LIMIT:
        "You have reached the usage limit for this coupon",
    };

    const knownMessage =
      errorMessages[error.message];

    if (knownMessage) {
      /*
        Important:
        Razorpay has already captured the money,
        but the order transaction failed.

        We must attempt a refund.
      */

      try {
        await razorpay.payments.refund(
          razorpay_payment_id,
          {
            amount:
              rupeesToPaise(
                order.paymentMethod ===
                  "COD"
                  ? order.advanceAmount
                  : order.totalAmount
              ),

            speed: "normal",

            notes: {
              fitforgeOrderId:
                order._id.toString(),

              reason:
                knownMessage,
            },
          }
        );

        await Payment.findOneAndUpdate(
          {
            order: order._id,
          },
          {
            $set: {
              status: "refunded",

              razorpayOrderId:
                razorpay_order_id,

              razorpayPaymentId:
                razorpay_payment_id,
            },
          },
          {
            upsert: true,
          }
        );

        return res.status(409).json({
          success: false,

          message:
            `${knownMessage}. Your payment has been refunded.`,

          paymentReceived: true,

          refundInitiated: true,
        });
      } catch (refundError) {
        console.error(
          "Automatic Razorpay refund failed:",
          refundError
        );

        return res.status(500).json({
          success: false,

          message:
            `${knownMessage}. Payment was received, but the automatic refund could not be completed. Please contact FITFORGE support.`,

          paymentReceived: true,

          refundInitiated: false,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Payment verification failed",
    });
  }
};

/* =========================================================
   GET PAYMENT STATUS
========================================================= */

export const getPaymentStatus = async (
  req,
  res
) => {
  try {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order =
      await Order.findOne({
        _id: orderId,
        user: req.user._id,
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const payment =
      await Payment.findOne({
        order: order._id,
      });

    return res.status(200).json({
      success: true,

      order: {
        _id: order._id,
        orderNumber:
          order.orderNumber,

        totalAmount:
          order.totalAmount,

        advanceAmount:
          order.advanceAmount,

        remainingAmount:
          order.remainingAmount,

        paymentMethod:
          order.paymentMethod,

        paymentStatus:
          order.paymentStatus,

        advancePaymentStatus:
          order.advancePaymentStatus,

        orderStatus:
          order.orderStatus,
      },

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

