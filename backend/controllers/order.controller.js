import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

/*
====================================================
GENERATE ORDER NUMBER
====================================================
*/

const generateOrderNumber = () => {
  const timestamp = Date.now();

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `FF-${timestamp}-${random}`;
};


/*
====================================================
CREATE ORDER
POST /api/orders
====================================================
*/

export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = "COD",
      couponCode = "",
      discount = 0,
      notes = "",
    } = req.body;

    /*
    --------------------------------------------
    Validate items
    --------------------------------------------
    */

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order must contain at least one item",
      });
    }

    /*
    --------------------------------------------
    Validate address
    --------------------------------------------
    */

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
      if (!shippingAddress[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    /*
    --------------------------------------------
    Get product IDs
    --------------------------------------------
    */

    const productIds = items.map(
      (item) => item.product
    );

    const validObjectIds = productIds.every(
      (id) => mongoose.isValidObjectId(id)
    );

    if (!validObjectIds) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    /*
    --------------------------------------------
    Get products from MongoDB
    --------------------------------------------

    IMPORTANT:
    We NEVER trust product price from frontend.
    --------------------------------------------
    */

    const products = await Product.find({
      _id: {
        $in: productIds,
      },

      isActive: true,
    });

    if (products.length !== items.length) {
      return res.status(400).json({
        success: false,
        message:
          "One or more products are unavailable",
      });
    }

    /*
    --------------------------------------------
    Calculate subtotal
    --------------------------------------------
    */

    let subtotal = 0;

    const orderItems = [];

    for (const item of items) {
      const product = products.find(
        (productItem) =>
          productItem._id.toString() ===
          item.product.toString()
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Product not found",
        });
      }

      /*
      ------------------------------------------
      Validate quantity
      ------------------------------------------
      */

      const quantity = Number(
        item.quantity
      );

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid quantity",
        });
      }

      /*
      ------------------------------------------
      Check stock
      ------------------------------------------
      */

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message:
            `${product.name} does not have enough stock`,
        });
      }

      /*
      ------------------------------------------
      Get REAL price from MongoDB
      ------------------------------------------
      */

      const price =
        product.salePrice !== null &&
        product.salePrice !== undefined
          ? Number(product.salePrice)
          : Number(product.price);

      subtotal += price * quantity;

      /*
      ------------------------------------------
      Add item to order
      ------------------------------------------
      */

      orderItems.push({
        product: product._id,

        name: product.name,

        image:
          product.images?.[0] || "",

        price,

        quantity,

        size: item.size || "",

        color: item.color || "",
      });
    }

    /*
    --------------------------------------------
    Discount
    --------------------------------------------
    */

    const safeDiscount = Math.max(
      0,
      Math.min(
        Number(discount) || 0,
        subtotal
      )
    );

    /*
    --------------------------------------------
    Shipping
    --------------------------------------------
    */

    const shippingFee =
      subtotal - safeDiscount >= 2000
        ? 0
        : 99;

    /*
    --------------------------------------------
    Total
    --------------------------------------------
    */

    const totalAmount =
      subtotal -
      safeDiscount +
      shippingFee;

    /*
    --------------------------------------------
    Payment method
    --------------------------------------------
    */

    const safePaymentMethod =
      paymentMethod === "RAZORPAY"
        ? "RAZORPAY"
        : "COD";

    /*
    ==================================================
    CREATE ORDER
    ==================================================

    IMPORTANT:

    We DO NOT decrease stock here.

    For Razorpay:

    Order created
          ↓
    Razorpay payment
          ↓
    Payment verified
          ↓
    Stock decreases

    This prevents stock loss when payment fails.
    ==================================================
    */

    const order = await Order.create({
      orderNumber:
        generateOrderNumber(),

      user: req.user._id,

      items: orderItems,

      shippingAddress,

      subtotal,

      shippingFee,

      discount: safeDiscount,

      totalAmount,

      paymentMethod:
        safePaymentMethod,

      paymentStatus: "Pending",

      orderStatus: "Pending",

      couponCode,

      notes,
    });

    /*
    --------------------------------------------
    Populate product information
    --------------------------------------------
    */

    const populatedOrder =
      await Order.findById(order._id).populate(
        "items.product",
        "name images price salePrice stock"
      );

    return res.status(201).json({
      success: true,

      message:
        "Order created successfully",

      order: populatedOrder,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create order",
    });
  }
};


/*
====================================================
GET MY ORDERS
GET /api/orders
====================================================
*/

export const getMyOrders = async (
  req,
  res
) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate(
        "items.product",
        "name images price salePrice"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      count: orders.length,

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


/*
====================================================
GET MY ORDER BY ID
GET /api/orders/:id
====================================================
*/

export const getMyOrderById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    /*
    --------------------------------------------
    Validate ID
    --------------------------------------------
    */

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    /*
    --------------------------------------------
    Find user's order
    --------------------------------------------
    */

    const order = await Order.findOne({
      _id: id,

      user: req.user._id,
    }).populate(
      "items.product",
      "name images price salePrice"
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


/*
====================================================
CANCEL MY ORDER
PATCH /api/orders/:id/cancel
====================================================

IMPORTANT:

Because stock is now NOT reduced when creating
the order, we DO NOT add stock back here.

====================================================
*/

export const cancelMyOrder = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    /*
    --------------------------------------------
    Validate ID
    --------------------------------------------
    */

    if (!mongoose.isValidObjectId(id)) {
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
      _id: id,

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
    Already cancelled
    --------------------------------------------
    */

    if (
      order.orderStatus ===
      "Cancelled"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Order is already cancelled",
      });
    }

    /*
    --------------------------------------------
    Only Pending / Confirmed orders
    can be cancelled
    --------------------------------------------
    */

    if (
      ![
        "Pending",
        "Confirmed",
      ].includes(order.orderStatus)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "This order can no longer be cancelled",
      });
    }

    /*
    --------------------------------------------
    Cancel order
    --------------------------------------------
    */

    order.orderStatus =
      "Cancelled";

    /*
    If your Order schema has this field,
    it will be stored.
    --------------------------------------------
    */

    order.cancelledAt =
      new Date();

    await order.save();

    return res.status(200).json({
      success: true,

      message:
        "Order cancelled successfully",

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