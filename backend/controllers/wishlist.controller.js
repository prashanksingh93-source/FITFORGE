import mongoose from "mongoose";

import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const populateWishlist = async (wishlist) => {
  return Wishlist.findById(wishlist._id).populate({
    path: "products",
    match: {
      isActive: true,
    },
    populate: {
      path: "category",
      select: "name slug",
    },
  });
};

/*
|--------------------------------------------------------------------------
| GET WISHLIST
|--------------------------------------------------------------------------
| GET /api/wishlist
|--------------------------------------------------------------------------
*/

export const getWishlist = async (
  req,
  res,
  next
) => {
  try {
    let wishlist =
      await Wishlist.findOne({
        user: req.user._id,
      }).populate({
        path: "products",
        match: {
          isActive: true,
        },
        populate: {
          path: "category",
          select: "name slug",
        },
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });

      wishlist =
        await populateWishlist(wishlist);
    }

    return res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADD TO WISHLIST
|--------------------------------------------------------------------------
| POST /api/wishlist/:productId
|--------------------------------------------------------------------------
*/

export const addToWishlist = async (
  req,
  res,
  next
) => {
  try {
    const { productId } = req.params;

    if (!isValidId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findOne({
        _id: productId,
        isActive: true,
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let wishlist =
      await Wishlist.findOne({
        user: req.user._id,
      });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user._id,
        products: [],
      });
    }

    const alreadyExists =
      wishlist.products.some(
        (id) =>
          id.toString() ===
          productId.toString()
      );

    if (!alreadyExists) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    wishlist =
      await populateWishlist(wishlist);

    return res.status(200).json({
      success: true,
      message: alreadyExists
        ? "Product is already in wishlist"
        : "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| REMOVE FROM WISHLIST
|--------------------------------------------------------------------------
| DELETE /api/wishlist/:productId
|--------------------------------------------------------------------------
*/

export const removeFromWishlist = async (
  req,
  res,
  next
) => {
  try {
    const { productId } = req.params;

    if (!isValidId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const wishlist =
      await Wishlist.findOne({
        user: req.user._id,
      });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.products =
      wishlist.products.filter(
        (id) =>
          id.toString() !==
          productId.toString()
      );

    await wishlist.save();

    const updatedWishlist =
      await populateWishlist(wishlist);

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| TOGGLE WISHLIST
|--------------------------------------------------------------------------
| POST /api/wishlist/:productId/toggle
|--------------------------------------------------------------------------
*/

export const toggleWishlist = async (
  req,
  res,
  next
) => {
  try {
    const { productId } = req.params;

    if (!isValidId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findOne({
        _id: productId,
        isActive: true,
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let wishlist =
      await Wishlist.findOne({
        user: req.user._id,
      });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user._id,
        products: [],
      });
    }

    const index =
      wishlist.products.findIndex(
        (id) =>
          id.toString() ===
          productId.toString()
      );

    let added;

    if (index >= 0) {
      wishlist.products.splice(index, 1);
      added = false;
    } else {
      wishlist.products.push(productId);
      added = true;
    }

    await wishlist.save();

    wishlist =
      await populateWishlist(wishlist);

    return res.status(200).json({
      success: true,
      added,
      message: added
        ? "Added to wishlist"
        : "Removed from wishlist",
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CLEAR WISHLIST
|--------------------------------------------------------------------------
| DELETE /api/wishlist
|--------------------------------------------------------------------------
*/

export const clearWishlist = async (
  req,
  res,
  next
) => {
  try {
    let wishlist =
      await Wishlist.findOne({
        user: req.user._id,
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });
    } else {
      wishlist.products = [];
      await wishlist.save();
    }

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared",
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};