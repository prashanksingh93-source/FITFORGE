import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";

export default function Shop() {
  const { products, loading } = useStore();

  const [searchParams] = useSearchParams();

  const initialCollection =
    searchParams.get("collection") || "All";

  const [collection, setCollection] =
    useState(initialCollection);

  const [gender, setGender] = useState("All");

  const [sort, setSort] = useState("default");

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (collection !== "All") {
      result = result.filter(
        (product) =>
          product.collection === collection
      );
    }

    if (gender !== "All") {
      result = result.filter(
        (product) => product.gender === gender
      );
    }

    if (sort === "low") {
      result.sort(
        (a, b) =>
          (a.salePrice || a.price) -
          (b.salePrice || b.price)
      );
    }

    if (sort === "high") {
      result.sort(
        (a, b) =>
          (b.salePrice || b.price) -
          (a.salePrice || a.price)
      );
    }

    if (sort === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );
    }

    return result;
  }, [products, collection, gender, sort]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-sm tracking-[0.3em] uppercase text-gray-500">
          FITFORGE STORE
        </p>

        <h1 className="text-5xl font-black mt-3">
          SHOP
        </h1>
      </div>

      <div className="flex flex-wrap gap-4 mb-10 border-b pb-6">
        <select
          value={collection}
          onChange={(e) =>
            setCollection(e.target.value)
          }
          className="border px-4 py-3"
        >
          <option value="All">All Collections</option>
          <option value="Performance">
            Performance
          </option>
          <option value="Luxury">Luxury</option>
        </select>

        <select
          value={gender}
          onChange={(e) =>
            setGender(e.target.value)
          }
          className="border px-4 py-3"
        >
          <option value="All">All Genders</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Unisex">Unisex</option>
        </select>

        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value)
          }
          className="border px-4 py-3"
        >
          <option value="default">Sort By</option>
          <option value="low">
            Price: Low to High
          </option>
          <option value="high">
            Price: High to Low
          </option>
          <option value="newest">
            Newest
          </option>
        </select>
      </div>

      {loading ? (
        <p className="text-center py-20 text-gray-500">
          Loading products...
        </p>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">
            No products found
          </h2>

          <p className="text-gray-500 mt-2">
            Try changing your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      )}
    </main>
  );
}