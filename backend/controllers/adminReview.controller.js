import Review from "../models/Review.js";
import Product from "../models/Product.js";

const updateProductRating = async (productId) => {
  const result = await Review.aggregate([
    {
      $match: {
        product: productId,
        isApproved: true,
      },
    },
    {
      $group: {
        _id: "$product",
        averageRating: {
          $avg: "$rating",
        },
        reviewCount: {
          $sum: 1,
        },
      },
    },
  ]);

  if (result.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      reviewCount: 0,
    });

    return;
  }

  await Product.findByIdAndUpdate(productId, {
    rating: Number(
      result[0].averageRating.toFixed(1)
    ),
    reviewCount: result[0].reviewCount,
  });
};

export const getAdminReviews = async (
  req,
  res
) => {
  try {
    const {
      search = "",
      status = "All",
      rating = "All",
    } = req.query;

    const filter = {};

    if (status === "approved") {
      filter.isApproved = true;
    }

    if (status === "pending") {
      filter.isApproved = false;
    }

    if (rating !== "All") {
      filter.rating = Number(rating);
    }

    const reviews = await Review.find(filter)
      .populate(
        "user",
        "fullName email avatar"
      )
      .populate(
        "product",
        "name images price"
      )
      .sort({ createdAt: -1 });

    let result = reviews;

    if (search.trim()) {
      const searchValue =
        search.trim().toLowerCase();

      result = reviews.filter((review) => {
        return (
          review.comment
            ?.toLowerCase()
            .includes(searchValue) ||
          review.title
            ?.toLowerCase()
            .includes(searchValue) ||
          review.user?.fullName
            ?.toLowerCase()
            .includes(searchValue) ||
          review.product?.name
            ?.toLowerCase()
            .includes(searchValue)
        );
      });
    }

    res.status(200).json({
      success: true,
      count: result.length,
      reviews: result,
    });
  } catch (error) {
    console.error(
      "Get admin reviews error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

export const getAdminReviewById = async (
  req,
  res
) => {
  try {
    const review = await Review.findById(
      req.params.id
    )
      .populate(
        "user",
        "fullName email avatar"
      )
      .populate(
        "product",
        "name images price"
      );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error(
      "Get review error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch review",
    });
  }
};

export const updateReviewStatus = async (
  req,
  res
) => {
  try {
    const { isApproved } = req.body;

    const review = await Review.findById(
      req.params.id
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.isApproved =
      isApproved === true ||
      isApproved === "true";

    await review.save();

    await updateProductRating(
      review.product
    );

    res.status(200).json({
      success: true,
      message: review.isApproved
        ? "Review approved successfully"
        : "Review rejected successfully",
      review,
    });
  } catch (error) {
    console.error(
      "Update review status error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update review status",
    });
  }
};

export const toggleFeaturedReview = async (
  req,
  res
) => {
  try {
    const review = await Review.findById(
      req.params.id
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (!review.isApproved) {
      return res.status(400).json({
        success: false,
        message:
          "Only approved reviews can be featured",
      });
    }

    review.isFeatured = !review.isFeatured;

    await review.save();

    res.status(200).json({
      success: true,
      message: review.isFeatured
        ? "Review featured successfully"
        : "Review removed from featured",
      review,
    });
  } catch (error) {
    console.error(
      "Featured review error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update featured status",
    });
  }
};

export const deleteReview = async (
  req,
  res
) => {
  try {
    const review = await Review.findById(
      req.params.id
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const productId = review.product;

    await Review.findByIdAndDelete(
      review._id
    );

    await updateProductRating(productId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete review error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};