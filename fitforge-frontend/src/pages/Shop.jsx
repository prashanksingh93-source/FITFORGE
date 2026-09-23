import React, { useEffect, useMemo, useState } from "react";
import {
  Filter,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/productService";

const LUXURY_BG = "bg-[oklch(56%_0.021_213.5)]";

const Shop = ({ collection: collectionProp = "" }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const isCollectionPage = Boolean(collectionProp);
  const isLuxury = collectionProp === "Luxury";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [collection, setCollection] = useState(
    collectionProp || searchParams.get("collection") || ""
  );

  const [gender, setGender] = useState(
    searchParams.get("gender") || ""
  );

  const [category, setCategory] = useState(
    searchParams.get("category") || ""
  );

  const [size, setSize] = useState(
    searchParams.get("size") || ""
  );

  const [color, setColor] = useState(
    searchParams.get("color") || ""
  );

  const [minPrice, setMinPrice] = useState(
    searchParams.get("minPrice") || ""
  );

  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("maxPrice") || ""
  );

  const [availability, setAvailability] = useState(
    searchParams.get("availability") || ""
  );

  const [bestSeller, setBestSeller] = useState(
    searchParams.get("bestSeller") === "true"
  );

  const [newArrival, setNewArrival] = useState(
    searchParams.get("newArrival") === "true"
  );

  const [sort, setSort] = useState(
    searchParams.get("sort") || "featured"
  );

  const [page, setPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  const [totalPages, setTotalPages] = useState(1);

  const [showMobileFilters, setShowMobileFilters] =
    useState(false);

  /* -------------------------------------------------------
     Keep collection synchronized with current route
  ------------------------------------------------------- */
  useEffect(() => {
    const urlCollection =
      searchParams.get("collection") || "";

    setCollection(collectionProp || urlCollection);
  }, [collectionProp, searchParams]);

  /* -------------------------------------------------------
     Synchronize filters with URL
  ------------------------------------------------------- */
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setGender(searchParams.get("gender") || "");
    setCategory(searchParams.get("category") || "");
    setSize(searchParams.get("size") || "");
    setColor(searchParams.get("color") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setAvailability(searchParams.get("availability") || "");

    setBestSeller(
      searchParams.get("bestSeller") === "true"
    );

    setNewArrival(
      searchParams.get("newArrival") === "true"
    );

    setSort(searchParams.get("sort") || "featured");

    setPage(
      Number(searchParams.get("page")) || 1
    );
  }, [searchParams]);

  /* -------------------------------------------------------
     Fetch products
  ------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit: 12,
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

        if (minPrice !== "") {
          params.minPrice = minPrice;
        }

        if (maxPrice !== "") {
          params.maxPrice = maxPrice;
        }

        if (availability) {
          params.availability = availability;
        }

        if (bestSeller) {
          params.bestSeller = "true";
        }

        if (newArrival) {
          params.newArrival = "true";
        }

        if (sort) {
          params.sort = sort;
        }

        const response = await getProducts(params);

        if (cancelled) return;

        const data = response?.data || response;

        const productList =
          data?.products ||
          data?.data ||
          [];

        setProducts(
          Array.isArray(productList)
            ? productList
            : []
        );

        setTotalPages(
          Number(
            data?.totalPages ||
              data?.pagination?.totalPages ||
              1
          )
        );
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Failed to load products:",
          err
        );

        setProducts([]);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load products."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [
    page,
    search,
    collection,
    gender,
    category,
    size,
    color,
    minPrice,
    maxPrice,
    availability,
    bestSeller,
    newArrival,
    sort,
  ]);

  /* -------------------------------------------------------
     URL helper
  ------------------------------------------------------- */
  const updateUrl = (overrides = {}) => {
    const params = new URLSearchParams();

    const nextSearch =
      overrides.search !== undefined
        ? overrides.search
        : search;

    const nextCollection =
      overrides.collection !== undefined
        ? overrides.collection
        : collection;

    const nextGender =
      overrides.gender !== undefined
        ? overrides.gender
        : gender;

    const nextCategory =
      overrides.category !== undefined
        ? overrides.category
        : category;

    const nextSize =
      overrides.size !== undefined
        ? overrides.size
        : size;

    const nextColor =
      overrides.color !== undefined
        ? overrides.color
        : color;

    const nextMinPrice =
      overrides.minPrice !== undefined
        ? overrides.minPrice
        : minPrice;

    const nextMaxPrice =
      overrides.maxPrice !== undefined
        ? overrides.maxPrice
        : maxPrice;

    const nextAvailability =
      overrides.availability !== undefined
        ? overrides.availability
        : availability;

    const nextBestSeller =
      overrides.bestSeller !== undefined
        ? overrides.bestSeller
        : bestSeller;

    const nextNewArrival =
      overrides.newArrival !== undefined
        ? overrides.newArrival
        : newArrival;

    const nextSort =
      overrides.sort !== undefined
        ? overrides.sort
        : sort;

    const nextPage =
      overrides.page !== undefined
        ? overrides.page
        : page;

    if (nextSearch.trim()) {
      params.set(
        "search",
        nextSearch.trim()
      );
    }

    /*
     * Only /shop can use collection query.
     */
    if (!isCollectionPage && nextCollection) {
      params.set(
        "collection",
        nextCollection
      );
    }

    if (nextGender) {
      params.set("gender", nextGender);
    }

    if (nextCategory) {
      params.set("category", nextCategory);
    }

    if (nextSize) {
      params.set("size", nextSize);
    }

    if (nextColor) {
      params.set("color", nextColor);
    }

    if (nextMinPrice !== "") {
      params.set(
        "minPrice",
        nextMinPrice
      );
    }

    if (nextMaxPrice !== "") {
      params.set(
        "maxPrice",
        nextMaxPrice
      );
    }

    if (nextAvailability) {
      params.set(
        "availability",
        nextAvailability
      );
    }

    if (nextBestSeller) {
      params.set(
        "bestSeller",
        "true"
      );
    }

    if (nextNewArrival) {
      params.set(
        "newArrival",
        "true"
      );
    }

    if (
      nextSort &&
      nextSort !== "featured"
    ) {
      params.set(
        "sort",
        nextSort
      );
    }

    if (nextPage > 1) {
      params.set(
        "page",
        String(nextPage)
      );
    }

    setSearchParams(params);
  };

  /* -------------------------------------------------------
     Search
  ------------------------------------------------------- */
  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);

    updateUrl({
      search,
      page: 1,
    });
  };

  /* -------------------------------------------------------
     Collection
  ------------------------------------------------------- */
  const handleCollectionChange = (value) => {
    if (isCollectionPage) {
      return;
    }

    setCollection(value);
    setPage(1);

    updateUrl({
      collection: value,
      page: 1,
    });
  };

  /* -------------------------------------------------------
     Other filters
  ------------------------------------------------------- */
  const handleGenderChange = (value) => {
    setGender(value);
    setPage(1);

    updateUrl({
      gender: value,
      page: 1,
    });
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1);

    updateUrl({
      category: value,
      page: 1,
    });
  };

  const handleSizeChange = (value) => {
    setSize(value);
    setPage(1);

    updateUrl({
      size: value,
      page: 1,
    });
  };

  const handleColorChange = (value) => {
    setColor(value);
    setPage(1);

    updateUrl({
      color: value,
      page: 1,
    });
  };

  const handleAvailabilityChange = (value) => {
    setAvailability(value);
    setPage(1);

    updateUrl({
      availability: value,
      page: 1,
    });
  };

  const handleBestSellerChange = (value) => {
    setBestSeller(value);
    setPage(1);

    updateUrl({
      bestSeller: value,
      page: 1,
    });
  };

  const handleNewArrivalChange = (value) => {
    setNewArrival(value);
    setPage(1);

    updateUrl({
      newArrival: value,
      page: 1,
    });
  };

  const handlePriceChange = (
    type,
    value
  ) => {
    setPage(1);

    if (type === "min") {
      setMinPrice(value);

      updateUrl({
        minPrice: value,
        page: 1,
      });
    } else {
      setMaxPrice(value);

      updateUrl({
        maxPrice: value,
        page: 1,
      });
    }
  };

  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);

    updateUrl({
      sort: value,
      page: 1,
    });
  };

  /* -------------------------------------------------------
     Clear filters
  ------------------------------------------------------- */
  const clearFilters = () => {
    setSearch("");
    setGender("");
    setCategory("");
    setSize("");
    setColor("");
    setMinPrice("");
    setMaxPrice("");
    setAvailability("");
    setBestSeller(false);
    setNewArrival(false);
    setSort("featured");
    setPage(1);

    if (isCollectionPage) {
      setCollection(collectionProp);
    } else {
      setCollection("");
    }

    setSearchParams({});
  };

  /* -------------------------------------------------------
     Active filter count
  ------------------------------------------------------- */
  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (!isCollectionPage && collection) {
      count++;
    }

    if (gender) count++;
    if (category) count++;
    if (size) count++;
    if (color) count++;
    if (minPrice !== "") count++;
    if (maxPrice !== "") count++;
    if (availability) count++;
    if (bestSeller) count++;
    if (newArrival) count++;

    return count;
  }, [
    collection,
    gender,
    category,
    size,
    color,
    minPrice,
    maxPrice,
    availability,
    bestSeller,
    newArrival,
    isCollectionPage,
  ]);

  /* -------------------------------------------------------
     Page title
  ------------------------------------------------------- */
  const pageTitle = isCollectionPage
    ? collectionProp === "Performance"
      ? "PERFORMANCE"
      : "LUXURY"
    : "SHOP";

  const pageDescription =
    isCollectionPage
      ? collectionProp ===
        "Performance"
        ? "ENGINEERED FOR PERFORMANCE. BUILT FOR MOVEMENT."
        : "ELEVATED TRAINING. PREMIUM GYM WEAR."
      : "EXPLORE THE COMPLETE FITFORGE COLLECTION.";

  /* -------------------------------------------------------
     Filter content
  ------------------------------------------------------- */
  const FilterContent = () => (
    <div className="space-y-8">
      {/* COLLECTION */}
      <div>
        <h3
          className={`mb-4 text-sm font-semibold tracking-wider ${
            isLuxury
              ? "text-white"
              : "text-black"
          }`}
        >
          COLLECTION
        </h3>

        {isCollectionPage ? (
          <label
            className={`flex items-center gap-3 text-sm ${
              isLuxury
                ? "text-white"
                : "text-black"
            }`}
          >
            <input
              type="radio"
              checked
              readOnly
              className="accent-black"
            />

            <span>
              {collectionProp}
            </span>
          </label>
        ) : (
          <div className="space-y-3">
            {[
              {
                label: "All",
                value: "",
              },
              {
                label: "Performance",
                value: "Performance",
              },
              {
                label: "Luxury",
                value: "Luxury",
              },
            ].map((item) => (
              <label
                key={item.label}
                className="flex cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  type="radio"
                  name="collection"
                  value={item.value}
                  checked={
                    collection ===
                    item.value
                  }
                  onChange={() =>
                    handleCollectionChange(
                      item.value
                    )
                  }
                  className="accent-black"
                />

                <span>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* GENDER */}
      <div>
        <h3
          className={`mb-4 text-sm font-semibold tracking-wider ${
            isLuxury
              ? "text-white"
              : "text-black"
          }`}
        >
          GENDER
        </h3>

        <div className="space-y-3">
          {[
            "",
            "Men",
            "Women",
            "Unisex",
          ].map((item) => (
            <label
              key={item || "all"}
              className={`flex cursor-pointer items-center gap-3 text-sm ${
                isLuxury
                  ? "text-gray-300"
                  : "text-black"
              }`}
            >
              <input
                type="radio"
                name="gender"
                value={item}
                checked={
                  gender === item
                }
                onChange={() =>
                  handleGenderChange(
                    item
                  )
                }
                className="accent-black"
              />

              <span>
                {item || "All"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* CATEGORY */}
      <div>
        <h3
          className={`mb-4 text-sm font-semibold tracking-wider ${
            isLuxury
              ? "text-white"
              : "text-black"
          }`}
        >
          CATEGORY
        </h3>

        <select
          value={category}
          onChange={(e) =>
            handleCategoryChange(
              e.target.value
            )
          }
          className={`w-full border px-3 py-3 text-sm outline-none ${
            isLuxury
              ? "border-white/30 bg-[oklch(56%_0.021_213.5)] text-white focus:border-white"
              : "border-gray-300 bg-white text-black focus:border-black"
          }`}
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
      </div>

      {/* SIZE */}
      <div>
        <h3
          className={`mb-4 text-sm font-semibold tracking-wider ${
            isLuxury
              ? "text-white"
              : "text-black"
          }`}
        >
          SIZE
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {[
            "XS",
            "S",
            "M",
            "L",
            "XL",
            "XXL",
          ].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                handleSizeChange(
                  size === item
                    ? ""
                    : item
                )
              }
              className={`border px-3 py-2 text-xs transition ${
                size === item
                  ? isLuxury
                    ? "border-white bg-white text-black"
                    : "border-black bg-black text-white"
                  : isLuxury
                    ? "border-white/30 text-white hover:border-white"
                    : "border-gray-300 bg-white text-black hover:border-black"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* COLOR */}
      <div>
        <h3
          className={`mb-4 text-sm font-semibold tracking-wider ${
            isLuxury
              ? "text-white"
              : "text-black"
          }`}
        >
          COLOR
        </h3>

        <select
          value={color}
          onChange={(e) =>
            handleColorChange(
              e.target.value
            )
          }
          className={`w-full border px-3 py-3 text-sm outline-none ${
            isLuxury
              ? "border-white/30 bg-[oklch(56%_0.021_213.5)] text-white focus:border-white"
              : "border-gray-300 bg-white text-black focus:border-black"
          }`}
        >
          <option value="">
            All Colors
          </option>

          <option value="Black">
            Black
          </option>

          <option value="White">
            White
          </option>

          <option value="Grey">
            Grey
          </option>

          <option value="Navy">
            Navy
          </option>

          <option value="Red">
            Red
          </option>

          <option value="Green">
            Green
          </option>

          <option value="Blue">
            Blue
          </option>

          <option value="Beige">
            Beige
          </option>
        </select>
      </div>

      {/* PRICE */}
      <div>
        <h3
          className={`mb-4 text-sm font-semibold tracking-wider ${
            isLuxury
              ? "text-white"
              : "text-black"
          }`}
        >
          PRICE
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) =>
              handlePriceChange(
                "min",
                e.target.value
              )
            }
            className={`w-full border px-3 py-2 text-sm outline-none ${
              isLuxury
                ? "border-white/30 bg-transparent text-white placeholder:text-white/50 focus:border-white"
                : "border-gray-300 bg-white text-black focus:border-black"
            }`}
          />

          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) =>
              handlePriceChange(
                "max",
                e.target.value
              )
            }
            className={`w-full border px-3 py-2 text-sm outline-none ${
              isLuxury
                ? "border-white/30 bg-transparent text-white placeholder:text-white/50 focus:border-white"
                : "border-gray-300 bg-white text-black focus:border-black"
            }`}
          />
        </div>
      </div>

      {/* AVAILABILITY */}
      <div>
        <h3
          className={`mb-4 text-sm font-semibold tracking-wider ${
            isLuxury
              ? "text-white"
              : "text-black"
          }`}
        >
          AVAILABILITY
        </h3>

        <div className="space-y-3">
          {[
            {
              label: "All",
              value: "",
            },
            {
              label: "In Stock",
              value: "in-stock",
            },
            {
              label: "Out of Stock",
              value: "out-of-stock",
            },
          ].map((item) => (
            <label
              key={item.label}
              className={`flex cursor-pointer items-center gap-3 text-sm ${
                isLuxury
                  ? "text-gray-300"
                  : "text-black"
              }`}
            >
              <input
                type="radio"
                name="availability"
                value={item.value}
                checked={
                  availability ===
                  item.value
                }
                onChange={() =>
                  handleAvailabilityChange(
                    item.value
                  )
                }
                className="accent-black"
              />

              <span>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* SPECIAL */}
      <div>
        <h3
          className={`mb-4 text-sm font-semibold tracking-wider ${
            isLuxury
              ? "text-white"
              : "text-black"
          }`}
        >
          SPECIAL
        </h3>

        <div className="space-y-3">
          <label
            className={`flex cursor-pointer items-center gap-3 text-sm ${
              isLuxury
                ? "text-gray-300"
                : "text-black"
            }`}
          >
            <input
              type="checkbox"
              checked={bestSeller}
              onChange={(e) =>
                handleBestSellerChange(
                  e.target.checked
                )
              }
              className="accent-black"
            />

            <span>
              Best Sellers
            </span>
          </label>

          <label
            className={`flex cursor-pointer items-center gap-3 text-sm ${
              isLuxury
                ? "text-gray-300"
                : "text-black"
            }`}
          >
            <input
              type="checkbox"
              checked={newArrival}
              onChange={(e) =>
                handleNewArrivalChange(
                  e.target.checked
                )
              }
              className="accent-black"
            />

            <span>
              New Arrivals
            </span>
          </label>
        </div>
      </div>

      {/* CLEAR FILTERS */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className={`w-full border px-4 py-3 text-xs font-semibold tracking-wider transition ${
            isLuxury
              ? "border-white text-white hover:bg-white hover:text-black"
              : "border-black text-black hover:bg-black hover:text-white"
          }`}
        >
          CLEAR FILTERS
        </button>
      )}
    </div>
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isLuxury
          ? LUXURY_BG
          : "bg-white"
      }`}
    >
      {/* ---------------------------------------------------
          PAGE HEADER
      --------------------------------------------------- */}
      <section
        className={`border-b ${
          isLuxury
            ? `${LUXURY_BG} border-white/20`
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5">
            <p
              className={`text-xs font-semibold tracking-[0.3em] ${
                isLuxury
                  ? "text-white/60"
                  : "text-gray-500"
              }`}
            >
              FITFORGE
            </p>

            <h1
              className={`text-4xl font-black tracking-tight sm:text-5xl ${
                isLuxury
                  ? "text-white"
                  : "text-black"
              }`}
            >
              {pageTitle}
            </h1>

            <p
              className={`max-w-2xl text-sm leading-7 ${
                isLuxury
                  ? "text-white/70"
                  : "text-gray-600"
              }`}
            >
              {pageDescription}
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------
          SEARCH + SORT
      --------------------------------------------------- */}
      <section
        className={`border-b ${
          isLuxury
            ? `${LUXURY_BG} border-white/20`
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* SEARCH */}
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-xl"
            >
              <div className="relative flex-1">
                <Search
                  size={18}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isLuxury
                      ? "text-white/60"
                      : "text-gray-500"
                  }`}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search products..."
                  className={`h-11 w-full border pl-10 pr-4 text-sm outline-none ${
                    isLuxury
                      ? "border-white/30 bg-transparent text-white placeholder:text-white/50 focus:border-white"
                      : "border-gray-300 bg-white text-black focus:border-black"
                  }`}
                />
              </div>

              <button
                type="submit"
                className={`h-11 px-6 text-xs font-semibold tracking-wider transition ${
                  isLuxury
                    ? "bg-white text-black hover:bg-white/80"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                SEARCH
              </button>
            </form>

            <div className="flex items-center gap-3">
              {/* MOBILE FILTER */}
              <button
                type="button"
                onClick={() =>
                  setShowMobileFilters(
                    true
                  )
                }
                className={`flex h-11 items-center gap-2 border px-4 text-xs font-semibold tracking-wider lg:hidden ${
                  isLuxury
                    ? "border-white/30 text-white hover:border-white"
                    : "border-gray-300 text-black"
                }`}
              >
                <Filter size={16} />

                FILTER

                {activeFilterCount > 0 && (
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] ${
                      isLuxury
                        ? "bg-white text-black"
                        : "bg-black text-white"
                    }`}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* SORT */}
              <div className="relative">
                <SlidersHorizontal
                  size={16}
                  className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${
                    isLuxury
                      ? "text-white/60"
                      : "text-gray-500"
                  }`}
                />

                <select
                  value={sort}
                  onChange={(e) =>
                    handleSortChange(
                      e.target.value
                    )
                  }
                  className={`h-11 appearance-none border pl-9 pr-10 text-xs font-semibold tracking-wider outline-none ${
                    isLuxury
                      ? "border-white/30 bg-[oklch(56%_0.021_213.5)] text-white focus:border-white"
                      : "border-gray-300 bg-white text-black focus:border-black"
                  }`}
                >
                  <option value="featured">
                    FEATURED
                  </option>

                  <option value="newest">
                    NEWEST
                  </option>

                  <option value="price-low-high">
                    PRICE LOW TO HIGH
                  </option>

                  <option value="price-high-low">
                    PRICE HIGH TO LOW
                  </option>

                  <option value="best-selling">
                    BEST SELLING
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------
          MAIN
      --------------------------------------------------- */}
      <main
        className={`mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 ${
          isLuxury
            ? LUXURY_BG
            : "bg-white"
        }`}
      >
        <div className="flex gap-10">
          {/* DESKTOP FILTERS */}
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-24">
              <div
                className={`mb-7 flex items-center justify-between border-b pb-5 ${
                  isLuxury
                    ? "border-white/20"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Filter
                    size={17}
                    className={
                      isLuxury
                        ? "text-white"
                        : "text-black"
                    }
                  />

                  <h2
                    className={`text-sm font-bold tracking-wider ${
                      isLuxury
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    FILTERS
                  </h2>
                </div>

                {activeFilterCount > 0 && (
                  <span
                    className={
                      isLuxury
                        ? "text-xs text-white/60"
                        : "text-xs text-gray-500"
                    }
                  >
                    {activeFilterCount} active
                  </span>
                )}
              </div>

              <FilterContent />
            </div>
          </aside>

          {/* PRODUCTS */}
          <section className="min-w-0 flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p
                className={
                  isLuxury
                    ? "text-sm text-white/60"
                    : "text-sm text-gray-500"
                }
              >
                {loading
                  ? "Loading products..."
                  : `${products.length} products`}
              </p>
            </div>

            {/* ERROR */}
            {error && !loading && (
              <div
                className={`border px-5 py-6 text-sm ${
                  isLuxury
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {error}
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({
                  length: 6,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse"
                  >
                    <div
                      className={`aspect-[3/4] ${
                        isLuxury
                          ? "bg-white/10"
                          : "bg-gray-100"
                      }`}
                    />

                    <div
                      className={`mt-4 h-4 w-3/4 ${
                        isLuxury
                          ? "bg-white/10"
                          : "bg-gray-100"
                      }`}
                    />

                    <div
                      className={`mt-2 h-4 w-1/3 ${
                        isLuxury
                          ? "bg-white/10"
                          : "bg-gray-100"
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* EMPTY */}
            {!loading &&
              !error &&
              products.length === 0 && (
                <div
                  className={`flex min-h-[400px] flex-col items-center justify-center border px-6 text-center ${
                    isLuxury
                      ? "border-white/20 bg-white/10"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <Search
                    size={36}
                    className={
                      isLuxury
                        ? "mb-5 text-white/50"
                        : "mb-5 text-gray-400"
                    }
                  />

                  <h2
                    className={`text-lg font-bold ${
                      isLuxury
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    NO PRODUCTS FOUND
                  </h2>

                  <p
                    className={`mt-2 max-w-md text-sm leading-6 ${
                      isLuxury
                        ? "text-white/60"
                        : "text-gray-500"
                    }`}
                  >
                    We couldn't find
                    products matching your
                    current filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className={`mt-6 px-6 py-3 text-xs font-semibold tracking-wider ${
                      isLuxury
                        ? "bg-white text-black hover:bg-white/80"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    CLEAR FILTERS
                  </button>
                </div>
              )}

            {/* PRODUCT GRID */}
            {!loading &&
              !error &&
              products.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map(
                    (product) => (
                      <ProductCard
                        key={
                          product._id ||
                          product.id ||
                          product.slug
                        }
                        product={product}
                      />
                    )
                  )}
                </div>
              )}

            {/* PAGINATION */}
            {!loading &&
              !error &&
              products.length > 0 &&
              totalPages > 1 && (
                <div className="mt-14 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => {
                      const nextPage =
                        Math.max(
                          page - 1,
                          1
                        );

                      setPage(nextPage);

                      updateUrl({
                        page: nextPage,
                      });

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className={`border px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
                      isLuxury
                        ? "border-white/30 text-white hover:border-white"
                        : "border-gray-300 text-black hover:border-black"
                    }`}
                  >
                    PREVIOUS
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      {
                        length: totalPages,
                      },
                      (_, index) =>
                        index + 1
                    )
                      .filter(
                        (pageNumber) => {
                          if (
                            totalPages <= 7
                          ) {
                            return true;
                          }

                          return (
                            pageNumber ===
                              1 ||
                            pageNumber ===
                              totalPages ||
                            Math.abs(
                              pageNumber -
                                page
                            ) <= 1
                          );
                        }
                      )
                      .map(
                        (pageNumber) => (
                          <button
                            key={
                              pageNumber
                            }
                            type="button"
                            onClick={() => {
                              setPage(
                                pageNumber
                              );

                              updateUrl({
                                page: pageNumber,
                              });

                              window.scrollTo({
                                top: 0,
                                behavior:
                                  "smooth",
                              });
                            }}
                            className={`flex h-9 w-9 items-center justify-center text-xs font-semibold ${
                              page ===
                              pageNumber
                                ? isLuxury
                                  ? "bg-white text-black"
                                  : "bg-black text-white"
                                : isLuxury
                                  ? "border border-white/30 text-white hover:border-white"
                                  : "border border-gray-300 hover:border-black"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      )}
                  </div>

                  <button
                    type="button"
                    disabled={
                      page >=
                      totalPages
                    }
                    onClick={() => {
                      const nextPage =
                        Math.min(
                          page + 1,
                          totalPages
                        );

                      setPage(nextPage);

                      updateUrl({
                        page: nextPage,
                      });

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className={`border px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
                      isLuxury
                        ? "border-white/30 text-white hover:border-white"
                        : "border-gray-300 text-black hover:border-black"
                    }`}
                  >
                    NEXT
                  </button>
                </div>
              )}
          </section>
        </div>
      </main>

      {/* ---------------------------------------------------
          MOBILE FILTER DRAWER
      --------------------------------------------------- */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close filters"
            onClick={() =>
              setShowMobileFilters(
                false
              )
            }
            className="absolute inset-0 bg-black/50"
          />

          {/* Drawer */}
          <div
            className={`absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto shadow-xl ${
              isLuxury
                ? LUXURY_BG
                : "bg-white"
            }`}
          >
            <div
              className={`sticky top-0 z-10 flex items-center justify-between border-b px-5 py-5 ${
                isLuxury
                  ? `${LUXURY_BG} border-white/20`
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter
                  size={18}
                  className={
                    isLuxury
                      ? "text-white"
                      : "text-black"
                  }
                />

                <h2
                  className={`text-sm font-bold tracking-wider ${
                    isLuxury
                      ? "text-white"
                      : "text-black"
                  }`}
                >
                  FILTERS
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowMobileFilters(
                    false
                  )
                }
                className={`p-2 ${
                  isLuxury
                    ? "text-white"
                    : "text-black"
                }`}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <FilterContent />
            </div>

            <div
              className={`sticky bottom-0 border-t p-5 ${
                isLuxury
                  ? `${LUXURY_BG} border-white/20`
                  : "border-gray-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setShowMobileFilters(
                    false
                  )
                }
                className={`w-full px-5 py-4 text-xs font-semibold tracking-wider ${
                  isLuxury
                    ? "bg-white text-black hover:bg-white/80"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                SHOW PRODUCTS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;

