import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <Outlet />

      <footer className="bg-black text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <h2 className="text-2xl font-black">
                FITFORGE
              </h2>

              <p className="text-gray-400 mt-4 text-sm leading-relaxed">
                Performance meets luxury.
                Built for those who train hard
                and live stronger.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">
                SHOP
              </h3>

              <div className="space-y-2 text-gray-400 text-sm">
                <a
                  href="/shop"
                  className="block hover:text-white"
                >
                  All Products
                </a>

                <a
                  href="/shop?collection=Performance"
                  className="block hover:text-white"
                >
                  Performance
                </a>

                <a
                  href="/shop?collection=Luxury"
                  className="block hover:text-white"
                >
                  Luxury
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">
                CUSTOMER
              </h3>

              <div className="space-y-2 text-gray-400 text-sm">
                <a href="/profile">My Account</a>
                <br />
                <a href="/orders">Orders</a>
                <br />
                <a href="/wishlist">Wishlist</a>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">
                FITFORGE
              </h3>

              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} FITFORGE.
                All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}