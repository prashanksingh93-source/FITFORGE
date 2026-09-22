import React from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

import { useStore } from "../context/StoreContext";

export default function ProductCard({ product }) {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  if (!product?._id) {
    return null;
  }

  const image =
    product.images?.[0] ||
    "https://via.placeholder.com/500x600?text=FITFORGE";

  const price =
    product.salePrice !== null &&
    product.salePrice !== undefined
      ? Number(product.salePrice)
      : Number(product.price || 0);

  const originalPrice =
    product.salePrice !== null &&
    product.salePrice !== undefined
      ? Number(product.price || 0)
      : null;

  const outOfStock =
    product.stock !== undefined &&
    Number(product.stock) <= 0;

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (outOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    const size = product.sizes?.[0] || "";
    const color = product.colors?.[0]?.name || "";

    addToCart(
      product,
      1,
      size,
      color
    );

    toast.success(
      `${product.name} added to cart`
    );
  };

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const alreadyInWishlist =
      isInWishlist(product._id);

    toggleWishlist(product);

    if (alreadyInWishlist) {
      toast.success("Removed from wishlist");
    } else {
      toast.success("Added to wishlist");
    }
  };

  return (
    <article className="group">
      {/* PRODUCT IMAGE */}
      <div className="relative overflow-hidden bg-gray-100">
        <Link to={`/product/${product._id}`}>
          <img
            src={image}
            alt={product.name}
            className="w-full aspect-[4/5] object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>

        {/* BADGES */}
        {product.badges?.length > 0 && (
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.badges
              .slice(0, 2)
              .map((badge) => (
                <span
                  key={badge}
                  className="bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                >
                  {badge}
                </span>
              ))}
          </div>
        )}

        {/* WISHLIST */}
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-black hover:text-white transition"
          aria-label="Toggle wishlist"
        >
          <Heart
            className={`w-5 h-5 ${
              isInWishlist(product._id)
                ? "fill-current"
                : ""
            }`}
          />
        </button>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="pt-5">
        <Link to={`/product/${product._id}`}>
          <p className="text-xs tracking-[0.2em] uppercase text-gray-400">
            {product.collection}
          </p>

          <h3 className="font-bold text-lg mt-1 hover:underline">
            {product.name}
          </h3>

          <div className="flex items-center gap-3 mt-2">
            <span className="font-bold">
              ₹{price.toLocaleString("en-IN")}
            </span>

            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹
                {originalPrice.toLocaleString(
                  "en-IN"
                )}
              </span>
            )}
          </div>
        </Link>

        {/* ADD TO CART */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`mt-4 w-full py-3 flex items-center justify-center gap-2 font-bold text-sm transition ${
            outOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />

          {outOfStock
            ? "OUT OF STOCK"
            : "ADD TO CART"}
        </button>
      </div>
    </article>
  );
}