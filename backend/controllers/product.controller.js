import Product from "../models/Product.js";
import "../models/Category.js";

export const getProducts = async (
  req,
  res
) => {
  try {
    const {
      collection,
      gender,
      category,
      search,
      minPrice,
      maxPrice,
      sort,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (collection) {
      filter.collection = collection;
    }

    if (gender) {
      filter.gender = gender;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte =
          Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte =
          Number(maxPrice);
      }
    }

    let sortOption = {
      createdAt: -1,
    };

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

    if (sort === "newest") {
      sortOption = {
        createdAt: -1,
      };
    }

    if (sort === "rating") {
      sortOption = {
        rating: -1,
      };
    }

    const products =
      await Product.find(filter)
        .populate("category")
        .sort(sortOption);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch products",
    });
  }
};

export const getProductById = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findOne({
        _id: req.params.id,
        isActive: true,
      }).populate("category");

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
    console.error(
      "Get product error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch product",
    });
  }
};