import React, {
  useEffect,
  useState,
} from "react";

import {
  Heart,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";
import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";

const ProductCard = ({
  product,
}) => {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | AUTH
  |--------------------------------------------------------------------------
  */

  const {
    user,
    loading: authLoading,
  } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | STORE
  |--------------------------------------------------------------------------
  */

  const {
    wishlist = [],
    wishlistLoading,
    toggleWishlist,
    addToCart,
  } = useStore();

  /*
  |--------------------------------------------------------------------------
  | LOCAL STATE
  |--------------------------------------------------------------------------
  */

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  const [addingToCart, setAddingToCart] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | CHECK WISHLIST STATUS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!product?._id) {
      setIsWishlisted(false);
      return;
    }

    const exists =
      Array.isArray(wishlist) &&
      wishlist.some(
        (item) =>
          String(item?._id) ===
          String(product._id)
      );

    setIsWishlisted(exists);
  }, [
    wishlist,
    product?._id,
  ]);

  /*
  |--------------------------------------------------------------------------
  | PRODUCT DATA
  |--------------------------------------------------------------------------
  */

  if (!product) {
    return null;
  }

  const productId =
    product._id;

  const image =
    product.images?.[0] ||
    product.thumbnail ||
    "";

  const hasSale =
    product.salePrice !==
      null &&
    product.salePrice !==
      undefined &&
    Number(product.salePrice) <
      Number(product.price);

  const currentPrice =
    hasSale
      ? Number(
          product.salePrice
        )
      : Number(
          product.price || 0
        );

  const originalPrice =
    Number(
      product.price || 0
    );

  const discount =
    hasSale &&
    originalPrice > 0
      ? Math.round(
          ((originalPrice -
            currentPrice) /
            originalPrice) *
            100
        )
      : 0;

  const stock =
    Number(
      product.stock || 0
    );

  const isOutOfStock =
    stock <= 0;

  const isLowStock =
    stock > 0 && stock <= 5;

  /*
  |--------------------------------------------------------------------------
  | WISHLIST
  |--------------------------------------------------------------------------
  */

  const handleWishlist =
    async (event) => {
      event.preventDefault();
      event.stopPropagation();

      /*
       * Wait until authentication has
       * finished checking the current user.
       */
      if (authLoading) {
        return;
      }

      /*
       * User is not logged in.
       */
      if (!user) {
        toast.error(
          "Please login to use wishlist"
        );

        navigate("/login", {
          state: {
            from: {
              pathname:
                window.location.pathname,
            },
          },
        });

        return;
      }

      try {
        await toggleWishlist(
          product
        );

        /*
         * StoreContext updates wishlist
         * from the backend after the toggle.
         */
        if (isWishlisted) {
          toast.success(
            "Removed from wishlist"
          );
        } else {
          toast.success(
            "Added to wishlist"
          );
        }
      } catch (error) {
        console.error(
          "Wishlist error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            error.message ||
            "Unable to update wishlist"
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | ADD TO CART
  |--------------------------------------------------------------------------
  */

  const handleAddToCart =
    async (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (isOutOfStock) {
        toast.error(
          "This product is out of stock"
        );

        return;
      }

      /*
       * Default size/color.
       *
       * Product details page can allow
       * the customer to choose another
       * size/color.
       */
      const defaultSize =
        product.sizes?.[0] ||
        "";

      const defaultColor =
        product.colors?.[0]
          ?.name ||
        product.colors?.[0] ||
        "";

      try {
        setAddingToCart(true);

        await addToCart(
          product,
          1,
          defaultSize,
          defaultColor
        );

        toast.success(
          "Added to cart"
        );
      } catch (error) {
        console.error(
          "Add to cart error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            error.message ||
            "Unable to add product to cart"
        );
      } finally {
        setAddingToCart(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | BUY NOW
  |--------------------------------------------------------------------------
  */

  const handleBuyNow =
    async (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (isOutOfStock) {
        toast.error(
          "This product is out of stock"
        );

        return;
      }

      const defaultSize =
        product.sizes?.[0] ||
        "";

      const defaultColor =
        product.colors?.[0]
          ?.name ||
        product.colors?.[0] ||
        "";

      try {
        setAddingToCart(true);

        await addToCart(
          product,
          1,
          defaultSize,
          defaultColor
        );

        navigate("/checkout");
      } catch (error) {
        console.error(
          "Buy now error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            error.message ||
            "Unable to continue to checkout"
        );
      } finally {
        setAddingToCart(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
      }}
      className="group relative"
    >
      {/* PRODUCT IMAGE */}
      <div className="relative overflow-hidden bg-gray-100">
        <Link
          to={`/product/${productId}`}
          className="block"
        >
          {image ? (
            <img
              src={image}
              alt={
                product.name ||
                "FITFORGE product"
              }
              className="w-full aspect-[3/4] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full aspect-[3/4] bg-gray-100 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </Link>

        {/* BADGES */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isIconic && (
            <span className="bg-black text-white px-3 py-1 text-[10px] font-bold tracking-[0.15em]">
              ICONIC
            </span>
          )}

          {product.isBestSeller && (
            <span className="bg-white text-black px-3 py-1 text-[10px] font-bold tracking-[0.15em]">
              BESTSELLER
            </span>
          )}

          {product.isNewArrival && (
            <span className="bg-gray-200 text-black px-3 py-1 text-[10px] font-bold tracking-[0.15em]">
              NEW
            </span>
          )}

          {product.isLimitedEdition && (
            <span className="bg-gray-700 text-white px-3 py-1 text-[10px] font-bold tracking-[0.15em]">
              LIMITED
            </span>
          )}
        </div>

        {/* SALE BADGE */}
        {hasSale && (
          <span className="absolute top-3 right-3 bg-black text-white px-3 py-1 text-xs font-bold">
            -{discount}%
          </span>
        )}

        {/* WISHLIST BUTTON */}
        <button
          type="button"
          onClick={handleWishlist}
          disabled={
            authLoading ||
            wishlistLoading
          }
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          aria-pressed={
            isWishlisted
          }
          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
            isWishlisted
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-black hover:text-white"
          } ${
            authLoading ||
            wishlistLoading
              ? "opacity-60 cursor-not-allowed"
              : ""
          }`}
        >
          <Heart
            size={18}
            strokeWidth={2}
            fill={
              isWishlisted
                ? "currentColor"
                : "none"
            }
          />
        </button>

        {/* OUT OF STOCK OVERLAY */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
            <span className="bg-white text-black px-5 py-2 text-xs font-bold tracking-[0.15em]">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* PRODUCT INFORMATION */}
      <div className="pt-4">
        {/* COLLECTION */}
        {product.collection && (
          <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
            {product.collection}
          </p>
        )}

        {/* PRODUCT NAME */}
        <Link
          to={`/product/${productId}`}
        >
          <h3 className="mt-1 font-bold text-sm md:text-base leading-tight hover:underline">
            {product.name}
          </h3>
        </Link>

        {/* PRICE */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-sm md:text-base">
            ₹
            {currentPrice.toLocaleString(
              "en-IN"
            )}
          </span>

          {hasSale && (
            <span className="text-xs md:text-sm text-gray-400 line-through">
              ₹
              {originalPrice.toLocaleString(
                "en-IN"
              )}
            </span>
          )}
        </div>

        {/* STOCK */}
        {isLowStock && (
          <p className="text-xs text-red-600 mt-2 font-medium">
            Only {stock} left
          </p>
        )}

        {/* ACTIONS */}
        <div className="grid grid-cols-1 gap-2 mt-4">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              isOutOfStock ||
              addingToCart
            }
            className="w-full bg-black text-white py-3 px-4 flex items-center justify-center gap-2 text-xs md:text-sm font-bold tracking-wide transition hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <ShoppingBag
              size={16}
            />

            {addingToCart
              ? "ADDING..."
              : isOutOfStock
              ? "OUT OF STOCK"
              : "ADD TO CART"}
          </button>

          {!isOutOfStock && (
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={
                addingToCart
              }
              className="w-full border border-black text-black py-3 px-4 flex items-center justify-center gap-2 text-xs md:text-sm font-bold tracking-wide transition hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              BUY NOW
              <ArrowRight
                size={15}
              />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;

