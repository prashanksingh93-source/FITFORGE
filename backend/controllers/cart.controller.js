import mongoose from "mongoose";

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getProductPrice = (product) => {
  if (
    product.salePrice !== null &&
    product.salePrice !== undefined
  ) {
    return Number(product.salePrice);
  }

  return Number(product.price || 0);
};

const formatCart = (cart) => {
  const items = cart.items || [];

  const formattedItems = items.map((item) => {
    const product = item.product;

    if (!product) {
      return {
        _id: item._id,
        product: null,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      };
    }

    const price = getProductPrice(product);

    return {
      _id: item._id,
      product,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      itemTotal: price * item.quantity,
    };
  });

  const subtotal = formattedItems.reduce(
    (total, item) => {
      return total + Number(item.itemTotal || 0);
    },
    0
  );

  const itemCount = formattedItems.reduce(
    (total, item) => {
      return total + Number(item.quantity || 0);
    },
    0
  );

  return {
    _id: cart._id,
    user: cart.user,
    items: formattedItems,
    itemCount,
    subtotal,
    updatedAt: cart.updatedAt,
  };
};

/*
|--------------------------------------------------------------------------
| GET CART
|--------------------------------------------------------------------------
| GET /api/cart
|--------------------------------------------------------------------------
*/

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({
      user: req.user._id,
    }).populate({
      path: "items.product",
      match: {
        isActive: true,
      },
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });

      cart = await Cart.findById(cart._id).populate({
        path: "items.product",
        match: {
          isActive: true,
        },
        populate: {
          path: "category",
          select: "name slug",
        },
      });
    }

    return res.status(200).json({
      success: true,
      cart: formatCart(cart),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADD TO CART
|--------------------------------------------------------------------------
| POST /api/cart
|--------------------------------------------------------------------------
*/

export const addToCart = async (req, res, next) => {
  try {
    const {
      productId,
      quantity = 1,
      size = "",
      color = "",
    } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const requestedQuantity = Number(quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    if (size && product.sizes?.length) {
      if (!product.sizes.includes(size)) {
        return res.status(400).json({
          success: false,
          message: "Selected size is not available",
        });
      }
    }

    if (color && product.colors?.length) {
      const colorExists = product.colors.some(
        (item) =>
          item.name.toLowerCase() ===
          color.toLowerCase()
      );

      if (!colorExists) {
        return res.status(400).json({
          success: false,
          message: "Selected color is not available",
        });
      }
    }

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() ===
          productId.toString() &&
        item.size === size &&
        item.color === color
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity +
        requestedQuantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} item(s) available`,
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      if (requestedQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} item(s) available`,
        });
      }

      cart.items.push({
        product: productId,
        quantity: requestedQuantity,
        size,
        color,
      });
    }

    await cart.save();

    cart = await Cart.findById(cart._id).populate({
      path: "items.product",
      match: {
        isActive: true,
      },
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: formatCart(cart),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE CART ITEM
|--------------------------------------------------------------------------
| PATCH /api/cart/:itemId
|--------------------------------------------------------------------------
*/

export const updateCartItem = async (
  req,
  res,
  next
) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!isValidObjectId(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    const newQuantity = Number(quantity);

    if (
      !Number.isInteger(newQuantity) ||
      newQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    const product = await Product.findOne({
      _id: item.product,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product is no longer available",
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} item(s) available`,
      });
    }

    item.quantity = newQuantity;

    await cart.save();

    const populatedCart =
      await Cart.findById(cart._id).populate({
        path: "items.product",
        match: {
          isActive: true,
        },
        populate: {
          path: "category",
          select: "name slug",
        },
      });

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: formatCart(populatedCart),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| REMOVE CART ITEM
|--------------------------------------------------------------------------
| DELETE /api/cart/:itemId
|--------------------------------------------------------------------------
*/

export const removeCartItem = async (
  req,
  res,
  next
) => {
  try {
    const { itemId } = req.params;

    if (!isValidObjectId(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    cart.items.pull(itemId);

    await cart.save();

    const populatedCart =
      await Cart.findById(cart._id).populate({
        path: "items.product",
        match: {
          isActive: true,
        },
        populate: {
          path: "category",
          select: "name slug",
        },
      });

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: formatCart(populatedCart),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CLEAR CART
|--------------------------------------------------------------------------
| DELETE /api/cart
|--------------------------------------------------------------------------
*/

export const clearCart = async (
  req,
  res,
  next
) => {
  try {
    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    } else {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart: {
        _id: cart._id,
        user: cart.user,
        items: [],
        itemCount: 0,
        subtotal: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};