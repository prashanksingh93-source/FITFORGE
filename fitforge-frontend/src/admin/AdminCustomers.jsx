import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Search,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

import api from "../services/api";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/admin/customers",
        {
          params: {
            search,
            status,
          },
        }
      );

      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, status]);

  const updateCustomerStatus = async (
    customer
  ) => {
    try {
      await api.patch(
        `/admin/customers/${customer._id}/status`,
        {
          isBlocked: !customer.isBlocked,
        }
      );

      toast.success(
        customer.isBlocked
          ? "Customer unblocked successfully"
          : "Customer blocked successfully"
      );

      fetchCustomers();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update customer"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-gray-500">
                FITFORGE ADMIN
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                Customers
              </h1>

              <p className="mt-1 text-gray-500">
                Manage FITFORGE customers and accounts.
              </p>
            </div>

            <button
              onClick={fetchCustomers}
              className="flex items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-100"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* FILTERS */}

        <div className="flex flex-col gap-4 bg-white p-5 shadow-sm md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, email or phone..."
              className="w-full border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-black"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
          >
            <option value="">All Customers</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* TABLE */}

        <div className="mt-6 overflow-hidden bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <RefreshCw
                size={30}
                className="animate-spin"
              />
            </div>
          ) : customers.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center">
              <p className="text-gray-500">
                No customers found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-sm">
                    <th className="px-5 py-4 font-semibold">
                      Customer
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Phone
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Orders
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Total Spent
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer._id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      {/* CUSTOMER */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gray-200 font-semibold">
                            {customer.avatar ? (
                              <img
                                src={customer.avatar}
                                alt={customer.fullName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              customer.fullName
                                ?.charAt(0)
                                .toUpperCase()
                            )}
                          </div>

                          <div>
                            <p className="font-semibold">
                              {customer.fullName}
                            </p>

                            <p className="text-sm text-gray-500">
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PHONE */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {customer.phone || "—"}
                      </td>

                      {/* ORDERS */}

                      <td className="px-5 py-4 text-sm">
                        {customer.orderCount || 0}
                      </td>

                      {/* SPENT */}

                      <td className="px-5 py-4 text-sm font-semibold">
                        ₹
                        {Number(
                          customer.totalSpent || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            customer.isBlocked
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {customer.isBlocked
                            ? "Blocked"
                            : "Active"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/customers/${customer._id}`}
                            className="flex items-center gap-1 border border-gray-300 px-3 py-2 text-xs font-medium hover:bg-gray-100"
                          >
                            <Eye size={14} />
                            View
                          </Link>

                          <button
                            onClick={() =>
                              updateCustomerStatus(
                                customer
                              )
                            }
                            className={`flex items-center gap-1 px-3 py-2 text-xs font-medium ${
                              customer.isBlocked
                                ? "border border-green-300 text-green-700 hover:bg-green-50"
                                : "border border-red-300 text-red-700 hover:bg-red-50"
                            }`}
                          >
                            {customer.isBlocked ? (
                              <>
                                <UserCheck size={14} />
                                Unblock
                              </>
                            ) : (
                              <>
                                <UserX size={14} />
                                Block
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminCustomers;