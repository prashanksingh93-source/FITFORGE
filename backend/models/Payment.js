import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ["Razorpay"],
      default: "Razorpay",
    },

    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
      index: true,
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "created",
        "authorized",
        "captured",
        "failed",
        "refunded",
      ],
      default: "created",
      index: true,
    },

    method: {
      type: String,
      default: "",
    },

    failureReason: {
      type: String,
      default: "",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Payment =
  mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);

export default Payment;

