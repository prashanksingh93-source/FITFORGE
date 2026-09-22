import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
} from "lucide-react";

import { toast } from "sonner";

import api from "../services/api";

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const response =
        await api.get(
          `/admin/orders/${id}`
        );

      if (response.data.success) {
        setOrder(
          response.data.order
        );
      }
    } catch (error) {
      console.error(
        "Order detail error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load order"
      );

      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const updateOrderStatus =
    async (newStatus) => {
      try {
        setSaving(true);

        const response =
          await api.patch(
            `/admin/orders/${id}/status`,
            {
              orderStatus: newStatus,
            }
          );

        if (response.data.success) {
          setOrder(
            response.data.order
          );

          toast.success(
            "Order status updated"
          );
        }
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Failed to update order"
        );
      } finally {
        setSaving(false);
      }
    };

  const updatePaymentStatus =
    async (newStatus) => {
      try {
        setSaving(true);

        const response =
          await api.patch(
            `/admin/orders/${id}/payment-status`,
            {
              paymentStatus:
                newStatus,
            }
          );

        if (response.data.success) {
          setOrder(
            response.data.order
          );

          toast.success(
            "Payment status updated"
          );
        }
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Failed to update payment"
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading order...
        </p>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/admin/orders"
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-black hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-gray-500">
              FITFORGE ADMIN
            </p>

            <h1 className="text-3xl md:text-4xl font-black mt-1">
              {order.orderNumber}
            </h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* CUSTOMER */}

            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <User className="w-5 h-5" />

                <h2 className="text-xl font-black">
                  CUSTOMER
                </h2>
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Name
                  </p>

                  <p className="font-bold mt-1">
                    {order.user
                      ?.fullName ||
                      "Customer"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Email
                  </p>

                  <p className="font-bold mt-1 break-all">
                    {order.user
                      ?.email || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Phone
                  </p>

                  <p className="font-bold mt-1">
                    {order.user
                      ?.phone || "-"}
                  </p>
                </div>
              </div>
            </section>

            {/* ITEMS */}

            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-5 h-5" />

                <h2 className="text-xl font-black">
                  ORDER ITEMS
                </h2>
              </div>

              <div className="space-y-5">
                {order.items?.map(
                  (item, index) => {
                    const image =
                      item.image ||
                      item.product
                        ?.images?.[0];

                    return (
                      <div
                        key={index}
                        className="flex gap-4 border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                      >
                        <div className="w-20 h-24 bg-gray-100 rounded overflow-hidden shrink-0">
                          {image ? (
                            <img
                              src={image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-black">
                            {item.name}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            ₹
                            {Number(
                              item.price
                            ).toLocaleString(
                              "en-IN"
                            )}{" "}
                            ×{" "}
                            {item.quantity}
                          </p>

                          {item.size && (
                            <p className="text-sm mt-2">
                              Size:{" "}
                              <b>
                                {item.size}
                              </b>
                            </p>
                          )}

                          {item.color && (
                            <p className="text-sm">
                              Color:{" "}
                              <b>
                                {item.color}
                              </b>
                            </p>
                          )}
                        </div>

                        <div className="font-black">
                          ₹
                          {Number(
                            item.price *
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
            </section>

            {/* SHIPPING */}

            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <MapPin className="w-5 h-5" />

                <h2 className="text-xl font-black">
                  SHIPPING ADDRESS
                </h2>
              </div>

              <div className="text-gray-700 leading-7">
                <p className="font-bold">
                  {
                    order.shippingAddress
                      ?.fullName
                  }
                </p>

                <p>
                  {
                    order.shippingAddress
                      ?.addressLine
                  }
                </p>

                <p>
                  {
                    order.shippingAddress
                      ?.city
                  }
                  ,{" "}
                  {
                    order.shippingAddress
                      ?.state
                  }{" "}
                  -{" "}
                  {
                    order.shippingAddress
                      ?.pincode
                  }
                </p>

                <p>
                  Phone:{" "}
                  {
                    order.shippingAddress
                      ?.phone
                  }
                </p>
              </div>
            </section>
          </div>

          {/* RIGHT SIDE */}

          <div className="space-y-6">
            {/* STATUS */}

            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-xl font-black mb-5">
                ORDER STATUS
              </h2>

              <select
                value={
                  order.orderStatus
                }
                disabled={
                  saving ||
                  order.orderStatus ===
                    "Cancelled"
                }
                onChange={(e) =>
                  updateOrderStatus(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-black font-bold"
              >
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

              {saving && (
                <p className="text-xs text-gray-500 mt-2">
                  Updating...
                </p>
              )}
            </section>

            {/* PAYMENT */}

            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <CreditCard className="w-5 h-5" />

                <h2 className="text-xl font-black">
                  PAYMENT
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Method
                  </p>

                  <p className="font-bold mt-1">
                    {
                      order.paymentMethod
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">
                    Payment Status
                  </p>

                  <select
                    value={
                      order.paymentStatus
                    }
                    disabled={saving}
                    onChange={(e) =>
                      updatePaymentStatus(
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-black"
                  >
                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Paid">
                      Paid
                    </option>

                    <option value="Failed">
                      Failed
                    </option>

                    <option value="Refunded">
                      Refunded
                    </option>
                  </select>
                </div>

                {order.paymentId && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      Payment ID
                    </p>

                    <p className="text-sm font-mono mt-1 break-all">
                      {
                        order.paymentId
                      }
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* SUMMARY */}

            <section className="bg-black text-white rounded-2xl p-6">
              <h2 className="text-xl font-black mb-6">
                ORDER SUMMARY
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">
                    Subtotal
                  </span>

                  <span>
                    ₹
                    {Number(
                      order.subtotal
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">
                    Shipping
                  </span>

                  <span>
                    {order.shippingFee ===
                    0
                      ? "FREE"
                      : `₹${Number(
                          order.shippingFee
                        ).toLocaleString(
                          "en-IN"
                        )}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">
                    Discount
                  </span>

                  <span>
                    -₹
                    {Number(
                      order.discount
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="border-t border-gray-700 pt-4 mt-4 flex justify-between text-lg">
                  <span className="font-bold">
                    TOTAL
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
            </section>

            <div className="text-sm text-gray-500">
              Order placed:{" "}
              {new Date(
                order.createdAt
              ).toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;