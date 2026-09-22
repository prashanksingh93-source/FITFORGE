import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useStore } from "../context/StoreContext";

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist } = useStore();

  const isLuxury = product.collection === "Luxury";

  const isWishlisted = wishlist.some(
    (item) => item._id === product._id
  );

  const image =
    product.images?.[0] ||
    "https://via.placeholder.com/600x750?text=FITFORGE";

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;

  const isLimitedEdition =
    product.badges?.includes("Limited Edition");

  const isNewArrival =
    product.badges?.includes("New Arrival");

  const isBestSeller =
    product.badges?.includes("Best Seller");

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`group relative h-full flex flex-col ${
        isLuxury
          ? "bg-charcoal text-white p-4 rounded-xl"
          : ""
      }`}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className="absolute top-6 right-6 z-10 bg-white/50 backdrop-blur p-2 rounded-full hover:bg-white transition"
        aria-label="Add to wishlist"
      >
        <Heart
          className={`w-4 h-4 ${
            isWishlisted
              ? "fill-red-500 text-red-500"
              : "text-black"
          }`}
        />
      </button>

      <Link
        to={`/product/${product._id}`}
        className="flex-1 flex flex-col"
      >
        <div className="relative overflow-hidden aspect-[4/5] bg-gray-100 mb-4 rounded-md">
          <img
            src={image}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {isLuxury && isLimitedEdition && (
              <span className="text-[10px] font-bold tracking-widest uppercase bg-white text-black px-2 py-1">
                Limited Edition
              </span>
            )}

            {isNewArrival && (
              <span className="text-[10px] font-bold tracking-widest uppercase bg-black text-white px-2 py-1">
                New
              </span>
            )}

            {isBestSeller && (
              <span className="text-[10px] font-bold tracking-widest uppercase bg-black text-white px-2 py-1">
                Best Seller
              </span>
            )}

            {product.salePrice && (
              <span className="text-[10px] font-bold tracking-widest uppercase bg-red-600 text-white px-2 py-1">
                Sale
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 justify-between">
          <div>
            <h3
              className={`font-semibold text-lg ${
                isLuxury
                  ? "text-gray-200"
                  : "text-gray-900"
              }`}
            >
              {product.name}
            </h3>

            <p
              className={`text-sm mt-1 mb-2 ${
                isLuxury
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              {categoryName || product.collection}
            </p>
          </div>

          <div className="flex gap-2 items-center">
            {product.salePrice ? (
              <>
                <span
                  className={`font-bold ${
                    isLuxury
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  ₹
                  {product.salePrice.toLocaleString(
                    "en-IN"
                  )}
                </span>

                <span className="text-sm line-through text-gray-500">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              </>
            ) : (
              <span
                className={`font-bold ${
                  isLuxury
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}