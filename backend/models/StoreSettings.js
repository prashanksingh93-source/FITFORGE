
import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "FITFORGE",
      trim: true,
    },

    logo: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
    },

    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    freeShippingThreshold: {
      type: Number,
      default: 999,
      min: 0,
    },

    gst: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    socialLinks: {
      instagram: {
        type: String,
        default: "",
        trim: true,
      },

      facebook: {
        type: String,
        default: "",
        trim: true,
      },

      youtube: {
        type: String,
        default: "",
        trim: true,
      },

      twitter: {
        type: String,
        default: "",
        trim: true,
      },
    },

    footerText: {
      type: String,
      default: "© FITFORGE. All rights reserved.",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const StoreSettings =
  mongoose.models.StoreSettings ||
  mongoose.model("StoreSettings", storeSettingsSchema);

export default StoreSettings;

