import Promotion from "../models/Promotion.js";

export const getAllPromotions = async (req, res) => {
  try {
    const { type, status } = req.query;

    const filter = {};

    if (type) {
      filter.type = type;
    }

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const promotions = await Promotion.find(filter).sort({
      priority: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: promotions.length,
      promotions,
    });
  } catch (error) {
    console.error("Get promotions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch promotions",
    });
  }
};

export const getActivePromotions = async (req, res) => {
  try {
    const now = new Date();

    const promotions = await Promotion.find({
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: null },
            { startDate: { $lte: now } },
          ],
        },
        {
          $or: [
            { endDate: null },
            { endDate: { $gte: now } },
          ],
        },
      ],
    }).sort({
      priority: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: promotions.length,
      promotions,
    });
  } catch (error) {
    console.error("Get active promotions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch active promotions",
    });
  }
};

export const createPromotion = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      image,
      buttonText,
      buttonLink,
      type,
      collection,
      discountText,
      startDate,
      endDate,
      isActive,
      priority,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Promotion title is required",
      });
    }

    const promotion = await Promotion.create({
      title: title.trim(),
      subtitle: subtitle?.trim() || "",
      description: description?.trim() || "",
      image: image?.trim() || "",
      buttonText: buttonText?.trim() || "Shop Now",
      buttonLink: buttonLink?.trim() || "/shop",
      type: type || "Banner",
      collection: collection || "All",
      discountText: discountText?.trim() || "",
      startDate: startDate || null,
      endDate: endDate || null,
      isActive:
        typeof isActive === "boolean"
          ? isActive
          : true,
      priority: Number(priority) || 0,
    });

    res.status(201).json({
      success: true,
      message: "Promotion created successfully",
      promotion,
    });
  } catch (error) {
    console.error("Create promotion error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create promotion",
    });
  }
};

export const getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(
      req.params.id
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    res.status(200).json({
      success: true,
      promotion,
    });
  } catch (error) {
    console.error("Get promotion error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch promotion",
    });
  }
};

export const updatePromotion = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      image,
      buttonText,
      buttonLink,
      type,
      collection,
      discountText,
      startDate,
      endDate,
      isActive,
      priority,
    } = req.body;

    const promotion = await Promotion.findById(
      req.params.id
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Promotion title is required",
        });
      }

      promotion.title = title.trim();
    }

    if (subtitle !== undefined) {
      promotion.subtitle = subtitle.trim();
    }

    if (description !== undefined) {
      promotion.description = description.trim();
    }

    if (image !== undefined) {
      promotion.image = image.trim();
    }

    if (buttonText !== undefined) {
      promotion.buttonText =
        buttonText.trim() || "Shop Now";
    }

    if (buttonLink !== undefined) {
      promotion.buttonLink =
        buttonLink.trim() || "/shop";
    }

    if (type !== undefined) {
      promotion.type = type;
    }

    if (collection !== undefined) {
      promotion.collection = collection;
    }

    if (discountText !== undefined) {
      promotion.discountText =
        discountText.trim();
    }

    if (startDate !== undefined) {
      promotion.startDate = startDate || null;
    }

    if (endDate !== undefined) {
      promotion.endDate = endDate || null;
    }

    if (isActive !== undefined) {
      promotion.isActive = Boolean(isActive);
    }

    if (priority !== undefined) {
      promotion.priority = Number(priority) || 0;
    }

    await promotion.save();

    res.status(200).json({
      success: true,
      message: "Promotion updated successfully",
      promotion,
    });
  } catch (error) {
    console.error("Update promotion error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update promotion",
    });
  }
};

export const togglePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(
      req.params.id
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    promotion.isActive = !promotion.isActive;

    await promotion.save();

    res.status(200).json({
      success: true,
      message: promotion.isActive
        ? "Promotion activated"
        : "Promotion deactivated",
      promotion,
    });
  } catch (error) {
    console.error("Toggle promotion error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update promotion status",
    });
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(
      req.params.id
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Promotion deleted successfully",
    });
  } catch (error) {
    console.error("Delete promotion error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete promotion",
    });
  }
};
