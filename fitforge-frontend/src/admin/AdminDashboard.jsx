import React, { useEffect, useState } from "react";
import {
  IndianRupee,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

import api from "../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/admin/dashboard");

        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
          <p className="text-sm font-medium text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Products",
      value: stats?.totalProducts || 0,
      icon: Package,
    },
    {
      title: "Customers",
      value: stats?.totalCustomers || 0,
      icon: Users,
    },
    {
      title: "Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
    },
    {
      title: "Revenue",
      value: `₹${Number(stats?.revenue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: ShoppingCart,
    },
    {
      title: "Low Stock",
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
            FITFORGE ADMIN
          </p>

          <h1 className="mt-2 text-4xl font-black md:text-5xl">DASHBOARD</h1>

          <p className="mt-3 max-w-2xl text-gray-500">
            Manage your FITFORGE store, products, customers, orders, inventory
            and homepage.
          </p>
        </div>

        {/* STATS */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>

                    <p className="mt-2 text-3xl font-black">{card.value}</p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* QUICK ACTIONS + STORE CONTROL */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* QUICK ACTIONS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <Sparkles size={18} />
              </div>

              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-gray-400">
                  ADMIN CONTROL
                </p>

                <h2 className="text-xl font-black">QUICK ACTIONS</h2>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <a
                href="/admin/products"
                className="border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                PRODUCTS
              </a>

              <a
                href="/admin/orders"
                className="border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                ORDERS
              </a>

              <a
                href="/admin/customers"
                className="border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                CUSTOMERS
              </a>

              <a
                href="/admin/inventory"
                className="border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                INVENTORY
              </a>

              <a
                href="/admin/promotions"
                className="border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                PROMOTIONS
              </a>

              <a
                href="/admin/homepage"
                className="flex items-center gap-2 border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                <Sparkles size={17} />
                HOMEPAGE
              </a>

              <a
                href="/admin/reviews"
                className="border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                REVIEWS
              </a>
            </div>
          </div>

          {/* STORE CONTROL */}
          <div className="rounded-2xl bg-black p-7 text-white">
            <p className="text-xs tracking-[0.3em] text-gray-400">
              STORE CONTROL
            </p>

            <h2 className="mt-3 text-2xl font-black">MANAGE FITFORGE</h2>

            <p className="mt-3 leading-7 text-gray-400">
              Control products, orders, customers, inventory, promotions and
              homepage content from the FITFORGE admin panel.
            </p>

            <a
              href="/admin/homepage"
              className="mt-6 inline-flex items-center gap-2 border border-white px-5 py-3 text-sm font-bold transition hover:bg-white hover:text-black"
            >
              <Sparkles size={17} />
              EDIT HOMEPAGE
            </a>
          </div>
        </div>

        {/* LOW STOCK WARNING */}
        {Number(stats?.lowStockProducts || 0) > 0 && (
          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
              <AlertTriangle size={20} />
            </div>

            <div>
              <p className="font-black text-orange-900">LOW STOCK ALERT</p>

              <p className="mt-1 text-sm text-orange-700">
                {stats.lowStockProducts} product
                {stats.lowStockProducts === 1 ? "" : "s"} need stock attention.
              </p>
            </div>

            <a
              href="/admin/inventory"
              className="ml-auto hidden border border-orange-300 px-4 py-2 text-sm font-bold text-orange-900 transition hover:bg-orange-500 hover:text-white sm:block"
            >
              VIEW INVENTORY
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
