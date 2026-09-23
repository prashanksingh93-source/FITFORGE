import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";

import api from "../services/api";
import { useStore } from "../context/StoreContext";

export default function ProductDetails() {
  const { id } = useParams();

  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);

        if (response.data.success) {
          const productData = response.data.product;

          setProduct(productData);

          // Default size
          if (productData.sizes?.length) {
            setSelectedSize(productData.sizes[0]);
          }

          // Default color
          if (productData.colors?.length) {
            const firstColor = productData.colors[0];

            setSelectedColor(
              typeof firstColor === "string"
                ? firstColor
                : firstColor?.name || ""
            );
          }
        } else {
          setError("Product not found.");
        }
      } catch (error) {
        console.error("Product fetch error:", error);
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">
          Product not found
        </h2>

        <Link
          to="/shop"
          className="mt-6 underline"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const image =
    product.thumbnail ||
    product.images?.[0] ||
    "https://via.placeholder.com/700x850?text=FITFORGE";

  const price =
    product.salePrice || product.price;

  const wishlisted = isInWishlist(product._id);

  const addProductToCart = () => {
    if (product.stock <= 0) return;

    addToCart(
      product,
      quantity,
      selectedSize,
      selectedColor
    );
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(product.stock || 1, current + 1)
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* BACK */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-sm mb-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to shop
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* IMAGE */}
        <div className="bg-gray-100 aspect-[4/5] overflow-hidden">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* INFORMATION */}
        <div className="py-4">
          {/* COLLECTION */}
          {product.collection && (
            <p className="text-sm tracking-[0.3em] uppercase text-gray-500">
              {product.collection}
            </p>
          )}

          {/* NAME */}
          <h1 className="text-4xl md:text-5xl font-black mt-4">
            {product.name}
          </h1>

          {/* PRICE */}
          <div className="flex items-center gap-4 mt-6">
            <span className="text-2xl font-bold">
              ₹{price.toLocaleString("en-IN")}
            </span>

            {product.salePrice && (
              <>
                <span className="line-through text-gray-500">
                  ₹
                  {product.price.toLocaleString(
                    "en-IN"
                  )}
                </span>

                {product.price > 0 && (
                  <span className="text-sm font-semibold text-red-600">
                    {Math.round(
                      ((product.price -
                        product.salePrice) /
                        product.price) *
                        100
                    )}
                    % OFF
                  </span>
                )}
              </>
            )}
          </div>

          {/* DESCRIPTION */}
          {product.description && (
            <p className="text-gray-600 leading-relaxed mt-8">
              {product.description}
            </p>
          )}

          {/* STOCK STATUS */}
          <div className="mt-6">
            {product.stock <= 0 ? (
              <span className="font-semibold text-red-600">
                Out of Stock
              </span>
            ) : product.stock <= 5 ? (
              <span className="font-semibold text-orange-600">
                Only {product.stock} left
              </span>
            ) : (
              <span className="font-semibold text-green-600">
                In Stock
              </span>
            )}
          </div>

          {/* COLORS */}
          {product.colors?.length > 0 && (
            <div className="mt-8">
              <h3 className="font-bold mb-4">
                Color
              </h3>

              <div className="flex gap-3 flex-wrap">
                {product.colors.map(
                  (color, index) => {
                    const colorName =
                      typeof color === "string"
                        ? color
                        : color?.name || "";

                    const colorHex =
                      typeof color === "string"
                        ? color
                        : color?.hex || "#000000";

                    const isSelected =
                      selectedColor === colorName;

                    return (
                      <button
                        key={`${colorName}-${index}`}
                        type="button"
                        title={colorName}
                        onClick={() =>
                          setSelectedColor(
                            colorName
                          )
                        }
                        className={`flex items-center gap-2 rounded-md border px-3 py-2 transition ${
                          isSelected
                            ? "border-black ring-2 ring-black"
                            : "border-gray-300"
                        }`}
                      >
                        <span
                          className="h-5 w-5 rounded-full border"
                          style={{
                            backgroundColor:
                              colorHex,
                          }}
                        />

                        <span>
                          {colorName}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* SIZES */}
          {product.sizes?.length > 0 && (
            <div className="mt-8">
              <h3 className="font-bold mb-4">
                Size
              </h3>

              <div className="flex gap-3 flex-wrap">
                {product.sizes.map(
                  (size, index) => (
                    <button
                      key={`${size}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedSize(size)
                      }
                      className={`w-12 h-12 border ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-300"
                      }`}
                    >
                      {size}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          <div className="mt-8">
            <h3 className="font-bold mb-4">
              Quantity
            </h3>

            <div className="flex items-center border w-fit">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="p-3 disabled:opacity-40"
              >
                <Minus className="w-4" />
              </button>

              <span className="px-5">
                {quantity}
              </span>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={
                  product.stock <= 0 ||
                  quantity >= product.stock
                }
                className="p-3 disabled:opacity-40"
              >
                <Plus className="w-4" />
              </button>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-4 mt-10">
            <button
              type="button"
              onClick={addProductToCart}
              disabled={product.stock <= 0}
              className="flex-1 bg-black text-white py-4 font-bold flex items-center justify-center gap-3 disabled:bg-gray-400"
            >
              <ShoppingBag className="w-5" />

              {product.stock > 0
                ? "ADD TO CART"
                : "OUT OF STOCK"}
            </button>

            <button
              type="button"
              onClick={() =>
                toggleWishlist(product)
              }
              className="border px-5"
              aria-label="Add to wishlist"
            >
              <Heart
                className={
                  wishlisted
                    ? "fill-red-500 text-red-500"
                    : ""
                }
              />
            </button>
          </div>

          {/* PRODUCT DETAILS */}
          <div className="border-t mt-10 pt-8 space-y-4 text-sm">
            {product.material && (
              <div className="flex justify-between gap-6">
                <span className="text-gray-500">
                  Material
                </span>

                <span className="text-right">
                  {product.material}
                </span>
              </div>
            )}

            {product.fit && (
              <div className="flex justify-between gap-6">
                <span className="text-gray-500">
                  Fit
                </span>

                <span className="text-right">
                  {product.fit}
                </span>
              </div>
            )}

            {product.gender && (
              <div className="flex justify-between gap-6">
                <span className="text-gray-500">
                  Gender
                </span>

                <span className="text-right">
                  {product.gender}
                </span>
              </div>
            )}

            {product.sku && (
              <div className="flex justify-between gap-6">
                <span className="text-gray-500">
                  SKU
                </span>

                <span className="text-right">
                  {product.sku}
                </span>
              </div>
            )}

            {product.stock !== undefined && (
              <div className="flex justify-between gap-6">
                <span className="text-gray-500">
                  Stock
                </span>

                <span className="text-right">
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Out of stock"}
                </span>
              </div>
            )}

            {product.careInstructions && (
              <div className="flex justify-between gap-6">
                <span className="text-gray-500">
                  Care
                </span>

                <span className="text-right max-w-xs">
                  {product.careInstructions}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}