import { useEffect, useState } from "react";
import {
  Save,
  Eye,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  Megaphone,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

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

  useEffect(() => {
    fetchHomepage();
  }, []);

  const fetchHomepage = async () => {
    try {
      setLoading(true);

      const response = await api.get("/homepage/admin");

      setForm({
        ...initialForm,
        ...response.data.homepage,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load homepage"
      );
    } finally {
      setLoading(false);
    }
  };

  const changeHandler = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveHomepage = async () => {
    try {
      setSaving(true);

      const response = await api.patch(
        "/homepage/admin",
        form
      );

      setForm(response.data.homepage);

      toast.success("Homepage updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update homepage"
      );
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    fetchHomepage();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6 md:p-10">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-8 h-10 w-72 rounded-xl bg-neutral-200" />

          <div className="h-80 rounded-3xl bg-neutral-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}

      <div className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
              FITFORGE / ADMIN
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">
              Homepage Management
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetForm}
              className="hidden items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold transition hover:border-black md:flex"
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              onClick={saveHomepage}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={17} />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-8 px-5 py-8 md:px-8">

        {/* Hero Preview */}

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl bg-black text-white"
        >
          <div className="grid min-h-[430px] lg:grid-cols-2">
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
              <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
                <Sparkles size={15} />
                Live Preview
              </div>

              <h2 className="max-w-xl text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
                {form.heroTitle ||
                  "THE MOST ICONIC GYM WEAR"}
              </h2>

              <p className="mt-6 max-w-lg text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">
                {form.heroSubtitle}
              </p>

              <p className="mt-4 max-w-lg text-sm leading-6 text-neutral-500">
                {form.heroDescription}
              </p>

              <div className="mt-8">
                <span className="inline-flex items-center gap-3 bg-white px-6 py-4 text-sm font-black text-black">
                  {form.heroButtonText ||
                    "SHOP NOW"}

                  <ArrowUpRight size={17} />
                </span>
              </div>
            </div>

            <div className="relative min-h-[300px] overflow-hidden bg-neutral-900">
              {form.heroImage ? (
                <img
                  src={form.heroImage}
                  alt="Homepage hero"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <ImageIcon
                      className="mx-auto text-neutral-600"
                      size={55}
                    />

                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-neutral-600">
                      Add Hero Image
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            </div>
          </div>
        </motion.section>


        {/* Announcement */}

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-black p-3 text-white">
              <Megaphone size={19} />
            </div>

            <div>
              <h2 className="font-bold">
                Announcement Bar
              </h2>

              <p className="text-sm text-neutral-500">
                Control the message shown at the top of the website.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-[1fr_auto]">
            <input
              name="announcementText"
              value={form.announcementText}
              onChange={changeHandler}
              placeholder="THE MOST ICONIC GYM WEAR"
              className="h-12 rounded-xl border border-neutral-200 px-4 text-sm outline-none transition focus:border-black"
            />

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 px-5">
              <input
                type="checkbox"
                name="announcementEnabled"
                checked={form.announcementEnabled}
                onChange={changeHandler}
                className="h-4 w-4"
              />

              <span className="text-sm font-semibold">
                Enabled
              </span>
            </label>
          </div>
        </section>


        {/* Hero Settings */}

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
              Hero Section
            </p>

            <h2 className="mt-1 text-xl font-black">
              Main Homepage Content
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <Field
              label="Hero Title"
              name="heroTitle"
              value={form.heroTitle}
              onChange={changeHandler}
            />

            <Field
              label="Hero Subtitle"
              name="heroSubtitle"
              value={form.heroSubtitle}
              onChange={changeHandler}
            />

            <Field
              label="Button Text"
              name="heroButtonText"
              value={form.heroButtonText}
              onChange={changeHandler}
            />

            <Field
              label="Button Link"
              name="heroButtonLink"
              value={form.heroButtonLink}
              onChange={changeHandler}
            />

            <div className="md:col-span-2">
              <Field
                label="Hero Image URL"
                name="heroImage"
                value={form.heroImage}
                onChange={changeHandler}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Hero Description
              </label>

              <textarea
                name="heroDescription"
                value={form.heroDescription}
                onChange={changeHandler}
                rows={4}
                className="w-full rounded-xl border border-neutral-200 p-4 text-sm outline-none transition focus:border-black"
              />
            </div>
          </div>
        </section>


        {/* Collections */}

        <section className="grid gap-6 lg:grid-cols-2">

          <CollectionCard
            title="Performance Collection"
            description="Control the Performance section."
            titleName="performanceTitle"
            subtitleName="performanceSubtitle"
            titleValue={form.performanceTitle}
            subtitleValue={form.performanceSubtitle}
            onChange={changeHandler}
          />

          <CollectionCard
            title="Luxury Collection"
            description="Control the Luxury section."
            titleName="luxuryTitle"
            subtitleName="luxurySubtitle"
            titleValue={form.luxuryTitle}
            subtitleValue={form.luxurySubtitle}
            onChange={changeHandler}
          />

        </section>


        {/* Featured */}

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
              Featured Products
            </p>

            <h2 className="mt-1 text-xl font-black">
              Featured Section
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <Field
              label="Section Title"
              name="featuredTitle"
              value={form.featuredTitle}
              onChange={changeHandler}
            />

            <Field
              label="Section Subtitle"
              name="featuredSubtitle"
              value={form.featuredSubtitle}
              onChange={changeHandler}
            />

          </div>
        </section>


        {/* Bottom save */}

        <div className="flex justify-end pb-10">
          <button
            onClick={saveHomepage}
            disabled={saving}
            className="flex items-center gap-2 rounded-2xl bg-black px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 disabled:opacity-50"
          >
            <Save size={18} />

            {saving
              ? "Saving Homepage..."
              : "Save Homepage"}
          </button>
        </div>

      </main>
    </div>
  );
};

const Field = ({
  label,
  name,
  value,
  onChange,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        className="h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
      />
    </div>
  );
};

const CollectionCard = ({
  title,
  description,
  titleName,
  subtitleName,
  titleValue,
  subtitleValue,
  onChange,
}) => {
  return (
    <motion.section
      whileHover={{ y: -3 }}
      className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-black">
        {title}
      </h2>

      <p className="mt-1 text-sm text-neutral-500">
        {description}
      </p>

      <div className="mt-6 space-y-5">

        <Field
          label="Title"
          name={titleName}
          value={titleValue}
          onChange={onChange}
        />

        <Field
          label="Subtitle"
          name={subtitleName}
          value={subtitleValue}
          onChange={onChange}
        />

      </div>
    </motion.section>
  );
};

export default AdminHomepage;