import React, { useEffect, useState } from "react";
import {
  IndianRupee,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Sparkles,
  Tag,
  CreditCard,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/admin/dashboard");

        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Dashboard error:", error);

        if (error.response?.status === 401) {
          navigate("/admin/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await api.post("/auth/logout");

      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);

      // Even if the backend logout request fails,
      // remove the local authentication data if your
      // project stores any.
      localStorage.removeItem("admin");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("token");

      navigate("/admin/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
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
      value: `₹${Number(
        stats?.revenue || 0
      ).toLocaleString("en-IN")}`,
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
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
              FITFORGE ADMIN
            </p>

            <h1 className="mt-2 text-4xl font-black md:text-5xl">
              DASHBOARD
            </h1>

            <p className="mt-3 max-w-2xl text-gray-500">
              Manage your FITFORGE store, products, customers,
              orders, payments, inventory and homepage.
            </p>
          </div>

          {/* LOGOUT BUTTON */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={18} />

            {loggingOut ? "LOGGING OUT..." : "LOGOUT"}
          </button>
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
                    <p className="text-sm text-gray-500">
                      {card.title}
                    </p>

                    <p className="mt-2 text-3xl font-black">
                      {card.value}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* PAYMENT CONTROL */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <CreditCard size={18} />
              </div>

              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-gray-400">
                  RAZORPAY
                </p>

                <h2 className="text-xl font-black">
                  PAYMENT CONTROL
                </h2>
              </div>
            </div>

            <Link
              to="/admin/payments"
              className="inline-flex items-center justify-center gap-2 border border-black px-5 py-3 text-sm font-bold transition hover:bg-black hover:text-white"
            >
              <CreditCard size={17} />
              VIEW PAYMENTS
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Total Payments
              </p>

              <p className="mt-2 text-2xl font-black">
                {stats?.totalPayments || 0}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Captured Payments
              </p>

              <p className="mt-2 text-2xl font-black">
                {stats?.capturedPayments || 0}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Captured Revenue
              </p>

              <p className="mt-2 text-2xl font-black">
                ₹
                {Number(
                  stats?.paymentRevenue || 0
                ).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <Sparkles size={18} />
              </div>

              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-gray-400">
                  ADMIN CONTROL
                </p>

                <h2 className="text-xl font-black">
                  QUICK ACTIONS
                </h2>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                to="/admin/products"
                className="flex items-center gap-2 border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                <Package size={17} />
                PRODUCTS
              </Link>

              <Link
                to="/admin/orders"
                className="flex items-center gap-2 border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                <ShoppingCart size={17} />
                ORDERS
              </Link>

              <Link
                to="/admin/payments"
                className="flex items-center gap-2 border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                <CreditCard size={17} />
                PAYMENTS
              </Link>

              <Link
                to="/admin/customers"
                className="flex items-center gap-2 border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                <Users size={17} />
                CUSTOMERS
              </Link>

              <Link
                to="/admin/inventory"
                className="flex items-center gap-2 border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                <Package size={17} />
                INVENTORY
              </Link>

              <Link
                to="/admin/promotions"
                className="flex items-center gap-2 border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                <Sparkles size={17} />
                PROMOTIONS
              </Link>

              <Link
                to="/admin/homepage"
                className="flex items-center gap-2 border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                <Sparkles size={17} />
                HOMEPAGE
              </Link>

              <Link
                to="/admin/reviews"
                className="flex items-center gap-2 border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                REVIEWS
              </Link>

              <Link
                to="/admin/coupons"
                className="flex items-center gap-2 border border-gray-200 p-4 font-bold transition hover:bg-black hover:text-white"
              >
                <Tag size={17} />
                COUPONS
              </Link>
            </div>
          </div>

          {/* STORE CONTROL */}
          <div className="rounded-2xl bg-black p-7 text-white">
            <p className="text-xs tracking-[0.3em] text-gray-400">
              STORE CONTROL
            </p>

            <h2 className="mt-3 text-2xl font-black">
              MANAGE FITFORGE
            </h2>

            <p className="mt-3 leading-7 text-gray-400">
              Control products, orders, customers, payments,
              inventory, promotions and homepage content from
              the FITFORGE admin panel.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/admin/homepage"
                className="inline-flex items-center gap-2 border border-white px-5 py-3 text-sm font-bold transition hover:bg-white hover:text-black"
              >
                <Sparkles size={17} />
                EDIT HOMEPAGE
              </Link>

              <Link
                to="/admin/payments"
                className="inline-flex items-center gap-2 border border-white px-5 py-3 text-sm font-bold transition hover:bg-white hover:text-black"
              >
                <CreditCard size={17} />
                PAYMENTS
              </Link>
            </div>
          </div>
        </div>

        {/* LOW STOCK */}
        {Number(stats?.lowStockProducts || 0) > 0 && (
          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
              <AlertTriangle size={20} />
            </div>

            <div>
              <p className="font-black text-orange-900">
                LOW STOCK ALERT
              </p>

              <p className="mt-1 text-sm text-orange-700">
                {stats.lowStockProducts} product
                {stats.lowStockProducts === 1 ? "" : "s"} need
                stock attention.
              </p>
            </div>

            <Link
              to="/admin/inventory"
              className="ml-auto hidden border border-orange-300 px-4 py-2 text-sm font-bold text-orange-900 transition hover:bg-orange-500 hover:text-white sm:block"
            >
              VIEW INVENTORY
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

