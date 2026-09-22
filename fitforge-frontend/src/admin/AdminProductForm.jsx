import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import api from "../services/api";

const initialForm = {
  name: "",
  description: "",
  price: "",
  salePrice: "",
  category: "",
  gender: "Unisex",
  collection: "Performance",
  sizes: [],
  colors: [],
  stock: 0,
  lowStockThreshold: 5,
  sku: "",
  material: "",
  fit: "",
  careInstructions: "",
  badges: [],
  images: [],
  isActive: true,
};

const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

const availableBadges = [
  "Iconic",
  "Best Seller",
  "New Arrival",
  "Featured",
  "Limited Edition",
];

const AdminProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  const [imageInput, setImageInput] = useState("");
  const [colorInput, setColorInput] = useState({
    name: "",
    hex: "#000000",
  });

  useEffect(() => {
    fetchCategories();

    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/active");

      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Categories error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load categories"
      );
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await api.get(
        `/admin/products/${id}`
      );

      if (!response.data.success) {
        throw new Error("Product not found");
      }

      const product = response.data.product;

      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        salePrice: product.salePrice ?? "",
        category:
          product.category?._id ||
          product.category ||
          "",
        gender: product.gender || "Unisex",
        collection: product.collection || "Performance",
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock: product.stock || 0,
        lowStockThreshold:
          product.lowStockThreshold ?? 5,
        sku: product.sku || "",
        material: product.material || "",
        fit: product.fit || "",
        careInstructions:
          product.careInstructions || "",
        badges: product.badges || [],
        images: product.images || [],
        isActive:
          product.isActive !== undefined
            ? product.isActive
            : true,
      });
    } catch (error) {
      console.error("Product error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load product"
      );

      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  const toggleSize = (size) => {
    setForm((previous) => ({
      ...previous,
      sizes: previous.sizes.includes(size)
        ? previous.sizes.filter(
            (item) => item !== size
          )
        : [...previous.sizes, size],
    }));
  };

  const toggleBadge = (badge) => {
    setForm((previous) => ({
      ...previous,
      badges: previous.badges.includes(badge)
        ? previous.badges.filter(
            (item) => item !== badge
          )
        : [...previous.badges, badge],
    }));
  };

  const addImage = () => {
    const image = imageInput.trim();

    if (!image) {
      toast.error("Enter an image URL");
      return;
    }

    setForm((previous) => ({
      ...previous,
      images: [...previous.images, image],
    }));

    setImageInput("");
  };

  const removeImage = (index) => {
    setForm((previous) => ({
      ...previous,
      images: previous.images.filter(
        (_, imageIndex) => imageIndex !== index
      ),
    }));
  };

  const addColor = () => {
    if (!colorInput.name.trim()) {
      toast.error("Enter color name");
      return;
    }

    setForm((previous) => ({
      ...previous,
      colors: [
        ...previous.colors,
        {
          name: colorInput.name.trim(),
          hex: colorInput.hex,
        },
      ],
    }));

    setColorInput({
      name: "",
      hex: "#000000",
    });
  };

  const removeColor = (index) => {
    setForm((previous) => ({
      ...previous,
      colors: previous.colors.filter(
        (_, colorIndex) => colorIndex !== index
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Product description is required");
      return;
    }

    if (!form.price || Number(form.price) < 0) {
      toast.error("Enter a valid product price");
      return;
    }

    if (!form.category) {
      toast.error("Please select a category");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        price: Number(form.price),
        salePrice:
          form.salePrice === ""
            ? null
            : Number(form.salePrice),
        stock: Number(form.stock),
        lowStockThreshold: Number(
          form.lowStockThreshold
        ),
      };

      let response;

      if (isEditMode) {
        response = await api.patch(
          `/admin/products/${id}`,
          payload
        );
      } else {
        response = await api.post(
          "/admin/products",
          payload
        );
      }

      if (response.data.success) {
        toast.success(
          isEditMode
            ? "Product updated successfully"
            : "Product created successfully"
        );

        navigate("/admin/products");
      }
    } catch (error) {
      console.error("Save product error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to save product"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-black" />

          <p className="text-sm font-semibold text-neutral-500">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* HEADER */}
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/products"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 transition hover:bg-black hover:text-white"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                FITFORGE ADMIN
              </p>

              <h1 className="text-xl font-black sm:text-2xl">
                {isEditMode
                  ? "EDIT PRODUCT"
                  : "ADD PRODUCT"}
              </h1>
            </div>
          </div>

          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            <Save size={17} />

            {saving ? "SAVING..." : "SAVE PRODUCT"}
          </button>
        </div>
      </div>

      <form
        id="product-form"
        onSubmit={handleSubmit}
        className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"
      >
        {/* BASIC INFORMATION */}
        <Section title="BASIC INFORMATION">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Product Name" required>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Example: Core Performance Tee"
                className={inputClass}
              />
            </Field>

            <Field label="SKU">
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="FF-TEE-001"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Description" required>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe the product..."
              className={`${inputClass} resize-none`}
            />
          </Field>
        </Section>

        {/* CATEGORY + COLLECTION */}
        <Section title="CATEGORY & COLLECTION">
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Category" required>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  Select category
                </option>

                {categories.map((category) => (
                  <option
                    key={category._id}
                    value={category._id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              {categories.length === 0 && (
                <p className="mt-2 text-xs text-red-500">
                  No active categories available.
                </p>
              )}
            </Field>

            <Field label="Collection">
              <select
                name="collection"
                value={form.collection}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Performance">
                  Performance
                </option>

                <option value="Luxury">
                  Luxury
                </option>
              </select>
            </Field>

            <Field label="Gender">
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">
                  Unisex
                </option>
              </select>
            </Field>
          </div>
        </Section>

        {/* PRICING + STOCK */}
        <Section title="PRICING & INVENTORY">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Price" required>
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="2499"
                className={inputClass}
              />
            </Field>

            <Field label="Sale Price">
              <input
                name="salePrice"
                type="number"
                min="0"
                value={form.salePrice}
                onChange={handleChange}
                placeholder="1999"
                className={inputClass}
              />
            </Field>

            <Field label="Stock">
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Low Stock Alert">
              <input
                name="lowStockThreshold"
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        {/* SIZES */}
        <Section title="SIZES">
          <div className="flex flex-wrap gap-3">
            {availableSizes.map((size) => {
              const selected =
                form.sizes.includes(size);

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`h-11 min-w-14 rounded-xl border px-4 text-sm font-bold transition ${
                    selected
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 bg-white hover:border-black"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </Section>

        {/* COLORS */}
        <Section title="COLORS">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={colorInput.name}
              onChange={(event) =>
                setColorInput((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
              placeholder="Color name"
              className={`${inputClass} flex-1`}
            />

            <input
              type="color"
              value={colorInput.hex}
              onChange={(event) =>
                setColorInput((previous) => ({
                  ...previous,
                  hex: event.target.value,
                }))
              }
              className="h-12 w-full rounded-xl border border-neutral-200 bg-white p-1 sm:w-20"
            />

            <button
              type="button"
              onClick={addColor}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-bold text-white"
            >
              <Plus size={17} />
              ADD
            </button>
          </div>

          {form.colors.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              {form.colors.map((color, index) => (
                <div
                  key={`${color.name}-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3"
                >
                  <span
                    className="h-6 w-6 rounded-full border border-neutral-200"
                    style={{
                      backgroundColor: color.hex,
                    }}
                  />

                  <span className="text-sm font-semibold">
                    {color.name}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeColor(index)
                    }
                    className="text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* IMAGES */}
        <Section title="PRODUCT IMAGES">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={imageInput}
              onChange={(event) =>
                setImageInput(event.target.value)
              }
              placeholder="Paste image URL"
              className={`${inputClass} flex-1`}
            />

            <button
              type="button"
              onClick={addImage}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-bold text-white"
            >
              <Plus size={17} />
              ADD IMAGE
            </button>
          </div>

          {form.images.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {form.images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-100"
                >
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeImage(index)
                    }
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/80 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {form.images.length === 0 && (
            <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-12 text-center">
              <ImageIcon
                size={30}
                className="text-neutral-300"
              />

              <p className="mt-3 text-sm font-semibold text-neutral-500">
                No product images added
              </p>
            </div>
          )}
        </Section>

        {/* PRODUCT DETAILS */}
        <Section title="PRODUCT DETAILS">
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Material">
              <input
                name="material"
                value={form.material}
                onChange={handleChange}
                placeholder="Premium Cotton"
                className={inputClass}
              />
            </Field>

            <Field label="Fit">
              <input
                name="fit"
                value={form.fit}
                onChange={handleChange}
                placeholder="Athletic Fit"
                className={inputClass}
              />
            </Field>

            <Field label="Care Instructions">
              <input
                name="careInstructions"
                value={form.careInstructions}
                onChange={handleChange}
                placeholder="Machine wash cold"
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        {/* BADGES */}
        <Section title="BADGES">
          <div className="flex flex-wrap gap-3">
            {availableBadges.map((badge) => {
              const selected =
                form.badges.includes(badge);

              return (
                <button
                  key={badge}
                  type="button"
                  onClick={() => toggleBadge(badge)}
                  className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                    selected
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 bg-white hover:border-black"
                  }`}
                >
                  {badge}
                </button>
              );
            })}
          </div>
        </Section>

        {/* STATUS */}
        <Section title="STATUS">
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5">
            <div>
              <p className="font-bold">
                Product Active
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Active products are visible in the store.
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
        </Section>

        {/* BOTTOM SAVE */}
        <div className="flex justify-end gap-3 pb-10">
          <Link
            to="/admin/products"
            className="rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-bold transition hover:bg-neutral-100"
          >
            CANCEL
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            <Save size={17} />

            {saving
              ? "SAVING..."
              : isEditMode
              ? "UPDATE PRODUCT"
              : "CREATE PRODUCT"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Section = ({ title, children }) => {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7">
      <h2 className="mb-6 text-sm font-black tracking-[0.15em]">
        {title}
      </h2>

      <div className="space-y-5">
        {children}
      </div>
    </section>
  );
};

const Field = ({ label, required, children }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
};

const inputClass =
  "h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black";

export default AdminProductForm;