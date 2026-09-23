import React, { useEffect, useState } from "react";
import {
  Save,
  Truck,
  CreditCard,
  Percent,
  Store,
  Globe,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    storeName: "FITFORGE",
    logo: "",
    email: "",
    phone: "",
    address: "",
    currency: "INR",

    shippingFee: 100,
    freeShippingThreshold: 999,
    gst: 0,

    codEnabled: true,
    codAdvanceEnabled: false,
    codAdvancePercentage: 20,
    codMinimumAdvance: 0,
    codMaximumOrderValue: "",

    socialLinks: {
      instagram: "",
      facebook: "",
      youtube: "",
      twitter: "",
    },

    footerText: "© FITFORGE. All rights reserved.",
  });

  /* =========================
     LOAD SETTINGS
  ========================= */

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const response = await api.get("/settings");

      const data =
        response?.data?.settings ||
        response?.data ||
        {};

      setSettings({
        storeName: data.storeName ?? "FITFORGE",
        logo: data.logo ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
        currency: data.currency ?? "INR",

        shippingFee: data.shippingFee ?? 100,
        freeShippingThreshold:
          data.freeShippingThreshold ?? 999,
        gst: data.gst ?? 0,

        codEnabled: data.codEnabled ?? true,

        codAdvanceEnabled:
          data.codAdvanceEnabled ?? false,

        codAdvancePercentage:
          data.codAdvancePercentage ?? 20,

        codMinimumAdvance:
          data.codMinimumAdvance ?? 0,

        codMaximumOrderValue:
          data.codMaximumOrderValue ?? "",

        socialLinks: {
          instagram:
            data.socialLinks?.instagram ?? "",
          facebook:
            data.socialLinks?.facebook ?? "",
          youtube:
            data.socialLinks?.youtube ?? "",
          twitter:
            data.socialLinks?.twitter ?? "",
        },

        footerText:
          data.footerText ??
          "© FITFORGE. All rights reserved.",
      });
    } catch (error) {
      console.error("Failed to load settings:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load store settings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  /* =========================
     INPUT HANDLER
  ========================= */

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =========================
     SOCIAL INPUT HANDLER
  ========================= */

  const handleSocialChange = (event) => {
    const { name, value } = event.target;

    setSettings((previous) => ({
      ...previous,
      socialLinks: {
        ...previous.socialLinks,
        [name]: value,
      },
    }));
  };

  /* =========================
     SAVE SETTINGS
  ========================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!settings.storeName.trim()) {
      toast.error("Store name is required");
      return;
    }

    const shippingFee = Number(settings.shippingFee);

    const freeShippingThreshold = Number(
      settings.freeShippingThreshold
    );

    const gst = Number(settings.gst);

    const codAdvancePercentage = Number(
      settings.codAdvancePercentage
    );

    const codMinimumAdvance = Number(
      settings.codMinimumAdvance
    );

    let codMaximumOrderValue = null;

    if (
      settings.codMaximumOrderValue !== "" &&
      settings.codMaximumOrderValue !== null
    ) {
      codMaximumOrderValue = Number(
        settings.codMaximumOrderValue
      );
    }

    /* =========================
       VALIDATION
    ========================= */

    if (
      !Number.isFinite(shippingFee) ||
      shippingFee < 0
    ) {
      toast.error("Enter a valid shipping fee");
      return;
    }

    if (
      !Number.isFinite(freeShippingThreshold) ||
      freeShippingThreshold < 0
    ) {
      toast.error(
        "Enter a valid free shipping threshold"
      );
      return;
    }

    if (
      !Number.isFinite(gst) ||
      gst < 0 ||
      gst > 100
    ) {
      toast.error("GST must be between 0 and 100");
      return;
    }

    if (
      !Number.isFinite(codAdvancePercentage) ||
      codAdvancePercentage < 0 ||
      codAdvancePercentage > 100
    ) {
      toast.error(
        "COD advance percentage must be between 0 and 100"
      );
      return;
    }

    if (
      settings.codAdvanceEnabled &&
      !settings.codEnabled
    ) {
      toast.error(
        "Enable COD before enabling COD advance"
      );
      return;
    }

    if (
      settings.codAdvanceEnabled &&
      codAdvancePercentage <= 0
    ) {
      toast.error(
        "COD advance percentage must be greater than 0"
      );
      return;
    }

    if (
      !Number.isFinite(codMinimumAdvance) ||
      codMinimumAdvance < 0
    ) {
      toast.error(
        "Enter a valid minimum COD advance"
      );
      return;
    }

    if (
      codMaximumOrderValue !== null &&
      (!Number.isFinite(codMaximumOrderValue) ||
        codMaximumOrderValue < 0)
    ) {
      toast.error(
        "Enter a valid maximum COD order value"
      );
      return;
    }

    /* =========================
       SAVE
    ========================= */

    try {
      setSaving(true);

      const payload = {
        storeName: settings.storeName.trim(),
        logo: settings.logo.trim(),
        email: settings.email.trim(),
        phone: settings.phone.trim(),
        address: settings.address.trim(),
        currency: settings.currency.trim(),

        shippingFee,
        freeShippingThreshold,
        gst,

        codEnabled: settings.codEnabled,

        codAdvanceEnabled:
          settings.codAdvanceEnabled,

        codAdvancePercentage,

        codMinimumAdvance,

        codMaximumOrderValue,

        socialLinks: {
          instagram:
            settings.socialLinks.instagram.trim(),

          facebook:
            settings.socialLinks.facebook.trim(),

          youtube:
            settings.socialLinks.youtube.trim(),

          twitter:
            settings.socialLinks.twitter.trim(),
        },

        footerText:
          settings.footerText.trim(),
      };

      const response = await api.patch(
        "/settings",
        payload
      );

      const updated =
        response?.data?.settings ||
        response?.data ||
        settings;

      setSettings((previous) => ({
        ...previous,
        ...updated,

        socialLinks: {
          ...previous.socialLinks,
          ...(updated.socialLinks || {}),
        },
      }));

      toast.success(
        "Store settings saved successfully"
      );
    } catch (error) {
      console.error(
        "Failed to save settings:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to save store settings"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2
            size={24}
            className="animate-spin"
          />

          Loading settings...
        </div>
      </div>
    );
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Store Settings
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Control FITFORGE store, shipping, GST,
          COD and payment settings.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* =========================
            STORE INFORMATION
        ========================= */}

        <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Store size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Store Information
              </h2>

              <p className="text-sm text-gray-500">
                Basic information displayed across
                your store.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Store Name"
              name="storeName"
              value={settings.storeName}
              onChange={handleChange}
            />

            <Input
              label="Currency"
              name="currency"
              value={settings.currency}
              onChange={handleChange}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={settings.email}
              onChange={handleChange}
            />

            <Input
              label="Phone"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
            />

            <Input
              label="Logo URL"
              name="logo"
              value={settings.logo}
              onChange={handleChange}
              className="md:col-span-2"
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Address
              </label>

              <textarea
                name="address"
                value={settings.address}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </section>

        {/* =========================
            SHIPPING
        ========================= */}

        <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Truck size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Shipping Settings
              </h2>

              <p className="text-sm text-gray-500">
                Control how much customers pay for
                shipping.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Shipping Fee (₹)"
              name="shippingFee"
              type="number"
              min="0"
              step="0.01"
              value={settings.shippingFee}
              onChange={handleChange}
            />

            <Input
              label="Free Shipping Above (₹)"
              name="freeShippingThreshold"
              type="number"
              min="0"
              step="0.01"
              value={
                settings.freeShippingThreshold
              }
              onChange={handleChange}
            />
          </div>

          <div className="mt-5 rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
            <strong>Example:</strong> If shipping
            fee is ₹80 and free shipping threshold
            is ₹999, orders below ₹999 pay ₹80
            shipping. Orders of ₹999 or more get
            free shipping.
          </div>
        </section>

        {/* =========================
            GST
        ========================= */}

        <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Percent size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Tax / GST
              </h2>

              <p className="text-sm text-gray-500">
                Set the GST percentage used during
                checkout.
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <Input
              label="GST (%)"
              name="gst"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={settings.gst}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* =========================
            COD
        ========================= */}

        <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CreditCard size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                COD Payment Settings
              </h2>

              <p className="text-sm text-gray-500">
                Control Cash on Delivery and the
                online advance payment required.
              </p>
            </div>
          </div>

          {/* COD ENABLED */}

          <div className="flex items-center justify-between gap-4 border border-gray-200 rounded-xl p-4 mb-4">
            <div>
              <p className="font-medium text-gray-900">
                Enable Cash on Delivery
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Allow customers to select COD during
                checkout.
              </p>
            </div>

            <Toggle
              checked={settings.codEnabled}
              onChange={(checked) =>
                setSettings((previous) => ({
                  ...previous,
                  codEnabled: checked,
                  codAdvanceEnabled: checked
                    ? previous.codAdvanceEnabled
                    : false,
                }))
              }
            />
          </div>

          {/* ADVANCE ENABLED */}

          <div className="flex items-center justify-between gap-4 border border-gray-200 rounded-xl p-4 mb-6">
            <div>
              <p className="font-medium text-gray-900">
                Require COD Advance Payment
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Customer pays a percentage online and
                the remaining amount at delivery.
              </p>
            </div>

            <Toggle
              checked={
                settings.codAdvanceEnabled
              }
              disabled={!settings.codEnabled}
              onChange={(checked) =>
                setSettings((previous) => ({
                  ...previous,
                  codAdvanceEnabled: checked,
                }))
              }
            />
          </div>

          {settings.codAdvanceEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="Advance Payment (%)"
                name="codAdvancePercentage"
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                value={
                  settings.codAdvancePercentage
                }
                onChange={handleChange}
              />

              <Input
                label="Minimum Advance (₹)"
                name="codMinimumAdvance"
                type="number"
                min="0"
                step="0.01"
                value={
                  settings.codMinimumAdvance
                }
                onChange={handleChange}
              />

              <Input
                label="Maximum COD Order (₹)"
                name="codMaximumOrderValue"
                type="number"
                min="0"
                step="0.01"
                placeholder="No limit"
                value={
                  settings.codMaximumOrderValue
                }
                onChange={handleChange}
              />
            </div>
          )}

          {/* EXAMPLE */}

          <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-5">
            <p className="font-semibold text-gray-900 mb-2">
              How COD Advance Works
            </p>

            {settings.codAdvanceEnabled ? (
              <p className="text-sm text-gray-600 leading-6">
                If the order total is ₹2,000 and
                advance payment is{" "}
                <strong>
                  {settings.codAdvancePercentage}%
                </strong>
                , the customer will pay approximately{" "}
                <strong>
                  ₹
                  {(
                    (2000 *
                      Number(
                        settings.codAdvancePercentage
                      )) /
                    100
                  ).toFixed(2)}
                </strong>{" "}
                online. The remaining amount is
                collected when the order is delivered.
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                COD advance payment is currently
                disabled. Customers will pay the full
                COD amount at delivery.
              </p>
            )}
          </div>
        </section>

        {/* =========================
            SOCIAL LINKS
        ========================= */}

        <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Globe size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Social Links
              </h2>

              <p className="text-sm text-gray-500">
                Links displayed in the store footer.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SocialInput
              label="Instagram"
              name="instagram"
              value={
                settings.socialLinks.instagram
              }
              onChange={handleSocialChange}
            />

            <SocialInput
              label="Facebook"
              name="facebook"
              value={
                settings.socialLinks.facebook
              }
              onChange={handleSocialChange}
            />

            <SocialInput
              label="YouTube"
              name="youtube"
              value={
                settings.socialLinks.youtube
              }
              onChange={handleSocialChange}
            />

            <SocialInput
              label="Twitter / X"
              name="twitter"
              value={
                settings.socialLinks.twitter
              }
              onChange={handleSocialChange}
            />
          </div>
        </section>

        {/* =========================
            FOOTER
        ========================= */}

        <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-7 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Footer Text
          </label>

          <textarea
            name="footerText"
            value={settings.footerText}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
          />
        </section>

        {/* =========================
            SAVE BUTTON
        ========================= */}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-7 py-3 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {saving ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

/* =========================
   INPUT COMPONENT
========================= */

const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  min,
  max,
  step,
  placeholder,
  className = "",
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  );
};

/* =========================
   SOCIAL INPUT
========================= */

const SocialInput = ({
  label,
  name,
  value,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <input
        type="url"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={`https://${name}.com/...`}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  );
};

/* =========================
   TOGGLE
========================= */

const Toggle = ({
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition ${
        checked ? "bg-black" : "bg-gray-300"
      } ${
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer"
      }`}
      aria-pressed={checked}
      aria-label="Toggle setting"
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
};

export default AdminSettings;

