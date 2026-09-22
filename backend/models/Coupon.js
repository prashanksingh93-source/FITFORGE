import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    discountType: {
      type: String,
      enum: ["Percentage", "Fixed"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumDiscount: {
      type: Number,
      default: null,
      min: 0,
    },

    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    collection: {
      type: String,
      enum: ["All", "Performance", "Luxury"],
      default: "All",
    },
  },
  {
    timestamps: true,
  }
);

const Coupon =
  mongoose.models.Coupon ||
  mongoose.model("Coupon", couponSchema);

export default Coupon;