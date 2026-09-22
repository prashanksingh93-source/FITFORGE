import Category from "../models/Category.js";
import Product from "../models/Product.js";

const createSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export const getCategories = async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = {};

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    let categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const productCounts = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(
      productCounts.map((item) => [
        item._id?.toString(),
        item.count,
      ])
    );

    categories = categories.map((category) => ({
      ...category,
      productCount: countMap.get(category._id.toString()) || 0,
    }));

    if (search?.trim()) {
      const searchText = search.trim().toLowerCase();

      categories = categories.filter(
        (category) =>
          category.name?.toLowerCase().includes(searchText) ||
          category.slug?.toLowerCase().includes(searchText) ||
          category.description?.toLowerCase().includes(searchText)
      );
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export const getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true,
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get active categories error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const productCount = await Product.countDocuments({
      category: category._id,
    });

    res.status(200).json({
      success: true,
      category: {
        ...category.toObject(),
        productCount,
      },
    });
  } catch (error) {
    console.error("Get category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const {
      name,
      description = "",
      image = "",
      isActive = true,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const slug = createSlug(name);

    const existingName = await Category.findOne({
      name: name.trim(),
    });

    if (existingName) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const existingSlug = await Category.findOne({ slug });

    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: "Category slug already exists",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description.trim(),
      image: image.trim(),
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const {
      name,
      description,
      image,
      isActive,
    } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }

      const existingCategory = await Category.findOne({
        name: name.trim(),
        _id: { $ne: category._id },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category already exists",
        });
      }

      category.name = name.trim();
      category.slug = createSlug(name);
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    if (image !== undefined) {
      category.image = image.trim();
    }

    if (typeof isActive === "boolean") {
      category.isActive = isActive;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

export const toggleCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.isActive = !category.isActive;

    await category.save();

    res.status(200).json({
      success: true,
      message: category.isActive
        ? "Category activated successfully"
        : "Category deactivated successfully",
      category,
    });
  } catch (error) {
    console.error("Toggle category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update category status",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const productCount = await Product.countDocuments({
      category: category._id,
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete this category because ${productCount} product${
          productCount === 1 ? "" : "s"
        } use it. Move the products to another category first.`,
      });
    }

    await Category.findByIdAndDelete(category._id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};