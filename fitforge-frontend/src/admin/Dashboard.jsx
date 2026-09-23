import React, {
  useEffect,
  useState,
} from "react";

import {
  Package,
  ShoppingBag,
  Users,
  IndianRupee,
  Clock3,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  getDashboardStats,
} from "../services/adminService";

const Dashboard = () => {
  const [
    dashboard,
    setDashboard,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const loadDashboard =
    async () => {
      try {
        setLoading(true);

        setError("");

        const data =
          await getDashboardStats();

        if (!data.success) {
          throw new Error(
            data.message ||
              "Failed to load dashboard"
          );
        }

        setDashboard(data);
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadDashboard();
  }, []);

  /*
  ================================================
  LOADING
  ================================================
  */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2
            size={24}
            className="animate-spin"
          />

          <span>
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  /*
  ================================================
  ERROR
  ================================================
  */

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <XCircle
            className="mt-0.5 text-red-500"
            size={22}
          />

          <div className="flex-1">
            <h2 className="font-semibold text-red-800">
              Unable to load dashboard
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

            <button
              onClick={
                loadDashboard
              }
              className="mt-4 flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
            >
              <RefreshCw size={16} />

              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats =
    dashboard?.stats || {};

  /*
  ================================================
  STAT CARDS
  ================================================
  */

  const statCards = [
    {
      title: "Total Products",
      value:
        stats.totalProducts || 0,
      icon: Package,
    },

    {
      title: "Total Orders",
      value:
        stats.totalOrders || 0,
      icon: ShoppingBag,
    },

    {
      title: "Total Customers",
      value:
        stats.totalCustomers || 0,
      icon: Users,
    },

    {
      title: "Total Revenue",
      value: `₹${Number(
        stats.totalRevenue || 0
      ).toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor your FITFORGE store.
          </p>
        </div>

        <button
          onClick={
            loadDashboard
          }
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <RefreshCw size={16} />

          Refresh
        </button>
      </div>

      {/* MAIN STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(
          (card) => {
            const Icon =
              card.icon;

            return (
              <div
                key={card.title}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {card.title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-100 p-3">
                    <Icon
                      size={22}
                      className="text-gray-700"
                    />
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* ORDER STATUS */}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Order Overview
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          <StatusCard
            title="Pending"
            value={
              stats.pendingOrders ||
              0
            }
            icon={Clock3}
          />

          <StatusCard
            title="Processing"
            value={
              stats.processingOrders ||
              0
            }
            icon={Package}
          />

          <StatusCard
            title="Shipped"
            value={
              stats.shippedOrders ||
              0
            }
            icon={Truck}
          />

          <StatusCard
            title="Delivered"
            value={
              stats.deliveredOrders ||
              0
            }
            icon={CheckCircle}
          />

          <StatusCard
            title="Cancelled"
            value={
              stats.cancelledOrders ||
              0
            }
            icon={XCircle}
          />
        </div>
      </div>

      {/* INVENTORY */}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Inventory Overview
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <InventoryCard
            title="Low Stock"
            value={
              stats.lowStockProducts ||
              0
            }
            icon={AlertTriangle}
          />

          <InventoryCard
            title="Out of Stock"
            value={
              stats.outOfStockProducts ||
              0
            }
            icon={Ban}
          />

          <InventoryCard
            title="Active Products"
            value={
              stats.totalProducts ||
              0
            }
            icon={Package}
          />
        </div>
      </div>

      {/* RECENT ORDERS */}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">
            Recent Orders
          </h2>
        </div>

        {dashboard?.recentOrders
          ?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">
                    Order
                  </th>

                  <th className="px-5 py-3">
                    Customer
                  </th>

                  <th className="px-5 py-3">
                    Amount
                  </th>

                  <th className="px-5 py-3">
                    Payment
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {dashboard.recentOrders.map(
                  (order) => (
                    <tr
                      key={
                        order._id
                      }
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 font-medium">
                        {order.orderNumber ||
                          order._id.slice(
                            -8
                          )}
                      </td>

                      <td className="px-5 py-4">
                        {order.user
                          ?.name ||
                          order.user
                            ?.fullName ||
                          order.user
                            ?.email ||
                          "Customer"}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        ₹
                        {Number(
                          order.totalAmount ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium">
                          {order.paymentStatus ||
                            "Pending"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium">
                          {order.orderStatus ||
                            "Pending"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-gray-500">
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-gray-500">
            No orders yet.
          </div>
        )}
      </div>

      {/* TWO COLUMN SECTION */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* RECENT CUSTOMERS */}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900">
              Recent Customers
            </h2>
          </div>

          {dashboard
            ?.recentCustomers
            ?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {dashboard.recentCustomers.map(
                (customer) => (
                  <div
                    key={
                      customer._id
                    }
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {customer.name ||
                          customer.fullName ||
                          "Customer"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {customer.email}
                      </p>
                    </div>

                    <p className="text-xs text-gray-400">
                      {customer.createdAt
                        ? new Date(
                            customer.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "-"}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-gray-500">
              No customers yet.
            </div>
          )}
        </div>

        {/* TOP PRODUCTS */}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900">
              Top Selling Products
            </h2>
          </div>

          {dashboard
            ?.topSellingProducts
            ?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {dashboard.topSellingProducts.map(
                (product, index) => (
                  <div
                    key={
                      product._id ||
                      index
                    }
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">
                          {
                            product.productName
                          }
                        </p>

                        <p className="text-sm text-gray-500">
                          {
                            product.totalQuantity
                          }{" "}
                          sold
                        </p>
                      </div>
                    </div>

                    <p className="font-semibold">
                      ₹
                      {Number(
                        product.totalRevenue ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-gray-500">
              No sales data yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


/*
====================================================
STATUS CARD
====================================================
*/

const StatusCard = ({
  title,
  value,
  icon: Icon,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-gray-100 p-2">
          <Icon size={18} />
        </div>

        <div>
          <p className="text-xs text-gray-500">
            {title}
          </p>

          <p className="text-xl font-bold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};


/*
====================================================
INVENTORY CARD
====================================================
*/

const InventoryCard = ({
  title,
  value,
  icon: Icon,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {value}
          </p>
        </div>

        <div className="rounded-lg bg-gray-100 p-3">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;