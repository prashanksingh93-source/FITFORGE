import mongoose from "mongoose";

import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";

const roundMoney = (value) =>
  Number(Number(value || 0).toFixed(2));

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

/*
|--------------------------------------------------------------------------
| VALIDATE COUPON
|--------------------------------------------------------------------------
| POST /api/coupons/validate
|
| Body:
| {
|   code: "SAVE20",
|   subtotal: 2500,
|   collection: "Performance"
| }
|--------------------------------------------------------------------------
*/

export const validateCoupon = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      code,
      subtotal,
      collection,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | BASIC VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      typeof code !== "string" ||
      !code.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const orderSubtotal = Number(subtotal);

    if (
      !Number.isFinite(orderSubtotal) ||
      orderSubtotal < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid subtotal",
      });
    }

    const normalizedCode =
      code.trim().toUpperCase();

    /*
    |--------------------------------------------------------------------------
    | FIND COUPON
    |--------------------------------------------------------------------------
    */

    const coupon =
      await Coupon.findOne({
        code: normalizedCode,
      }).lean();

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ACTIVE CHECK
    |--------------------------------------------------------------------------
    */

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: "This coupon is inactive",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | DATE CHECK
    |--------------------------------------------------------------------------
    */

    const now = new Date();

    if (
      coupon.startDate &&
      now < new Date(coupon.startDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not active yet",
      });
    }

    if (
      coupon.endDate &&
      now > new Date(coupon.endDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "This coupon has expired",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GLOBAL USAGE LIMIT
    |--------------------------------------------------------------------------
    */

    if (
      coupon.usageLimit !== null &&
      coupon.usageLimit !== undefined &&
      Number(coupon.usedCount || 0) >=
        Number(coupon.usageLimit)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This coupon usage limit has been reached",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | MINIMUM ORDER
    |--------------------------------------------------------------------------
    */

    const minimumOrderAmount =
      Number(
        coupon.minimumOrderAmount || 0
      );

    if (
      orderSubtotal <
      minimumOrderAmount
    ) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for this coupon is ₹${minimumOrderAmount}`,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | COLLECTION RESTRICTION
    |--------------------------------------------------------------------------
    */

    if (
      coupon.collection &&
      coupon.collection !== "All"
    ) {
      if (
        !collection ||
        String(collection).toLowerCase() !==
          String(coupon.collection).toLowerCase()
      ) {
        return res.status(400).json({
          success: false,
          message: `This coupon is valid only for ${coupon.collection} products`,
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | PER USER LIMIT
    |--------------------------------------------------------------------------
    |
    | We count only valid/used orders.
    |
    | Razorpay:
    | paymentStatus = Paid
    |
    | COD:
    | advance payment must be Paid
    | OR COD does not require advance.
    |
    | Cancelled and Refunded orders do not count.
    |--------------------------------------------------------------------------
    */

    const perUserLimit =
      Number(coupon.perUserLimit || 1);

    if (perUserLimit > 0) {
      const previousUses =
        await Order.countDocuments({
          user: userId,

          couponCode: coupon.code,

          orderStatus: {
            $nin: [
              "Cancelled",
              "Refunded",
            ],
          },

          $or: [
            {
              paymentStatus: "Paid",
            },
            {
              paymentMethod: "COD",

              $or: [
                {
                  advancePaymentStatus:
                    "Paid",
                },
                {
                  advancePaymentStatus:
                    "NotRequired",
                },
              ],
            },
          ],
        });

      if (
        previousUses >=
        perUserLimit
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You have already used this coupon the maximum number of times",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | CALCULATE DISCOUNT
    |--------------------------------------------------------------------------
    */

    let discount = 0;

    if (
      coupon.discountType ===
      "Percentage"
    ) {
      const percentage =
        Number(
          coupon.discountValue || 0
        );

      if (
        percentage <= 0 ||
        percentage > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This coupon has an invalid discount",
        });
      }

      discount = roundMoney(
        (orderSubtotal *
          percentage) /
          100
      );

      /*
      |--------------------------------------------------------------------------
      | MAXIMUM DISCOUNT
      |--------------------------------------------------------------------------
      */

      if (
        coupon.maximumDiscount !== null &&
        coupon.maximumDiscount !== undefined
      ) {
        discount = Math.min(
          discount,
          Number(
            coupon.maximumDiscount
          )
        );
      }
    } else if (
      coupon.discountType ===
      "Fixed"
    ) {
      const fixedDiscount =
        Number(
          coupon.discountValue || 0
        );

      if (fixedDiscount <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "This coupon has an invalid discount",
        });
      }

      discount = Math.min(
        fixedDiscount,
        orderSubtotal
      );
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Invalid coupon discount type",
      });
    }

    discount = roundMoney(
      Math.max(
        0,
        Math.min(
          discount,
          orderSubtotal
        )
      )
    );

    /*
    |--------------------------------------------------------------------------
    | FINAL SUBTOTAL
    |--------------------------------------------------------------------------
    */

    const finalSubtotal =
      roundMoney(
        Math.max(
          0,
          orderSubtotal - discount
        )
      );

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.json({
      success: true,

      message:
        "Coupon applied successfully",

      coupon: {
        id: coupon._id,
        code: coupon.code,
        description:
          coupon.description || "",
        discountType:
          coupon.discountType,
        discountValue:
          coupon.discountValue,
        maximumDiscount:
          coupon.maximumDiscount,
        collection:
          coupon.collection || "All",
      },

      discount,

      subtotal: roundMoney(
        orderSubtotal
      ),

      finalSubtotal,
    });
  } catch (error) {
    console.error(
      "Validate coupon error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to validate coupon",
    });
  }
};

