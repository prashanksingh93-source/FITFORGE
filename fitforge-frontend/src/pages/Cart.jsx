import React from "react";
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
    cart,
    cartCount,
    cartTotal,
    removeFromCart,
    updateCartQuantity,
  } = useStore();

  if (cart.length === 0) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-black">
          YOUR CART IS EMPTY
        </h1>

        <p className="text-gray-500 mt-4">
          Discover something built for your next workout.
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
        {/* ITEMS */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => {
            const product = item.product;

            const image =
              product.images?.[0] ||
              "https://via.placeholder.com/200x250";

            const price =
              product.salePrice || product.price;

            return (
              <div
                key={`${product._id}-${item.size}-${item.color}`}
                className="border-b pb-6 flex gap-6"
              >
                <img
                  src={image}
                  alt={product.name}
                  className="w-32 h-40 object-cover bg-gray-100"
                />

                <div className="flex-1">
                  <div className="flex justify-between gap-4">
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
                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(
                          product._id,
                          item.size,
                          item.color
                        )
                      }
                    >
                      <Trash2 className="w-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-8">
                    <div className="flex items-center border">
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            product._id,
                            item.quantity - 1,
                            item.size,
                            item.color
                          )
                        }
                        className="p-2"
                      >
                        <Minus className="w-4" />
                      </button>

                      <span className="px-4">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateCartQuantity(
                            product._id,
                            item.quantity + 1,
                            item.size,
                            item.color
                          )
                        }
                        className="p-2"
                      >
                        <Plus className="w-4" />
                      </button>
                    </div>

                    <p className="font-bold">
                      ₹
                      {(
                        price * item.quantity
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SUMMARY */}
        <div className="border p-8 h-fit">
          <h2 className="text-2xl font-black">
            ORDER SUMMARY
          </h2>

          <div className="flex justify-between mt-8">
            <span>Subtotal</span>
            <span>
              ₹{cartTotal.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between mt-4">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>

          <div className="border-t mt-6 pt-6 flex justify-between font-bold text-xl">
            <span>Total</span>
            <span>
              ₹{cartTotal.toLocaleString("en-IN")}
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