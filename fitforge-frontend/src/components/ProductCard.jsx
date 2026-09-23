import React from "react";
import {
  Heart,
  ShoppingBag,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const image =
    product.thumbnail ||
    product.images?.[0] ||
    null;

  const price = Number(product.price || 0);

  const salePrice =
    product.salePrice !== null &&
    product.salePrice !== undefined &&
    product.salePrice !== ""
      ? Number(product.salePrice)
      : null;

  const finalPrice =
    salePrice !== null && salePrice < price
      ? salePrice
      : price;

  const discount =
    salePrice !== null && salePrice < price
      ? Math.round(
          ((price - salePrice) / price) * 100
        )
      : 0;

  const stock = Number(product.stock || 0);

  const isOutOfStock = stock <= 0;

  return (
    <div className="group relative">
      {/* IMAGE */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        <Link to={`/product/${product._id}`}>
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </Link>

        {/* DISCOUNT */}
        {discount > 0 && (
          <span className="absolute left-3 top-3 bg-black px-2.5 py-1 text-xs font-semibold text-white">
            {discount}% OFF
          </span>
        )}

        {/* NEW */}
        {product.isNewArrival && (
          <span className="absolute left-3 top-11 bg-white px-2.5 py-1 text-xs font-semibold text-black">
            NEW
          </span>
        )}

        {/* WISHLIST */}
        <button
          type="button"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-black hover:text-white"
          aria-label="Add to wishlist"
        >
          <Heart size={17} />
        </button>

        {/* OUT OF STOCK */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="bg-white px-4 py-2 text-sm font-bold">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div className="pt-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {product.collection}
          </p>

          {product.rating > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Star
                size={13}
                fill="currentColor"
              />

              <span>
                {Number(product.rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <Link to={`/product/${product._id}`}>
          <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-gray-900 transition group-hover:underline md:text-base">
            {product.name}
          </h3>
        </Link>

        {/* PRICE */}
        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-gray-900">
            ₹{finalPrice.toLocaleString("en-IN")}
          </span>

          {salePrice !== null &&
            salePrice < price && (
              <span className="text-sm text-gray-400 line-through">
                ₹{price.toLocaleString("en-IN")}
              </span>
            )}
        </div>

        {/* STOCK */}
        {!isOutOfStock && stock <= 5 && (
          <p className="mt-2 text-xs font-medium text-orange-600">
            Only {stock} left
          </p>
        )}

        {/* QUICK ADD */}
        <Link
          to={`/product/${product._id}`}
          className={`mt-4 flex w-full items-center justify-center gap-2 border px-4 py-2.5 text-sm font-semibold transition ${
            isOutOfStock
              ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
              : "border-black bg-black text-white hover:bg-white hover:text-black"
          }`}
        >
          <ShoppingBag size={16} />

          {isOutOfStock
            ? "Out of Stock"
            : "View Product"}
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;