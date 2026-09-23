import React from "react";
import { NavLink } from "react-router-dom";
import { CreditCard } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  Megaphone,
  Tag,
  Star,
  Home,
  FolderTree,
  X,
} from "lucide-react";

const AdminSidebar = ({ isOpen = true, onClose }) => {
  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Products",
      path: "/admin/products",
      icon: Package,
    },
    {
      label: "Categories",
      path: "/admin/categories",
      icon: FolderTree,
    },
    {
      label: "Inventory",
      path: "/admin/inventory",
      icon: Warehouse,
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      label: "Payments",
      path: "/admin/payments",
      icon: CreditCard,
    },
    {
      label: "Customers",
      path: "/admin/customers",
      icon: Users,
    },
    {
      label: "Promotions",
      path: "/admin/promotions",
      icon: Megaphone,
    },
    {
      label: "Coupons",
      path: "/admin/coupons",
      icon: Tag,
    },
    {
      label: "Reviews",
      path: "/admin/reviews",
      icon: Star,
    },
    {
      label: "Homepage",
      path: "/admin/homepage",
      icon: Home,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-64 flex-col
          border-r border-gray-200 bg-white
          transition-transform duration-300
          lg:static lg:z-auto lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between border-b border-gray-200 px-5">
          <NavLink
            to="/admin"
            className="text-2xl font-black tracking-tight text-black"
            onClick={onClose}
          >
            FITFORGE
          </NavLink>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-black lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                    group flex items-center gap-3 rounded-xl
                    px-4 py-3 text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-black text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-black"
                    }
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />

                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              FITFORGE
            </p>

            <p className="mt-1 text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
