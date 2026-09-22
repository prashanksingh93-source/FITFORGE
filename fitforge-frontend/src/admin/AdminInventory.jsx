import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import api from "../services/api";

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUnits: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const [search, setSearch] = useState("");
  const [collection, setCollection] = useState("");
  const [stockStatus, setStockStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/inventory", {
        params: {
          search,
          collection,
          stockStatus,
        },
      });

      setProducts(response.data.products || []);

      setStats(
        response.data.stats || {
          totalProducts: 0,
          totalUnits: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
        }
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search, collection, stockStatus]);

  const updateStock = async (productId, stock) => {
    if (stock === "" || Number(stock) < 0) {
      toast.error("Enter a valid stock quantity");
      return;
    }

    try {
      setUpdatingId(productId);

      const response = await api.patch(
        `/admin/inventory/${productId}/stock`,
        {
          stock: Number(stock),
        }
      );

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product._id === productId
            ? response.data.product
            : product
        )
      );

      toast.success("Stock updated");

      fetchInventory();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update stock"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const adjustStock = async (productId, quantity) => {
    try {
      setUpdatingId(productId);

      const response = await api.patch(
        `/admin/inventory/${productId}/adjust-stock`,
        {
          quantity,
        }
      );

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product._id === productId
            ? response.data.product
            : product
        )
      );

      toast.success(
        quantity > 0
          ? `Added ${quantity} units`
          : `Removed ${Math.abs(quantity)} units`
      );

      fetchInventory();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to adjust stock"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStockStatus = (product) => {
    if (product.stock === 0) {
      return {
        label: "Out of stock",
        className:
          "bg-red-100 text-red-700",
      };
    }

    if (product.stock <= product.lowStockThreshold) {
      return {
        label: "Low stock",
        className:
          "bg-orange-100 text-orange-700",
      };
    }

    return {
      label: "In stock",
      className:
        "bg-green-100 text-green-700",
    };
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
                Inventory
              </h1>

              <p className="mt-1 text-gray-500">
                Monitor and manage product stock.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchInventory}
                className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-100"
              >
                <RefreshCw size={17} />
                Refresh
              </button>

              <Link
                to="/admin/products/add"
                className="flex items-center gap-2 bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Package size={17} />
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* STATS */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Products
              </span>

              <Package size={20} />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {stats.totalProducts}
            </p>
          </div>

          <div className="bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Total Units
              </span>

              <ShoppingBag size={20} />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {stats.totalUnits}
            </p>
          </div>

          <div className="bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                In Stock
              </span>

              <ArrowUp size={20} />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {stats.inStock}
            </p>
          </div>

          <div className="bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Low Stock
              </span>

              <AlertTriangle size={20} />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {stats.lowStock}
            </p>
          </div>

          <div className="bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Out of Stock
              </span>

              <XCircle size={20} />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {stats.outOfStock}
            </p>
          </div>
        </div>

        {/* FILTERS */}

        <div className="mt-8 flex flex-col gap-4 bg-white p-5 shadow-sm md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search product or SKU..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-black"
            />
          </div>

          <select
            value={collection}
            onChange={(event) =>
              setCollection(event.target.value)
            }
            className="border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
          >
            <option value="">All Collections</option>
            <option value="Performance">
              Performance
            </option>
            <option value="Luxury">
              Luxury
            </option>
          </select>

          <select
            value={stockStatus}
            onChange={(event) =>
              setStockStatus(event.target.value)
            }
            className="border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
          >
            <option value="">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        {/* TABLE */}

        <div className="mt-6 overflow-hidden bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <RefreshCw
                size={28}
                className="animate-spin"
              />
            </div>
          ) : products.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center">
              <Package
                size={45}
                className="text-gray-300"
              />

              <p className="mt-3 text-gray-500">
                No products found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-sm">
                    <th className="px-5 py-4 font-semibold">
                      Product
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Collection
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      SKU
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Stock
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const status =
                      getStockStatus(product);

                    return (
                      <tr
                        key={product._id}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 overflow-hidden bg-gray-100">
                              {product.images?.[0] ? (
                                <img
                                  src={
                                    product.images[0]
                                  }
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

                            <div>
                              <p className="font-semibold">
                                {product.name}
                              </p>

                              <p className="text-sm text-gray-500">
                                {product.category?.name ||
                                  "Uncategorized"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {product.collection}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-500">
                          {product.sku || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              defaultValue={
                                product.stock
                              }
                              onBlur={(event) => {
                                const value =
                                  Number(
                                    event.target.value
                                  );

                                if (
                                  value !==
                                  product.stock
                                ) {
                                  updateStock(
                                    product._id,
                                    value
                                  );
                                }
                              }}
                              className="w-24 border border-gray-300 px-3 py-2 text-center outline-none focus:border-black"
                            />

                            <span className="text-xs text-gray-500">
                              units
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-gray-400">
                            Low at ≤{" "}
                            {
                              product.lowStockThreshold
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              disabled={
                                updatingId ===
                                product._id
                              }
                              onClick={() =>
                                adjustStock(
                                  product._id,
                                  10
                                )
                              }
                              className="flex items-center gap-1 border border-gray-300 px-3 py-2 text-xs font-medium hover:bg-gray-100 disabled:opacity-50"
                            >
                              <ArrowUp size={14} />
                              +10
                            </button>

                            <button
                              disabled={
                                updatingId ===
                                product._id
                              }
                              onClick={() =>
                                adjustStock(
                                  product._id,
                                  -1
                                )
                              }
                              className="flex items-center gap-1 border border-gray-300 px-3 py-2 text-xs font-medium hover:bg-gray-100 disabled:opacity-50"
                            >
                              <ArrowDown size={14} />
                              -1
                            </button>

                            <Link
                              to={`/admin/products/edit/${product._id}`}
                              className="border border-black px-3 py-2 text-xs font-medium hover:bg-black hover:text-white"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminInventory;