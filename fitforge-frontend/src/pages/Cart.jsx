import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
} from "lucide-react";

import { useStore } from "../context/StoreContext";

export default function Cart() {
  const {
    cart = [],
    cartCount = 0,
    cartTotal = 0,
    removeFromCart,
    updateCartQuantity,
    refreshCartFromStorage,
  } = useStore();

  useEffect(() => {
    refreshCartFromStorage();
  }, [refreshCartFromStorage]);

  console.log("FINAL CART PAGE:", cart);

  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-black">
          YOUR CART IS EMPTY
        </h1>

        <p className="text-gray-500 mt-4">
          Add some FITFORGE products before checkout.
        </p>

        <Link
          to="/shop"
          className="mt-8 bg-black text-white px-8 py-4 font-bold"
        >
          SHOP NOW
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-sm tracking-[0.3em] uppercase text-gray-500">
          FITFORGE
        </p>

        <h1 className="text-5xl font-black mt-3">
          YOUR CART
        </h1>

        <p className="text-gray-500 mt-3">
          {cartCount} item
          {cartCount !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item, index) => {
            const product = item?.product;

            if (!product) {
              return null;
            }

            const image =
              product.images?.[0] ||
              "https://via.placeholder.com/300";

            const price =
              product.salePrice != null
                ? Number(product.salePrice)
                : Number(product.price || 0);

            const quantity =
              Number(item.quantity) || 1;

            return (
              <div
                key={`${product._id}-${item.size}-${item.color}-${index}`}
                className="border-b pb-6 flex gap-6"
              >
                <img
                  src={image}
                  alt={product.name}
                  className="w-32 h-40 object-cover bg-gray-100"
                />

                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h2 className="font-bold text-xl">
                        {product.name}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        {product.collection}
                      </p>

                      {item.size && (
                        <p className="text-sm mt-2">
                          Size: {item.size}
                        </p>
                      )}

                      {item.color && (
                        <p className="text-sm">
                          Color: {item.color}
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
                      onClick={() =>
                        removeFromCart(
                          product._id,
                          item.size,
                          item.color
                        )
                      }
                      className="text-gray-500 hover:text-black"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-8">
                    <div className="flex items-center border">
                      <button
                        type="button"
                        disabled={quantity <= 1}
                        onClick={() =>
                          updateCartQuantity(
                            product._id,
                            quantity - 1,
                            item.size,
                            item.color
                          )
                        }
                        className="p-2 disabled:opacity-30"
                      >
                        <Minus className="w-4" />
                      </button>

                      <span className="px-4">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        disabled={
                          quantity >=
                          Number(product.stock || 0)
                        }
                        onClick={() =>
                          updateCartQuantity(
                            product._id,
                            quantity + 1,
                            item.size,
                            item.color
                          )
                        }
                        className="p-2 disabled:opacity-30"
                      >
                        <Plus className="w-4" />
                      </button>
                    </div>

                    <p className="font-bold">
                      ₹
                      {(
                        price * quantity
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border p-8 h-fit">
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
              {Number(cartTotal).toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          <div className="border-t mt-6 pt-6 flex justify-between font-bold text-xl">
            <span>Total</span>

            <span>
              ₹
              {Number(cartTotal).toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          <Link
            to="/checkout"
            className="mt-8 bg-black text-white py-4 flex items-center justify-center gap-3 font-bold"
          >
            CHECKOUT

            <ArrowRight className="w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}