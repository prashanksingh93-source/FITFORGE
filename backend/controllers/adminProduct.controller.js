import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";

const createSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeColors = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return value
        .split(",")
        .map((name) => ({
          name: name.trim(),
          hex: "#000000",
        }))
        .filter((color) => color.name);
    }
  }

  return [];
};

// GET ALL PRODUCTS FOR ADMIN
export const getAllAdminProducts = async (req, res) => {
  try {
    const {
      search,
      collection,
      category,
      isActive,
      stockStatus,
    } = req.query;

    const filter = {};

    if (collection && collection !== "All") {
      filter.collection = collection;
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (isActive !== undefined && isActive !== "") {
      filter.isActive = isActive === "true";
    }

    if (search?.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          sku: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (stockStatus === "out") {
      filter.stock = 0;
    }

    if (stockStatus === "low") {
      filter.$expr = {
        $and: [
          { $gt: ["$stock", 0] },
          { $lte: ["$stock", "$lowStockThreshold"] },
        ],
      };
    }

    if (stockStatus === "in") {
      filter.$expr = {
        $gt: ["$stock", "$lowStockThreshold"],
      };
    }

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get admin products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch admin products",
    });
  }
};

// GET SINGLE PRODUCT
export const getAdminProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get admin product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      sku,
      category,
      collection,
      gender,
      price,
      salePrice,
      stock,
      lowStockThreshold,
      material,
      fit,
      careInstructions,
      isActive,
    } = req.body;

    if (
      !name ||
      !description ||
      !category ||
      !collection ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, description, category, collection and price are required",
      });
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    const slug = createSlug(name);

    const existingSlug = await Product.findOne({ slug });

    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: "A product with this name already exists",
      });
    }

    if (sku?.trim()) {
      const existingSku = await Product.findOne({
        sku: sku.trim(),
      });

      if (existingSku) {
        return res.status(409).json({
          success: false,
          message: "SKU already exists",
        });
      }
    }

    const numericPrice = Number(price);
    const numericSalePrice =
      salePrice === "" ||
      salePrice === undefined ||
      salePrice === null
        ? null
        : Number(salePrice);

    if (numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    if (
      numericSalePrice !== null &&
      (numericSalePrice < 0 || numericSalePrice > numericPrice)
    ) {
      return res.status(400).json({
        success: false,
        message: "Sale price must be between ₹0 and the regular price",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      slug,
      description: description.trim(),
      sku: sku?.trim() || undefined,

      category,

      collection,
      gender: gender || "Unisex",

      price: numericPrice,
      salePrice: numericSalePrice,

      images: normalizeArray(req.body.images),
      sizes: normalizeArray(req.body.sizes),
      colors: normalizeColors(req.body.colors),

      stock: Number(stock) || 0,
      lowStockThreshold:
        Number(lowStockThreshold) >= 0
          ? Number(lowStockThreshold)
          : 5,

      material: material || "",
      fit: fit || "",
      careInstructions: careInstructions || "",

      badges: normalizeArray(req.body.badges),

      isActive:
        isActive === undefined
          ? true
          : isActive === true ||
            isActive === "true",
    });

    const populatedProduct = await Product.findById(
      product._id
    ).populate("category", "name slug");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      description,
      sku,
      category,
      collection,
      gender,
      price,
      salePrice,
      stock,
      lowStockThreshold,
      material,
      fit,
      careInstructions,
      isActive,
    } = req.body;

    if (category) {
      const categoryExists = await Category.findById(category);

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }

      product.category = category;
    }

    if (name !== undefined) {
      const newName = name.trim();
      const newSlug = createSlug(newName);

      const existingSlug = await Product.findOne({
        slug: newSlug,
        _id: { $ne: product._id },
      });

      if (existingSlug) {
        return res.status(409).json({
          success: false,
          message: "A product with this name already exists",
        });
      }

      product.name = newName;
      product.slug = newSlug;
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    if (sku !== undefined) {
      const cleanSku = sku.trim();

      if (cleanSku) {
        const existingSku = await Product.findOne({
          sku: cleanSku,
          _id: { $ne: product._id },
        });

        if (existingSku) {
          return res.status(409).json({
            success: false,
            message: "SKU already exists",
          });
        }

        product.sku = cleanSku;
      } else {
        product.sku = undefined;
      }
    }

    if (collection !== undefined) {
      product.collection = collection;
    }

    if (gender !== undefined) {
      product.gender = gender;
    }

    if (price !== undefined && price !== "") {
      product.price = Number(price);
    }

    if (
      salePrice !== undefined
    ) {
      product.salePrice =
        salePrice === "" || salePrice === null
          ? null
          : Number(salePrice);
    }

    if (
      product.salePrice !== null &&
      product.salePrice > product.price
    ) {
      return res.status(400).json({
        success: false,
        message: "Sale price cannot be higher than regular price",
      });
    }

    if (stock !== undefined && stock !== "") {
      product.stock = Math.max(0, Number(stock));
    }

    if (
      lowStockThreshold !== undefined &&
      lowStockThreshold !== ""
    ) {
      product.lowStockThreshold = Math.max(
        0,
        Number(lowStockThreshold)
      );
    }

    if (req.body.images !== undefined) {
      product.images = normalizeArray(req.body.images);
    }

    if (req.body.sizes !== undefined) {
      product.sizes = normalizeArray(req.body.sizes);
    }

    if (req.body.colors !== undefined) {
      product.colors = normalizeColors(req.body.colors);
    }

    if (req.body.badges !== undefined) {
      product.badges = normalizeArray(req.body.badges);
    }

    if (material !== undefined) {
      product.material = material;
    }

    if (fit !== undefined) {
      product.fit = fit;
    }

    if (careInstructions !== undefined) {
      product.careInstructions = careInstructions;
    }

    if (isActive !== undefined) {
      product.isActive =
        isActive === true || isActive === "true";
    }

    await product.save();

    const updatedProduct = await Product.findById(
      product._id
    ).populate("category", "name slug");

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

// TOGGLE PRODUCT
export const toggleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = !product.isActive;

    await product.save();

    res.status(200).json({
      success: true,
      message: product.isActive
        ? "Product activated successfully"
        : "Product deactivated successfully",
      product,
    });
  } catch (error) {
    console.error("Toggle product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update product status",
    });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const orderUsingProduct = await Order.exists({
      "items.product": product._id,
    });

    if (orderUsingProduct) {
      return res.status(400).json({
        success: false,
        message:
          "This product is already used in an order. Deactivate it instead of deleting it.",
      });
    }

    await Product.findByIdAndDelete(product._id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};