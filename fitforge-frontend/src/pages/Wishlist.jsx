import React, {
  useEffect,
} from "react";

import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Loader2,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useStore } from "../context/StoreContext";

export default function Wishlist() {
  const navigate =
    useNavigate();

  const {
    wishlist = [],
    wishlistLoading = false,
    toggleWishlist,
    addToCart,
    fetchWishlist,
  } = useStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (
    product
  ) => {
    try {
      await toggleWishlist(
        product
      );
    } catch (error) {
      alert(
        error.response?.data
          ?.message ||
          "Unable to update wishlist"
      );
    }
  };

  const handleAddToCart = async (
    product
  ) => {
    try {
      const size =
        product.sizes?.[0] ||
        "";

      const color =
        product.colors?.[0]
          ?.name ||
        "";

      await addToCart(
        product,
        1,
        size,
        color
      );

      await toggleWishlist(
        product
      );

      navigate("/cart");
    } catch (error) {
      alert(
        error.response?.data
          ?.message ||
          "Unable to add product to cart"
      );
    }
  };

  if (wishlistLoading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </main>
    );
  }

  if (
    !Array.isArray(wishlist) ||
    wishlist.length === 0
  ) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <Heart className="w-12 h-12 mb-5" />

        <p className="text-sm tracking-[0.3em] uppercase text-gray-500">
          FITFORGE
        </p>

        <h1 className="text-4xl md:text-5xl font-black mt-3">
          YOUR WISHLIST IS EMPTY
        </h1>

        <p className="text-gray-500 mt-4 max-w-md">
          Save the FITFORGE pieces
          you want to come back to.
        </p>

        <Link
          to="/shop"
          className="mt-8 bg-[oklch(45%_0.017_213.2)] text-white px-8 py-4 font-bold flex items-center gap-3"
        >
          EXPLORE SHOP
          <ArrowRight className="w-4" />
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="mb-10">
        <p className="text-sm tracking-[0.3em] uppercase text-gray-500">
          FITFORGE
        </p>

        <h1 className="text-4xl md:text-5xl font-black mt-3">
          WISHLIST
        </h1>

        <p className="text-gray-500 mt-3">
          {wishlist.length} saved product
          {wishlist.length !== 1
            ? "s"
            : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
        {wishlist.map(
          (product) => {
            if (!product?._id) {
              return null;
            }

            const image =
              product.images?.[0] ||
              product.thumbnail ||
              "";

            const hasSale =
              product.salePrice !=
                null &&
              Number(
                product.salePrice
              ) <
                Number(
                  product.price
                );

            const displayPrice =
              hasSale
                ? Number(
                    product.salePrice
                  )
                : Number(
                    product.price || 0
                  );

            return (
              <article
                key={product._id}
                className="group"
              >
                <div className="relative overflow-hidden bg-gray-100">
                  <Link
                    to={`/product/${product._id}`}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={
                          product.name
                        }
                        className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full aspect-[3/4] flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemove(
                        product
                      )
                    }
                    className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-sm"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {product.stock <=
                    0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white px-4 py-2 text-xs font-bold">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    {
                      product.collection
                    }
                  </p>

                  <Link
                    to={`/product/${product._id}`}
                  >
                    <h2 className="font-bold mt-1 hover:underline">
                      {product.name}
                    </h2>
                  </Link>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-medium">
                      ₹
                      {displayPrice.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                    {hasSale && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹
                        {Number(
                          product.price
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={
                      product.stock <=
                        0 ||
                      wishlistLoading
                    }
                    onClick={() =>
                      handleAddToCart(
                        product
                      )
                    }
                    className="w-full mt-4 bg-black text-white py-3 flex items-center justify-center gap-2 font-bold disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    ADD TO CART
                  </button>
                </div>
              </article>
            );
          }
        )}
      </div>
    </main>
  );
}