import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  X,
  TicketPercent,
  CalendarDays,
  Percent,
  IndianRupee,
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const emptyForm = {
  code: "",
  description: "",
  discountType: "Percentage",
  discountValue: "",
  minimumOrderAmount: "",
  maximumDiscount: "",
  usageLimit: "",
  startDate: "",
  endDate: "",
  collection: "All",
  isActive: true,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/coupons", {
        params: { search },
      });

      setCoupons(response.data.coupons || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load coupons"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchCoupons, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const stats = useMemo(() => {
    return {
      total: coupons.length,
      active: coupons.filter((coupon) => coupon.isActive).length,
      inactive: coupons.filter((coupon) => !coupon.isActive).length,
      used: coupons.reduce(
        (total, coupon) => total + (coupon.usedCount || 0),
        0
      ),
    };
  }, [coupons]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setEditingId(coupon._id);

    setForm({
      code: coupon.code || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "Percentage",
      discountValue: coupon.discountValue ?? "",
      minimumOrderAmount: coupon.minimumOrderAmount ?? "",
      maximumDiscount: coupon.maximumDiscount ?? "",
      usageLimit: coupon.usageLimit ?? "",
      startDate: coupon.startDate
        ? coupon.startDate.slice(0, 10)
        : "",
      endDate: coupon.endDate
        ? coupon.endDate.slice(0, 10)
        : "",
      collection: coupon.collection || "All",
      isActive: coupon.isActive ?? true,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    if (!form.discountValue || Number(form.discountValue) <= 0) {
      toast.error("Enter a valid discount value");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minimumOrderAmount: Number(form.minimumOrderAmount || 0),
        maximumDiscount:
          form.maximumDiscount === ""
            ? null
            : Number(form.maximumDiscount),
        usageLimit:
          form.usageLimit === ""
            ? null
            : Number(form.usageLimit),
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        collection: form.collection,
        isActive: form.isActive,
      };

      if (editingId) {
        await api.patch(`/admin/coupons/${editingId}`, payload);
        toast.success("Coupon updated successfully");
      } else {
        await api.post("/admin/coupons", payload);
        toast.success("Coupon created successfully");
      }

      closeModal();
      fetchCoupons();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save coupon"
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleCoupon = async (id) => {
    try {
      await api.patch(`/admin/coupons/${id}/toggle`);
      toast.success("Coupon status updated");
      fetchCoupons();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update coupon"
      );
    }
  };

  const deleteCoupon = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coupon?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete coupon"
      );
    }
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === "Percentage") {
      return `${coupon.discountValue}%`;
    }

    return `₹${Number(coupon.discountValue).toLocaleString("en-IN")}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">
              Marketing
            </p>

            <h1 className="text-3xl font-black tracking-tight text-neutral-950">
              Coupons
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Create and manage discount codes for FITFORGE.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            <Plus size={18} />
            Create Coupon
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<TicketPercent size={20} />}
            label="Total Coupons"
            value={stats.total}
          />

          <StatCard
            icon={<Power size={20} />}
            label="Active"
            value={stats.active}
          />

          <StatCard
            icon={<Power size={20} />}
            label="Inactive"
            value={stats.inactive}
          />

          <StatCard
            icon={<TicketPercent size={20} />}
            label="Total Uses"
            value={stats.used}
          />
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search coupon code..."
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-black focus:bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Coupon
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Discount
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Minimum Order
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Usage
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Collection
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-16 text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-black" />
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-16 text-center text-sm text-neutral-500"
                    >
                      No coupons found.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <motion.tr
                      key={coupon._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-neutral-100 last:border-b-0"
                    >
                      <td className="px-5 py-5">
                        <div>
                          <p className="font-black tracking-wide text-neutral-950">
                            {coupon.code}
                          </p>

                          {coupon.description && (
                            <p className="mt-1 max-w-xs truncate text-xs text-neutral-500">
                              {coupon.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-bold">
                          {coupon.discountType === "Percentage" ? (
                            <Percent size={14} />
                          ) : (
                            <IndianRupee size={14} />
                          )}

                          {formatDiscount(coupon)}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-sm font-medium text-neutral-700">
                        ₹
                        {Number(
                          coupon.minimumOrderAmount || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-5 text-sm text-neutral-700">
                        <span className="font-bold">
                          {coupon.usedCount || 0}
                        </span>

                        {" / "}

                        {coupon.usageLimit ?? "∞"}
                      </td>

                      <td className="px-5 py-5">
                        <span className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-bold">
                          {coupon.collection}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <button
                          onClick={() => toggleCoupon(coupon._id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            coupon.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(coupon)}
                            className="rounded-lg border border-neutral-200 p-2 transition hover:bg-neutral-100"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => deleteCoupon(coupon._id)}
                            className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-black">
                  {editingId ? "Edit Coupon" : "Create Coupon"}
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  Configure your FITFORGE discount code.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 transition hover:bg-neutral-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Coupon Code">
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="FITFORGE10"
                    className="input"
                    required
                  />
                </Field>

                <Field label="Discount Type">
                  <select
                    name="discountType"
                    value={form.discountType}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed">Fixed Amount</option>
                  </select>
                </Field>

                <Field label="Discount Value">
                  <input
                    type="number"
                    min="0"
                    name="discountValue"
                    value={form.discountValue}
                    onChange={handleChange}
                    placeholder="10"
                    className="input"
                    required
                  />
                </Field>

                <Field label="Minimum Order Amount">
                  <input
                    type="number"
                    min="0"
                    name="minimumOrderAmount"
                    value={form.minimumOrderAmount}
                    onChange={handleChange}
                    placeholder="2000"
                    className="input"
                  />
                </Field>

                <Field label="Maximum Discount">
                  <input
                    type="number"
                    min="0"
                    name="maximumDiscount"
                    value={form.maximumDiscount}
                    onChange={handleChange}
                    placeholder="500"
                    className="input"
                  />
                </Field>

                <Field label="Usage Limit">
                  <input
                    type="number"
                    min="1"
                    name="usageLimit"
                    value={form.usageLimit}
                    onChange={handleChange}
                    placeholder="100"
                    className="input"
                  />
                </Field>

                <Field label="Start Date">
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    />

                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="input pl-10"
                    />
                  </div>
                </Field>

                <Field label="End Date">
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    />

                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="input pl-10"
                    />
                  </div>
                </Field>

                <Field label="Collection">
                  <select
                    name="collection"
                    value={form.collection}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="All">All Collections</option>
                    <option value="Performance">Performance</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="10% off on your next FITFORGE order"
                  rows="3"
                  className="input resize-none"
                />
              </Field>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4"
                />

                <div>
                  <p className="text-sm font-bold">
                    Coupon Active
                  </p>

                  <p className="text-xs text-neutral-500">
                    Customers can use this coupon when enabled.
                  </p>
                </div>
              </label>

              <div className="flex justify-end gap-3 border-t border-neutral-200 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-neutral-200 px-5 py-3 text-sm font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-black px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Coupon"
                    : "Create Coupon"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">
      {label}
    </label>

    {children}
  </div>
);

const StatCard = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
      {icon}
    </div>

    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
      {label}
    </p>

    <p className="mt-1 text-2xl font-black text-neutral-950">
      {value}
    </p>
  </div>
);

export default AdminCoupons;