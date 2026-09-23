
import StoreSettings from "../models/StoreSettings.js";

/*
  Get store settings
  GET /api/settings
*/
export const getStoreSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();

    // Create default settings automatically if none exist
    if (!settings) {
      settings = await StoreSettings.create({
        storeName: "FITFORGE",
        currency: "INR",
        shippingFee: 0,
        freeShippingThreshold: 999,
        gst: 0,
        footerText: "© FITFORGE. All rights reserved.",
      });
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("GET STORE SETTINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch store settings",
    });
  }
};

/*
  Update store settings
  PATCH /api/settings
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
      socialLinks,
      footerText,
    } = req.body;

    let settings = await StoreSettings.findOne();

    if (!settings) {
      settings = new StoreSettings();
    }

    if (storeName !== undefined) {
      settings.storeName = String(storeName).trim();
    }

    if (logo !== undefined) {
      settings.logo = String(logo).trim();
    }

    if (email !== undefined) {
      settings.email = String(email).trim().toLowerCase();
    }

    if (phone !== undefined) {
      settings.phone = String(phone).trim();
    }

    if (address !== undefined) {
      settings.address = String(address).trim();
    }

    if (currency !== undefined) {
      settings.currency = String(currency).trim().toUpperCase();
    }

    if (shippingFee !== undefined) {
      const value = Number(shippingFee);

      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid shipping fee",
        });
      }

      settings.shippingFee = value;
    }

    if (freeShippingThreshold !== undefined) {
      const value = Number(freeShippingThreshold);

      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid free shipping threshold",
        });
      }

      settings.freeShippingThreshold = value;
    }

    if (gst !== undefined) {
      const value = Number(gst);

      if (!Number.isFinite(value) || value < 0 || value > 100) {
        return res.status(400).json({
          success: false,
          message: "GST must be between 0 and 100",
        });
      }

      settings.gst = value;
    }

    if (socialLinks !== undefined) {
      settings.socialLinks = {
        instagram:
          socialLinks.instagram !== undefined
            ? String(socialLinks.instagram).trim()
            : settings.socialLinks?.instagram || "",

        facebook:
          socialLinks.facebook !== undefined
            ? String(socialLinks.facebook).trim()
            : settings.socialLinks?.facebook || "",

        youtube:
          socialLinks.youtube !== undefined
            ? String(socialLinks.youtube).trim()
            : settings.socialLinks?.youtube || "",

        twitter:
          socialLinks.twitter !== undefined
            ? String(socialLinks.twitter).trim()
            : settings.socialLinks?.twitter || "",
      };
    }

    if (footerText !== undefined) {
      settings.footerText = String(footerText).trim();
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Store settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("UPDATE STORE SETTINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update store settings",
    });
  }
};

