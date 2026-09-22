import Product from "../models/Product.js";
import Category from "../models/Category.js";

const makeSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const getAllAdminProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Admin products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export const getAdminProductById = async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    ).populate("category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Admin product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      salePrice,
      category,
      gender,
      collection,
      sizes,
      colors,
      stock,
      lowStockThreshold,
      sku,
      material,
      fit,
      careInstructions,
      badges,
      images,
      isActive,
    } = req.body;

    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      !collection
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, description, price, category and collection are required",
      });
    }

    const categoryExists =
      await Category.findById(category);

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    const baseSlug = makeSlug(name);

    let slug = baseSlug;
    let counter = 1;

    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price: Number(price),
      salePrice:
        salePrice === "" ||
        salePrice === undefined
          ? null
          : Number(salePrice),
      category,
      gender: gender || "Unisex",
      collection,
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      stock: Number(stock) || 0,
      lowStockThreshold:
        Number(lowStockThreshold) || 5,
      sku: sku || undefined,
      material: material || "",
      fit: fit || "",
      careInstructions:
        careInstructions || "",
      badges: Array.isArray(badges)
        ? badges
        : [],
      images: Array.isArray(images)
        ? images
        : [],
      isActive:
        isActive !== undefined
          ? Boolean(isActive)
          : true,
    });

    const populatedProduct =
      await Product.findById(product._id)
        .populate("category");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product =
      await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      description,
      price,
      salePrice,
      category,
      gender,
      collection,
      sizes,
      colors,
      stock,
      lowStockThreshold,
      sku,
      material,
      fit,
      careInstructions,
      badges,
      images,
      isActive,
    } = req.body;

    if (category) {
      const categoryExists =
        await Category.findById(category);

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }
    }

    if (name && name !== product.name) {
      const baseSlug = makeSlug(name);

      let slug = baseSlug;
      let counter = 1;

      while (
        await Product.findOne({
          slug,
          _id: { $ne: product._id },
        })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      product.slug = slug;
      product.name = name;
    }

    if (description !== undefined)
      product.description = description;

    if (price !== undefined)
      product.price = Number(price);

    if (salePrice !== undefined) {
      product.salePrice =
        salePrice === "" ||
        salePrice === null
          ? null
          : Number(salePrice);
    }

    if (category)
      product.category = category;

    if (gender)
      product.gender = gender;

    if (collection)
      product.collection = collection;

    if (Array.isArray(sizes))
      product.sizes = sizes;

    if (Array.isArray(colors))
      product.colors = colors;

    if (stock !== undefined)
      product.stock = Number(stock);

    if (lowStockThreshold !== undefined)
      product.lowStockThreshold =
        Number(lowStockThreshold);

    if (sku !== undefined)
      product.sku = sku || undefined;

    if (material !== undefined)
      product.material = material;

    if (fit !== undefined)
      product.fit = fit;

    if (careInstructions !== undefined)
      product.careInstructions =
        careInstructions;

    if (Array.isArray(badges))
      product.badges = badges;

    if (Array.isArray(images))
      product.images = images;

    if (isActive !== undefined)
      product.isActive = Boolean(isActive);

    await product.save();

    const updatedProduct =
      await Product.findById(product._id)
        .populate("category");

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product =
      await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = false;

    await product.save();

    res.json({
      success: true,
      message: "Product removed successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove product",
    });
  }
};

export const getAdminCategories = async (
  req,
  res
) => {
  try {
    const categories =
      await Category.find({
        isActive: true,
      }).sort({ name: 1 });

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error(
      "Admin categories error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};