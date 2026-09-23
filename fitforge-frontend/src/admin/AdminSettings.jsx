import React, { useEffect, useState } from "react";
import { Save, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    storeName: "FITFORGE",
    logo: "",
    email: "",
    phone: "",
    address: "",
    currency: "INR",
    shippingFee: 0,
    freeShippingThreshold: 999,
    gst: 0,
    socialLinks: {
      instagram: "",
      facebook: "",
      youtube: "",
      twitter: "",
    },
    footerText: "© FITFORGE. All rights reserved.",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const response = await api.get("/settings");

      if (response.data?.success && response.data?.settings) {
        const settings = response.data.settings;

        setForm({
          storeName: settings.storeName || "FITFORGE",
          logo: settings.logo || "",
          email: settings.email || "",
          phone: settings.phone || "",
          address: settings.address || "",
          currency: settings.currency || "INR",
          shippingFee: settings.shippingFee ?? 0,
          freeShippingThreshold:
            settings.freeShippingThreshold ?? 999,
          gst: settings.gst ?? 0,
          socialLinks: {
            instagram: settings.socialLinks?.instagram || "",
            facebook: settings.socialLinks?.facebook || "",
            youtube: settings.socialLinks?.youtube || "",
            twitter: settings.socialLinks?.twitter || "",
          },
          footerText:
            settings.footerText ||
            "© FITFORGE. All rights reserved.",
        });
      }
    } catch (error) {
      console.error("Fetch settings error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load store settings"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSocialChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      socialLinks: {
        ...previous.socialLinks,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const payload = {
        ...form,
        shippingFee: Number(form.shippingFee),
        freeShippingThreshold: Number(
          form.freeShippingThreshold
        ),
        gst: Number(form.gst),
      };

      const response = await api.patch(
        "/settings",
        payload
      );

      if (response.data?.success) {
        toast.success("Store settings updated successfully");
        await fetchSettings();
      }
    } catch (error) {
      console.error("Update settings error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update store settings"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-black p-2 text-white">
              <Settings size={20} />
            </div>

            <h1 className="text-2xl font-bold">
              Store Settings
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Manage your FITFORGE store configuration.
          </p>
        </div>

        <button
          type="submit"
          form="store-settings-form"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2
                size={17}
                className="animate-spin"
              />
              Saving...
            </>
          ) : (
            <>
              <Save size={17} />
              Save Changes
            </>
          )}
        </button>
      </div>

      <form
        id="store-settings-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Store Information */}
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">
            Store Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Store Name"
              name="storeName"
              value={form.storeName}
              onChange={handleChange}
              placeholder="FITFORGE"
            />

            <Field
              label="Logo URL"
              name="logo"
              value={form.logo}
              onChange={handleChange}
              placeholder="https://..."
            />

            <Field
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="support@fitforge.com"
            />

            <Field
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91..."
            />

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Store Address
              </label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                placeholder="Store address"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* Shipping & Tax */}
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">
            Shipping & Tax
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="Currency"
              name="currency"
              value={form.currency}
              onChange={handleChange}
              placeholder="INR"
            />

            <Field
              label="Shipping Fee"
              name="shippingFee"
              type="number"
              min="0"
              value={form.shippingFee}
              onChange={handleChange}
              placeholder="0"
            />

            <Field
              label="Free Shipping Above"
              name="freeShippingThreshold"
              type="number"
              min="0"
              value={form.freeShippingThreshold}
              onChange={handleChange}
              placeholder="999"
            />

            <Field
              label="GST (%)"
              name="gst"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.gst}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </section>

        {/* Social Links */}
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">
            Social Links
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Instagram"
              name="instagram"
              value={form.socialLinks.instagram}
              onChange={handleSocialChange}
              placeholder="https://instagram.com/..."
            />

            <Field
              label="Facebook"
              name="facebook"
              value={form.socialLinks.facebook}
              onChange={handleSocialChange}
              placeholder="https://facebook.com/..."
            />

            <Field
              label="YouTube"
              name="youtube"
              value={form.socialLinks.youtube}
              onChange={handleSocialChange}
              placeholder="https://youtube.com/..."
            />

            <Field
              label="Twitter / X"
              name="twitter"
              value={form.socialLinks.twitter}
              onChange={handleSocialChange}
              placeholder="https://x.com/..."
            />
          </div>
        </section>

        {/* Footer */}
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">
            Footer
          </h2>

          <label className="mb-2 block text-sm font-medium">
            Footer Text
          </label>

          <textarea
            name="footerText"
            value={form.footerText}
            onChange={handleChange}
            rows={3}
            placeholder="Footer text"
            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
          />
        </section>
      </form>
    </div>
  );
};

const Field = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
      />
    </div>
  );
};

export default AdminSettings;

