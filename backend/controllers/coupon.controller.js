import Coupon from "../models/Coupon.js";

export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal, collection = "All" } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: "Coupon is inactive",
      });
    }

    const now = new Date();

    if (coupon.startDate && now < coupon.startDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon is not active yet",
      });
    }

    if (coupon.endDate && now > coupon.endDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    if (
      coupon.usageLimit !== null &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    const orderSubtotal = Number(subtotal);

    if (!Number.isFinite(orderSubtotal) || orderSubtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid subtotal",
      });
    }

    if (orderSubtotal < coupon.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${coupon.minimumOrderAmount}`,
      });
    }

    if (
      coupon.collection !== "All" &&
      coupon.collection !== collection
    ) {
      return res.status(400).json({
        success: false,
        message: `Coupon is valid only for ${coupon.collection} products`,
      });
    }

    let discount = 0;

    if (coupon.discountType === "Percentage") {
      discount = (orderSubtotal * coupon.discountValue) / 100;

      if (coupon.maximumDiscount !== null) {
        discount = Math.min(discount, coupon.maximumDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, orderSubtotal);

    const finalSubtotal = orderSubtotal - discount;

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      subtotal: orderSubtotal,
      discount,
      finalSubtotal,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to validate coupon",
    });
  }
};