import React from "react";

import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingBag,
  Users,
  Megaphone,
  TicketPercent,
  Tags,
  Star,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

const AdminSidebar = ({
  mobileOpen = false,
  onClose,
}) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },

    {
      name: "Products",
      path: "/admin/products",
      icon: Package,
    },

    {
      name: "Inventory",
      path: "/admin/inventory",
      icon: Warehouse,
    },

    {
      name: "Orders",
      path: "/admin/orders",
      icon: ShoppingBag,
    },

    {
      name: "Customers",
      path: "/admin/customers",
      icon: Users,
    },

    {
      name: "Promotions",
      path: "/admin/promotions",
      icon: Megaphone,
    },

    {
      name: "Coupons",
      path: "/admin/coupons",
      icon: TicketPercent,
    },

    {
      name: "Categories",
      path: "/admin/categories",
      icon: Tags,
    },

    {
      name: "Reviews",
      path: "/admin/reviews",
      icon: Star,
    },

    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem(
      "fitforge-user"
    );

    localStorage.removeItem(
      "fitforge-token"
    );

    navigate("/admin/login");
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-64
          flex-col
          bg-black
          text-white
          transition-transform
          duration-300
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div>
            <h1 className="text-xl font-black tracking-widest">
              FITFORGE
            </h1>

            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-gray-400">
              Admin Panel
            </p>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            {menuItems.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={
                      item.path ===
                      "/admin"
                    }
                    onClick={onClose}
                    className={({
                      isActive,
                    }) =>
                      `
                      flex
                      items-center
                      gap-3
                      rounded-lg
                      px-4
                      py-3
                      text-sm
                      font-medium
                      transition
                      ${
                        isActive
                          ? "bg-white text-black"
                          : "text-gray-400 hover:bg-white/10 hover:text-white"
                      }
                    `
                    }
                  >
                    <Icon size={19} />

                    <span>
                      {item.name}
                    </span>
                  </NavLink>
                );
              }
            )}
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />

            <span>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;