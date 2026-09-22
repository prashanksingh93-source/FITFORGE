import React, { useEffect, useState } from "react";
import {
  IndianRupee,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
} from "lucide-react";

import api from "../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get(
          "/admin/dashboard"
        );

        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading dashboard...
        </p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-gray-500">
            FITFORGE ADMIN
          </p>

          <h1 className="text-4xl md:text-5xl font-black mt-2">
            DASHBOARD
          </h1>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="bg-white border border-gray-200 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {card.title}
                    </p>

                    <p className="text-3xl font-black mt-2">
                      {card.value}
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-7">
            <h2 className="text-xl font-black">
              QUICK ACTIONS
            </h2>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <a
                href="/admin/products"
                className="border border-gray-200 p-4 font-bold hover:bg-black hover:text-white transition"
              >
                PRODUCTS
              </a>

              <a
                href="/admin/orders"
                className="border border-gray-200 p-4 font-bold hover:bg-black hover:text-white transition"
              >
                ORDERS
              </a>

              <a
                href="/admin/customers"
                className="border border-gray-200 p-4 font-bold hover:bg-black hover:text-white transition"
              >
                CUSTOMERS
              </a>

              <a
                href="/admin/inventory"
                className="border border-gray-200 p-4 font-bold hover:bg-black hover:text-white transition"
              >
                INVENTORY
              </a>
            </div>
          </div>

          <div className="bg-black text-white rounded-2xl p-7">
            <p className="text-xs tracking-[0.3em] text-gray-400">
              STORE CONTROL
            </p>

            <h2 className="text-2xl font-black mt-3">
              MANAGE FITFORGE
            </h2>

            <p className="text-gray-400 mt-3">
              Control products, orders, customers,
              inventory and store operations from
              the admin panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;