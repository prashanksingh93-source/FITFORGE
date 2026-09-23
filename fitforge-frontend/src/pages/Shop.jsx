import React, {
  useEffect,
  useState,
} from "react";

import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Search,
} from "lucide-react";

import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import ProductCard from "../components/ProductCard";
import {
  getProducts,
} from "../services/productService";

const categories = [
  "T-Shirts",
  "Tank Tops",
  "Shorts",
  "Joggers",
  "Leggings",
  "Sports Bras",
  "Hoodies",
  "Jackets",
];

const sizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
];

const colors = [
  "Black",
  "White",
  "Navy",
  "Grey",
  "Red",
  "Blue",
];

const Shop = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [products, setProducts] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [mobileFilters, setMobileFilters] =
    useState(false);

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [collection, setCollection] =
    useState(
      searchParams.get("collection") || ""
    );

  const [gender, setGender] = useState(
    searchParams.get("gender") || ""
  );

  const [category, setCategory] =
    useState(
      searchParams.get("category") || ""
    );

  const [size, setSize] = useState(
    searchParams.get("size") || ""
  );

  const [color, setColor] = useState(
    searchParams.get("color") || ""
  );

  const [availability, setAvailability] =
    useState(
      searchParams.get("availability") || ""
    );

  const [featured, setFeatured] =
    useState(
      searchParams.get("featured") || ""
    );

  const [sort, setSort] = useState(
    searchParams.get("sort") || "featured"
  );

  const [page, setPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalProducts, setTotalProducts] =
    useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: 12,
        sort,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (collection) {
        params.collection = collection;
      }

      if (gender) {
        params.gender = gender;
      }

      if (category) {
        params.category = category;
      }

      if (size) {
        params.size = size;
      }

      if (color) {
        params.color = color;
      }

      if (availability) {
        params.availability =
          availability;
      }

      if (featured) {
        params.featured = featured;
      }

      const data =
        await getProducts(params);

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to load products"
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
        "Shop products error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load products"
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    page,
    collection,
    gender,
    category,
    size,
    color,
    availability,
    featured,
    sort,
  ]);

  const updateUrl = () => {
    const params = {};

    if (search.trim()) {
      params.search = search.trim();
    }

    if (collection) {
      params.collection = collection;
    }

    if (gender) {
      params.gender = gender;
    }

    if (category) {
      params.category = category;
    }

    if (size) {
      params.size = size;
    }

    if (color) {
      params.color = color;
    }

    if (availability) {
      params.availability =
        availability;
    }

    if (featured) {
      params.featured = featured;
    }

    if (sort !== "featured") {
      params.sort = sort;
    }

    if (page > 1) {
      params.page = page;
    }

    setSearchParams(params);
  };

  useEffect(() => {
    updateUrl();
  }, [
    collection,
    gender,
    category,
    size,
    color,
    availability,
    featured,
    sort,
    page,
  ]);

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(1);

    updateUrl();
  };

  const clearFilters = () => {
    setSearch("");
    setCollection("");
    setGender("");
    setCategory("");
    setSize("");
    setColor("");
    setAvailability("");
    setFeatured("");
    setSort("featured");
    setPage(1);
    setMobileFilters(false);

    setSearchParams({});
  };

  const activeFilterCount =
    [
      collection,
      gender,
      category,
      size,
      color,
      availability,
      featured,
    ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            FITFORGE
          </p>

          <h1 className="text-3xl font-bold uppercase tracking-tight text-black md:text-5xl">
            Shop
          </h1>

          <p className="mt-3 max-w-xl text-sm text-gray-600 md:text-base">
            Performance-driven gym wear and
            premium luxury fitness clothing.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {/* SEARCH */}
        <form
          onSubmit={handleSearch}
          className="mb-6 flex gap-2"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search products..."
              className="w-full border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-black"
            />
          </div>

          <button
            type="submit"
            className="bg-black px-6 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Search
          </button>
        </form>

        {/* MOBILE FILTER BUTTON */}
        <button
          type="button"
          onClick={() =>
            setMobileFilters(true)
          }
          className="mb-5 flex items-center gap-2 border border-gray-300 px-4 py-3 text-sm font-semibold lg:hidden"
        >
          <SlidersHorizontal size={17} />

          Filters

          {activeFilterCount > 0 && (
            <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex gap-8">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden w-60 shrink-0 lg:block">
            <FilterContent
              collection={collection}
              setCollection={setCollection}
              gender={gender}
              setGender={setGender}
              category={category}
              setCategory={setCategory}
              size={size}
              setSize={setSize}
              color={color}
              setColor={setColor}
              availability={availability}
              setAvailability={
                setAvailability
              }
              featured={featured}
              setFeatured={setFeatured}
              clearFilters={clearFilters}
              activeFilterCount={
                activeFilterCount
              }
            />
          </aside>

          {/* PRODUCTS */}
          <main className="min-w-0 flex-1">
            {/* TOOLBAR */}
            <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                {totalProducts} products
              </p>

              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-gray-500 sm:block">
                  Sort by
                </span>

                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(
                      e.target.value
                    );
                    setPage(1);
                  }}
                  className="border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
                >
                  <option value="featured">
                    Featured
                  </option>

                  <option value="newest">
                    Newest
                  </option>

                  <option value="price-low">
                    Price: Low to High
                  </option>

                  <option value="price-high">
                    Price: High to Low
                  </option>

                  <option value="best-selling">
                    Best Selling
                  </option>
                </select>
              </div>
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
                {Array.from({
                  length: 6,
                }).map((_, index) => (
                  <ProductSkeleton
                    key={index}
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <h2 className="text-xl font-semibold">
                  No products found
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Try changing your search or
                  filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 bg-black px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* PRODUCT GRID */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
                  {products.map(
                    (product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                      />
                    )
                  )}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage(
                          (p) => p - 1
                        )
                      }
                      className="border border-gray-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <span className="px-4 text-sm">
                      {page} / {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={
                        page >= totalPages
                      }
                      onClick={() =>
                        setPage(
                          (p) => p + 1
                        )
                      }
                      className="border border-gray-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() =>
              setMobileFilters(false)
            }
          />

          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-white p-5">
            <div className="mb-6 flex items-center justify-between border-b pb-4">
              <h2 className="text-lg font-bold">
                Filters
              </h2>

              <button
                type="button"
                onClick={() =>
                  setMobileFilters(false)
                }
              >
                <X size={22} />
              </button>
            </div>

            <FilterContent
              collection={collection}
              setCollection={setCollection}
              gender={gender}
              setGender={setGender}
              category={category}
              setCategory={setCategory}
              size={size}
              setSize={setSize}
              color={color}
              setColor={setColor}
              availability={availability}
              setAvailability={
                setAvailability
              }
              featured={featured}
              setFeatured={setFeatured}
              clearFilters={clearFilters}
              activeFilterCount={
                activeFilterCount
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// FILTER COMPONENT
// ==========================================

const FilterContent = ({
  collection,
  setCollection,
  gender,
  setGender,
  category,
  setCategory,
  size,
  setSize,
  color,
  setColor,
  availability,
  setAvailability,
  featured,
  setFeatured,
  clearFilters,
  activeFilterCount,
}) => {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-semibold">
          Filters
        </h2>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* COLLECTION */}
      <FilterSection title="Collection">
        <FilterRadio
          label="All"
          checked={!collection}
          onChange={() =>
            setCollection("")
          }
        />

        <FilterRadio
          label="Performance"
          checked={
            collection === "Performance"
          }
          onChange={() =>
            setCollection(
              "Performance"
            )
          }
        />

        <FilterRadio
          label="Luxury"
          checked={
            collection === "Luxury"
          }
          onChange={() =>
            setCollection("Luxury")
          }
        />
      </FilterSection>

      {/* GENDER */}
      <FilterSection title="Gender">
        {[
          ["All", ""],
          ["Men", "Men"],
          ["Women", "Women"],
          ["Unisex", "Unisex"],
        ].map(([label, value]) => (
          <FilterRadio
            key={label}
            label={label}
            checked={gender === value}
            onChange={() =>
              setGender(value)
            }
          />
        ))}
      </FilterSection>

      {/* CATEGORY */}
      <FilterSection title="Category">
        <FilterRadio
          label="All"
          checked={!category}
          onChange={() =>
            setCategory("")
          }
        />

        {categories.map((item) => (
          <FilterRadio
            key={item}
            label={item}
            checked={category === item}
            onChange={() =>
              setCategory(item)
            }
          />
        ))}
      </FilterSection>

      {/* SIZE */}
      <FilterSection title="Size">
        <FilterRadio
          label="All"
          checked={!size}
          onChange={() => setSize("")}
        />

        {sizes.map((item) => (
          <FilterRadio
            key={item}
            label={item}
            checked={size === item}
            onChange={() =>
              setSize(item)
            }
          />
        ))}
      </FilterSection>

      {/* COLOR */}
      <FilterSection title="Color">
        <FilterRadio
          label="All"
          checked={!color}
          onChange={() => setColor("")}
        />

        {colors.map((item) => (
          <FilterRadio
            key={item}
            label={item}
            checked={color === item}
            onChange={() =>
              setColor(item)
            }
          />
        ))}
      </FilterSection>

      {/* AVAILABILITY */}
      <FilterSection title="Availability">
        <FilterRadio
          label="All"
          checked={!availability}
          onChange={() =>
            setAvailability("")
          }
        />

        <FilterRadio
          label="In Stock"
          checked={
            availability === "in-stock"
          }
          onChange={() =>
            setAvailability(
              "in-stock"
            )
          }
        />

        <FilterRadio
          label="Out of Stock"
          checked={
            availability ===
            "out-of-stock"
          }
          onChange={() =>
            setAvailability(
              "out-of-stock"
            )
          }
        />
      </FilterSection>

      {/* SPECIAL */}
      <FilterSection title="Special">
        <FilterRadio
          label="All Products"
          checked={!featured}
          onChange={() =>
            setFeatured("")
          }
        />

        <FilterRadio
          label="Bestsellers"
          checked={
            featured ===
            "bestseller"
          }
          onChange={() =>
            setFeatured(
              "bestseller"
            )
          }
        />

        <FilterRadio
          label="New Arrivals"
          checked={
            featured === "new"
          }
          onChange={() =>
            setFeatured("new")
          }
        />
      </FilterSection>
    </div>
  );
};

// ==========================================
// FILTER SECTION
// ==========================================

const FilterSection = ({
  title,
  children,
}) => {
  return (
    <div className="border-t border-gray-200 py-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {title}
        </h3>

        <ChevronDown size={16} />
      </div>

      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

// ==========================================
// RADIO
// ==========================================

const FilterRadio = ({
  label,
  checked,
  onChange,
}) => {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-600 hover:text-black">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-black"
      />

      <span>{label}</span>
    </label>
  );
};

// ==========================================
// SKELETON
// ==========================================

const ProductSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] bg-gray-200" />

      <div className="mt-4 h-3 w-20 bg-gray-200" />

      <div className="mt-3 h-4 w-3/4 bg-gray-200" />

      <div className="mt-3 h-4 w-24 bg-gray-200" />

      <div className="mt-4 h-10 w-full bg-gray-200" />
    </div>
  );
};

export default Shop;