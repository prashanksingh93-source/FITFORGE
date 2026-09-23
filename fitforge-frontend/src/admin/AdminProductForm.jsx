import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Save,
  Star,
  Trash2,
  Upload,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { toast } from "sonner";

import api from "../services/api";

// =====================================================
// CONSTANTS
// =====================================================

const COLLECTIONS = [
  "Performance",
  "Luxury",
];

const GENDERS = [
  "Men",
  "Women",
  "Unisex",
];

const CATEGORIES = [
  "T-Shirts",
  "Tank Tops",
  "Shorts",
  "Joggers",
  "Leggings",
  "Sports Bras",
  "Hoodies",
  "Jackets",
];

const SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
];

const DEFAULT_COLORS = [
  {
    name: "Black",
    hex: "#000000",
  },
  {
    name: "White",
    hex: "#FFFFFF",
  },
  {
    name: "Grey",
    hex: "#808080",
  },
  {
    name: "Navy",
    hex: "#000080",
  },
  {
    name: "Red",
    hex: "#FF0000",
  },
  {
    name: "Green",
    hex: "#008000",
  },
  {
    name: "Beige",
    hex: "#F5F5DC",
  },
];

// =====================================================
// HELPERS
// =====================================================

const createSlug = (value = "") => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

/*
  IMPORTANT:
  The backend stores colors as objects:

  {
    name: "Black",
    hex: "#000000"
  }

  But the admin form keeps colors as strings:

  ["Black", "White", "Navy"]

  This prevents React object-rendering errors.
*/

const getColorName = (color) => {
  if (typeof color === "string") {
    return color.trim();
  }

  if (
    color &&
    typeof color === "object"
  ) {
    return (
      color.name?.trim?.() || ""
    );
  }

  return "";
};

const getColorHex = (color) => {
  if (
    color &&
    typeof color === "object" &&
    color.hex
  ) {
    return color.hex;
  }

  const name = getColorName(color);

  const defaultColor =
    DEFAULT_COLORS.find(
      (item) =>
        item.name.toLowerCase() ===
        name.toLowerCase()
    );

  return (
    defaultColor?.hex ||
    "#000000"
  );
};

const normalizeColorName = (
  color
) => {
  return getColorName(color);
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  salePrice: "",
  category: "T-Shirts",
  gender: "Unisex",
  collection: "Performance",
  sizes: [],
  colors: [],
  stock: "",
  sku: "",
  material: "",
  fit: "",
  careInstructions: "",
  images: [],
  thumbnail: "",
  isIconic: false,
  isBestSeller: false,
  isNewArrival: false,
  isFeatured: false,
  isLimitedEdition: false,
  isActive: true,
};

// =====================================================
// SMALL UI COMPONENTS
// =====================================================

const Section = ({
  title,
  children,
}) => {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 border-b border-neutral-100 pb-4">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-black">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  name,
  type = "text",
  placeholder = "",
  required = false,
  min,
  step,
}) => {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-neutral-600">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
      />
    </div>
  );
};

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
}) => {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-neutral-600">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-black"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

// =====================================================
// COMPONENT
// =====================================================

const AdminProductForm = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const fileInputRef =
    useRef(null);

  const isEditMode =
    Boolean(id);

  const [form, setForm] =
    useState({
      ...emptyForm,
      sizes: [],
      colors: [],
      images: [],
    });

  const [loading, setLoading] =
    useState(isEditMode);

  const [saving, setSaving] =
    useState(false);

  const [
    uploadingImages,
    setUploadingImages,
  ] = useState(false);

  const [newColor, setNewColor] =
    useState("");

  // ===================================================
  // LOAD PRODUCT
  // ===================================================

  useEffect(() => {
    if (!id) {
      setForm({
        ...emptyForm,
        sizes: [],
        colors: [],
        images: [],
      });

      setLoading(false);

      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);

        const response =
          await api.get(
            `/admin/products/${id}`
          );

        const product =
          response.data?.product ||
          response.data?.data ||
          response.data;

        if (!product) {
          throw new Error(
            "Product not found"
          );
        }

        /*
          IMPORTANT FIX

          Backend may return:

          colors: [
            {
              name: "Black",
              hex: "#000000"
            }
          ]

          Convert them to:

          colors: ["Black"]

          inside the form.
        */

        const normalizedColors =
          Array.isArray(
            product.colors
          )
            ? product.colors
                .map(
                  normalizeColorName
                )
                .filter(Boolean)
            : [];

        const normalizedImages =
          Array.isArray(
            product.images
          )
            ? product.images
                .map((image) =>
                  typeof image ===
                  "string"
                    ? image
                    : image?.url
                )
                .filter(Boolean)
            : [];

        const normalizedThumbnail =
          typeof product.thumbnail ===
          "string"
            ? product.thumbnail
            : product.thumbnail?.url ||
              "";

        setForm({
          name:
            product.name || "",

          slug:
            product.slug || "",

          description:
            product.description || "",

          price:
            product.price ?? "",

          salePrice:
            product.salePrice ?? "",

          category:
            product.category?.name ||
            product.category ||
            "T-Shirts",

          gender:
            product.gender ||
            "Unisex",

          collection:
            product.collection ||
            "Performance",

          sizes:
            Array.isArray(
              product.sizes
            )
              ? product.sizes
              : [],

          colors:
            normalizedColors,

          stock:
            product.stock ?? "",

          sku:
            product.sku || "",

          material:
            product.material || "",

          fit:
            product.fit || "",

          careInstructions:
            product.careInstructions ||
            "",

          images:
            normalizedImages,

          thumbnail:
            normalizedThumbnail,

          isIconic:
            Boolean(
              product.isIconic
            ),

          isBestSeller:
            Boolean(
              product.isBestSeller
            ),

          isNewArrival:
            Boolean(
              product.isNewArrival
            ),

          isFeatured:
            Boolean(
              product.isFeatured
            ),

          isLimitedEdition:
            Boolean(
              product.isLimitedEdition
            ),

          isActive:
            product.isActive !== false,
        });
      } catch (error) {
        console.error(
          "Load product error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to load product"
        );

        navigate(
          "/admin/products"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  // ===================================================
  // INPUT CHANGE
  // ===================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => {
      const nextValue =
        type === "checkbox"
          ? checked
          : value;

      if (
        name === "name" &&
        !isEditMode
      ) {
        return {
          ...previous,
          name: value,
          slug: createSlug(value),
        };
      }

      return {
        ...previous,
        [name]: nextValue,
      };
    });
  };

  // ===================================================
  // SIZE
  // ===================================================

  const toggleSize = (size) => {
    setForm((previous) => ({
      ...previous,

      sizes:
        previous.sizes.includes(
          size
        )
          ? previous.sizes.filter(
              (item) =>
                item !== size
            )
          : [
              ...previous.sizes,
              size,
            ],
    }));
  };

  // ===================================================
  // COLOR
  // ===================================================

  const addColor = (color) => {
    const cleanColor =
      getColorName(color);

    if (!cleanColor) {
      return;
    }

    const alreadyExists =
      form.colors.some(
        (item) =>
          getColorName(
            item
          ).toLowerCase() ===
          cleanColor.toLowerCase()
      );

    if (alreadyExists) {
      toast.error(
        "Color already added"
      );

      return;
    }

    /*
      IMPORTANT:
      Store only the color name
      in frontend state.

      Backend will convert it
      into { name, hex }.
    */

    setForm((previous) => ({
      ...previous,

      colors: [
        ...previous.colors,
        cleanColor,
      ],
    }));

    setNewColor("");
  };

  const removeColor = (
    colorToRemove
  ) => {
    const removeName =
      getColorName(
        colorToRemove
      ).toLowerCase();

    setForm((previous) => ({
      ...previous,

      colors:
        previous.colors.filter(
          (item) =>
            getColorName(
              item
            ).toLowerCase() !==
            removeName
        ),
    }));
  };

  const hasColor = (color) => {
    const target =
      getColorName(
        color
      ).toLowerCase();

    return form.colors.some(
      (item) =>
        getColorName(
          item
        ).toLowerCase() ===
        target
    );
  };

  // ===================================================
  // IMAGE UPLOAD
  // ===================================================

  const handleImageUpload =
    async (event) => {
      const files = Array.from(
        event.target.files || []
      );

      if (!files.length) {
        return;
      }

      if (
        form.images.length +
          files.length >
        10
      ) {
        toast.error(
          "Maximum 10 product images allowed"
        );

        event.target.value = "";

        return;
      }

      const invalidFile =
        files.find(
          (file) =>
            !file.type.startsWith(
              "image/"
            )
        );

      if (invalidFile) {
        toast.error(
          "Only image files are allowed"
        );

        event.target.value = "";

        return;
      }

      const largeFile =
        files.find(
          (file) =>
            file.size >
            5 * 1024 * 1024
        );

      if (largeFile) {
        toast.error(
          "Each image must be smaller than 5 MB"
        );

        event.target.value = "";

        return;
      }

      try {
        setUploadingImages(true);

        const formData =
          new FormData();

        files.forEach((file) => {
          formData.append(
            "images",
            file
          );
        });

        const response =
          await api.post(
            "/uploads/product-images",
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        const uploadedImages =
          response.data?.images ||
          [];

        if (
          !uploadedImages.length
        ) {
          throw new Error(
            "No images returned from server"
          );
        }

        const urls =
          uploadedImages
            .map((image) =>
              typeof image ===
              "string"
                ? image
                : image?.url
            )
            .filter(Boolean);

        if (!urls.length) {
          throw new Error(
            "Uploaded images did not contain valid URLs"
          );
        }

        setForm((previous) => {
          const newImages = [
            ...previous.images,
            ...urls,
          ];

          return {
            ...previous,

            images:
              newImages,

            thumbnail:
              previous.thumbnail ||
              newImages[0] ||
              "",
          };
        });

        toast.success(
          `${urls.length} image${
            urls.length > 1
              ? "s"
              : ""
          } uploaded successfully`
        );
      } catch (error) {
        console.error(
          "Image upload error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            error.message ||
            "Image upload failed"
        );
      } finally {
        setUploadingImages(
          false
        );

        event.target.value = "";
      }
    };

  // ===================================================
  // REMOVE IMAGE
  // ===================================================

  const removeImage = (
    index
  ) => {
    const image =
      form.images[index];

    if (!image) {
      return;
    }

    const confirmed =
      window.confirm(
        "Remove this image?"
      );

    if (!confirmed) {
      return;
    }

    setForm((previous) => {
      const images =
        previous.images.filter(
          (_, imageIndex) =>
            imageIndex !== index
        );

      let thumbnail =
        previous.thumbnail;

      if (
        thumbnail === image
      ) {
        thumbnail =
          images[0] || "";
      }

      return {
        ...previous,
        images,
        thumbnail,
      };
    });
  };

  // ===================================================
  // PRIMARY IMAGE
  // ===================================================

  const setPrimaryImage = (
    image
  ) => {
    setForm((previous) => ({
      ...previous,

      thumbnail: image,

      images: [
        image,
        ...previous.images.filter(
          (item) =>
            item !== image
        ),
      ],
    }));
  };

  // ===================================================
  // VALIDATION
  // ===================================================

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error(
        "Product name is required"
      );

      return false;
    }

    if (
      !form.description.trim()
    ) {
      toast.error(
        "Product description is required"
      );

      return false;
    }

    if (
      form.price === "" ||
      Number(form.price) <= 0
    ) {
      toast.error(
        "Enter a valid product price"
      );

      return false;
    }

    if (
      form.salePrice !== "" &&
      form.salePrice !== null &&
      Number(form.salePrice) >=
        Number(form.price)
    ) {
      toast.error(
        "Sale price must be lower than regular price"
      );

      return false;
    }

    if (
      form.stock === "" ||
      Number(form.stock) < 0
    ) {
      toast.error(
        "Enter a valid stock quantity"
      );

      return false;
    }

    if (!form.sku.trim()) {
      toast.error(
        "SKU is required"
      );

      return false;
    }

    if (!form.sizes.length) {
      toast.error(
        "Select at least one size"
      );

      return false;
    }

    if (!form.colors.length) {
      toast.error(
        "Select at least one color"
      );

      return false;
    }

    if (!form.images.length) {
      toast.error(
        "Upload at least one product image"
      );

      return false;
    }

    return true;
  };

  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (uploadingImages) {
      toast.error(
        "Please wait for image uploads to finish"
      );

      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      /*
        Send color names.

        Backend adminProduct.controller.js
        already converts these into:

        {
          name: "Black",
          hex: "#000000"
        }
      */

      const payload = {
        name:
          form.name.trim(),

        slug:
          form.slug.trim() ||
          createSlug(form.name),

        description:
          form.description.trim(),

        price:
          Number(form.price),

        salePrice:
          form.salePrice === "" ||
          form.salePrice === null
            ? null
            : Number(
                form.salePrice
              ),

        category:
          form.category,

        gender:
          form.gender,

        collection:
          form.collection,

        sizes:
          form.sizes,

        colors:
          form.colors.map(
            getColorName
          ).filter(Boolean),

        stock:
          Number(form.stock),

        sku:
          form.sku.trim(),

        material:
          form.material.trim(),

        fit:
          form.fit.trim(),

        careInstructions:
          form.careInstructions.trim(),

        images:
          form.images,

        thumbnail:
          form.thumbnail ||
          form.images[0],

        isIconic:
          form.isIconic,

        isBestSeller:
          form.isBestSeller,

        isNewArrival:
          form.isNewArrival,

        isFeatured:
          form.isFeatured,

        isLimitedEdition:
          form.isLimitedEdition,

        isActive:
          form.isActive,
      };

      let response;

      if (isEditMode) {
        response =
          await api.patch(
            `/admin/products/${id}`,
            payload
          );
      } else {
        response =
          await api.post(
            "/admin/products",
            payload
          );
      }

      if (
        response.data?.success ===
        false
      ) {
        throw new Error(
          response.data.message ||
            "Product operation failed"
        );
      }

      toast.success(
        isEditMode
          ? "Product updated successfully"
          : "Product created successfully"
      );

      navigate(
        "/admin/products"
      );
    } catch (error) {
      console.error(
        "Save product error:",
        error
      );

      toast.error(
        error.response?.data
          ?.message ||
          error.message ||
          "Failed to save product"
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2
            size={34}
            className="mx-auto animate-spin"
          />

          <p className="mt-4 text-sm font-bold text-neutral-500">
            LOADING PRODUCT
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8">

      {/* HEADER */}

      <div className="mx-auto mb-6 max-w-7xl">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/products"
            )
          }
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-neutral-600 transition hover:text-black"
        >
          <ArrowLeft size={17} />

          Back to Products
        </button>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-neutral-400">
              FITFORGE ADMIN
            </p>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              {isEditMode
                ? "Edit Product"
                : "Add Product"}
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Manage your FITFORGE
              product catalog.
            </p>
          </div>

          <button
            type="submit"
            form="product-form"
            disabled={
              saving ||
              uploadingImages
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                SAVING...
              </>
            ) : (
              <>
                <Save size={17} />

                {isEditMode
                  ? "UPDATE PRODUCT"
                  : "CREATE PRODUCT"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* FORM */}

      <form
        id="product-form"
        onSubmit={handleSubmit}
        className="mx-auto max-w-7xl space-y-6"
      >

        {/* BASIC INFORMATION */}

        <Section title="Basic Information">
          <div className="grid gap-5 md:grid-cols-2">

            <InputField
              label="Product Name"
              name="name"
              value={form.name}
              onChange={
                handleChange
              }
              placeholder="Performance Training T-Shirt"
              required
            />

            <InputField
              label="Slug"
              name="slug"
              value={form.slug}
              onChange={
                handleChange
              }
              placeholder="performance-training-t-shirt"
              required
            />

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-neutral-600">
                Description

                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <textarea
                name="description"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                rows={5}
                placeholder="Describe the product..."
                required
                className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

          </div>
        </Section>

        {/* PRICING */}

        <Section title="Pricing & Inventory">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <InputField
              label="Price (₹)"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={
                handleChange
              }
              placeholder="1999"
              required
            />

            <InputField
              label="Sale Price (₹)"
              name="salePrice"
              type="number"
              min="0"
              step="0.01"
              value={
                form.salePrice ??
                ""
              }
              onChange={
                handleChange
              }
              placeholder="1499"
            />

            <InputField
              label="Stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={
                handleChange
              }
              placeholder="50"
              required
            />

            <InputField
              label="SKU"
              name="sku"
              value={form.sku}
              onChange={
                handleChange
              }
              placeholder="FF-PER-TS-001"
              required
            />

          </div>
        </Section>

        {/* CLASSIFICATION */}

        <Section title="Product Classification">
          <div className="grid gap-5 md:grid-cols-3">

            <SelectField
              label="Collection"
              name="collection"
              value={
                form.collection
              }
              onChange={
                handleChange
              }
              options={
                COLLECTIONS
              }
            />

            <SelectField
              label="Category"
              name="category"
              value={
                form.category
              }
              onChange={
                handleChange
              }
              options={
                CATEGORIES
              }
            />

            <SelectField
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={
                handleChange
              }
              options={GENDERS}
            />

          </div>
        </Section>

        {/* SIZES */}

        <Section title="Sizes">
          <div className="flex flex-wrap gap-3">
            {SIZES.map((size) => {
              const selected =
                form.sizes.includes(
                  size
                );

              return (
                <button
                  type="button"
                  key={size}
                  onClick={() =>
                    toggleSize(
                      size
                    )
                  }
                  className={`min-w-16 rounded-xl border px-5 py-3 text-sm font-black transition ${
                    selected
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 bg-white text-black hover:border-black"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </Section>

        {/* COLORS */}

        <Section title="Colors">

          <div className="flex flex-wrap gap-2">
            {DEFAULT_COLORS.map(
              (color) => {
                const exists =
                  hasColor(
                    color.name
                  );

                return (
                  <button
                    type="button"
                    key={color.name}
                    onClick={() =>
                      addColor(
                        color.name
                      )
                    }
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${
                      exists
                        ? "border-black bg-black text-white"
                        : "border-neutral-200 bg-white hover:border-black"
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-neutral-300"
                      style={{
                        backgroundColor:
                          color.hex,
                      }}
                    />

                    {color.name}
                  </button>
                );
              }
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newColor}
              onChange={(event) =>
                setNewColor(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();

                  addColor(
                    newColor
                  );
                }
              }}
              placeholder="Add custom color"
              className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
            />

            <button
              type="button"
              onClick={() =>
                addColor(
                  newColor
                )
              }
              className="rounded-xl border border-black px-5 py-3 text-sm font-bold transition hover:bg-black hover:text-white"
            >
              Add Color
            </button>
          </div>

          {form.colors.length >
            0 && (
            <div className="mt-5 flex flex-wrap gap-2">

              {form.colors.map(
                (color, index) => {
                  const name =
                    getColorName(
                      color
                    );

                  const hex =
                    getColorHex(
                      color
                    );

                  return (
                    <div
                      key={`${name}-${index}`}
                      className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-xs font-bold"
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-neutral-300"
                        style={{
                          backgroundColor:
                            hex,
                        }}
                      />

                      <span>
                        {name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeColor(
                            color
                          )
                        }
                        className="text-neutral-400 hover:text-black"
                        aria-label={`Remove ${name}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                }
              )}

            </div>
          )}

        </Section>

        {/* PRODUCT DETAILS */}

        <Section title="Product Details">
          <div className="grid gap-5 md:grid-cols-2">

            <InputField
              label="Material"
              name="material"
              value={form.material}
              onChange={
                handleChange
              }
              placeholder="88% Polyester, 12% Elastane"
            />

            <InputField
              label="Fit"
              name="fit"
              value={form.fit}
              onChange={
                handleChange
              }
              placeholder="Athletic Fit"
            />

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-neutral-600">
                Care Instructions
              </label>

              <textarea
                name="careInstructions"
                value={
                  form.careInstructions
                }
                onChange={
                  handleChange
                }
                rows={4}
                placeholder="Machine wash cold. Do not bleach..."
                className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

          </div>
        </Section>

        {/* PRODUCT IMAGES */}

        <Section title="Product Images">

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={
              handleImageUpload
            }
            className="hidden"
          />

          <button
            type="button"
            disabled={
              uploadingImages ||
              form.images.length >=
                10
            }
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadingImages ? (
              <Loader2
                size={36}
                className="animate-spin"
              />
            ) : (
              <Upload size={36} />
            )}

            <p className="mt-4 text-sm font-black">
              {uploadingImages
                ? "UPLOADING TO CLOUDINARY..."
                : "UPLOAD PRODUCT IMAGES"}
            </p>

            <p className="mt-2 text-xs text-neutral-500">
              JPG, PNG or WEBP • Maximum
              5 MB per image • Maximum
              10 images
            </p>
          </button>

          {form.images.length >
            0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {form.images.map(
                (image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-100"
                  >
                    <img
                      src={image}
                      alt={`FITFORGE product ${
                        index + 1
                      }`}
                      className="h-full w-full object-cover"
                    />

                    {form.thumbnail ===
                      image && (
                      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black px-3 py-1.5 text-[10px] font-black uppercase text-white">
                        <Star
                          size={10}
                          fill="currentColor"
                        />

                        Primary
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-2 bg-black/80 p-2 transition group-hover:translate-y-0">

                      {form.thumbnail !==
                        image && (
                        <button
                          type="button"
                          onClick={() =>
                            setPrimaryImage(
                              image
                            )
                          }
                          className="flex flex-1 items-center justify-center rounded-lg bg-white px-2 py-2 text-[10px] font-black text-black"
                        >
                          PRIMARY
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            index
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black"
                        aria-label="Remove image"
                      >
                        <Trash2
                          size={14}
                        />
                      </button>

                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {form.images.length ===
            0 && (
            <div className="mt-5 rounded-2xl border border-neutral-200 py-10 text-center">
              <ImagePlus
                size={30}
                className="mx-auto text-neutral-300"
              />

              <p className="mt-3 text-sm font-semibold text-neutral-500">
                No images uploaded yet
              </p>
            </div>
          )}

        </Section>

        {/* PRODUCT FLAGS */}

        <Section title="Store Visibility & Badges">

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-4">
              <input
                type="checkbox"
                name="isIconic"
                checked={
                  form.isIconic
                }
                onChange={
                  handleChange
                }
                className="h-4 w-4"
              />

              <div>
                <p className="text-sm font-bold">
                  Iconic
                </p>

                <p className="text-xs text-neutral-500">
                  Show in iconic products
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-4">
              <input
                type="checkbox"
                name="isBestSeller"
                checked={
                  form.isBestSeller
                }
                onChange={
                  handleChange
                }
                className="h-4 w-4"
              />

              <div>
                <p className="text-sm font-bold">
                  Bestseller
                </p>

                <p className="text-xs text-neutral-500">
                  Show as bestseller
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-4">
              <input
                type="checkbox"
                name="isNewArrival"
                checked={
                  form.isNewArrival
                }
                onChange={
                  handleChange
                }
                className="h-4 w-4"
              />

              <div>
                <p className="text-sm font-bold">
                  New Arrival
                </p>

                <p className="text-xs text-neutral-500">
                  Show as new arrival
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-4">
              <input
                type="checkbox"
                name="isFeatured"
                checked={
                  form.isFeatured
                }
                onChange={
                  handleChange
                }
                className="h-4 w-4"
              />

              <div>
                <p className="text-sm font-bold">
                  Featured
                </p>

                <p className="text-xs text-neutral-500">
                  Show in featured products
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-4">
              <input
                type="checkbox"
                name="isLimitedEdition"
                checked={
                  form.isLimitedEdition
                }
                onChange={
                  handleChange
                }
                className="h-4 w-4"
              />

              <div>
                <p className="text-sm font-bold">
                  Limited Edition
                </p>

                <p className="text-xs text-neutral-500">
                  Mark as limited edition
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-4">
              <input
                type="checkbox"
                name="isActive"
                checked={
                  form.isActive
                }
                onChange={
                  handleChange
                }
                className="h-4 w-4"
              />

              <div>
                <p className="text-sm font-bold">
                  Active
                </p>

                <p className="text-xs text-neutral-500">
                  Visible to customers
                </p>
              </div>
            </label>

          </div>
        </Section>

        {/* MOBILE SAVE */}

        <div className="flex justify-end pb-10">
          <button
            type="submit"
            disabled={
              saving ||
              uploadingImages
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-7 py-4 text-sm font-black text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                SAVING...
              </>
            ) : (
              <>
                <Save size={17} />

                {isEditMode
                  ? "UPDATE PRODUCT"
                  : "CREATE PRODUCT"}
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AdminProductForm;

