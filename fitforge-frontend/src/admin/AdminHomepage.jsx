import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Eye,
  RotateCcw,
  Sparkles,
  ImageIcon,
  Megaphone,
  ArrowUpRight,
  Upload,
  X,
  Link as LinkIcon,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import api from "../services/api";

const initialForm = {
  heroTitle: "",
  heroSubtitle: "",
  heroDescription: "",
  heroImage: "",
  heroButtonText: "",
  heroButtonLink: "",

  announcementEnabled: true,
  announcementText: "",

  performanceTitle: "",
  performanceSubtitle: "",

  luxuryTitle: "",
  luxurySubtitle: "",

  featuredTitle: "",
  featuredSubtitle: "",

  isActive: true,
};

const AdminHomepage = () => {
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hero image upload state
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadedHeroPublicId, setUploadedHeroPublicId] =
    useState("");

  const [imageSource, setImageSource] = useState("url");

  // --------------------------------------------------
  // Fetch homepage settings
  // --------------------------------------------------
  const fetchHomepage = async () => {
    try {
      setLoading(true);

      const response = await api.get("/homepage/admin");

      const homepage = response.data?.homepage || {};

      setForm({
        ...initialForm,
        ...homepage,
      });

      // If an existing image already exists,
      // show the URL section by default.
      if (homepage.heroImage) {
        setImageSource("url");
      }
    } catch (error) {
      console.error(
        "Fetch homepage error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load homepage settings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepage();
  }, []);

  // --------------------------------------------------
  // Generic form change
  // --------------------------------------------------
  const changeHandler = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // --------------------------------------------------
  // Upload Hero Image
  // --------------------------------------------------
  const handleHeroUpload = async (e) => {
    const file = e.target.files?.[0];

    // Reset file input so same file can be selected again
    e.target.value = "";

    if (!file) return;

    // -----------------------------------------------
    // Validate file type
    // -----------------------------------------------
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    // -----------------------------------------------
    // Validate file size
    // 10MB maximum
    // -----------------------------------------------
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Image size must be less than 10MB.");
      return;
    }

    try {
      setUploadingHero(true);
      setUploadProgress(0);

      const formData = new FormData();

      // Your backend expects exactly "images"
      formData.append("images", file);

      const response = await api.post(
        "/uploads/product-images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },

          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return;

            const progress = Math.round(
              (progressEvent.loaded * 100) /
                progressEvent.total
            );

            setUploadProgress(progress);
          },
        }
      );

      const uploadedImage =
        response.data?.images?.[0];

      if (
        !response.data?.success ||
        !uploadedImage?.url
      ) {
        throw new Error(
          "Cloudinary did not return a valid image URL."
        );
      }

      // -----------------------------------------------
      // Save Cloudinary URL into homepage form
      // -----------------------------------------------
      setForm((prev) => ({
        ...prev,
        heroImage: uploadedImage.url,
      }));

      // Save public ID so we can optionally delete it
      setUploadedHeroPublicId(
        uploadedImage.publicId || ""
      );

      setImageSource("upload");
      setUploadProgress(100);

      alert("Hero image uploaded successfully.");
    } catch (error) {
      console.error(
        "Hero image upload error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Hero image upload failed"
      );
    } finally {
      setUploadingHero(false);
    }
  };

  // --------------------------------------------------
  // Remove Hero Image
  // --------------------------------------------------
  const handleRemoveHeroImage = async () => {
    if (!form.heroImage) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove the hero image?"
    );

    if (!confirmed) return;

    try {
      // -----------------------------------------------
      // Delete Cloudinary image only when we know
      // its public ID.
      // -----------------------------------------------
      if (uploadedHeroPublicId) {
        try {
          await api.delete(
            "/uploads/product-image",
            {
              data: {
                publicId:
                  uploadedHeroPublicId,
              },
            }
          );
        } catch (deleteError) {
          console.error(
            "Cloudinary delete error:",
            deleteError.response?.data ||
              deleteError
          );

          // Do not block clearing the homepage
          // if Cloudinary deletion fails.
        }
      }

      setForm((prev) => ({
        ...prev,
        heroImage: "",
      }));

      setUploadedHeroPublicId("");
      setUploadProgress(0);

      alert("Hero image removed.");
    } catch (error) {
      console.error(
        "Remove hero image error:",
        error
      );

      alert("Failed to remove hero image.");
    }
  };

  // --------------------------------------------------
  // Save homepage settings
  // --------------------------------------------------
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await api.patch(
        "/homepage/admin",
        form
      );

      const homepage =
        response.data?.homepage;

      setForm({
        ...initialForm,
        ...(homepage || form),
      });

      alert(
        "Homepage settings saved successfully."
      );
    } catch (error) {
      console.error(
        "Save homepage error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Failed to save homepage settings"
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Reset form from database
  // --------------------------------------------------
  const handleReset = async () => {
    const confirmed = window.confirm(
      "Discard your unsaved changes?"
    );

    if (!confirmed) return;

    await fetchHomepage();
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading homepage settings...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* ==================================================
          HEADER
      ================================================== */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gray-900" />

                <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                  Homepage Management
                </h1>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Control your FITFORGE homepage content,
                hero section and collections.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          MAIN
      ================================================== */}
      <form
        onSubmit={handleSave}
        className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8"
      >
        {/* ==================================================
            HERO SETTINGS
        ================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-100 p-2.5">
                <ImageIcon className="h-5 w-5 text-gray-700" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  Hero Section
                </h2>

                <p className="text-sm text-gray-500">
                  Main visual and headline shown at
                  the top of your homepage.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
            {/* -------------------------------------------
                Hero Text
            ------------------------------------------- */}
            <div className="space-y-5">
              <Field
                label="Hero Heading"
                name="heroTitle"
                value={form.heroTitle}
                onChange={changeHandler}
                placeholder="THE MOST ICONIC GYM WEAR"
              />

              <Field
                label="Hero Subtitle"
                name="heroSubtitle"
                value={form.heroSubtitle}
                onChange={changeHandler}
                placeholder="BUILT FOR PERFORMANCE. DESIGNED FOR THE ICONIC."
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Hero Description
                </label>

                <textarea
                  name="heroDescription"
                  value={form.heroDescription}
                  onChange={changeHandler}
                  rows={4}
                  placeholder="Premium gym wear engineered for movement..."
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Button Text"
                  name="heroButtonText"
                  value={form.heroButtonText}
                  onChange={changeHandler}
                  placeholder="SHOP THE SIGNATURE COLLECTION"
                />

                <Field
                  label="Button URL"
                  name="heroButtonLink"
                  value={form.heroButtonLink}
                  onChange={changeHandler}
                  placeholder="/shop"
                />
              </div>
            </div>

            {/* -------------------------------------------
                Hero Image
            ------------------------------------------- */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Hero Image
                </label>

                <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() =>
                      setImageSource("upload")
                    }
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      imageSource === "upload"
                        ? "bg-black text-white"
                        : "text-gray-600 hover:bg-white"
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setImageSource("url")
                    }
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      imageSource === "url"
                        ? "bg-black text-white"
                        : "text-gray-600 hover:bg-white"
                    }`}
                  >
                    <LinkIcon className="h-4 w-4" />
                    Image URL
                  </button>
                </div>
              </div>

              {/* -----------------------------------------
                  Upload
              ----------------------------------------- */}
              {imageSource === "upload" && (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-3 rounded-full bg-white p-3 shadow-sm">
                      <Upload className="h-6 w-6 text-gray-700" />
                    </div>

                    <h3 className="font-medium text-gray-900">
                      Upload Hero Image
                    </h3>

                    <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                      JPG, JPEG, PNG, WEBP and other
                      supported image formats. Maximum
                      size: 10MB.
                    </p>

                    <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">
                      {uploadingHero ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Choose Image
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingHero}
                        onChange={
                          handleHeroUpload
                        }
                      />
                    </label>

                    {uploadingHero && (
                      <div className="mt-4 w-full max-w-sm">
                        <div className="mb-1 flex justify-between text-xs text-gray-500">
                          <span>
                            Uploading to Cloudinary
                          </span>

                          <span>
                            {uploadProgress}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-black transition-all duration-300"
                            style={{
                              width: `${uploadProgress}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {!uploadingHero &&
                      uploadedHeroPublicId && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Image uploaded to Cloudinary
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* -----------------------------------------
                  URL
              ----------------------------------------- */}
              {imageSource === "url" && (
                <div>
                  <Field
                    label="Hero Image URL"
                    name="heroImage"
                    value={form.heroImage}
                    onChange={changeHandler}
                    placeholder="https://example.com/hero.jpg"
                    icon={
                      <LinkIcon className="h-4 w-4" />
                    }
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Paste any publicly accessible image
                    URL. If you upload an image, the
                    Cloudinary URL will replace this value.
                  </p>
                </div>
              )}

              {/* -----------------------------------------
                  Current Image Preview
              ----------------------------------------- */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Current Hero Image
                  </label>

                  {form.heroImage && (
                    <button
                      type="button"
                      onClick={
                        handleRemoveHeroImage
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 transition hover:text-red-700"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                  {form.heroImage ? (
                    <>
                      <img
                        src={form.heroImage}
                        alt="FITFORGE Hero"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";

                          const fallback =
                            e.currentTarget
                              .nextElementSibling;

                          if (fallback) {
                            fallback.style.display =
                              "flex";
                          }
                        }}
                      />

                      <div className="absolute inset-0 hidden items-center justify-center bg-gray-100 text-center">
                        <div>
                          <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />

                          <p className="mt-2 text-sm font-medium text-gray-600">
                            Image could not be loaded
                          </p>

                          <p className="mt-1 px-4 text-xs text-gray-400">
                            Check the image URL.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-center">
                      <div>
                        <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />

                        <p className="mt-2 text-sm font-medium text-gray-600">
                          No hero image selected
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Upload an image or paste a
                          URL above.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ==================================================
            ANNOUNCEMENT
        ================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-100 p-2.5">
                <Megaphone className="h-5 w-5 text-gray-700" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  Announcement Banner
                </h2>

                <p className="text-sm text-gray-500">
                  Promotional message shown at the top
                  of the website.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Field
                  label="Announcement Text"
                  name="announcementText"
                  value={form.announcementText}
                  onChange={changeHandler}
                  placeholder="THE MOST ICONIC GYM WEAR"
                />
              </div>

              <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-gray-300 bg-white px-4">
                <input
                  type="checkbox"
                  name="announcementEnabled"
                  checked={
                    form.announcementEnabled
                  }
                  onChange={changeHandler}
                  className="h-4 w-4 rounded border-gray-300"
                />

                <span className="text-sm font-medium text-gray-700">
                  Enabled
                </span>
              </label>
            </div>
          </div>
        </motion.section>

        {/* ==================================================
            PERFORMANCE
        ================================================== */}
        <CollectionCard
          title="Performance Collection"
          subtitle="Athletic and modern collection content."
          icon="performance"
          titleName="performanceTitle"
          subtitleName="performanceSubtitle"
          titleValue={form.performanceTitle}
          subtitleValue={form.performanceSubtitle}
          onChange={changeHandler}
        />

        {/* ==================================================
            LUXURY
        ================================================== */}
        <CollectionCard
          title="Luxury Collection"
          subtitle="Premium dark high-end collection content."
          icon="luxury"
          titleName="luxuryTitle"
          subtitleName="luxurySubtitle"
          titleValue={form.luxuryTitle}
          subtitleValue={form.luxurySubtitle}
          onChange={changeHandler}
        />

        {/* ==================================================
            FEATURED
        ================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-100 p-2.5">
                <Sparkles className="h-5 w-5 text-gray-700" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  Featured / Iconic Section
                </h2>

                <p className="text-sm text-gray-500">
                  Control the heading displayed above
                  your featured products.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <Field
              label="Featured Heading"
              name="featuredTitle"
              value={form.featuredTitle}
              onChange={changeHandler}
              placeholder="ICONIC ESSENTIALS"
            />

            <Field
              label="Featured Subtitle"
              name="featuredSubtitle"
              value={form.featuredSubtitle}
              onChange={changeHandler}
              placeholder="THE PIECES THAT DEFINE FITFORGE"
            />
          </div>
        </motion.section>

        {/* ==================================================
            STATUS
        ================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="font-semibold text-gray-900">
                Homepage Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Control whether these homepage settings
                are active.
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={changeHandler}
                className="h-5 w-5 rounded border-gray-300"
              />

              <span className="text-sm font-medium text-gray-700">
                Homepage Active
              </span>
            </label>
          </div>
        </motion.section>

        {/* ==================================================
            SAVE BAR
        ================================================== */}
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Eye className="h-4 w-4" />

            <span>
              Changes are applied to the customer
              homepage after saving.
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Homepage
                <ArrowUpRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// ======================================================
// FIELD COMPONENT
// ======================================================
const Field = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  icon = null,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          id={name}
          type="text"
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border border-gray-300 bg-white text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10 ${
            icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
};

// ======================================================
// COLLECTION CARD
// ======================================================
const CollectionCard = ({
  title,
  subtitle,
  icon,
  titleName,
  subtitleName,
  titleValue,
  subtitleValue,
  onChange,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gray-100 p-2.5">
            <Sparkles className="h-5 w-5 text-gray-700" />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              {title}
            </h2>

            <p className="text-sm text-gray-500">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <Field
          label="Heading"
          name={titleName}
          value={titleValue}
          onChange={onChange}
          placeholder={title}
        />

        <Field
          label="Subtitle"
          name={subtitleName}
          value={subtitleValue}
          onChange={onChange}
          placeholder="Collection subtitle"
        />
      </div>
    </motion.section>
  );
};

export default AdminHomepage;

