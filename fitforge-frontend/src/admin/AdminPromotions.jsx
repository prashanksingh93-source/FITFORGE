import { useEffect, useState } from "react";
import {
  Edit,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";

import api from "../services/api";

const emptyForm = {
  title: "",
  subtitle: "",
  description: "",
  image: "",
  buttonText: "Shop Now",
  buttonLink: "/shop",
  type: "Banner",
  collection: "All",
  discountText: "",
  startDate: "",
  endDate: "",
  isActive: true,
  priority: 0,
};

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPromotions = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/admin/promotions"
      );

      setPromotions(
        response.data.promotions || []
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load promotions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const changeHandler = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (promotion) => {
    setEditingId(promotion._id);

    setForm({
      title: promotion.title || "",
      subtitle: promotion.subtitle || "",
      description: promotion.description || "",
      image: promotion.image || "",
      buttonText:
        promotion.buttonText || "Shop Now",
      buttonLink:
        promotion.buttonLink || "/shop",
      type: promotion.type || "Banner",
      collection:
        promotion.collection || "All",
      discountText:
        promotion.discountText || "",
      startDate: promotion.startDate
        ? new Date(promotion.startDate)
            .toISOString()
            .slice(0, 16)
        : "",
      endDate: promotion.endDate
        ? new Date(promotion.endDate)
            .toISOString()
            .slice(0, 16)
        : "",
      isActive:
        promotion.isActive ?? true,
      priority: promotion.priority || 0,
    });

    setShowForm(true);
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Promotion title is required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        priority: Number(form.priority) || 0,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };

      if (editingId) {
        await api.patch(
          `/admin/promotions/${editingId}`,
          payload
        );

        toast.success(
          "Promotion updated successfully"
        );
      } else {
        await api.post(
          "/admin/promotions",
          payload
        );

        toast.success(
          "Promotion created successfully"
        );
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      fetchPromotions();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to save promotion"
      );
    } finally {
      setSaving(false);
    }
  };

  const togglePromotion = async (id) => {
    try {
      await api.patch(
        `/admin/promotions/${id}/toggle`
      );

      toast.success("Promotion status updated");

      fetchPromotions();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update promotion"
      );
    }
  };

  const deletePromotion = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this promotion?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/admin/promotions/${id}`
      );

      toast.success("Promotion deleted");

      fetchPromotions();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete promotion"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-gray-500">
                FITFORGE ADMIN
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                Promotions
              </h1>

              <p className="mt-1 text-gray-500">
                Manage banners and promotional campaigns.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchPromotions}
                className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-100"
              >
                <RefreshCw size={17} />
                Refresh
              </button>

              <button
                onClick={openCreateForm}
                className="flex items-center gap-2 bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Plus size={17} />
                New Promotion
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {showForm && (
          <div className="mb-8 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingId
                  ? "Edit Promotion"
                  : "Create Promotion"}
              </h2>

              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="text-sm text-gray-500 hover:text-black"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={submitHandler}
              className="grid gap-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Title *
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={changeHandler}
                  placeholder="THE MOST ICONIC GYM WEAR"
                  className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Subtitle
                </label>

                <input
                  name="subtitle"
                  value={form.subtitle}
                  onChange={changeHandler}
                  placeholder="Signature Collection"
                  className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={changeHandler}
                  rows="3"
                  placeholder="Promotion description..."
                  className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Image URL
                </label>

                <input
                  name="image"
                  value={form.image}
                  onChange={changeHandler}
                  placeholder="https://..."
                  className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Button Text
                </label>

                <input
                  name="buttonText"
                  value={form.buttonText}
                  onChange={changeHandler}
                  className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Button Link
                </label>

                <input
                  name="buttonLink"
                  value={form.buttonLink}
                  onChange={changeHandler}
                  placeholder="/shop"
                  className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Type
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={changeHandler}
                  className="w-full border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                >
                  <option value="Hero">Hero</option>
                  <option value="Banner">Banner</option>
                  <option value="Popup">Popup</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Collection
                </label>

                <select
                  name="collection"
                  value={form.collection}
                  onChange={changeHandler}
                  className="w-full border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                >
                  <option value="All">All</option>
                  <option value="Performance">
                    Performance
                  </option>
                  <option value="Luxury">
                    Luxury
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Discount Text
                </label>

                <input
                  name="discountText"
                  value={form.discountText}
                  onChange={changeHandler}
                  placeholder="UP TO 30% OFF"
                  className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Priority
                </label>

                <input
                  name="priority"
                  type="number"
                  value={form.priority}
                  onChange={changeHandler}
                  className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Start Date
                </label>

                <input
                  name="startDate"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={changeHandler}
                  className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  End Date
                </label>

                <input
                  name="endDate"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={changeHandler}
                  className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <label className="flex items-center gap-3 md:col-span-2">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={changeHandler}
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium">
                  Promotion is active
                </span>
              </label>

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Promotion"
                      : "Create Promotion"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="border border-gray-300 px-6 py-3 text-sm font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center bg-white">
            <RefreshCw
              size={30}
              className="animate-spin"
            />
          </div>
        ) : promotions.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center bg-white">
            <ImageIcon
              size={50}
              className="text-gray-300"
            />

            <p className="mt-4 text-gray-500">
              No promotions created yet.
            </p>

            <button
              onClick={openCreateForm}
              className="mt-4 bg-black px-5 py-2.5 text-sm text-white"
            >
              Create Promotion
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promotion) => (
              <div
                key={promotion._id}
                className="overflow-hidden bg-white shadow-sm"
              >
                <div className="relative h-48 bg-gray-100">
                  {promotion.image ? (
                    <img
                      src={promotion.image}
                      alt={promotion.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon
                        size={45}
                        className="text-gray-300"
                      />
                    </div>
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                      promotion.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {promotion.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {promotion.type}
                      </p>

                      <h3 className="mt-1 text-lg font-bold">
                        {promotion.title}
                      </h3>
                    </div>

                    <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                      #{promotion.priority}
                    </span>
                  </div>

                  {promotion.subtitle && (
                    <p className="mt-2 text-sm text-gray-600">
                      {promotion.subtitle}
                    </p>
                  )}

                  {promotion.discountText && (
                    <p className="mt-3 text-sm font-bold">
                      {promotion.discountText}
                    </p>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    Collection:{" "}
                    {promotion.collection}
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() =>
                        togglePromotion(
                          promotion._id
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      {promotion.isActive ? (
                        <ToggleRight size={17} />
                      ) : (
                        <ToggleLeft size={17} />
                      )}

                      {promotion.isActive
                        ? "Disable"
                        : "Enable"}
                    </button>

                    <button
                      onClick={() =>
                        openEditForm(promotion)
                      }
                      className="flex items-center justify-center border border-gray-300 px-3 py-2 hover:bg-gray-100"
                    >
                      <Edit size={17} />
                    </button>

                    <button
                      onClick={() =>
                        deletePromotion(
                          promotion._id
                        )
                      }
                      className="flex items-center justify-center border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                    </button>
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

export default AdminPromotions;