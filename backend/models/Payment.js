import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | ORDER
    |--------------------------------------------------------------------------
    */

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | AMOUNT
    |--------------------------------------------------------------------------
    */

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | CURRENCY
    |--------------------------------------------------------------------------
    */

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT METHOD
    |--------------------------------------------------------------------------
    */

    paymentMethod: {
      type: String,
      enum: ["Razorpay", "COD"],
      default: "Razorpay",
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT TYPE
    |--------------------------------------------------------------------------
    |
    | FULL_PAYMENT
    | COD_ADVANCE
    | COD_REMAINING
    |
    */

    paymentType: {
      type: String,
      enum: [
        "FULL_PAYMENT",
        "COD_ADVANCE",
        "COD_REMAINING",
      ],
      default: "FULL_PAYMENT",
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "created",
        "authorized",
        "captured",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      default: "created",
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | RAZORPAY ORDER ID
    |--------------------------------------------------------------------------
    |
    | Index is defined below using paymentSchema.index()
    | to avoid duplicate index warnings.
    |
    */

    razorpayOrderId: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | RAZORPAY PAYMENT ID
    |--------------------------------------------------------------------------
    |
    | Index is defined below using paymentSchema.index()
    | to avoid duplicate index warnings.
    |
    */

    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | RAZORPAY SIGNATURE
    |--------------------------------------------------------------------------
    */

    razorpaySignature: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | FAILURE REASON
    |--------------------------------------------------------------------------
    */

    failureReason: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | REFUND
    |--------------------------------------------------------------------------
    */

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | METADATA
    |--------------------------------------------------------------------------
    */

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
|
| These are intentionally defined here instead of also using
| index: true on razorpayOrderId / razorpayPaymentId.
|
*/

paymentSchema.index({
  order: 1,
  createdAt: -1,
});

paymentSchema.index({
  razorpayOrderId: 1,
});

paymentSchema.index({
  razorpayPaymentId: 1,
});

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const Payment =
  mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);

export default Payment;

