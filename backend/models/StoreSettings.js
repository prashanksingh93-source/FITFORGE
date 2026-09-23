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

    /* =========================
       SHIPPING SETTINGS
    ========================= */

    shippingFee: {
      type: Number,
      default: 100,
      min: 0,
    },

    freeShippingThreshold: {
      type: Number,
      default: 999,
      min: 0,
    },

    /* =========================
       TAX / GST
    ========================= */

    gst: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    /* =========================
       COD SETTINGS
    ========================= */

    codEnabled: {
      type: Boolean,
      default: true,
    },

    codAdvanceEnabled: {
      type: Boolean,
      default: false,
    },

    /*
      Percentage of final order amount
      that customer must pay online
      before COD order is confirmed.
    */

    codAdvancePercentage: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },

    /*
      Minimum amount customer must
      pay as COD advance.
    */

    codMinimumAdvance: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
      Optional maximum order value
      for COD.

      Example:
      5000 means COD is available
      only for orders <= ₹5000.

      null = no maximum.
    */

    codMaximumOrderValue: {
      type: Number,
      default: null,
      min: 0,
    },

    /* =========================
       SOCIAL LINKS
    ========================= */

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

    /* =========================
       FOOTER
    ========================= */

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

