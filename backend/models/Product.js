import mongoose from "mongoose";

const colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    hex: {
      type: String,
      default: "#000000",
    },
  },
  {
    _id: false,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    salePrice: {
      type: Number,
      default: null,
      min: 0,
    },

    images: [
      {
        type: String,
      },
    ],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    gender: {
      type: String,
      enum: [
        "Men",
        "Women",
        "Unisex",
      ],
      default: "Unisex",
    },

    collection: {
      type: String,
      enum: [
        "Performance",
        "Luxury",
      ],
      required: true,
    },

    sizes: [
      {
        type: String,
      },
    ],

    colors: [colorSchema],

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },

    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    material: {
      type: String,
      default: "",
    },

    fit: {
      type: String,
      default: "",
    },

    careInstructions: {
      type: String,
      default: "",
    },

    badges: [
      {
        type: String,
        enum: [
          "Iconic",
          "Best Seller",
          "New Arrival",
          "Featured",
          "Limited Edition",
        ],
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product ||
  mongoose.model(
    "Product",
    productSchema
  );

export default Product;