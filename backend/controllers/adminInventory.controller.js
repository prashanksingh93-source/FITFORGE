import Product from "../models/Product.js";

export const getInventory = async (req, res) => {
  try {
    const { search, collection, stockStatus } = req.query;

    const filter = {};

    if (collection) {
      filter.collection = collection;
    }

    let products = await Product.find(filter)
      .populate("category", "name")
      .sort({ stock: 1, createdAt: -1 })
      .lean();

    if (search?.trim()) {
      const searchText = search.trim().toLowerCase();

      products = products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchText) ||
          product.sku?.toLowerCase().includes(searchText)
      );
    }

    if (stockStatus === "out") {
      products = products.filter((product) => product.stock === 0);
    }

    if (stockStatus === "low") {
      products = products.filter(
        (product) =>
          product.stock > 0 &&
          product.stock <= product.lowStockThreshold
      );
    }

    if (stockStatus === "in") {
      products = products.filter(
        (product) => product.stock > product.lowStockThreshold
      );
    }

    const totalProducts = products.length;

    const outOfStock = products.filter(
      (product) => product.stock === 0
    ).length;

    const lowStock = products.filter(
      (product) =>
        product.stock > 0 &&
        product.stock <= product.lowStockThreshold
    ).length;

    const inStock = products.filter(
      (product) => product.stock > product.lowStockThreshold
    ).length;

    const totalUnits = products.reduce(
      (total, product) => total + Number(product.stock || 0),
      0
    );

    res.status(200).json({
      success: true,
      count: products.length,
      stats: {
        totalProducts,
        totalUnits,
        inStock,
        lowStock,
        outOfStock,
      },
      products,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
};

export const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (
      stock === undefined ||
      stock === null ||
      Number.isNaN(Number(stock)) ||
      Number(stock) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid stock quantity is required",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.stock = Number(stock);

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .lean();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update stock error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update stock",
    });
  }
};

export const adjustProductStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (
      quantity === undefined ||
      quantity === null ||
      Number.isNaN(Number(quantity)) ||
      Number(quantity) === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid non-zero number",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const newStock = product.stock + Number(quantity);

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    product.stock = newStock;

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .lean();

    res.status(200).json({
      success: true,
      message: "Stock adjusted successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Adjust stock error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to adjust stock",
    });
  }
};