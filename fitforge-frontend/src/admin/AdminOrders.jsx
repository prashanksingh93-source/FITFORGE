import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Search,
  Eye,
  ShoppingBag,
} from "lucide-react";

import { toast } from "sonner";

import api from "../services/api";

const AdminOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const params = {};

      if (status) {
        params.status = status;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const response =
        await api.get(
          "/admin/orders",
          {
            params,
          }
        );

      if (response.data.success) {
        setOrders(
          response.data.orders
        );
      }
    } catch (error) {
      console.error(
        "Admin orders error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const searchHandler = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const statusClass = (value) => {
    const classes = {
      Pending:
        "bg-yellow-100 text-yellow-700",
      Confirmed:
        "bg-blue-100 text-blue-700",
      Processing:
        "bg-purple-100 text-purple-700",
      Shipped:
        "bg-indigo-100 text-indigo-700",
      Delivered:
        "bg-green-100 text-green-700",
      Cancelled:
        "bg-red-100 text-red-700",
    };

    return (
      classes[value] ||
      "bg-gray-100 text-gray-700"
    );
  };

  const paymentClass = (value) => {
    const classes = {
      Paid:
        "bg-green-100 text-green-700",
      Pending:
        "bg-yellow-100 text-yellow-700",
      Failed:
        "bg-red-100 text-red-700",
      Refunded:
        "bg-purple-100 text-purple-700",
    };

    return (
      classes[value] ||
      "bg-gray-100 text-gray-700"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold tracking-[0.3em] text-gray-500">
            FITFORGE ADMIN
          </p>

          <h1 className="text-4xl font-black mt-2">
            ORDERS
          </h1>

          <p className="text-gray-500 mt-2">
            Manage customer orders and payments.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <form
            onSubmit={searchHandler}
            className="flex flex-col md:flex-row gap-3"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search order number, customer or email..."
                className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 outline-none focus:border-black"
              />
            </div>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-black"
            >
              <option value="">
                All Orders
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Confirmed">
                Confirmed
              </option>

              <option value="Processing">
                Processing
              </option>

              <option value="Shipped">
                Shipped
              </option>

              <option value="Delivered">
                Delivered
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>

            <button
              type="submit"
              className="bg-black text-white px-7 py-3 rounded-lg font-bold"
            >
              SEARCH
            </button>
          </form>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-500">
              Loading orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-400" />

            <h2 className="text-xl font-black mt-4">
              No orders found
            </h2>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-5 py-4">
                      ORDER
                    </th>

                    <th className="px-5 py-4">
                      CUSTOMER
                    </th>

                    <th className="px-5 py-4">
                      DATE
                    </th>

                    <th className="px-5 py-4">
                      TOTAL
                    </th>

                    <th className="px-5 py-4">
                      PAYMENT
                    </th>

                    <th className="px-5 py-4">
                      STATUS
                    </th>

                    <th className="px-5 py-4">
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map(
                    (order) => (
                      <tr
                        key={order._id}
                        className="border-b border-gray-100"
                      >
                        <td className="px-5 py-5">
                          <p className="font-bold">
                            {order.orderNumber}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {
                              order.items
                                ?.length
                            }{" "}
                            item
                            {order.items
                              ?.length !==
                            1
                              ? "s"
                              : ""}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-bold">
                            {order.user
                              ?.fullName ||
                              "Customer"}
                          </p>

                          <p className="text-sm text-gray-500">
                            {order.user
                              ?.email ||
                              ""}
                          </p>
                        </td>

                        <td className="px-5 py-5 text-sm text-gray-600">
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-black">
                            ₹
                            {Number(
                              order.totalAmount
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          <p className="text-xs text-gray-500">
                            {
                              order.paymentMethod
                            }
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${paymentClass(
                              order.paymentStatus
                            )}`}
                          >
                            {
                              order.paymentStatus
                            }
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${statusClass(
                              order.orderStatus
                            )}`}
                          >
                            {
                              order.orderStatus
                            }
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <button
                            onClick={() =>
                              navigate(
                                `/admin/orders/${order._id}`
                              )
                            }
                            className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;