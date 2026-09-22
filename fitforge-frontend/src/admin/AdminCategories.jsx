import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Power,
  X,
  Layers3,
  Package,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import api from "../services/api";

const emptyForm = {
  name: "",
  description: "",
  image: "",
  isActive: true,
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status !== "all") {
        params.status = status;
      }

      const response = await api.get("/categories", {
        params,
      });

      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Categories error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status]);

  const stats = useMemo(() => {
    const total = categories.length;

    const active = categories.filter(
      (category) => category.isActive
    ).length;

    const inactive = categories.filter(
      (category) => !category.isActive
    ).length;

    const products = categories.reduce(
      (total, category) =>
        total + Number(category.productCount || 0),
      0
    );

    return {
      total,
      active,
      inactive,
      products,
    };
  }, [categories]);

  const openCreate = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCategory(null);
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

    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSaving(true);

      if (editingCategory) {
        await api.patch(
          `/categories/${editingCategory._id}`,
          form
        );

        toast.success("Category updated successfully");
      } else {
        await api.post("/categories", form);

        toast.success("Category created successfully");
      }

      closeModal();
      fetchCategories();
    } catch (error) {
      console.error("Save category error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to save category"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (category) => {
    try {
      await api.patch(
        `/categories/${category._id}/toggle`
      );

      toast.success(
        category.isActive
          ? "Category deactivated"
          : "Category activated"
      );

      fetchCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update category"
      );
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Delete "${category.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/categories/${category._id}`);

      toast.success("Category deleted successfully");

      fetchCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete category"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* HEADER */}
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-400">
              FITFORGE ADMIN
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              CATEGORIES
            </h1>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">
              ADD CATEGORY
            </span>
            <span className="sm:hidden">ADD</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Categories"
            value={stats.total}
            icon={Layers3}
          />

          <StatCard
            title="Active"
            value={stats.active}
            icon={CheckCircle2}
          />

          <StatCard
            title="Inactive"
            value={stats.inactive}
            icon={XCircle}
          />

          <StatCard
            title="Products Assigned"
            value={stats.products}
            icon={Package}
          />
        </div>

        {/* FILTERS */}
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm outline-none transition focus:border-black focus:bg-white"
              />
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none focus:border-black"
            >
              <option value="all">All Categories</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {loading ? (
            <LoadingState />
          ) : categories.length === 0 ? (
            <EmptyState onAdd={openCreate} />
          ) : (
            <div className="divide-y divide-neutral-100">
              {categories.map((category) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 transition hover:bg-neutral-50 sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* CATEGORY INFO */}
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-neutral-400">
                            <ImageIcon size={22} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-lg font-black">
                            {category.name}
                          </h2>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                              category.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-neutral-100 text-neutral-500"
                            }`}
                          >
                            {category.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        <p className="mt-1 text-xs font-medium text-neutral-400">
                          /{category.slug}
                        </p>

                        {category.description && (
                          <p className="mt-2 max-w-xl truncate text-sm text-neutral-500">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* PRODUCT COUNT */}
                    <div className="flex items-center gap-2 lg:min-w-32">
                      <Package
                        size={17}
                        className="text-neutral-400"
                      />

                      <div>
                        <p className="text-lg font-black">
                          {category.productCount || 0}
                        </p>

                        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                          Products
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggle(category)
                        }
                        title={
                          category.isActive
                            ? "Deactivate"
                            : "Activate"
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:bg-black hover:text-white"
                      >
                        <Power size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(category)
                        }
                        title="Edit"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:bg-black hover:text-white"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(category)
                        }
                        title="Delete"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 p-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
                    FITFORGE
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    {editingCategory
                      ? "EDIT CATEGORY"
                      : "NEW CATEGORY"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 transition hover:bg-black hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-6"
              >
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Category Name
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Example: T-Shirts"
                    className="h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe this category..."
                    className="w-full resize-none rounded-xl border border-neutral-200 p-4 text-sm outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Image URL
                  </label>

                  <input
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-black"
                  />
                </div>

                {form.image && (
                  <div className="overflow-hidden rounded-2xl border border-neutral-200">
                    <img
                      src={form.image}
                      alt="Category preview"
                      className="h-40 w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>
                )}

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-200 p-4">
                  <div>
                    <p className="text-sm font-bold">
                      Active Category
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      Active categories can be used by products.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-5 w-5 accent-black"
                  />
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-neutral-200 px-5 py-3 text-sm font-bold transition hover:bg-neutral-100"
                  >
                    CANCEL
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "SAVING..."
                      : editingCategory
                      ? "UPDATE CATEGORY"
                      : "CREATE CATEGORY"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="space-y-4 p-6">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex animate-pulse items-center gap-4"
        >
          <div className="h-16 w-16 rounded-2xl bg-neutral-200" />

          <div className="flex-1">
            <div className="h-4 w-40 rounded bg-neutral-200" />
            <div className="mt-2 h-3 w-64 rounded bg-neutral-100" />
          </div>

          <div className="h-10 w-24 rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
};

const EmptyState = ({ onAdd }) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
        <Layers3 size={26} className="text-neutral-400" />
      </div>

      <h3 className="mt-5 text-xl font-black">
        No categories found
      </h3>

      <p className="mt-2 max-w-md text-sm text-neutral-500">
        Create your first product category to organize
        the FITFORGE store.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-6 flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white"
      >
        <Plus size={17} />
        ADD CATEGORY
      </button>
    </div>
  );
};

export default AdminCategories;