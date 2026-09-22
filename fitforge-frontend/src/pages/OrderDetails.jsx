import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import api from "../services/api";

const statusSteps = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(
          `/orders/${id}`
        );

        if (response.data.success) {
          setOrder(response.data.order);
        }
      } catch (error) {
        console.error(
          "Fetch order details error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Order not found"
        );

        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const cancelOrder = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setCancelling(true);

      const response = await api.patch(
        `/orders/${id}/cancel`
      );

      if (response.data.success) {
        setOrder(response.data.order);
        toast.success(
          "Order cancelled successfully"
        );
      }
    } catch (error) {
      console.error(
        "Cancel order error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to cancel order"
      );
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const isCancelled =
    order.orderStatus === "Cancelled";

  const currentStep = statusSteps.indexOf(
    order.orderStatus
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm font-bold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO ORDERS
        </Link>

        <div className="mt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
              Order Details
            </p>

            <h1 className="text-3xl md:text-5xl font-black mt-2">
              {order.orderNumber}
            </h1>

            <p className="text-gray-500 mt-2">
              Placed on{" "}
              {formatDate(order.createdAt)}
            </p>
          </div>

          {isCancelled ? (
            <span className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-full bg-red-100 text-red-700 font-bold text-sm">
              <XCircle className="w-4 h-4" />
              CANCELLED
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-full bg-gray-100 text-gray-800 font-bold text-sm">
              <Package className="w-4 h-4" />
              {order.orderStatus}
            </span>
          )}
        </div>

        {!isCancelled && (
          <div className="border border-gray-200 rounded-2xl p-5 md:p-8 mt-8">
            <h2 className="text-xl font-black mb-8">
              ORDER STATUS
            </h2>

            <div className="relative">
              <div className="hidden md:block absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {statusSteps.map(
                  (status, index) => {
                    const completed =
                      index <= currentStep;

                    return (
                      <div
                        key={status}
                        className="relative flex flex-col items-center text-center"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 ${
                            completed
                              ? "bg-black text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {index === 0 && (
                            <Clock3 className="w-5 h-5" />
                          )}

                          {index === 1 && (
                            <CheckCircle2 className="w-5 h-5" />
                          )}

                          {index === 2 && (
                            <Package className="w-5 h-5" />
                          )}

                          {index === 3 && (
                            <Truck className="w-5 h-5" />
                          )}

                          {index === 4 && (
                            <CheckCircle2 className="w-5 h-5" />
                          )}
                        </div>

                        <p
                          className={`text-xs font-bold mt-3 ${
                            completed
                              ? "text-black"
                              : "text-gray-400"
                          }`}
                        >
                          {status}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="border border-gray-200 rounded-2xl p-5 md:p-8">
              <h2 className="text-xl font-black mb-6">
                ITEMS
              </h2>

              <div className="space-y-6">
                {order.items.map(
                  (item, index) => {
                    const image =
                      item.image ||
                      item.product?.images?.[0] ||
                      "https://via.placeholder.com/120x150?text=FITFORGE";

                    return (
                      <div
                        key={`${item.product?._id || item.product}-${index}`}
                        className="flex gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                      >
                        <div className="w-24 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-bold text-lg">
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

                          <div className="flex justify-between mt-4">
                            <span className="font-semibold">
                              ₹
                              {Number(
                                item.price
                              ).toLocaleString(
                                "en-IN"
                              )}{" "}
                              ×{" "}
                              {item.quantity}
                            </span>

                            <span className="font-black">
                              ₹
                              {(
                                Number(
                                  item.price
                                ) *
                                item.quantity
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>

            <section className="border border-gray-200 rounded-2xl p-5 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-5 h-5" />
                <h2 className="text-xl font-black">
                  SHIPPING ADDRESS
                </h2>
              </div>

              <div className="text-gray-600 space-y-1">
                <p className="font-bold text-black">
                  {
                    order.shippingAddress
                      .fullName
                  }
                </p>

                <p>
                  {
                    order.shippingAddress
                      .addressLine
                  }
                </p>

                <p>
                  {
                    order.shippingAddress
                      .city
                  }
                  ,{" "}
                  {
                    order.shippingAddress
                      .state
                  }{" "}
                  -{" "}
                  {
                    order.shippingAddress
                      .pincode
                  }
                </p>

                <p>
                  Phone:{" "}
                  {
                    order.shippingAddress
                      .phone
                  }
                </p>
              </div>
            </section>

            <section className="border border-gray-200 rounded-2xl p-5 md:p-8">
              <h2 className="text-xl font-black mb-5">
                PAYMENT
              </h2>

              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">
                    Payment Method
                  </p>

                  <p className="font-bold mt-1">
                    {order.paymentMethod}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Payment Status
                  </p>

                  <p className="font-bold mt-1">
                    {order.paymentStatus}
                  </p>
                </div>

                {order.paymentId && (
                  <div>
                    <p className="text-sm text-gray-500">
                      Payment ID
                    </p>

                    <p className="font-bold mt-1 break-all">
                      {order.paymentId}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside>
            <div className="border border-gray-200 rounded-2xl p-5 md:p-7 lg:sticky lg:top-24">
              <h2 className="text-xl font-black mb-6">
                ORDER SUMMARY
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    ₹
                    {Number(
                      order.subtotal
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="font-semibold">
                    {order.shippingFee === 0
                      ? "FREE"
                      : `₹${Number(
                          order.shippingFee
                        ).toLocaleString(
                          "en-IN"
                        )}`}
                  </span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount
                    </span>

                    <span className="font-semibold">
                      - ₹
                      {Number(
                        order.discount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-5 flex justify-between text-lg">
                  <span className="font-black">
                    Total
                  </span>

                  <span className="font-black">
                    ₹
                    {Number(
                      order.totalAmount
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-7 pt-6 border-t border-gray-200 text-xs text-gray-500">
                Last updated{" "}
                {formatDateTime(
                  order.updatedAt
                )}
              </div>

              {!isCancelled &&
                [
                  "Pending",
                  "Confirmed",
                ].includes(
                  order.orderStatus
                ) && (
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={cancelOrder}
                    className="w-full mt-6 flex items-center justify-center gap-2 border border-red-600 text-red-600 py-3 font-bold hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />

                    {cancelling
                      ? "CANCELLING..."
                      : "CANCEL ORDER"}
                  </button>
                )}

              <Link
                to="/shop"
                className="w-full mt-3 flex items-center justify-center border border-black py-3 font-bold hover:bg-black hover:text-white transition"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;