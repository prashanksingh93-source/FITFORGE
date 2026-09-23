import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { useStore } from "../context/StoreContext";

export default function Cart() {
  const {
    cart = [],
    cartCount = 0,
    cartTotal = 0,
    cartLoading = false,
    removeFromCart,
    updateCartQuantity,
    refreshCartFromStorage,
  } = useStore();

  useEffect(() => {
    refreshCartFromStorage();
  }, [refreshCartFromStorage]);

  const handleRemove = async (item) => {
    try {
      await removeFromCart(
        item.product?._id,
        item.size,
        item.color,
        item._id
      );
    } catch (error) {
      alert(
        error.response?.data
          ?.message ||
          "Unable to remove item"
      );
    }
  };

  const handleQuantity = async (
    item,
    quantity
  ) => {
    try {
      await updateCartQuantity(
        item.product?._id,
        quantity,
        item.size,
        item.color,
        item._id
      );
    } catch (error) {
      alert(
        error.response?.data
          ?.message ||
          "Unable to update quantity"
      );
    }
  };

  if (
    !Array.isArray(cart) ||
    cart.length === 0
  ) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-sm tracking-[0.3em] uppercase text-gray-500">
          FITFORGE
        </p>

        <h1 className="text-4xl md:text-5xl font-black mt-4">
          YOUR CART IS EMPTY
        </h1>

        <p className="text-gray-500 mt-4 max-w-md">
          Add your favourite FITFORGE
          products before checkout.
        </p>

        <Link
          to="/shop"
          className="mt-8 bg-black text-white px-8 py-4 font-bold hover:bg-gray-800 transition"
        >
          SHOP NOW
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="mb-10 md:mb-12">
        <p className="text-sm tracking-[0.3em] uppercase text-gray-500">
          FITFORGE
        </p>

        <h1 className="text-4xl md:text-5xl font-black mt-3">
          YOUR CART
        </h1>

        <p className="text-gray-500 mt-3">
          {cartCount} item
          {cartCount !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10 lg:gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => {
            const product =
              item?.product;

            if (!product) {
              return null;
            }

            const image =
              product.images?.[0] ||
              product.thumbnail ||
              "";

            const price =
              product.salePrice !=
              null
                ? Number(
                    product.salePrice
                  )
                : Number(
                    product.price || 0
                  );

            const quantity =
              Number(
                item.quantity || 1
              );

            const stock =
              Number(
                product.stock || 0
              );

            return (
              <div
                key={item._id}
                className="border-b pb-6 flex flex-col sm:flex-row gap-5 sm:gap-6"
              >
                <Link
                  to={`/product/${product._id}`}
                  className="shrink-0"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={
                        product.name
                      }
                      className="w-full sm:w-32 h-56 sm:h-40 object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="w-full sm:w-32 h-56 sm:h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </Link>

                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link
                        to={`/product/${product._id}`}
                      >
                        <h2 className="font-bold text-lg md:text-xl hover:underline">
                          {product.name}
                        </h2>
                      </Link>

                      <p className="text-sm text-gray-500 mt-1">
                        {
                          product.collection
                        }
                      </p>

                      {item.size && (
                        <p className="text-sm mt-3">
                          Size:{" "}
                          <span className="font-medium">
                            {item.size}
                          </span>
                        </p>
                      )}

                      {item.color && (
                        <p className="text-sm">
                          Color:{" "}
                          <span className="font-medium">
                            {item.color}
                          </span>
                        </p>
                      )}

                      <p className="font-medium mt-3">
                        ₹
                        {price.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        cartLoading
                      }
                      onClick={() =>
                        handleRemove(
                          item
                        )
                      }
                      className="text-gray-500 hover:text-black disabled:opacity-40"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-7">
                    <div className="flex items-center border">
                      <button
                        type="button"
                        disabled={
                          cartLoading ||
                          quantity <= 1
                        }
                        onClick={() =>
                          handleQuantity(
                            item,
                            quantity -
                              1
                          )
                        }
                        className="p-2 disabled:opacity-30"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4" />
                      </button>

                      <span className="px-4 min-w-[48px] text-center">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        disabled={
                          cartLoading ||
                          quantity >=
                            stock
                        }
                        onClick={() =>
                          handleQuantity(
                            item,
                            quantity +
                              1
                          )
                        }
                        className="p-2 disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4" />
                      </button>
                    </div>

                    <p className="font-bold">
                      ₹
                      {(
                        price *
                        quantity
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  {stock > 0 &&
                    stock <= 5 && (
                      <p className="text-xs text-orange-600 mt-3">
                        Only {stock} left
                      </p>
                    )}

                  {stock === 0 && (
                    <p className="text-xs text-red-600 mt-3">
                      Currently out of stock
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border p-6 md:p-8 h-fit lg:sticky lg:top-24">
          <h2 className="text-2xl font-black">
            ORDER SUMMARY
          </h2>

          <div className="flex justify-between mt-8">
            <span>Items</span>
            <span>{cartCount}</span>
          </div>

          <div className="flex justify-between mt-4">
            <span>Subtotal</span>

            <span>
              ₹
              {Number(
                cartTotal
              ).toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Final shipping, tax,
            discounts and payment
            amount will be calculated
            securely during checkout.
          </p>

          <div className="border-t mt-6 pt-6 flex justify-between font-bold text-xl">
            <span>Total</span>

            <span>
              ₹
              {Number(
                cartTotal
              ).toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          <Link
            to="/checkout"
            className="mt-8 bg-black text-white py-4 px-5 flex items-center justify-center gap-3 font-bold hover:bg-gray-800 transition"
          >
            CHECKOUT

            <ArrowRight className="w-4" />
          </Link>

          {cartLoading && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-5">
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating cart...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}