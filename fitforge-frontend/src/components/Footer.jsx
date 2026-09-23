import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold tracking-wider">
              FITFORGE
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
              Performance-driven gym wear built for training,
              movement, and everyday confidence.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Shop
            </h3>

            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <Link
                to="/shop"
                className="transition hover:text-white"
              >
                All Products
              </Link>

              <Link
                to="/performance"
                className="transition hover:text-white"
              >
                Performance
              </Link>

              <Link
                to="/luxury"
                className="transition hover:text-white"
              >
                Luxury
              </Link>
            </div>
          </div>

          {/* Customer */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Customer
            </h3>

            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <Link
                to="/profile"
                className="transition hover:text-white"
              >
                My Account
              </Link>

              <Link
                to="/orders"
                className="transition hover:text-white"
              >
                My Orders
              </Link>

              <Link
                to="/wishlist"
                className="transition hover:text-white"
              >
                Wishlist
              </Link>

              <Link
                to="/cart"
                className="transition hover:text-white"
              >
                Cart
              </Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Follow FITFORGE
            </h3>

            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="rounded-full border border-gray-700 p-2 text-gray-400 transition hover:border-white hover:text-white"
              >
                <Instagram size={18} />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="rounded-full border border-gray-700 p-2 text-gray-400 transition hover:border-white hover:text-white"
              >
                <Facebook size={18} />
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="rounded-full border border-gray-700 p-2 text-gray-400 transition hover:border-white hover:text-white"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-gray-800 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} FITFORGE. All rights reserved.
            </p>

            {/* Admin Login */}
            <Link
              to="/admin/login"
              className="text-xs text-gray-500 transition hover:text-white"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

