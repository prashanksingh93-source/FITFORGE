import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

dotenv.config();

const categories = [
  {
    name: "T-Shirts",
    slug: "t-shirts",
    description: "Performance and luxury gym t-shirts",
  },
  {
    name: "Leggings",
    slug: "leggings",
    description: "Premium training leggings",
  },
  {
    name: "Hoodies",
    slug: "hoodies",
    description: "Premium gym hoodies",
  },
  {
    name: "Tank Tops",
    slug: "tank-tops",
    description: "Training tank tops",
  },
  {
    name: "Joggers",
    slug: "joggers",
    description: "Performance and luxury joggers",
  },
  {
    name: "Shorts",
    slug: "shorts",
    description: "Training and running shorts",
  },
  {
    name: "Sports Bras",
    slug: "sports-bras",
    description: "Performance sports bras",
  },
];

const products = [
  {
    name: "AeroKnit Supreme Tee",
    slug: "aeroknit-supreme-tee",
    description:
      "Premium breathable gym t-shirt engineered for intense training sessions.",
    price: 9999,
    collection: "Luxury",
    gender: "Men",
    categorySlug: "t-shirts",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#ffffff" },
    ],
    stock: 40,
    lowStockThreshold: 5,
    material: "Premium AeroKnit Fabric",
    fit: "Athletic Fit",
    careInstructions: "Machine wash cold. Do not bleach.",
    badges: ["Iconic", "Featured"],
    isActive: true,
  },

  {
    name: "Onyx Elite Compression Leggings",
    slug: "onyx-elite-compression-leggings",
    description:
      "High-performance compression leggings with a premium sculpted fit.",
    price: 11999,
    collection: "Luxury",
    gender: "Women",
    categorySlug: "leggings",
    images: [
      "https://images.unsplash.com/photo-1506629905607-d9f8d5b2b8f4",
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Black", hex: "#000000" },
    ],
    stock: 25,
    lowStockThreshold: 5,
    material: "Premium Compression Fabric",
    fit: "Compression Fit",
    careInstructions: "Wash inside out with similar colors.",
    badges: ["Iconic", "Featured"],
    isActive: true,
  },

  {
    name: "The Sovereign Hoodie",
    slug: "the-sovereign-hoodie",
    description:
      "Heavyweight luxury hoodie designed for training and everyday movement.",
    price: 14999,
    collection: "Luxury",
    gender: "Men",
    categorySlug: "hoodies",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Grey", hex: "#808080" },
    ],
    stock: 20,
    lowStockThreshold: 5,
    material: "Premium Cotton Blend",
    fit: "Relaxed Fit",
    careInstructions: "Machine wash cold.",
    badges: ["Limited Edition"],
    isActive: true,
  },

  {
    name: "Silk-Blend Warmup Jacket",
    slug: "silk-blend-warmup-jacket",
    description:
      "Elegant lightweight warmup jacket combining luxury and athletic performance.",
    price: 17999,
    collection: "Luxury",
    gender: "Women",
    categorySlug: "hoodies",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5",
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Cream", hex: "#f5f5dc" },
    ],
    stock: 15,
    lowStockThreshold: 5,
    material: "Silk Blend",
    fit: "Regular Fit",
    careInstructions: "Gentle wash recommended.",
    badges: ["New Arrival"],
    isActive: true,
  },

  {
    name: "Obsidian Seamless Tank",
    slug: "obsidian-seamless-tank",
    description:
      "Seamless training tank with lightweight stretch construction.",
    price: 6999,
    collection: "Luxury",
    gender: "Women",
    categorySlug: "tank-tops",
    images: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1",
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Black", hex: "#000000" },
    ],
    stock: 30,
    lowStockThreshold: 5,
    material: "Seamless Performance Knit",
    fit: "Slim Fit",
    careInstructions: "Wash cold.",
    badges: ["Featured"],
    isActive: true,
  },

  {
    name: "Titanium Woven Joggers",
    slug: "titanium-woven-joggers",
    description:
      "Premium woven joggers with lightweight stretch and tapered construction.",
    price: 12999,
    collection: "Luxury",
    gender: "Men",
    categorySlug: "joggers",
    images: [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Grey", hex: "#777777" },
    ],
    stock: 22,
    lowStockThreshold: 5,
    material: "Premium Woven Fabric",
    fit: "Tapered Fit",
    careInstructions: "Machine wash cold.",
    badges: [],
    isActive: true,
  },

  {
    name: "Core Performance Tee",
    slug: "core-performance-tee",
    description:
      "Everyday performance t-shirt designed for comfortable training.",
    price: 2499,
    collection: "Performance",
    gender: "Men",
    categorySlug: "t-shirts",
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#ffffff" },
    ],
    stock: 100,
    lowStockThreshold: 10,
    material: "Moisture-Wicking Polyester",
    fit: "Athletic Fit",
    careInstructions: "Machine wash cold.",
    badges: ["Iconic", "Best Seller"],
    isActive: true,
  },

  {
    name: "Velocity Running Shorts",
    slug: "velocity-running-shorts",
    description:
      "Lightweight running shorts built for speed and unrestricted movement.",
    price: 2999,
    collection: "Performance",
    gender: "Men",
    categorySlug: "shorts",
    images: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Navy", hex: "#111827" },
    ],
    stock: 75,
    lowStockThreshold: 10,
    material: "Lightweight Performance Fabric",
    fit: "Regular Fit",
    careInstructions: "Machine wash cold.",
    badges: ["Best Seller"],
    isActive: true,
  },

  {
    name: "FlexTech Sports Bra",
    slug: "flextech-sports-bra",
    description:
      "Supportive sports bra engineered for high-intensity workouts.",
    price: 2799,
    collection: "Performance",
    gender: "Women",
    categorySlug: "sports-bras",
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#ffffff" },
    ],
    stock: 60,
    lowStockThreshold: 10,
    material: "Stretch Performance Fabric",
    fit: "Supportive Fit",
    careInstructions: "Wash cold.",
    badges: ["Iconic", "Best Seller"],
    isActive: true,
  },

  {
    name: "Essential Training Joggers",
    slug: "essential-training-joggers",
    description:
      "Versatile training joggers designed for daily workouts.",
    price: 3999,
    collection: "Performance",
    gender: "Men",
    categorySlug: "joggers",
    images: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Grey", hex: "#777777" },
    ],
    stock: 80,
    lowStockThreshold: 10,
    material: "Stretch Cotton Blend",
    fit: "Tapered Fit",
    careInstructions: "Machine wash cold.",
    badges: ["Best Seller"],
    isActive: true,
  },

  {
    name: "Agile Stride Leggings",
    slug: "agile-stride-leggings",
    description:
      "Flexible training leggings with a supportive high-rise construction.",
    price: 3499,
    collection: "Performance",
    gender: "Women",
    categorySlug: "leggings",
    images: [
      "https://images.unsplash.com/photo-1506629905607-d9f8d5b2b8f4",
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Grey", hex: "#777777" },
    ],
    stock: 65,
    lowStockThreshold: 10,
    material: "Four-Way Stretch Fabric",
    fit: "High-Rise Fit",
    careInstructions: "Wash cold.",
    badges: ["New Arrival"],
    isActive: true,
  },

  {
    name: "Momentum Zip-Up Hoodie",
    slug: "momentum-zip-up-hoodie",
    description:
      "Lightweight performance hoodie for warmups, training and recovery.",
    price: 4499,
    collection: "Performance",
    gender: "Men",
    categorySlug: "hoodies",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Grey", hex: "#777777" },
    ],
    stock: 50,
    lowStockThreshold: 10,
    material: "Performance Fleece",
    fit: "Regular Fit",
    careInstructions: "Machine wash cold.",
    badges: ["New Arrival"],
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("Clearing existing categories...");
    await Category.deleteMany({});

    console.log("Clearing existing products...");
    await Product.deleteMany({});

    const createdCategories = await Category.insertMany(categories);

    const categoryMap = {};

    createdCategories.forEach((category) => {
      categoryMap[category.slug] = category._id;
    });

    const productsWithCategories = products.map((product) => {
      const { categorySlug, ...productData } = product;

      return {
        ...productData,
        category: categoryMap[categorySlug],
      };
    });

    await Product.insertMany(productsWithCategories);

    console.log("=================================");
    console.log("FITFORGE database seeded successfully");
    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Products: ${productsWithCategories.length}`);
    console.log("=================================");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedDatabase();