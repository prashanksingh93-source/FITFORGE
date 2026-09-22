import Coupon from "../models/Coupon.js";

const validateCouponData = (data) => {
  const {
    code,
    discountType,
    discountValue,
    minimumOrderAmount,
    maximumDiscount,
    usageLimit,
    startDate,
    endDate,
  } = data;

  if (!code?.trim()) {
    return "Coupon code is required";
  }

  if (!["Percentage", "Fixed"].includes(discountType)) {
    return "Invalid discount type";
  }

  const value = Number(discountValue);

  if (!Number.isFinite(value) || value <= 0) {
    return "Discount value must be greater than 0";
  }

  if (
    discountType === "Percentage" &&
    value > 100
  ) {
    return "Percentage discount cannot exceed 100%";
  }

  if (
    minimumOrderAmount !== undefined &&
    Number(minimumOrderAmount) < 0
  ) {
    return "Minimum order amount cannot be negative";
  }

  if (
    maximumDiscount !== undefined &&
    maximumDiscount !== "" &&
    Number(maximumDiscount) < 0
  ) {
    return "Maximum discount cannot be negative";
  }

  if (
    usageLimit !== undefined &&
    usageLimit !== "" &&
    Number(usageLimit) < 1
  ) {
    return "Usage limit must be at least 1";
  }

  if (
    startDate &&
    endDate &&
    new Date(endDate) < new Date(startDate)
  ) {
    return "End date cannot be before start date";
  }

  return null;
};

export const getCoupons = async (req, res) => {
  try {
    const {
      search = "",
      status = "All",
    } = req.query;

    const filter = {};

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    if (search.trim()) {
      filter.$or = [
        {
          code: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const coupons = await Coupon.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};

export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(
      req.params.id
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error(
      "Get coupon error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch coupon",
    });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const validationError =
      validateCouponData(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const code = req.body.code
      .trim()
      .toUpperCase();

    const existingCoupon =
      await Coupon.findOne({ code });

    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    const coupon = await Coupon.create({
      code,

      description:
        req.body.description || "",

      discountType:
        req.body.discountType,

      discountValue:
        Number(req.body.discountValue),

      minimumOrderAmount:
        Number(req.body.minimumOrderAmount) || 0,

      maximumDiscount:
        req.body.maximumDiscount === "" ||
        req.body.maximumDiscount === undefined
          ? null
          : Number(req.body.maximumDiscount),

      usageLimit:
        req.body.usageLimit === "" ||
        req.body.usageLimit === undefined
          ? null
          : Number(req.body.usageLimit),

      startDate:
        req.body.startDate || null,

      endDate:
        req.body.endDate || null,

      collection:
        req.body.collection || "All",

      isActive:
        req.body.isActive === undefined
          ? true
          : req.body.isActive === true ||
            req.body.isActive === "true",
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error(
      "Create coupon error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create coupon",
    });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(
      req.params.id
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const validationError =
      validateCouponData(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const code = req.body.code
      .trim()
      .toUpperCase();

    const duplicate =
      await Coupon.findOne({
        code,
        _id: { $ne: coupon._id },
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    coupon.code = code;

    coupon.description =
      req.body.description || "";

    coupon.discountType =
      req.body.discountType;

    coupon.discountValue =
      Number(req.body.discountValue);

    coupon.minimumOrderAmount =
      Number(req.body.minimumOrderAmount) || 0;

    coupon.maximumDiscount =
      req.body.maximumDiscount === "" ||
      req.body.maximumDiscount === undefined
        ? null
        : Number(req.body.maximumDiscount);

    coupon.usageLimit =
      req.body.usageLimit === "" ||
      req.body.usageLimit === undefined
        ? null
        : Number(req.body.usageLimit);

    coupon.startDate =
      req.body.startDate || null;

    coupon.endDate =
      req.body.endDate || null;

    coupon.collection =
      req.body.collection || "All";

    if (req.body.isActive !== undefined) {
      coupon.isActive =
        req.body.isActive === true ||
        req.body.isActive === "true";
    }

    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error(
      "Update coupon error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update coupon",
    });
  }
};

export const toggleCoupon = async (
  req,
  res
) => {
  try {
    const coupon = await Coupon.findById(
      req.params.id
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    coupon.isActive = !coupon.isActive;

    await coupon.save();

    res.status(200).json({
      success: true,
      message: coupon.isActive
        ? "Coupon activated successfully"
        : "Coupon deactivated successfully",
      coupon,
    });
  } catch (error) {
    console.error(
      "Toggle coupon error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update coupon",
    });
  }
};

export const deleteCoupon = async (
  req,
  res
) => {
  try {
    const coupon = await Coupon.findById(
      req.params.id
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    await Coupon.findByIdAndDelete(
      coupon._id
    );

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete coupon error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};