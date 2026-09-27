import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  User,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();

  const { cartCount, wishlist } = useStore();
  const { user, loading, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      name: "HOME",
      path: "/",
    },
    {
      name: "SHOP",
      path: "/shop",
    },
    {
      name: "PERFORMANCE",
      path: "/performance",
    },
    {
      name: "LUXURY",
      path: "/luxury",
    },
    
  ];

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();

      toast.success("Logged out successfully");

      navigate("/");
      closeMobileMenu();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Unable to logout");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[oklch(45%_0.017_213.2)] border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">

            {/* ================= LOGO ================= */}
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="text-2xl md:text-3xl font-black tracking-[0.18em]"
            >
              FITFORGE
            </Link>

            {/* ================= DESKTOP NAVIGATION ================= */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-xs font-semibold tracking-widest transition-all duration-300 ${
                      isActive
                        ? "text-black"
                        : "text-gray-500 hover:text-black"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* ================= DESKTOP ACTIONS ================= */}
            <div className="hidden lg:flex items-center gap-5">

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative text-gray-700 hover:text-black transition-all duration-300 hover:scale-110"
                aria-label="Wishlist"
              >
                <Heart size={21} />

                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-black text-white text-[9px] rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Account */}
              {!loading && (
                <>
                  {user ? (
                    <div className="relative group">
                      <button
                        type="button"
                        className="flex items-center gap-2 text-gray-700 hover:text-black transition-all duration-300"
                      >
                        <User size={21} />

                        <span className="text-xs font-semibold max-w-24 truncate">
                          {user.fullName}
                        </span>
                      </button>

                      <div className="absolute right-0 top-full pt-3 hidden group-hover:block">
                        <div className="w-48 bg-white border border-gray-200 shadow-lg p-2">

                          <Link
                            to="/profile"
                            className="block px-4 py-3 text-sm hover:bg-gray-100 transition"
                          >
                            My Profile
                          </Link>

                          <Link
                            to="/orders"
                            className="block px-4 py-3 text-sm hover:bg-gray-100 transition"
                          >
                            My Orders
                          </Link>

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left hover:bg-gray-100 transition"
                          >
                            <LogOut size={16} />
                            Logout
                          </button>

                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-black transition-all duration-300 hover:scale-110"
                      aria-label="Login"
                    >
                      <User size={21} />
                    </Link>
                  )}
                </>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                className="relative text-gray-700 hover:text-black transition-all duration-300 hover:scale-110"
                aria-label="Shopping bag"
              >
                <ShoppingBag size={21} />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-black text-white text-[9px] rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* ================= MOBILE ACTIONS ================= */}
            <div className="flex lg:hidden items-center gap-4">

              {/* Mobile Cart */}
              <Link
                to="/cart"
                className="relative transition-transform duration-300 hover:scale-110"
                aria-label="Shopping bag"
              >
                <ShoppingBag size={21} />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-black text-white text-[9px] rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* ================= ANIMATED HAMBURGER ================= */}
              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen((previous) => !previous)
                }
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
                className="relative w-8 h-8 flex items-center justify-center"
              >
                <span
                  className={`absolute block w-6 h-[2px] bg-black transition-all duration-300 ease-in-out ${
                    mobileMenuOpen
                      ? "rotate-45"
                      : "-translate-y-2"
                  }`}
                />

                <span
                  className={`absolute block w-6 h-[2px] bg-black transition-all duration-300 ease-in-out ${
                    mobileMenuOpen
                      ? "opacity-0 translate-x-3"
                      : "opacity-100"
                  }`}
                />

                <span
                  className={`absolute block w-6 h-[2px] bg-black transition-all duration-300 ease-in-out ${
                    mobileMenuOpen
                      ? "-rotate-45"
                      : "translate-y-2"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ================= MOBILE MENU ================= */}
        <div
          className={`lg:hidden overflow-hidden bg-white border-t border-gray-200 transition-all duration-500 ease-in-out ${
            mobileMenuOpen
              ? "max-h-[700px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <nav className="px-6 py-5">

            {/* Main Navigation */}
            {navLinks.map((link, index) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={closeMobileMenu}
                style={{
                  transitionDelay: mobileMenuOpen
                    ? `${index * 70}ms`
                    : "0ms",
                }}
                className={({ isActive }) =>
                  `group flex items-center justify-between py-4 border-b border-gray-100 text-sm font-semibold tracking-[0.2em] transition-all duration-500 ${
                    mobileMenuOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-8 opacity-0"
                  } ${
                    isActive
                      ? "text-black"
                      : "text-gray-500"
                  }`
                }
              >
                <span>{link.name}</span>

                {/* Arrow animation */}
                <span className="text-lg transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </NavLink>
            ))}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              onClick={closeMobileMenu}
              style={{
                transitionDelay: mobileMenuOpen ? "280ms" : "0ms",
              }}
              className={`flex items-center justify-between py-4 border-b border-gray-100 text-sm font-semibold tracking-[0.15em] transition-all duration-500 ${
                mobileMenuOpen
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-8 opacity-0"
              }`}
            >
              <span className="flex items-center gap-3">
                <Heart size={19} />
                WISHLIST
              </span>

              {wishlist.length > 0 && (
                <span className="text-xs text-gray-500">
                  ({wishlist.length})
                </span>
              )}
            </Link>

            {/* Account Section */}
            {!loading && (
              <>
                {user ? (
                  <>
                    {/* Profile */}
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      style={{
                        transitionDelay: mobileMenuOpen
                          ? "350ms"
                          : "0ms",
                      }}
                      className={`flex items-center gap-3 py-4 border-b border-gray-100 text-sm font-semibold tracking-[0.15em] transition-all duration-500 ${
                        mobileMenuOpen
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-8 opacity-0"
                      }`}
                    >
                      <User size={19} />
                      {user.fullName}
                    </Link>

                    {/* Orders */}
                    <Link
                      to="/orders"
                      onClick={closeMobileMenu}
                      style={{
                        transitionDelay: mobileMenuOpen
                          ? "420ms"
                          : "0ms",
                      }}
                      className={`block py-4 border-b border-gray-100 text-sm font-semibold tracking-[0.15em] transition-all duration-500 ${
                        mobileMenuOpen
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-8 opacity-0"
                      }`}
                    >
                      MY ORDERS
                    </Link>

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        transitionDelay: mobileMenuOpen
                          ? "490ms"
                          : "0ms",
                      }}
                      className={`w-full flex items-center gap-3 py-4 text-sm font-semibold tracking-[0.15em] text-left transition-all duration-500 ${
                        mobileMenuOpen
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-8 opacity-0"
                      }`}
                    >
                      <LogOut size={19} />
                      LOGOUT
                    </button>
                  </>
                ) : (
                  /* Login */
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    style={{
                      transitionDelay: mobileMenuOpen
                        ? "350ms"
                        : "0ms",
                    }}
                    className={`flex items-center gap-3 py-4 text-sm font-semibold tracking-[0.15em] transition-all duration-500 ${
                      mobileMenuOpen
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-8 opacity-0"
                    }`}
                  >
                    <User size={19} />
                    LOGIN
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
};

export default Navbar;