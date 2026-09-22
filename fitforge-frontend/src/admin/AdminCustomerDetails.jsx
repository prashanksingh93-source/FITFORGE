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
  User,
  ShoppingBag,
} from "lucide-react";

import { toast } from "sonner";

import api from "../services/api";

const AdminCustomerDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [customer, setCustomer] =
    useState(null);

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const fetchCustomer = async () => {
    try {
      setLoading(true);

      const response =
        await api.get(
          `/admin/customers/${id}`
        );

      if (response.data.success) {
        setCustomer(
          response.data.customer
        );

        setOrders(
          response.data.orders
        );
      }
    } catch (error) {
      console.error(
        "Customer details error:",
        error
      );

      toast.error(
        error.response?.data
          ?.message ||
          "Failed to load customer"
      );

      navigate("/admin/customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const toggleBlock = async () => {
    try {
      const response =
        await api.patch(
          `/admin/customers/${id}/status`,
          {
            isBlocked:
              !customer.isBlocked,
          }
        );

      if (response.data.success) {
        setCustomer(
          (current) => ({
            ...current,
            isBlocked:
              !current.isBlocked,
          })
        );

        toast.success(
          response.data.message
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Failed to update customer"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading customer...
        </p>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* HEADER */}

        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/admin/customers"
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-black hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-gray-500">
              FITFORGE ADMIN
            </p>

            <h1 className="text-3xl md:text-4xl font-black mt-1">
              CUSTOMER DETAILS
            </h1>
          </div>
        </div>

        {/* CUSTOMER PROFILE */}

        <div className="grid lg:grid-cols-3 gap-6 mb-6">

          <section className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">

            <div className="flex flex-col sm:flex-row sm:items-center gap-5">

              <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-3xl font-black">
                {customer.fullName
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-black">
                  {customer.fullName}
                </h2>

                <p className="text-gray-500 mt-1">
                  {customer.email}
                </p>

                <p className="text-gray-500">
                  {customer.phone ||
                    "No phone number"}
                </p>
              </div>

              <span
                className={`text-xs font-bold px-3 py-2 rounded-full ${
                  customer.isBlocked
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {customer.isBlocked
                  ? "BLOCKED"
                  : "ACTIVE"}
              </span>

            </div>

            <div className="grid sm:grid-cols-3 gap-5 mt-8 pt-6 border-t border-gray-100">

              <div>
                <p className="text-xs text-gray-500 uppercase">
                  Orders
                </p>

                <p className="text-2xl font-black mt-1">
                  {
                    customer.orderCount
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">
                  Total Spent
                </p>

                <p className="text-2xl font-black mt-1">
                  ₹
                  {Number(
                    customer.totalSpent ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">
                  Joined
                </p>

                <p className="font-bold mt-2">
                  {new Date(
                    customer.createdAt
                  ).toLocaleDateString(
                    "en-IN"
                  )}
                </p>
              </div>

            </div>
          </section>

          {/* ACTION */}

          <section className="bg-black text-white rounded-2xl p-6">
            <User className="w-7 h-7 mb-5" />

            <h2 className="text-xl font-black">
              CUSTOMER CONTROL
            </h2>

            <p className="text-gray-400 text-sm mt-2">
              Manage access to this customer's
              account.
            </p>

            <button
              onClick={toggleBlock}
              className={`w-full mt-6 py-3 font-black ${
                customer.isBlocked
                  ? "bg-green-500 text-black hover:bg-green-400"
                  : "bg-red-500 text-white hover:bg-red-400"
              }`}
            >
              {customer.isBlocked
                ? "UNBLOCK CUSTOMER"
                : "BLOCK CUSTOMER"}
            </button>
          </section>

        </div>

        {/* ADDRESSES */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-black mb-5">
            SAVED ADDRESSES
          </h2>

          {customer.addresses?.length ===
          0 ? (
            <p className="text-gray-500">
              No saved addresses.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {customer.addresses?.map(
                (address) => (
                  <div
                    key={address._id}
                    className="border border-gray-200 rounded-xl p-5"
                  >
                    <p className="font-black">
                      {
                        address.fullName
                      }
                    </p>

                    <p className="text-sm text-gray-600 mt-2">
                      {
                        address.addressLine
                      }
                    </p>

                    <p className="text-sm text-gray-600">
                      {address.city},{" "}
                      {address.state} -{" "}
                      {address.pincode}
                    </p>

                    <p className="text-sm text-gray-600">
                      Phone:{" "}
                      {address.phone}
                    </p>

                    {address.isDefault && (
                      <span className="inline-block mt-3 text-xs font-bold bg-black text-white px-3 py-1 rounded-full">
                        DEFAULT
                      </span>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* ORDER HISTORY */}

        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <ShoppingBag className="w-5 h-5" />

            <h2 className="text-xl font-black">
              ORDER HISTORY
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500">
                This customer has no orders.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4">
                      ORDER
                    </th>

                    <th className="px-6 py-4">
                      DATE
                    </th>

                    <th className="px-6 py-4">
                      TOTAL
                    </th>

                    <th className="px-6 py-4">
                      STATUS
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map(
                    (order) => (
                      <tr
                        key={
                          order._id
                        }
                        className="border-t border-gray-100"
                      >
                        <td className="px-6 py-5 font-bold">
                          {order.orderNumber}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-500">
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-6 py-5 font-black">
                          ₹
                          {Number(
                            order.totalAmount
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100">
                            {
                              order.orderStatus
                            }
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>

              </table>
            </div>
          )}

        </section>

      </div>
    </div>
  );
};

export default AdminCustomerDetails;