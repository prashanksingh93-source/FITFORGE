import React from "react";
import { Link } from "react-router-dom";
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
            {/* BRAND */}
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

            {/* SHOP */}
            <div>
              <h3 className="font-bold mb-4">
                SHOP
              </h3>

              <div className="space-y-2 text-gray-400 text-sm">
                <Link
                  to="/shop"
                  className="block hover:text-white transition"
                >
                  All Products
                </Link>

                <Link
                  to="/shop?collection=Performance"
                  className="block hover:text-white transition"
                >
                  Performance
                </Link>

                <Link
                  to="/shop?collection=Luxury"
                  className="block hover:text-white transition"
                >
                  Luxury
                </Link>
              </div>
            </div>

            {/* CUSTOMER */}
            <div>
              <h3 className="font-bold mb-4">
                CUSTOMER
              </h3>

              <div className="space-y-2 text-gray-400 text-sm">
                <Link
                  to="/profile"
                  className="block hover:text-white transition"
                >
                  My Account
                </Link>

                <Link
                  to="/orders"
                  className="block hover:text-white transition"
                >
                  Orders
                </Link>

                <Link
                  to="/wishlist"
                  className="block hover:text-white transition"
                >
                  Wishlist
                </Link>

                <Link
                  to="/cart"
                  className="block hover:text-white transition"
                >
                  Cart
                </Link>
              </div>
            </div>

            {/* FITFORGE */}
            <div>
              <h3 className="font-bold mb-4">
                FITFORGE
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                © {new Date().getFullYear()} FITFORGE.
                All rights reserved.
              </p>
            </div>
          </div>

          {/* BOTTOM SECTION */}
          <div className="border-t border-gray-800 mt-12 pt-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} FITFORGE. All rights reserved.
              </p>

              {/* ADMIN LOGIN */}
              <Link
                to="/admin/login"
                className="text-xs text-gray-500 hover:text-white transition"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

