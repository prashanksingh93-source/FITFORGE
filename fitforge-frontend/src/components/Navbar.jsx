import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Heart,
  Menu,
  ShoppingBag,
  User,
  X,
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

            {/* Logo */}
            <Link
              to="/"
              className="text-2xl md:text-3xl font-black tracking-[0.18em]"
              onClick={closeMobileMenu}
            >
              FITFORGE
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `text-xs font-semibold tracking-widest transition ${
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

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-5">

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative text-gray-700 hover:text-black transition"
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
                        className="flex items-center gap-2 text-gray-700 hover:text-black"
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
                            className="block px-4 py-3 text-sm hover:bg-gray-100"
                          >
                            My Profile
                          </Link>

                          <Link
                            to="/orders"
                            className="block px-4 py-3 text-sm hover:bg-gray-100"
                          >
                            My Orders
                          </Link>

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left hover:bg-gray-100"
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
                      className="text-gray-700 hover:text-black transition"
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
                className="relative text-gray-700 hover:text-black transition"
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

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-4">

              <Link
                to="/cart"
                className="relative"
                aria-label="Shopping bag"
              >
                <ShoppingBag size={21} />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-black text-white text-[9px] rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen((previous) => !previous)
                }
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X size={24} />
                ) : (
                  <Menu size={24} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <nav className="px-6 py-6 space-y-1">

              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block py-4 text-sm font-semibold tracking-widest border-b border-gray-100 ${
                      isActive
                        ? "text-black"
                        : "text-gray-500"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <Link
                to="/wishlist"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 py-4 text-sm font-semibold border-b border-gray-100"
              >
                <Heart size={19} />

                Wishlist

                {wishlist.length > 0 && (
                  <span className="text-xs text-gray-500">
                    ({wishlist.length})
                  </span>
                )}
              </Link>

              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 py-4 text-sm font-semibold border-b border-gray-100"
                      >
                        <User size={19} />
                        {user.fullName}
                      </Link>

                      <Link
                        to="/orders"
                        onClick={closeMobileMenu}
                        className="block py-4 text-sm font-semibold border-b border-gray-100"
                      >
                        My Orders
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 py-4 text-sm font-semibold text-left"
                      >
                        <LogOut size={19} />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 py-4 text-sm font-semibold"
                    >
                      <User size={19} />
                      Login
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;

