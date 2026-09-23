import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

/**
 * Create URL-friendly slug
 */
const createSlug = (name) => {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

/**
 * Convert values into array.
 *
 * Supports:
 * "S,M,L"
 *
 * or:
 *
 * ["S", "M", "L"]
 */
const normalizeArray = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter(Boolean);
      }
    } catch {
      // Continue with comma-separated string
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

/**
 * Get hex code for common colors.
 */
const getColorHex = (colorName) => {
  const colors = {
    black: "#000000",
    white: "#FFFFFF",
    navy: "#000080",
    blue: "#0000FF",
    red: "#FF0000",
    green: "#008000",
    yellow: "#FFFF00",
    orange: "#FFA500",
    purple: "#800080",
    pink: "#FFC0CB",
    grey: "#808080",
    gray: "#808080",
    brown: "#A52A2A",
    beige: "#F5F5DC",
    cream: "#FFFDD0",
    maroon: "#800000",
    olive: "#808000",
    teal: "#008080",
    cyan: "#00FFFF",
    silver: "#C0C0C0",
    gold: "#FFD700",
  };

  return (
    colors[
      String(colorName)
        .trim()
        .toLowerCase()
    ] || "#000000"
  );
};

/**
 * Convert colors into the format expected by
 * the Product Mongoose schema.
 *
 * Frontend can send:
 *
 * ["Navy", "Black"]
 *
 * OR:
 *
 * [
 *   { name: "Navy", hex: "#000080" }
 * ]
 */
const normalizeColors = (value) => {
  if (!value) {
    return [];
  }

  let colors = value;

  /* -----------------------------------------
     JSON string
  ----------------------------------------- */

  if (typeof colors === "string") {
    try {
      colors = JSON.parse(colors);
    } catch {
      colors = colors
        .split(",")
        .map((color) => color.trim())
        .filter(Boolean);
    }
  }

  if (!Array.isArray(colors)) {
    return [];
  }

  return colors
    .map((color) => {
      /* Already object */

      if (
        typeof color === "object" &&
        color !== null
      ) {
        const name = String(
          color.name || ""
        ).trim();

        if (!name) {
          return null;
        }

        return {
          name,
          hex:
            color.hex ||
            getColorHex(name),
        };
      }

      /* String such as "Navy" */

      const name = String(color).trim();

      if (!name) {
        return null;
      }

      return {
        name,
        hex: getColorHex(name),
      };
    })
    .filter(Boolean);
};

/**
 * Convert boolean values safely.
 */
const toBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return String(value).toLowerCase() === "true";
};

/**
 * Escape user input before using it in regex.
 */
const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

/**
 * Resolve Category.
 *
 * Supports:
 *
 * category = ObjectId
 *
 * OR
 *
 * category = "T-Shirts"
 */
const resolveCategory = async (categoryValue) => {
  if (!categoryValue) {
    return null;
  }

  const categoryString =
    String(categoryValue).trim();

  if (!categoryString) {
    return null;
  }

  /* -----------------------------------------
     CATEGORY OBJECT ID
  ----------------------------------------- */

  if (
    mongoose.Types.ObjectId.isValid(
      categoryString
    )
  ) {
    const category =
      await Category.findById(
        categoryString
      );

    if (category) {
      return category;
    }
  }

  /* -----------------------------------------
     CATEGORY NAME
  ----------------------------------------- */

  const escapedName =
    escapeRegex(categoryString);

  const category =
    await Category.findOne({
      name: {
        $regex: `^${escapedName}$`,
        $options: "i",
      },
    });

  return category;
};

/* =========================================================
   GET ALL ADMIN PRODUCTS
========================================================= */

export const getAllAdminProducts = async (
  req,
  res
) => {
  try {
    const {
      search,
      collection,
      category,
      isActive,
      stockStatus,
      page = 1,
      limit = 20,
      sort = "newest",
    } = req.query;

    const filter = {};

    /* -----------------------------------------
       SEARCH
    ----------------------------------------- */

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

    /* -----------------------------------------
       COLLECTION
    ----------------------------------------- */

    if (
      collection &&
      collection !== "All"
    ) {
      filter.collection = collection;
    }

    /* -----------------------------------------
       CATEGORY
    ----------------------------------------- */

    if (
      category &&
      category !== "All"
    ) {
      if (
        mongoose.Types.ObjectId.isValid(
          category
        )
      ) {
        filter.category = category;
      } else {
        const categoryDoc =
          await resolveCategory(category);

        if (!categoryDoc) {
          return res.status(200).json({
            success: true,
            count: 0,
            total: 0,
            page: Number(page),
            pages: 0,
            products: [],
          });
        }

        filter.category =
          categoryDoc._id;
      }
    }

    /* -----------------------------------------
       ACTIVE STATUS
    ----------------------------------------- */

    if (
      isActive !== undefined &&
      isActive !== ""
    ) {
      filter.isActive =
        toBoolean(isActive);
    }

    /* -----------------------------------------
       STOCK STATUS
    ----------------------------------------- */

    if (stockStatus === "out") {
      filter.stock = 0;
    }

    if (stockStatus === "low") {
      filter.stock = {
        $gt: 0,
        $lte: 5,
      };
    }

    if (stockStatus === "in") {
      filter.stock = {
        $gt: 5,
      };
    }

    /* -----------------------------------------
       PAGINATION
    ----------------------------------------- */

    const pageNumber =
      Math.max(Number(page) || 1, 1);

    const limitNumber =
      Math.min(
        Math.max(Number(limit) || 20, 1),
        100
      );

    const skip =
      (pageNumber - 1) *
      limitNumber;

    /* -----------------------------------------
       SORT
    ----------------------------------------- */

    let sortOption = {
      createdAt: -1,
    };

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    if (sort === "price-low") {
      sortOption = {
        price: 1,
      };
    }

    if (sort === "price-high") {
      sortOption = {
        price: -1,
      };
    }

    if (sort === "name") {
      sortOption = {
        name: 1,
      };
    }

    /* -----------------------------------------
       QUERY
    ----------------------------------------- */

    const [products, total] =
      await Promise.all([
        Product.find(filter)
          .populate(
            "category",
            "name slug"
          )
          .sort(sortOption)
          .skip(skip)
          .limit(limitNumber),

        Product.countDocuments(filter),
      ]);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNumber,
      pages: Math.ceil(
        total / limitNumber
      ),
      products,
    });
  } catch (error) {
    console.error(
      "Get admin products error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch products",
    });
  }
};

/* =========================================================
   GET SINGLE ADMIN PRODUCT
========================================================= */

export const getAdminProductById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findById(id).populate(
        "category",
        "name slug"
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Get admin product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch product",
    });
  }
};

/* =========================================================
   CREATE PRODUCT
========================================================= */

export const createProduct = async (
  req,
  res
) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      salePrice,
      category,
      gender,
      collection,
      stock,
      sku,
      material,
      fit,
      careInstructions,
      thumbnail,
      lowStockThreshold,
    } = req.body;

    /* -----------------------------------------
       REQUIRED NAME
    ----------------------------------------- */

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Product name is required",
      });
    }

    /* -----------------------------------------
       DESCRIPTION
    ----------------------------------------- */

    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Product description is required",
      });
    }

    /* -----------------------------------------
       CATEGORY
    ----------------------------------------- */

    if (!category) {
      return res.status(400).json({
        success: false,
        message:
          "Product category is required",
      });
    }

    const categoryDoc =
      await resolveCategory(category);

    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message:
          `Category "${category}" was not found`,
      });
    }

    /* -----------------------------------------
       COLLECTION
    ----------------------------------------- */

    if (!collection) {
      return res.status(400).json({
        success: false,
        message:
          "Product collection is required",
      });
    }

    if (
      !["Performance", "Luxury"].includes(
        collection
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Collection must be Performance or Luxury",
      });
    }

    /* -----------------------------------------
       GENDER
    ----------------------------------------- */

    const productGender =
      gender || "Unisex";

    if (
      !["Men", "Women", "Unisex"].includes(
        productGender
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Gender must be Men, Women or Unisex",
      });
    }

    /* -----------------------------------------
       PRICE
    ----------------------------------------- */

    const numericPrice =
      Number(price);

    if (
      !Number.isFinite(
        numericPrice
      ) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid product price is required",
      });
    }

    /* -----------------------------------------
       SALE PRICE
    ----------------------------------------- */

    let numericSalePrice = null;

    if (
      salePrice !== undefined &&
      salePrice !== null &&
      salePrice !== ""
    ) {
      numericSalePrice =
        Number(salePrice);

      if (
        !Number.isFinite(
          numericSalePrice
        ) ||
        numericSalePrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid sale price",
        });
      }

      if (
        numericSalePrice >
        numericPrice
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Sale price cannot be greater than regular price",
        });
      }
    }

    /* -----------------------------------------
       STOCK
    ----------------------------------------- */

    const numericStock =
      stock === undefined ||
      stock === ""
        ? 0
        : Number(stock);

    if (
      !Number.isFinite(
        numericStock
      ) ||
      numericStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid stock value",
      });
    }

    /* -----------------------------------------
       LOW STOCK THRESHOLD
    ----------------------------------------- */

    const numericLowStockThreshold =
      lowStockThreshold ===
        undefined ||
      lowStockThreshold === ""
        ? 5
        : Number(
            lowStockThreshold
          );

    if (
      !Number.isFinite(
        numericLowStockThreshold
      ) ||
      numericLowStockThreshold < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid low stock threshold",
      });
    }

    /* -----------------------------------------
       SKU
    ----------------------------------------- */

    const cleanSku =
      sku?.trim() || undefined;

    if (cleanSku) {
      const existingSku =
        await Product.findOne({
          sku: cleanSku,
        });

      if (existingSku) {
        return res.status(409).json({
          success: false,
          message:
            "SKU already exists",
        });
      }
    }

    /* -----------------------------------------
       SLUG
    ----------------------------------------- */

    let finalSlug =
      slug?.trim() ||
      createSlug(name);

    if (!finalSlug) {
      return res.status(400).json({
        success: false,
        message:
          "Unable to create product slug",
      });
    }

    const existingSlug =
      await Product.findOne({
        slug: finalSlug,
      });

    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    /* -----------------------------------------
       ARRAYS
    ----------------------------------------- */

    const sizes =
      normalizeArray(
        req.body.sizes
      );

    const images =
      normalizeArray(
        req.body.images
      );

    const colors =
      normalizeColors(
        req.body.colors
      );

    const badges =
      normalizeArray(
        req.body.badges
      );

    /* -----------------------------------------
       THUMBNAIL
    ----------------------------------------- */

    let finalThumbnail =
      thumbnail?.trim() ||
      "";

    if (
      !finalThumbnail &&
      images.length > 0
    ) {
      finalThumbnail =
        images[0];
    }

    /* -----------------------------------------
       CREATE PRODUCT
    ----------------------------------------- */

    const product =
      await Product.create({
        name: name.trim(),

        slug: finalSlug,

        description:
          description.trim(),

        price:
          numericPrice,

        salePrice:
          numericSalePrice,

        category:
          categoryDoc._id,

        gender:
          productGender,

        collection,

        sizes,

        colors,

        stock:
          numericStock,

        sku:
          cleanSku,

        material:
          material?.trim() || "",

        fit:
          fit?.trim() || "",

        careInstructions:
          careInstructions?.trim() ||
          "",

        images,

        thumbnail:
          finalThumbnail,

        badges,

        lowStockThreshold:
          numericLowStockThreshold,

        isIconic:
          toBoolean(
            req.body.isIconic
          ),

        isBestSeller:
          toBoolean(
            req.body.isBestSeller
          ),

        isNewArrival:
          toBoolean(
            req.body.isNewArrival
          ),

        isFeatured:
          toBoolean(
            req.body.isFeatured
          ),

        isLimitedEdition:
          toBoolean(
            req.body.isLimitedEdition
          ),

        isActive:
          toBoolean(
            req.body.isActive,
            true
          ),
      });

    /* -----------------------------------------
       POPULATE CATEGORY
    ----------------------------------------- */

    const populatedProduct =
      await Product.findById(
        product._id
      ).populate(
        "category",
        "name slug"
      );

    return res.status(201).json({
      success: true,
      message:
        "Product created successfully",
      product:
        populatedProduct,
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error
    );

    /* MONGOOSE VALIDATION ERROR */

    if (
      error.name ===
      "ValidationError"
    ) {
      const messages =
        Object.values(
          error.errors
        ).map(
          (err) => err.message
        );

      return res.status(400).json({
        success: false,
        message:
          messages.join(", "),
      });
    }

    /* DUPLICATE KEY */

    if (error.code === 11000) {
      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];

      return res.status(409).json({
        success: false,
        message:
          `${duplicateField || "Value"} already exists`,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create product",
    });
  }
};

/* =========================================================
   UPDATE PRODUCT
========================================================= */

export const updateProduct = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    const {
      name,
      slug,
      description,
      price,
      salePrice,
      category,
      gender,
      collection,
      stock,
      sku,
      material,
      fit,
      careInstructions,
      thumbnail,
      lowStockThreshold,
    } = req.body;

    /* -----------------------------------------
       CATEGORY
    ----------------------------------------- */

    if (
      category !== undefined &&
      category !== ""
    ) {
      const categoryDoc =
        await resolveCategory(
          category
        );

      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message:
            `Category "${category}" was not found`,
        });
      }

      product.category =
        categoryDoc._id;
    }

    /* -----------------------------------------
       NAME
    ----------------------------------------- */

    if (name !== undefined) {
      const cleanName =
        String(name).trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message:
            "Product name cannot be empty",
        });
      }

      product.name =
        cleanName;

      const newSlug =
        slug?.trim() ||
        createSlug(cleanName);

      const existingSlug =
        await Product.findOne({
          slug: newSlug,
          _id: {
            $ne: product._id,
          },
        });

      if (existingSlug) {
        product.slug =
          `${newSlug}-${Date.now()}`;
      } else {
        product.slug =
          newSlug;
      }
    }

    /* -----------------------------------------
       SLUG
    ----------------------------------------- */

    if (
      slug !== undefined &&
      slug.trim()
    ) {
      const cleanSlug =
        slug.trim();

      const existingSlug =
        await Product.findOne({
          slug: cleanSlug,
          _id: {
            $ne: product._id,
          },
        });

      if (existingSlug) {
        return res.status(409).json({
          success: false,
          message:
            "Slug already exists",
        });
      }

      product.slug =
        cleanSlug;
    }

    /* -----------------------------------------
       DESCRIPTION
    ----------------------------------------- */

    if (
      description !== undefined
    ) {
      const cleanDescription =
        String(
          description
        ).trim();

      if (!cleanDescription) {
        return res.status(400).json({
          success: false,
          message:
            "Description cannot be empty",
        });
      }

      product.description =
        cleanDescription;
    }

    /* -----------------------------------------
       PRICE
    ----------------------------------------- */

    if (
      price !== undefined &&
      price !== ""
    ) {
      const numericPrice =
        Number(price);

      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid price",
        });
      }

      product.price =
        numericPrice;
    }

    /* -----------------------------------------
       SALE PRICE
    ----------------------------------------- */

    if (
      salePrice !== undefined
    ) {
      if (
        salePrice === "" ||
        salePrice === null
      ) {
        product.salePrice =
          null;
      } else {
        const numericSalePrice =
          Number(salePrice);

        if (
          !Number.isFinite(
            numericSalePrice
          ) ||
          numericSalePrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid sale price",
          });
        }

        product.salePrice =
          numericSalePrice;
      }
    }

    if (
      product.salePrice !==
        null &&
      product.salePrice !==
        undefined &&
      product.salePrice >
        product.price
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Sale price cannot be greater than regular price",
      });
    }

    /* -----------------------------------------
       COLLECTION
    ----------------------------------------- */

    if (
      collection !== undefined
    ) {
      if (
        ![
          "Performance",
          "Luxury",
        ].includes(collection)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid collection",
        });
      }

      product.collection =
        collection;
    }

    /* -----------------------------------------
       GENDER
    ----------------------------------------- */

    if (
      gender !== undefined
    ) {
      if (
        ![
          "Men",
          "Women",
          "Unisex",
        ].includes(gender)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid gender",
        });
      }

      product.gender =
        gender;
    }

    /* -----------------------------------------
       STOCK
    ----------------------------------------- */

    if (
      stock !== undefined &&
      stock !== ""
    ) {
      const numericStock =
        Number(stock);

      if (
        !Number.isFinite(
          numericStock
        ) ||
        numericStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid stock",
        });
      }

      product.stock =
        numericStock;
    }

    /* -----------------------------------------
       LOW STOCK THRESHOLD
    ----------------------------------------- */

    if (
      lowStockThreshold !==
        undefined &&
      lowStockThreshold !== ""
    ) {
      const threshold =
        Number(
          lowStockThreshold
        );

      if (
        !Number.isFinite(
          threshold
        ) ||
        threshold < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid low stock threshold",
        });
      }

      product.lowStockThreshold =
        threshold;
    }

    /* -----------------------------------------
       SKU
    ----------------------------------------- */

    if (
      sku !== undefined
    ) {
      const cleanSku =
        String(sku).trim();

      if (cleanSku) {
        const existingSku =
          await Product.findOne({
            sku: cleanSku,
            _id: {
              $ne: product._id,
            },
          });

        if (existingSku) {
          return res.status(409).json({
            success: false,
            message:
              "SKU already exists",
          });
        }

        product.sku =
          cleanSku;
      } else {
        product.sku =
          undefined;
      }
    }

    /* -----------------------------------------
       ARRAYS
    ----------------------------------------- */

    if (
      req.body.sizes !==
      undefined
    ) {
      product.sizes =
        normalizeArray(
          req.body.sizes
        );
    }

    if (
      req.body.colors !==
      undefined
    ) {
      product.colors =
        normalizeColors(
          req.body.colors
        );
    }

    if (
      req.body.images !==
      undefined
    ) {
      product.images =
        normalizeArray(
          req.body.images
        );
    }

    if (
      req.body.badges !==
      undefined
    ) {
      product.badges =
        normalizeArray(
          req.body.badges
        );
    }

    /* -----------------------------------------
       THUMBNAIL
    ----------------------------------------- */

    if (
      thumbnail !== undefined
    ) {
      product.thumbnail =
        String(
          thumbnail
        ).trim();
    }

    if (
      !product.thumbnail &&
      product.images?.length
    ) {
      product.thumbnail =
        product.images[0];
    }

    /* -----------------------------------------
       MATERIAL
    ----------------------------------------- */

    if (
      material !== undefined
    ) {
      product.material =
        String(
          material
        ).trim();
    }

    /* -----------------------------------------
       FIT
    ----------------------------------------- */

    if (
      fit !== undefined
    ) {
      product.fit =
        String(
          fit
        ).trim();
    }

    /* -----------------------------------------
       CARE INSTRUCTIONS
    ----------------------------------------- */

    if (
      careInstructions !==
      undefined
    ) {
      product.careInstructions =
        String(
          careInstructions
        ).trim();
    }

    /* -----------------------------------------
       FLAGS
    ----------------------------------------- */

    if (
      req.body.isIconic !==
      undefined
    ) {
      product.isIconic =
        toBoolean(
          req.body.isIconic
        );
    }

    if (
      req.body.isBestSeller !==
      undefined
    ) {
      product.isBestSeller =
        toBoolean(
          req.body.isBestSeller
        );
    }

    if (
      req.body.isNewArrival !==
      undefined
    ) {
      product.isNewArrival =
        toBoolean(
          req.body.isNewArrival
        );
    }

    if (
      req.body.isFeatured !==
      undefined
    ) {
      product.isFeatured =
        toBoolean(
          req.body.isFeatured
        );
    }

    if (
      req.body.isLimitedEdition !==
      undefined
    ) {
      product.isLimitedEdition =
        toBoolean(
          req.body
            .isLimitedEdition
        );
    }

    if (
      req.body.isActive !==
      undefined
    ) {
      product.isActive =
        toBoolean(
          req.body.isActive
        );
    }

    /* -----------------------------------------
       SAVE
    ----------------------------------------- */

    await product.save();

    const updatedProduct =
      await Product.findById(
        product._id
      ).populate(
        "category",
        "name slug"
      );

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      product:
        updatedProduct,
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      const messages =
        Object.values(
          error.errors
        ).map(
          (err) => err.message
        );

      return res.status(400).json({
        success: false,
        message:
          messages.join(", "),
      });
    }

    if (error.code === 11000) {
      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];

      return res.status(409).json({
        success: false,
        message:
          `${duplicateField || "Value"} already exists`,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update product",
    });
  }
};

/* =========================================================
   TOGGLE PRODUCT ACTIVE STATUS
========================================================= */

export const toggleProduct = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    product.isActive =
      !product.isActive;

    await product.save();

    return res.status(200).json({
      success: true,
      message: product.isActive
        ? "Product activated successfully"
        : "Product deactivated successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Toggle product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update product status",
    });
  }
};

/* =========================================================
   DELETE PRODUCT
========================================================= */

export const deleteProduct = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    /* -----------------------------------------
       DO NOT DELETE PRODUCTS USED IN ORDERS
    ----------------------------------------- */

    const orderUsingProduct =
      await Order.exists({
        "items.product":
          product._id,
      });

    if (orderUsingProduct) {
      return res.status(400).json({
        success: false,
        message:
          "This product is already used in an order. Deactivate it instead of deleting it.",
      });
    }

    await Product.findByIdAndDelete(
      product._id
    );

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete product",
    });
  }
};