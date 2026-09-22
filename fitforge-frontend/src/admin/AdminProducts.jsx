import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Plus,
  Pencil,
  Trash2,
  Package,
} from "lucide-react";

import { toast } from "sonner";

import api from "../services/api";

const AdminProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response =
        await api.get(
          "/admin/products"
        );

      if (response.data.success) {
        setProducts(
          response.data.products
        );
      }
    } catch (error) {
      console.error(
        "Products error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteHandler = async (
    productId
  ) => {
    const confirmed =
      window.confirm(
        "Remove this product?"
      );

    if (!confirmed) return;

    try {
      const response =
        await api.delete(
          `/admin/products/${productId}`
        );

      if (response.data.success) {
        toast.success(
          "Product removed"
        );

        fetchProducts();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to remove product"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading products...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-gray-500">
              FITFORGE ADMIN
            </p>

            <h1 className="text-4xl font-black mt-2">
              PRODUCTS
            </h1>

            <p className="text-gray-500 mt-2">
              {products.length} products
            </p>
          </div>

          <Link
            to="/admin/products/add"
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-5 py-3 font-bold hover:bg-gray-800"
          >
            <Plus className="w-5 h-5" />
            ADD PRODUCT
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-400" />

            <h2 className="text-xl font-black mt-4">
              No products found
            </h2>

            <Link
              to="/admin/products/add"
              className="inline-block mt-5 bg-black text-white px-5 py-3 font-bold"
            >
              ADD FIRST PRODUCT
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-5 py-4">
                      PRODUCT
                    </th>

                    <th className="px-5 py-4">
                      COLLECTION
                    </th>

                    <th className="px-5 py-4">
                      PRICE
                    </th>

                    <th className="px-5 py-4">
                      STOCK
                    </th>

                    <th className="px-5 py-4">
                      STATUS
                    </th>

                    <th className="px-5 py-4">
                      ACTIONS
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map(
                    (product) => {
                      const image =
                        product.images?.[0];

                      const category =
                        typeof product.category ===
                        "object"
                          ? product.category
                              ?.name
                          : product.category;

                      const lowStock =
                        product.stock <=
                        product.lowStockThreshold;

                      return (
                        <tr
                          key={product._id}
                          className="border-b border-gray-100"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-4 min-w-[280px]">
                              <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden shrink-0">
                                {image ? (
                                  <img
                                    src={image}
                                    alt={
                                      product.name
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              <div>
                                <p className="font-bold">
                                  {product.name}
                                </p>

                                <p className="text-sm text-gray-500 mt-1">
                                  {category ||
                                    "Uncategorized"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-sm font-bold">
                              {
                                product.collection
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div>
                              <p className="font-bold">
                                ₹
                                {Number(
                                  product.salePrice ??
                                    product.price
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                              {product.salePrice && (
                                <p className="text-xs text-gray-400 line-through">
                                  ₹
                                  {Number(
                                    product.price
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={
                                lowStock
                                  ? "font-bold text-red-600"
                                  : "font-bold"
                              }
                            >
                              {product.stock}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${
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

                          <td className="px-5 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/admin/products/edit/${product._id}`
                                  )
                                }
                                className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() =>
                                  deleteHandler(
                                    product._id
                                  )
                                }
                                className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:bg-red-600 hover:text-white"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;