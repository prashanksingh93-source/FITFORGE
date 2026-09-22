import Order from "../models/Order.js";
import Product from "../models/Product.js";

const orderStatuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const paymentStatuses = [
  "Pending",
  "Paid",
  "Failed",
  "Refunded",
];

export const getAllAdminOrders = async (req, res) => {
  try {
    const {
      search = "",
      status = "All",
      paymentStatus = "All",
    } = req.query;

    const filter = {};

    if (status !== "All") {
      filter.orderStatus = status;
    }

    if (paymentStatus !== "All") {
      filter.paymentStatus = paymentStatus;
    }

    const orders = await Order.find(filter)
      .populate("user", "fullName email phone")
      .populate(
        "items.product",
        "name images price salePrice"
      )
      .sort({ createdAt: -1 });

    let result = orders;

    if (search.trim()) {
      const value = search.trim().toLowerCase();

      result = orders.filter((order) => {
        return (
          order.orderNumber
            ?.toLowerCase()
            .includes(value) ||
          order.user?.fullName
            ?.toLowerCase()
            .includes(value) ||
          order.user?.email
            ?.toLowerCase()
            .includes(value)
        );
      });
    }

    res.status(200).json({
      success: true,
      count: result.length,
      orders: result,
    });
  } catch (error) {
    console.error("Admin orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "fullName email phone")
      .populate(
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
    console.error("Order details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    if (!orderStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const previousStatus = order.orderStatus;

    if (
      previousStatus === "Cancelled" &&
      orderStatus !== "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled orders cannot be reopened",
      });
    }

    if (
      orderStatus === "Cancelled" &&
      previousStatus !== "Cancelled"
    ) {
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

      order.cancelledAt = new Date();
    }

    if (orderStatus === "Delivered") {
      order.deliveredAt = new Date();

      if (
        order.paymentMethod === "COD" &&
        order.paymentStatus === "Pending"
      ) {
        order.paymentStatus = "Paid";
      }
    }

    order.orderStatus = orderStatus;

    await order.save();

    const updatedOrder =
      await Order.findById(order._id)
        .populate(
          "user",
          "fullName email phone"
        )
        .populate(
          "items.product",
          "name images price salePrice"
        );

    res.status(200).json({
      success: true,
      message:
        "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Update order status error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update order status",
    });
  }
};

export const updatePaymentStatus = async (
  req,
  res
) => {
  try {
    const { paymentStatus } = req.body;

    if (!paymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentStatus = paymentStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message:
        "Payment status updated successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Payment status error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update payment status",
    });
  }
};