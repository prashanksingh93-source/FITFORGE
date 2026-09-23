import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import StoreSettings from "../models/StoreSettings.js";

/* =========================================================
   HELPERS
========================================================= */

const roundMoney = (value) => {
  return Number(Number(value || 0).toFixed(2));
};

const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `FF${timestamp}${random}`;
};

const normalizeId = (value) => {
  if (!value) return null;

  if (typeof value === "object" && value._id) {
    return value._id.toString();
  }

  return value.toString();
};

/* =========================================================
   CREATE ORDER
========================================================= */

export const createOrder = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      items,
      shippingAddress,
      paymentMethod = "Razorpay",
      couponCode = "",
      notes = "",
    } = req.body;

    /* =====================================================
       BASIC VALIDATION
    ===================================================== */

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const requiredAddressFields = [
      "fullName",
      "phone",
      "addressLine",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredAddressFields) {
      if (
        !shippingAddress[field] ||
        String(shippingAddress[field]).trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    if (!["Razorpay", "COD"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    /* =====================================================
       LOAD STORE SETTINGS
    ===================================================== */

    let settings = await StoreSettings.findOne();

    if (!settings) {
      settings = await StoreSettings.create({});
    }

    const shippingSetting = Math.max(
      0,
      Number(settings.shippingFee || 0)
    );

    const freeShippingThreshold = Math.max(
      0,
      Number(settings.freeShippingThreshold || 0)
    );

    const gstRate = Math.min(
      100,
      Math.max(0, Number(settings.gst || 0))
    );

    /* =====================================================
       COD SETTINGS
    ===================================================== */

    const codEnabled =
      settings.codEnabled !== false;

    const codAdvanceEnabled =
      settings.codAdvanceEnabled === true;

    const codAdvancePercentage = Math.min(
      100,
      Math.max(
        0,
        Number(settings.codAdvancePercentage || 0)
      )
    );

    const codMinimumAdvance = Math.max(
      0,
      Number(settings.codMinimumAdvance || 0)
    );

    const codMaximumOrderValue =
      settings.codMaximumOrderValue === null ||
      settings.codMaximumOrderValue === undefined
        ? null
        : Math.max(
            0,
            Number(settings.codMaximumOrderValue)
          );

    /* =====================================================
       CHECK COD AVAILABILITY
    ===================================================== */

    if (paymentMethod === "COD" && !codEnabled) {
      return res.status(400).json({
        success: false,
        message: "Cash on Delivery is currently unavailable",
      });
    }

    /* =====================================================
       NORMALIZE CART ITEMS
    ===================================================== */

    const normalizedItems = [];

    for (const item of items) {
      const productId = normalizeId(item.product);

      if (
        !productId ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product in cart",
        });
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity",
        });
      }

      const product = await Product.findOne({
        _id: productId,
        isActive: true,
      }).lean();

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "One of the products is unavailable",
        });
      }

      /* ===================================================
         CHECK STOCK
      =================================================== */

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} has only ${product.stock} item(s) available`,
        });
      }

      /* ===================================================
         VALIDATE SIZE
      =================================================== */

      const requestedSize =
        item.size?.toString().trim() || "";

      if (
        Array.isArray(product.sizes) &&
        product.sizes.length > 0 &&
        requestedSize &&
        !product.sizes.includes(requestedSize)
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid size selected for ${product.name}`,
        });
      }

      /* ===================================================
         VALIDATE COLOR
      =================================================== */

      const requestedColor =
        item.color?.toString().trim() || "";

      if (
        Array.isArray(product.colors) &&
        product.colors.length > 0 &&
        requestedColor
      ) {
        const validColor = product.colors.some(
          (color) => {
            if (typeof color === "string") {
              return color === requestedColor;
            }

            return (
              color?.name === requestedColor
            );
          }
        );

        if (!validColor) {
          return res.status(400).json({
            success: false,
            message: `Invalid color selected for ${product.name}`,
          });
        }
      }

      /* ===================================================
         DATABASE PRICE
         NEVER TRUST FRONTEND PRICE
      =================================================== */

      const actualPrice =
        Number(product.salePrice) > 0
          ? Number(product.salePrice)
          : Number(product.price);

      if (
        !Number.isFinite(actualPrice) ||
        actualPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${product.name}`,
        });
      }

      const itemSubtotal = roundMoney(
        actualPrice * quantity
      );

      const image =
        product.thumbnail ||
        product.images?.[0]?.url ||
        product.images?.[0] ||
        "";

      normalizedItems.push({
        product: product._id,
        name: product.name,
        image,
        price: actualPrice,
        quantity,
        size: requestedSize,
        color: requestedColor,
        subtotal: itemSubtotal,
      });
    }

    /* =====================================================
       SUBTOTAL
    ===================================================== */

    const subtotal = roundMoney(
      normalizedItems.reduce(
        (total, item) => total + item.subtotal,
        0
      )
    );

    if (subtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order subtotal",
      });
    }

    /* =====================================================
       COUPON
    ===================================================== */

    let discount = 0;
    let appliedCoupon = null;

    if (couponCode?.trim()) {
      const normalizedCouponCode =
        couponCode.trim().toUpperCase();

      const coupon = await Coupon.findOne({
        code: normalizedCouponCode,
      });

      if (!coupon) {
        return res.status(400).json({
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

      if (
        coupon.startDate &&
        now < coupon.startDate
      ) {
        return res.status(400).json({
          success: false,
          message: "Coupon is not active yet",
        });
      }

      if (
        coupon.endDate &&
        now > coupon.endDate
      ) {
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

      if (
        subtotal < Number(coupon.minimumOrderAmount || 0)
      ) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount is ₹${coupon.minimumOrderAmount}`,
        });
      }

      /* ===================================================
         COLLECTION VALIDATION
      =================================================== */

      if (coupon.collection !== "All") {
        const containsAllowedCollection =
          normalizedItems.every((item) => {
            const product = items.find(
              (originalItem) =>
                normalizeId(originalItem.product) ===
                normalizeId(item.product)
            );

            return Boolean(product);
          });

        if (!containsAllowedCollection) {
          return res.status(400).json({
            success: false,
            message: `Coupon is valid only for ${coupon.collection} products`,
          });
        }

        const productIds =
          normalizedItems.map(
            (item) => item.product
          );

        const collectionProducts =
          await Product.find({
            _id: { $in: productIds },
            collection: coupon.collection,
          })
            .select("_id")
            .lean();

        if (
          collectionProducts.length !==
          normalizedItems.length
        ) {
          return res.status(400).json({
            success: false,
            message: `Coupon is valid only for ${coupon.collection} products`,
          });
        }
      }

      /* ===================================================
         PER-USER COUPON LIMIT
      =================================================== */

      const perUserLimit =
        coupon.perUserLimit === null ||
        coupon.perUserLimit === undefined
          ? null
          : Number(coupon.perUserLimit);

      if (
        perUserLimit !== null &&
        perUserLimit > 0
      ) {
        const previousUses =
          await Order.countDocuments({
            user: userId,
            couponCode: coupon.code,
            paymentStatus: {
              $in: ["Paid"],
            },
            orderStatus: {
              $nin: [
                "Cancelled",
                "Refunded",
              ],
            },
          });

        if (previousUses >= perUserLimit) {
          return res.status(400).json({
            success: false,
            message:
              "You have already used this coupon the maximum allowed number of times",
          });
        }
      }

      /* ===================================================
         CALCULATE DISCOUNT
      =================================================== */

      if (coupon.discountType === "Percentage") {
        discount = roundMoney(
          (subtotal *
            Number(coupon.discountValue || 0)) /
            100
        );

        if (
          coupon.maximumDiscount !== null &&
          coupon.maximumDiscount !== undefined
        ) {
          discount = Math.min(
            discount,
            Number(coupon.maximumDiscount)
          );
        }
      } else if (
        coupon.discountType === "Fixed"
      ) {
        discount = Number(
          coupon.discountValue || 0
        );
      }

      discount = roundMoney(
        Math.min(discount, subtotal)
      );

      appliedCoupon = coupon;
    }

    /* =====================================================
       AMOUNT AFTER DISCOUNT
    ===================================================== */

    const amountAfterDiscount = roundMoney(
      Math.max(0, subtotal - discount)
    );

    /* =====================================================
       SHIPPING
       CONTROLLED BY ADMIN SETTINGS
    ===================================================== */

    const shippingFee =
      freeShippingThreshold > 0 &&
      amountAfterDiscount >=
        freeShippingThreshold
        ? 0
        : shippingSetting;

    /* =====================================================
       GST
       CONTROLLED BY ADMIN SETTINGS
    ===================================================== */

    const tax = roundMoney(
      (amountAfterDiscount * gstRate) / 100
    );

    /* =====================================================
       FINAL ORDER TOTAL
    ===================================================== */

    const totalAmount = roundMoney(
      amountAfterDiscount +
        tax +
        shippingFee
    );

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order total",
      });
    }

    /* =====================================================
       COD ADVANCE CALCULATION
    ===================================================== */

    let advanceAmount = 0;
    let remainingAmount = totalAmount;
    let advancePaymentStatus =
      "NotRequired";

    if (paymentMethod === "COD") {
      if (
        codMaximumOrderValue !== null &&
        totalAmount > codMaximumOrderValue
      ) {
        return res.status(400).json({
          success: false,
          message: `COD is available only for orders up to ₹${codMaximumOrderValue}`,
        });
      }

      if (codAdvanceEnabled) {
        advanceAmount = roundMoney(
          (totalAmount *
            codAdvancePercentage) /
            100
        );

        /*
          Apply minimum advance amount.
        */

        if (
          codMinimumAdvance > 0 &&
          advanceAmount < codMinimumAdvance
        ) {
          advanceAmount =
            codMinimumAdvance;
        }

        /*
          Never allow advance to exceed
          the complete order total.
        */

        advanceAmount = roundMoney(
          Math.min(
            advanceAmount,
            totalAmount
          )
        );

        remainingAmount = roundMoney(
          totalAmount - advanceAmount
        );

        /*
          If the advance becomes the entire
          order amount, there is no remaining
          COD amount.
        */

        if (remainingAmount <= 0) {
          remainingAmount = 0;
          advanceAmount = totalAmount;
        }

        advancePaymentStatus =
          advanceAmount > 0
            ? "Pending"
            : "NotRequired";
      } else {
        advanceAmount = 0;
        remainingAmount = totalAmount;
        advancePaymentStatus =
          "NotRequired";
      }
    }

    /* =====================================================
       PREPAID ORDER
    ===================================================== */

    if (paymentMethod === "Razorpay") {
      advanceAmount = totalAmount;
      remainingAmount = 0;
      advancePaymentStatus = "NotRequired";
    }

    /* =====================================================
       CREATE ORDER
    ===================================================== */

    const order = await Order.create({
      orderNumber: generateOrderNumber(),

      user: userId,

      items: normalizedItems,

      shippingAddress: {
        fullName:
          shippingAddress.fullName.trim(),

        phone:
          shippingAddress.phone.trim(),

        addressLine:
          shippingAddress.addressLine.trim(),

        city:
          shippingAddress.city.trim(),

        state:
          shippingAddress.state.trim(),

        pincode:
          shippingAddress.pincode.trim(),

        country:
          shippingAddress.country?.trim() ||
          "India",
      },

      subtotal,

      shippingFee,

      discount,

      tax,

      totalAmount,

      advanceAmount,

      remainingAmount,

      advancePaymentStatus,

      paymentMethod,

      paymentStatus: "Pending",

      orderStatus: "Pending",

      couponCode:
        appliedCoupon?.code || "",

      notes:
        typeof notes === "string"
          ? notes.trim()
          : "",
    });

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(201).json({
      success: true,
      message:
        paymentMethod === "COD"
          ? codAdvanceEnabled &&
            advanceAmount > 0
            ? "COD order created. Advance payment is required."
            : "COD order created successfully."
          : "Order created successfully.",

      order: {
        _id: order._id,
        orderNumber: order.orderNumber,

        subtotal: order.subtotal,
        discount: order.discount,
        shippingFee: order.shippingFee,
        tax: order.tax,
        totalAmount: order.totalAmount,

        paymentMethod:
          order.paymentMethod,

        paymentStatus:
          order.paymentStatus,

        advanceAmount:
          order.advanceAmount,

        remainingAmount:
          order.remainingAmount,

        advancePaymentStatus:
          order.advancePaymentStatus,

        orderStatus:
          order.orderStatus,
      },

      /*
        Frontend uses this to decide whether
        Razorpay should open for the COD advance.
      */

      paymentRequired:
        paymentMethod === "Razorpay" ||
        (
          paymentMethod === "COD" &&
          advanceAmount > 0
        ),

      paymentAmount:
        paymentMethod === "Razorpay"
          ? totalAmount
          : advanceAmount,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    if (
      error.name === "ValidationError"
    ) {
      const message = Object.values(
        error.errors
      )
        .map(
          (item) => item.message
        )
        .join(", ");

      return res.status(400).json({
        success: false,
        message:
          message ||
          "Invalid order information",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

/* =========================================================
   GET MY ORDERS
========================================================= */

export const getMyOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find({
        user: req.user._id,
      })
        .populate(
          "items.product",
          "name thumbnail images"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "Get my orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch orders",
    });
  }
};

/* =========================================================
   GET SINGLE MY ORDER
========================================================= */

export const getMyOrderById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order =
      await Order.findOne({
        _id: id,
        user: req.user._id,
      }).populate(
        "items.product",
        "name thumbnail images"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "Get order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch order",
    });
  }
};

/* =========================================================
   CANCEL MY ORDER
========================================================= */

export const cancelMyOrder = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order =
      await Order.findOne({
        _id: id,
        user: req.user._id,
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      [
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Refunded",
      ].includes(order.orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This order cannot be cancelled",
      });
    }

    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Cancel order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel order",
    });
  }
};

