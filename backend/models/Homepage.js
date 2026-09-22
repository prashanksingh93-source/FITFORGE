import mongoose from "mongoose";

const homepageSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      default: "THE MOST ICONIC GYM WEAR",
      trim: true,
    },

    heroSubtitle: {
      type: String,
      default: "BUILT FOR PERFORMANCE. DESIGNED FOR THE ICONIC.",
      trim: true,
    },

    heroDescription: {
      type: String,
      default:
        "Premium gym wear engineered for movement, performance and everyday confidence.",
      trim: true,
    },

    heroImage: {
      type: String,
      default: "",
      trim: true,
    },

    heroButtonText: {
      type: String,
      default: "SHOP THE SIGNATURE COLLECTION",
      trim: true,
    },

    heroButtonLink: {
      type: String,
      default: "/shop",
      trim: true,
    },

    announcementEnabled: {
      type: Boolean,
      default: true,
    },

    announcementText: {
      type: String,
      default: "THE MOST ICONIC GYM WEAR",
      trim: true,
    },

    performanceTitle: {
      type: String,
      default: "PERFORMANCE",
      trim: true,
    },

    performanceSubtitle: {
      type: String,
      default: "ENGINEERED TO PERFORM",
      trim: true,
    },

    luxuryTitle: {
      type: String,
      default: "LUXURY",
      trim: true,
    },

    luxurySubtitle: {
      type: String,
      default: "ELEVATED TRAINING",
      trim: true,
    },

    featuredTitle: {
      type: String,
      default: "ICONIC ESSENTIALS",
      trim: true,
    },

    featuredSubtitle: {
      type: String,
      default: "THE PIECES THAT DEFINE FITFORGE",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Homepage =
  mongoose.models.Homepage ||
  mongoose.model("Homepage", homepageSchema);

export default Homepage;