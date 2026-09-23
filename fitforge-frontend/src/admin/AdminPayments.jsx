import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  IndianRupee,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    totalPayments: 0,
    capturedPayments: 0,
    failedPayments: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page,
        limit: 20,
      });

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (status) {
        params.append("status", status);
      }

      const response = await api.get(
        `/admin/payments?${params.toString()}`
      );

      if (response.data?.success) {
        setPayments(response.data.payments || []);
        setSummary(
          response.data.summary || {
            totalPayments: 0,
            capturedPayments: 0,
            failedPayments: 0,
            totalRevenue: 0,
          }
        );

        setPagination(
          response.data.pagination || {
            page: 1,
            pages: 1,
            total: 0,
          }
        );
      }
    } catch (error) {
      console.error("FETCH ADMIN PAYMENTS ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load payments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, status]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    fetchPayments();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (paymentStatus) => {
    switch (paymentStatus) {
      case "captured":
        return "bg-green-100 text-green-700";

      case "authorized":
        return "bg-blue-100 text-blue-700";

      case "failed":
        return "bg-red-100 text-red-700";

      case "refunded":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusIcon = (paymentStatus) => {
    switch (paymentStatus) {
      case "captured":
        return <CheckCircle size={14} />;

      case "failed":
        return <XCircle size={14} />;

      default:
        return <Clock size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-black p-3 text-white">
              <CreditCard size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Payments
              </h1>

              <p className="text-sm text-gray-500">
                Monitor Razorpay payments and transactions
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchPayments}
          className="flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Total Payments
            </span>

            <div className="rounded-lg bg-gray-100 p-2">
              <CreditCard size={18} />
            </div>
          </div>

          <p className="text-2xl font-bold">
            {summary.totalPayments}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Captured
            </span>

            <div className="rounded-lg bg-green-100 p-2 text-green-600">
              <CheckCircle size={18} />
            </div>
          </div>

          <p className="text-2xl font-bold text-green-600">
            {summary.capturedPayments}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Failed
            </span>

            <div className="rounded-lg bg-red-100 p-2 text-red-600">
              <XCircle size={18} />
            </div>
          </div>

          <p className="text-2xl font-bold text-red-600">
            {summary.failedPayments}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Captured Revenue
            </span>

            <div className="rounded-lg bg-green-100 p-2 text-green-600">
              <IndianRupee size={18} />
            </div>
          </div>

          <p className="text-2xl font-bold">
            {formatCurrency(summary.totalRevenue)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border bg-white p-4 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 md:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Razorpay order/payment ID..."
              className="w-full rounded-lg border px-10 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
          >
            <option value="">All Statuses</option>
            <option value="created">Created</option>
            <option value="authorized">Authorized</option>
            <option value="captured">Captured</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <RefreshCw
              size={28}
              className="animate-spin text-gray-500"
            />
          </div>
        ) : payments.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
            <CreditCard
              size={45}
              className="mb-3 text-gray-300"
            />

            <h3 className="font-semibold text-gray-700">
              No payments found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Payment transactions will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                      Order
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                      Method
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(payment.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {payment.user?.name || "Unknown"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {payment.user?.email || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {payment.order?.orderNumber ||
                            payment.order?._id ||
                            "—"}
                        </p>

                        <p className="max-w-[180px] truncate text-xs text-gray-500">
                          {payment.razorpayOrderId}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {formatCurrency(payment.amount)}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {payment.method || "Razorpay"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(
                            payment.status
                          )}`}
                        >
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedPayment(payment)
                          }
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-100"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of{" "}
                {pagination.pages || 1} ·{" "}
                {pagination.total || 0} payments
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(current - 1, 1)
                    )
                  }
                  className="rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  disabled={
                    page >= (pagination.pages || 1)
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        current + 1,
                        pagination.pages || 1
                      )
                    )
                  }
                  className="rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold">
                  Payment Details
                </h2>

                <p className="text-sm text-gray-500">
                  {selectedPayment.razorpayPaymentId ||
                    "Payment transaction"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">
                  Payment ID
                </p>

                <p className="mt-1 break-all text-sm font-medium">
                  {selectedPayment.razorpayPaymentId ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Razorpay Order ID
                </p>

                <p className="mt-1 break-all text-sm font-medium">
                  {selectedPayment.razorpayOrderId ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Amount
                </p>

                <p className="mt-1 text-lg font-bold">
                  {formatCurrency(selectedPayment.amount)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Status
                </p>

                <span
                  className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(
                    selectedPayment.status
                  )}`}
                >
                  {getStatusIcon(selectedPayment.status)}
                  {selectedPayment.status}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Customer
                </p>

                <p className="mt-1 text-sm font-medium">
                  {selectedPayment.user?.name || "—"}
                </p>

                <p className="text-xs text-gray-500">
                  {selectedPayment.user?.email || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Payment Method
                </p>

                <p className="mt-1 text-sm font-medium">
                  {selectedPayment.method || "Razorpay"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Order
                </p>

                <p className="mt-1 text-sm font-medium">
                  {selectedPayment.order?.orderNumber ||
                    selectedPayment.order?._id ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Created
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formatDate(
                    selectedPayment.createdAt
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;

