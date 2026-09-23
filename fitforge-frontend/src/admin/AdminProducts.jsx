import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Power,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertTriangle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import api from "../services/api";

const AdminProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [collection, setCollection] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.append("page", page);
      params.append("limit", limit);

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (collection) {
        params.append("collection", collection);
      }

      if (category) {
        params.append("category", category);
      }

      if (status) {
        params.append("status", status);
      }

      const response = await api.get(
        `/admin/products?${params.toString()}`
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(
          data.message || "Failed to load products"
        );
      }

      setProducts(data.products || []);

      setTotalProducts(
        data.pagination?.totalProducts ||
          data.totalProducts ||
          0
      );

      setTotalPages(
        data.pagination?.totalPages ||
          data.totalPages ||
          1
      );
    } catch (error) {
      console.error(
        "Fetch products error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL / FILTER FETCH
  // ==========================================

  useEffect(() => {
    fetchProducts();
  }, [page, collection, category, status]);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(1);
    fetchProducts();
  };

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await fetchProducts();

      toast.success("Products refreshed");
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const confirmDelete = async () => {
    if (!deleteProduct) return;

    try {
      setDeleting(true);

      const response = await api.delete(
        `/admin/products/${deleteProduct._id}`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Failed to delete product"
        );
      }

      toast.success("Product deleted successfully");

      setDeleteProduct(null);

      // If last item on page was deleted
      if (products.length === 1 && page > 1) {
        setPage((previousPage) => previousPage - 1);
      } else {
        fetchProducts();
      }
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete product"
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // ACTIVATE / DEACTIVATE
  // ==========================================

  const handleToggle = async (product) => {
    try {
      const response = await api.patch(
        `/admin/products/${product._id}/toggle`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Failed to update product"
        );
      }

      toast.success(
        product.isActive
          ? "Product deactivated"
          : "Product activated"
      );

      fetchProducts();
    } catch (error) {
      console.error(
        "Toggle product error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update product"
      );
    }
  };

  // ==========================================
  // RESET FILTERS
  // ==========================================

  const resetFilters = () => {
    setSearch("");
    setCollection("");
    setCategory("");
    setStatus("");
    setPage(1);
  };

  // ==========================================
  // HELPERS
  // ==========================================

  const getProductImage = (product) => {
    if (
      product.thumbnail &&
      typeof product.thumbnail === "string"
    ) {
      return product.thumbnail;
    }

    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const firstImage = product.images[0];

      if (typeof firstImage === "string") {
        return firstImage;
      }

      if (firstImage?.url) {
        return firstImage.url;
      }
    }

    return null;
  };

  const getProductPrice = (product) => {
    const price = Number(product.price || 0);

    const salePrice =
      product.salePrice !== null &&
      product.salePrice !== undefined &&
      product.salePrice !== ""
        ? Number(product.salePrice)
        : null;

    if (salePrice !== null && salePrice < price) {
      return (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">
            ₹{salePrice.toLocaleString("en-IN")}
          </span>

          <span className="text-xs text-gray-400 line-through">
            ₹{price.toLocaleString("en-IN")}
          </span>
        </div>
      );
    }

    return (
      <span className="font-semibold text-gray-900">
        ₹{price.toLocaleString("en-IN")}
      </span>
    );
  };

  const getStockStatus = (stock) => {
    const quantity = Number(stock || 0);

    if (quantity === 0) {
      return {
        text: "OUT OF STOCK",
        className:
          "bg-red-100 text-red-700",
      };
    }

    if (quantity <= 5) {
      return {
        text: "LOW STOCK",
        className:
          "bg-orange-100 text-orange-700",
      };
    }

    return {
      text: "IN STOCK",
      className:
        "bg-green-100 text-green-700",
    };
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="mb-6 h-10 w-56 rounded bg-gray-200" />

            <div className="mb-6 h-20 rounded-xl bg-white" />

            <div className="h-96 rounded-xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Products
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your FITFORGE product catalog.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/products/add")
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {/* STATS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-100 p-3">
                <Package size={20} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Total Products
                </p>

                <p className="text-2xl font-bold text-gray-900">
                  {totalProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-3 text-orange-700">
                <AlertTriangle size={20} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Low Stock
                </p>

                <p className="text-2xl font-bold text-gray-900">
                  {
                    products.filter(
                      (product) =>
                        Number(product.stock || 0) > 0 &&
                        Number(product.stock || 0) <= 5
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-3 text-red-700">
                <Package size={20} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Out of Stock
                </p>

                <p className="text-2xl font-bold text-gray-900">
                  {
                    products.filter(
                      (product) =>
                        Number(product.stock || 0) === 0
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* SEARCH */}
            <form
              onSubmit={handleSearch}
              className="flex flex-1 gap-2"
            >
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search name, SKU..."
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-black"
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-black px-5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Search
              </button>
            </form>

            {/* COLLECTION */}
            <select
              value={collection}
              onChange={(e) => {
                setCollection(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="">
                All Collections
              </option>

              <option value="Performance">
                Performance
              </option>

              <option value="Luxury">
                Luxury
              </option>
            </select>

            {/* CATEGORY */}
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="">
                All Categories
              </option>

              <option value="T-Shirts">
                T-Shirts
              </option>

              <option value="Tank Tops">
                Tank Tops
              </option>

              <option value="Shorts">
                Shorts
              </option>

              <option value="Joggers">
                Joggers
              </option>

              <option value="Leggings">
                Leggings
              </option>

              <option value="Sports Bras">
                Sports Bras
              </option>

              <option value="Hoodies">
                Hoodies
              </option>

              <option value="Jackets">
                Jackets
              </option>
            </select>

            {/* STATUS */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            {/* REFRESH */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            {/* RESET */}
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              <X size={17} />
              Reset
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    SKU
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Collection
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Price
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-5 py-16 text-center"
                    >
                      <Package
                        size={40}
                        className="mx-auto mb-3 text-gray-300"
                      />

                      <p className="font-medium text-gray-900">
                        No products found
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const image =
                      getProductImage(product);

                    const stockStatus =
                      getStockStatus(product.stock);

                    return (
                      <tr
                        key={product._id}
                        className="transition hover:bg-gray-50"
                      >
                        {/* PRODUCT */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                              {image ? (
                                <img
                                  src={image}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <Package
                                    size={20}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[220px] truncate font-semibold text-gray-900">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {product.gender || "Unisex"}
                              </p>

                              <div className="mt-1 flex flex-wrap gap-1">
                                {product.isIconic && (
                                  <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
                                    ICONIC
                                  </span>
                                )}

                                {product.isBestSeller && (
                                  <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700">
                                    BESTSELLER
                                  </span>
                                )}

                                {product.isNewArrival && (
                                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                                    NEW
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {product.sku || "—"}
                        </td>

                        {/* COLLECTION */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              product.collection ===
                              "Luxury"
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {product.collection ||
                              "Performance"}
                          </span>
                        </td>

                        {/* CATEGORY */}
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {product.category?.name ||
                            product.category ||
                            "—"}
                        </td>

                        {/* PRICE */}
                        <td className="px-5 py-4 text-sm">
                          {getProductPrice(product)}
                        </td>

                        {/* STOCK */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {product.stock || 0}
                            </p>

                            <span
                              className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${stockStatus.className}`}
                            >
                              {stockStatus.text}
                            </span>
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              product.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {product.isActive
                              ? "ACTIVE"
                              : "INACTIVE"}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {/* VIEW */}
                            <button
                              type="button"
                              title="View product"
                              onClick={() =>
                                navigate(
                                  `/product/${product._id}`
                                )
                              }
                              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 hover:text-black"
                            >
                              <Eye size={17} />
                            </button>

                            {/* EDIT */}
                            <button
                              type="button"
                              title="Edit product"
                              onClick={() =>
                                navigate(
                                  `/admin/products/edit/${product._id}`
                                )
                              }
                              className="rounded-lg border border-blue-200 p-2 text-blue-600 transition hover:bg-blue-50"
                            >
                              <Pencil size={17} />
                            </button>

                            {/* ACTIVATE */}
                            <button
                              type="button"
                              title={
                                product.isActive
                                  ? "Deactivate"
                                  : "Activate"
                              }
                              onClick={() =>
                                handleToggle(product)
                              }
                              className={`rounded-lg border p-2 transition ${
                                product.isActive
                                  ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                                  : "border-green-200 text-green-600 hover:bg-green-50"
                              }`}
                            >
                              <Power size={17} />
                            </button>

                            {/* DELETE */}
                            <button
                              type="button"
                              title="Delete product"
                              onClick={() =>
                                setDeleteProduct(
                                  product
                                )
                              }
                              className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {products.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Page{" "}
                <span className="font-medium text-gray-900">
                  {page}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-900">
                  {totalPages}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((p) => p - 1)
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    page >= totalPages
                  }
                  onClick={() =>
                    setPage((p) => p + 1)
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Delete Product
              </h2>

              <button
                type="button"
                onClick={() =>
                  setDeleteProduct(null)
                }
                disabled={deleting}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">
                Are you sure you want to delete:
              </p>

              <p className="mt-1 font-semibold text-red-900">
                {deleteProduct.name}
              </p>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteProduct(null)
                }
                disabled={deleting}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting && (
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                )}

                {deleting
                  ? "Deleting..."
                  : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;