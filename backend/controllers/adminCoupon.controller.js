import Coupon from "../models/Coupon.js";

/* =========================================================
   VALIDATE COUPON DATA
========================================================= */

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
    collection,
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
    minimumOrderAmount !== "" &&
    (!Number.isFinite(Number(minimumOrderAmount)) ||
      Number(minimumOrderAmount) < 0)
  ) {
    return "Minimum order amount cannot be negative";
  }

  if (
    maximumDiscount !== undefined &&
    maximumDiscount !== "" &&
    (!Number.isFinite(Number(maximumDiscount)) ||
      Number(maximumDiscount) < 0)
  ) {
    return "Maximum discount cannot be negative";
  }

  if (
    usageLimit !== undefined &&
    usageLimit !== "" &&
    (!Number.isInteger(Number(usageLimit)) ||
      Number(usageLimit) < 1)
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

  if (
    collection &&
    !["All", "Performance", "Luxury"].includes(
      collection
    )
  ) {
    return "Invalid collection";
  }

  return null;
};

/* =========================================================
   GET ALL COUPONS
   GET /api/admin/coupons
========================================================= */

export const getCoupons = async (req, res) => {
  try {
    const {
      search = "",
      status = "All",
    } = req.query;

    const filter = {};

    /* Status filter */

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    /* Search */

    if (search.trim()) {
      const searchRegex = {
        $regex: search.trim(),
        $options: "i",
      };

      filter.$or = [
        {
          code: searchRegex,
        },
        {
          description: searchRegex,
        },
      ];
    }

    const coupons = await Coupon.find(filter)
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error(
      "Get coupons error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};

/* =========================================================
   GET SINGLE COUPON
   GET /api/admin/coupons/:id
========================================================= */

export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(
      req.params.id
    ).lean();

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error(
      "Get coupon error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupon",
    });
  }
};

/* =========================================================
   CREATE COUPON
   POST /api/admin/coupons
========================================================= */

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

    /* Check duplicate code */

    const existingCoupon =
      await Coupon.findOne({ code });

    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    /* Create coupon */

    const coupon = await Coupon.create({
      code,

      description:
        req.body.description?.trim() || "",

      discountType:
        req.body.discountType,

      discountValue:
        Number(req.body.discountValue),

      minimumOrderAmount:
        req.body.minimumOrderAmount === "" ||
        req.body.minimumOrderAmount === undefined
          ? 0
          : Number(req.body.minimumOrderAmount),

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

      usedCount: 0,

      startDate:
        req.body.startDate
          ? new Date(req.body.startDate)
          : null,

      endDate:
        req.body.endDate
          ? new Date(req.body.endDate)
          : null,

      collection:
        req.body.collection || "All",

      isActive:
        req.body.isActive === undefined
          ? true
          : req.body.isActive === true ||
            req.body.isActive === "true",
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error(
      "Create coupon error:",
      error
    );

    /* Duplicate key protection */

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create coupon",
    });
  }
};

/* =========================================================
   UPDATE COUPON
   PATCH /api/admin/coupons/:id
========================================================= */

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

    /* Check duplicate */

    const duplicate =
      await Coupon.findOne({
        code,
        _id: {
          $ne: coupon._id,
        },
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    /* Update fields */

    coupon.code = code;

    coupon.description =
      req.body.description?.trim() || "";

    coupon.discountType =
      req.body.discountType;

    coupon.discountValue =
      Number(req.body.discountValue);

    coupon.minimumOrderAmount =
      req.body.minimumOrderAmount === "" ||
      req.body.minimumOrderAmount === undefined
        ? 0
        : Number(req.body.minimumOrderAmount);

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
      req.body.startDate
        ? new Date(req.body.startDate)
        : null;

    coupon.endDate =
      req.body.endDate
        ? new Date(req.body.endDate)
        : null;

    coupon.collection =
      req.body.collection || "All";

    if (req.body.isActive !== undefined) {
      coupon.isActive =
        req.body.isActive === true ||
        req.body.isActive === "true";
    }

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error(
      "Update coupon error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update coupon",
    });
  }
};

/* =========================================================
   TOGGLE COUPON
   PATCH /api/admin/coupons/:id/toggle
========================================================= */

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

    return res.status(200).json({
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

    return res.status(500).json({
      success: false,
      message: "Failed to update coupon",
    });
  }
};

/* =========================================================
   DELETE COUPON
   DELETE /api/admin/coupons/:id
========================================================= */

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

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete coupon error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};

