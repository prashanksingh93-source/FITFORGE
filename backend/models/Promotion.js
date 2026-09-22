import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    buttonText: {
      type: String,
      default: "Shop Now",
      trim: true,
    },

    buttonLink: {
      type: String,
      default: "/shop",
      trim: true,
    },

    type: {
      type: String,
      enum: ["Hero", "Banner", "Popup"],
      default: "Banner",
    },

    collection: {
      type: String,
      enum: ["Performance", "Luxury", "All"],
      default: "All",
    },

    discountText: {
      type: String,
      default: "",
      trim: true,
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

    priority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Promotion =
  mongoose.models.Promotion ||
  mongoose.model("Promotion", promotionSchema);

export default Promotion;