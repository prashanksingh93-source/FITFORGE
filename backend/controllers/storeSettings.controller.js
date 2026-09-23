
import StoreSettings from "../models/StoreSettings.js";

/*
  GET STORE SETTINGS
  Public endpoint.
  Used by checkout, footer, homepage, etc.
*/
export const getStoreSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();

    if (!settings) {
      settings = await StoreSettings.create({});
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get store settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load store settings",
    });
  }
};

/*
  UPDATE STORE SETTINGS
  Admin only.
*/
export const updateStoreSettings = async (req, res) => {
  try {
    const {
      storeName,
      logo,
      email,
      phone,
      address,
      currency,

      shippingFee,
      freeShippingThreshold,
      gst,

      codEnabled,
      codAdvanceEnabled,
      codAdvancePercentage,
      codMinimumAdvance,
      codMaximumOrderValue,

      socialLinks,
      footerText,
    } = req.body;

    /* =========================
       BASIC VALIDATION
    ========================= */

    if (
      storeName !== undefined &&
      typeof storeName !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Store name must be text",
      });
    }

    if (
      email !== undefined &&
      typeof email !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Email must be text",
      });
    }

    if (
      phone !== undefined &&
      typeof phone !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Phone must be text",
      });
    }

    /* =========================
       SHIPPING VALIDATION
    ========================= */

    let parsedShippingFee;

    if (shippingFee !== undefined) {
      parsedShippingFee = Number(shippingFee);

      if (
        !Number.isFinite(parsedShippingFee) ||
        parsedShippingFee < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Shipping fee must be 0 or greater",
        });
      }
    }

    let parsedFreeShippingThreshold;

    if (freeShippingThreshold !== undefined) {
      parsedFreeShippingThreshold = Number(
        freeShippingThreshold
      );

      if (
        !Number.isFinite(parsedFreeShippingThreshold) ||
        parsedFreeShippingThreshold < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Free shipping threshold must be 0 or greater",
        });
      }
    }

    /* =========================
       GST VALIDATION
    ========================= */

    let parsedGst;

    if (gst !== undefined) {
      parsedGst = Number(gst);

      if (
        !Number.isFinite(parsedGst) ||
        parsedGst < 0 ||
        parsedGst > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "GST must be between 0 and 100",
        });
      }
    }

    /* =========================
       COD VALIDATION
    ========================= */

    if (
      codEnabled !== undefined &&
      typeof codEnabled !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "COD enabled value must be true or false",
      });
    }

    if (
      codAdvanceEnabled !== undefined &&
      typeof codAdvanceEnabled !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "COD advance enabled value must be true or false",
      });
    }

    let parsedCodAdvancePercentage;

    if (codAdvancePercentage !== undefined) {
      parsedCodAdvancePercentage = Number(
        codAdvancePercentage
      );

      if (
        !Number.isFinite(parsedCodAdvancePercentage) ||
        parsedCodAdvancePercentage < 0 ||
        parsedCodAdvancePercentage > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "COD advance percentage must be between 0 and 100",
        });
      }
    }

    let parsedCodMinimumAdvance;

    if (codMinimumAdvance !== undefined) {
      parsedCodMinimumAdvance = Number(
        codMinimumAdvance
      );

      if (
        !Number.isFinite(parsedCodMinimumAdvance) ||
        parsedCodMinimumAdvance < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Minimum COD advance must be 0 or greater",
        });
      }
    }

    let parsedCodMaximumOrderValue;

    if (
      codMaximumOrderValue !== undefined &&
      codMaximumOrderValue !== null &&
      codMaximumOrderValue !== ""
    ) {
      parsedCodMaximumOrderValue = Number(
        codMaximumOrderValue
      );

      if (
        !Number.isFinite(parsedCodMaximumOrderValue) ||
        parsedCodMaximumOrderValue < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Maximum COD order value must be 0 or greater",
        });
      }
    } else if (
      codMaximumOrderValue === null ||
      codMaximumOrderValue === ""
    ) {
      parsedCodMaximumOrderValue = null;
    }

    /*
      If advance payment is enabled,
      percentage must be greater than 0.
    */

    if (
      codAdvanceEnabled === true &&
      parsedCodAdvancePercentage !== undefined &&
      parsedCodAdvancePercentage <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "COD advance percentage must be greater than 0 when advance payment is enabled",
      });
    }

    /* =========================
       LOAD SETTINGS
    ========================= */

    let settings = await StoreSettings.findOne();

    if (!settings) {
      settings = new StoreSettings();
    }

    /* =========================
       UPDATE BASIC SETTINGS
    ========================= */

    if (storeName !== undefined) {
      settings.storeName = storeName.trim();
    }

    if (logo !== undefined) {
      settings.logo = String(logo).trim();
    }

    if (email !== undefined) {
      settings.email = email.trim().toLowerCase();
    }

    if (phone !== undefined) {
      settings.phone = phone.trim();
    }

    if (address !== undefined) {
      settings.address = address.trim();
    }

    if (currency !== undefined) {
      settings.currency = String(currency)
        .trim()
        .toUpperCase();
    }

    /* =========================
       UPDATE SHIPPING
    ========================= */

    if (parsedShippingFee !== undefined) {
      settings.shippingFee = parsedShippingFee;
    }

    if (
      parsedFreeShippingThreshold !== undefined
    ) {
      settings.freeShippingThreshold =
        parsedFreeShippingThreshold;
    }

    /* =========================
       UPDATE GST
    ========================= */

    if (parsedGst !== undefined) {
      settings.gst = parsedGst;
    }

    /* =========================
       UPDATE COD
    ========================= */

    if (codEnabled !== undefined) {
      settings.codEnabled = codEnabled;
    }

    if (codAdvanceEnabled !== undefined) {
      settings.codAdvanceEnabled =
        codAdvanceEnabled;
    }

    if (
      parsedCodAdvancePercentage !== undefined
    ) {
      settings.codAdvancePercentage =
        parsedCodAdvancePercentage;
    }

    if (
      parsedCodMinimumAdvance !== undefined
    ) {
      settings.codMinimumAdvance =
        parsedCodMinimumAdvance;
    }

    if (
      parsedCodMaximumOrderValue !== undefined
    ) {
      settings.codMaximumOrderValue =
        parsedCodMaximumOrderValue;
    }

    /* =========================
       SOCIAL LINKS
    ========================= */

    if (
      socialLinks !== undefined &&
      typeof socialLinks === "object" &&
      socialLinks !== null
    ) {
      settings.socialLinks = {
        ...settings.socialLinks?.toObject?.(),
        ...socialLinks,
      };
    }

    /* =========================
       FOOTER
    ========================= */

    if (footerText !== undefined) {
      settings.footerText = String(footerText).trim();
    }

    /* =========================
       SAVE
    ========================= */

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Store settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update store settings error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((item) => item.message)
        .join(", ");

      return res.status(400).json({
        success: false,
        message: messages || "Invalid store settings",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update store settings",
    });
  }
};

