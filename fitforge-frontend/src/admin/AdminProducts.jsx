import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Layers3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

import api from "../services/api";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [collection, setCollection] = useState("all");
  const [category, setCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/products", {
        params: {
          search: search.trim() || undefined,
          collection:
            collection !== "all"
              ? collection
              : undefined,
          category:
            category !== "all"
              ? category
              : undefined,
        },
      });

      if (response.data.success) {
        let result = response.data.products || [];

        if (stockStatus === "out") {
          result = result.filter(
            (product) => Number(product.stock) === 0
          );
        }

        if (stockStatus === "low") {
          result = result.filter(
            (product) =>
              Number(product.stock) > 0 &&
              Number(product.stock) <=
                Number(product.lowStockThreshold || 5)
          );
        }

        if (stockStatus === "in") {
          result = result.filter(
            (product) =>
              Number(product.stock) >
              Number(product.lowStockThreshold || 5)
          );
        }

        setProducts(result);
      }
    } catch (error) {
      console.error("Products error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get(
        "/categories/active"
      );

      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Categories error:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [
    search,
    collection,
    category,
    stockStatus,
  ]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const stats = useMemo(() => {
    const total = products.length;

    const active = products.filter(
      (product) => product.isActive
    ).length;

    const outOfStock = products.filter(
      (product) => Number(product.stock) === 0
    ).length;

    const lowStock = products.filter(
      (product) =>
        Number(product.stock) > 0 &&
        Number(product.stock) <=
          Number(product.lowStockThreshold || 5)
    ).length;

    const inventoryValue = products.reduce(
      (total, product) =>
        total +
        Number(product.price || 0) *
          Number(product.stock || 0),
      0
    );

    return {
      total,
      active,
      outOfStock,
      lowStock,
      inventoryValue,
    };
  }, [products]);

  const handleToggle = async (product) => {
    try {
      await api.patch(
        `/admin/products/${product._id}/toggle`
      );

      toast.success(
        product.isActive
          ? "Product deactivated"
          : "Product activated"
      );

      fetchProducts();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update product"
      );
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/admin/products/${product._id}`
      );

      toast.success("Product deleted successfully");

      fetchProducts();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete product"
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

            <h1 className="mt-1 text-2xl font-black sm:text-3xl">
              PRODUCTS
            </h1>
          </div>

          <Link
            to="/admin/products/add"
            className="flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            <Plus size={18} />

            <span className="hidden sm:inline">
              ADD PRODUCT
            </span>

            <span className="sm:hidden">ADD</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Products"
            value={stats.total}
            icon={Package}
          />

          <StatCard
            title="Active"
            value={stats.active}
            icon={CheckCircle2}
          />

          <StatCard
            title="Low Stock"
            value={stats.lowStock}
            icon={AlertTriangle}
          />

          <StatCard
            title="Out of Stock"
            value={stats.outOfStock}
            icon={XCircle}
          />

          <StatCard
            title="Inventory Value"
            value={`₹${stats.inventoryValue.toLocaleString(
              "en-IN"
            )}`}
            icon={IndianRupee}
          />
        </div>

        {/* FILTERS */}
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-4">
            <div className="relative lg:col-span-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm outline-none transition focus:border-black focus:bg-white"
              />
            </div>

            <select
              value={collection}
              onChange={(event) =>
                setCollection(event.target.value)
              }
              className="h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none focus:border-black"
            >
              <option value="all">
                All Collections
              </option>

              <option value="Performance">
                Performance
              </option>

              <option value="Luxury">
                Luxury
              </option>
            </select>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none focus:border-black"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={stockStatus}
              onChange={(event) =>
                setStockStatus(event.target.value)
              }
              className="h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none focus:border-black"
            >
              <option value="all">
                All Stock
              </option>

              <option value="in">
                In Stock
              </option>

              <option value="low">
                Low Stock
              </option>

              <option value="out">
                Out of Stock
              </option>
            </select>
          </div>
        </div>

        {/* PRODUCT LIST */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {loading ? (
            <LoadingState />
          ) : products.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-neutral-100">
              {products.map((product) => (
                <ProductRow
                  key={product._id}
                  product={product}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductRow = ({
  product,
  onToggle,
  onDelete,
}) => {
  const stock = Number(product.stock || 0);

  const threshold = Number(
    product.lowStockThreshold || 5
  );

  const isOut = stock === 0;
  const isLow = stock > 0 && stock <= threshold;

  const image =
    product.images?.[0] ||
    "";

  const categoryName =
    product.category?.name ||
    "Uncategorized";

  const currentPrice =
    product.salePrice !== null &&
    product.salePrice !== undefined
      ? product.salePrice
      : product.price;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-5 transition hover:bg-neutral-50 sm:p-6"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

        {/* IMAGE */}
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-400">
              <Package size={26} />
            </div>
          )}
        </div>

        {/* PRODUCT */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black">
              {product.name}
            </h2>

            {product.isActive ? (
              <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase text-green-700">
                Active
              </span>
            ) : (
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase text-neutral-500">
                Inactive
              </span>
            )}

            {product.collection && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase text-neutral-600">
                {product.collection}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
            <span>
              {categoryName}
            </span>

            <span>
              {product.gender}
            </span>

            {product.sku && (
              <span>
                SKU: {product.sku}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div>
              <span className="text-lg font-black">
                ₹
                {Number(
                  currentPrice
                ).toLocaleString("en-IN")}
              </span>

              {product.salePrice !== null &&
                product.salePrice !== undefined && (
                  <span className="ml-2 text-sm text-neutral-400 line-through">
                    ₹
                    {Number(
                      product.price
                    ).toLocaleString("en-IN")}
                  </span>
                )}
            </div>

            <StockBadge
              stock={stock}
              isOut={isOut}
              isLow={isLow}
            />
          </div>
        </div>

        {/* BADGES */}
        <div className="hidden min-w-40 flex-wrap gap-2 xl:flex">
          {product.badges?.slice(0, 2).map(
            (badge) => (
              <span
                key={badge}
                className="rounded-full border border-neutral-200 px-3 py-1 text-[10px] font-bold uppercase"
              >
                {badge}
              </span>
            )
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggle(product)}
            title={
              product.isActive
                ? "Deactivate"
                : "Activate"
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:bg-black hover:text-white"
          >
            <Power size={17} />
          </button>

          <Link
            to={`/admin/products/edit/${product._id}`}
            title="Edit"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:bg-black hover:text-white"
          >
            <Pencil size={17} />
          </Link>

          <button
            type="button"
            onClick={() => onDelete(product)}
            title="Delete"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:bg-red-500 hover:text-white"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const StockBadge = ({
  stock,
  isOut,
  isLow,
}) => {
  if (isOut) {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
        <XCircle size={13} />
        OUT OF STOCK
      </span>
    );
  }

  if (isLow) {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
        <AlertTriangle size={13} />
        LOW · {stock}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
      <CheckCircle2 size={13} />
      {stock} IN STOCK
    </span>
  );
};

const StatCard = ({
  title,
  value,
  icon: Icon,
}) => {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black">
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
    <div className="space-y-5 p-6">
      {[1, 2, 3, 4, 5].map(
        (item) => (
          <div
            key={item}
            className="flex animate-pulse items-center gap-5"
          >
            <div className="h-24 w-24 rounded-2xl bg-neutral-200" />

            <div className="flex-1">
              <div className="h-5 w-64 rounded bg-neutral-200" />

              <div className="mt-3 h-3 w-80 rounded bg-neutral-100" />

              <div className="mt-3 h-4 w-40 rounded bg-neutral-100" />
            </div>

            <div className="h-10 w-32 rounded bg-neutral-100" />
          </div>
        )
      )}
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
        <Package
          size={28}
          className="text-neutral-400"
        />
      </div>

      <h2 className="mt-5 text-xl font-black">
        No products found
      </h2>

      <p className="mt-2 max-w-md text-sm text-neutral-500">
        Try changing your search or filters, or add
        your first product.
      </p>

      <Link
        to="/admin/products/add"
        className="mt-6 flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white"
      >
        <Plus size={17} />
        ADD PRODUCT
      </Link>
    </div>
  );
};

export default AdminProducts;