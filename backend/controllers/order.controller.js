import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

const generateOrderNumber = () => {
  const timestamp = Date.now();

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `FF-${timestamp}-${random}`;
};

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

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
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
      if (!shippingAddress[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

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

    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    });

    if (products.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products are unavailable",
      });
    }

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

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid quantity",
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} does not have enough stock`,
        });
      }

      const price =
        product.salePrice !== null &&
        product.salePrice !== undefined
          ? product.salePrice
          : product.price;

      subtotal += price * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        price,
        quantity,
        size: item.size || "",
        color: item.color || "",
      });
    }

    const safeDiscount = Math.max(
      0,
      Math.min(Number(discount) || 0, subtotal)
    );

    const shippingFee =
      subtotal - safeDiscount >= 2000
        ? 0
        : 99;

    const totalAmount =
      subtotal -
      safeDiscount +
      shippingFee;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),

      user: req.user._id,

      items: orderItems,

      shippingAddress,

      subtotal,

      shippingFee,

      discount: safeDiscount,

      totalAmount,

      paymentMethod:
        paymentMethod === "RAZORPAY"
          ? "RAZORPAY"
          : "COD",

      paymentStatus: "Pending",

      orderStatus: "Pending",

      couponCode,

      notes,
    });

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );
    }

    const populatedOrder =
      await Order.findById(order._id)
        .populate(
          "items.product",
          "name images price salePrice"
        );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

export const getMyOrders = async (req, res) => {
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

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "Get my orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getMyOrderById = async (
  req,
  res
) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
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

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "Get order error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

export const cancelMyOrder = async (
  req,
  res
) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

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

    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();

    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: item.quantity,
          },
        }
      );
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Cancel order error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
};