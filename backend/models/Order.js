import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    size: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

const orderSchema = new mongoose.Schema(
  {
    /* =========================
       ORDER NUMBER
    ========================= */

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    /* =========================
       CUSTOMER
    ========================= */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* =========================
       PRODUCTS
    ========================= */

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) =>
          Array.isArray(items) && items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    /* =========================
       SHIPPING ADDRESS
    ========================= */

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      addressLine: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },

      country: {
        type: String,
        default: "India",
        trim: true,
      },
    },

    /* =========================
       ORDER AMOUNTS
    ========================= */

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    discount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /* =========================
       COD / ADVANCE PAYMENT
    ========================= */

    /*
      Amount paid online before COD
    */

    advanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
      Amount customer must pay
      when the order is delivered.
    */

    remainingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
      For normal prepaid orders:
      NotRequired

      For COD without advance:
      Pending

      After Razorpay advance payment:
      Paid

      If advance payment fails:
      Failed

      If advance is refunded:
      Refunded
    */

    advancePaymentStatus: {
      type: String,
      enum: [
        "NotRequired",
        "Pending",
        "Paid",
        "Failed",
        "Refunded",
      ],
      default: "NotRequired",
    },

    /* =========================
       PAYMENT METHOD
    ========================= */

    paymentMethod: {
      type: String,
      enum: ["Razorpay", "COD"],
      required: true,
    },

    /* =========================
       PAYMENT STATUS
    ========================= */

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Failed",
        "Refunded",
      ],
      default: "Pending",
    },

    /* =========================
       GENERAL PAYMENT ID
    ========================= */

    paymentId: {
      type: String,
      default: "",
      trim: true,
    },

    /* =========================
       RAZORPAY
    ========================= */

    razorpayOrderId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true,
    },

    razorpaySignature: {
      type: String,
      default: "",
      trim: true,
    },

    /* =========================
       ORDER STATUS
    ========================= */

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Refunded",
      ],
      default: "Pending",
      index: true,
    },

    /* =========================
       COUPON
    ========================= */

    couponCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    /* =========================
       NOTES
    ========================= */

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    /* =========================
       CANCELLATION
    ========================= */

    cancelledAt: {
      type: Date,
      default: null,
    },

    /* =========================
       DELIVERY
    ========================= */

    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES
========================= */

orderSchema.index({
  user: 1,
  createdAt: -1,
});

orderSchema.index({
  paymentStatus: 1,
  orderStatus: 1,
});

orderSchema.index({
  paymentMethod: 1,
  advancePaymentStatus: 1,
});

/* =========================
   MODEL
========================= */

const Order =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);

export default Order;

