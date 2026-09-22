import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Package, XCircle } from "lucide-react";
import { toast } from "sonner";

import api from "../services/api";

const statusClasses = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Processing: "bg-purple-100 text-purple-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/orders");

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);

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
  }, []);

  const cancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(orderId);

      const response = await api.patch(
        `/orders/${orderId}/cancel`
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");

        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  orderStatus: "Cancelled",
                }
              : order
          )
        );
      }
    } catch (error) {
      console.error("Cancel order error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to cancel order"
      );
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-gray-500 mb-3">
            FITFORGE
          </p>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            MY ORDERS
          </h1>

          <p className="mt-4 text-gray-500">
            Track and manage your FITFORGE orders.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {orders.length === 0 ? (
          <div className="border border-gray-200 rounded-2xl p-12 text-center">
            <Package className="w-14 h-14 mx-auto text-gray-300 mb-5" />

            <h2 className="text-2xl font-bold">
              No orders yet
            </h2>

            <p className="text-gray-500 mt-2 mb-7">
              Your completed orders will appear here.
            </p>

            <Link
              to="/shop"
              className="inline-flex items-center justify-center bg-black text-white px-7 py-3 font-bold tracking-wide hover:bg-gray-800 transition"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border border-gray-200 rounded-2xl overflow-hidden bg-white"
              >
                <div className="bg-gray-50 border-b border-gray-200 p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500">
                        Order Number
                      </p>

                      <h2 className="font-bold text-lg mt-1">
                        {order.orderNumber}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        Placed on{" "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          statusClasses[
                            order.orderStatus
                          ] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.orderStatus}
                      </span>

                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  <div className="space-y-5">
                    {order.items.map(
                      (item, index) => {
                        const image =
                          item.image ||
                          item.product?.images?.[0] ||
                          "https://via.placeholder.com/120x150?text=FITFORGE";

                        return (
                          <div
                            key={`${order._id}-${index}`}
                            className="flex gap-4"
                          >
                            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base sm:text-lg">
                                {item.name}
                              </h3>

                              <div className="text-sm text-gray-500 mt-2 space-y-1">
                                <p>
                                  Quantity:{" "}
                                  {item.quantity}
                                </p>

                                {item.size && (
                                  <p>
                                    Size:{" "}
                                    {item.size}
                                  </p>
                                )}

                                {item.color && (
                                  <p>
                                    Color:{" "}
                                    {item.color}
                                  </p>
                                )}
                              </div>

                              <p className="font-bold mt-3">
                                ₹
                                {Number(
                                  item.price
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            </div>

                            <div className="font-bold text-right">
                              ₹
                              {(
                                Number(
                                  item.price
                                ) *
                                item.quantity
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="border-t border-gray-200 mt-6 pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Subtotal
                        </p>

                        <p className="font-bold mt-1">
                          ₹
                          {Number(
                            order.subtotal
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Shipping
                        </p>

                        <p className="font-bold mt-1">
                          {order.shippingFee ===
                          0
                            ? "FREE"
                            : `₹${Number(
                                order.shippingFee
                              ).toLocaleString(
                                "en-IN"
                              )}`}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Discount
                        </p>

                        <p className="font-bold mt-1">
                          ₹
                          {Number(
                            order.discount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Total
                        </p>

                        <p className="font-black text-lg mt-1">
                          ₹
                          {Number(
                            order.totalAmount
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-7">
                    <Link
                      to={`/orders/${order._id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 border border-black px-5 py-3 font-bold hover:bg-black hover:text-white transition"
                    >
                      <Eye className="w-4 h-4" />
                      VIEW ORDER
                    </Link>

                    {[
                      "Pending",
                      "Confirmed",
                    ].includes(
                      order.orderStatus
                    ) && (
                      <button
                        type="button"
                        disabled={
                          cancellingId === order._id
                        }
                        onClick={() =>
                          cancelOrder(
                            order._id
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 border border-red-600 text-red-600 px-5 py-3 font-bold hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />

                        {cancellingId ===
                        order._id
                          ? "CANCELLING..."
                          : "CANCEL ORDER"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;