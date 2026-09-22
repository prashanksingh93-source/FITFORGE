import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  MessageSquare,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import api from "../services/api";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [rating, setRating] = useState("All");

  const [selectedReview, setSelectedReview] =
    useState(null);

  const [processingId, setProcessingId] =
    useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/admin/reviews",
        {
          params: {
            search,
            status,
            rating,
          },
        }
      );

      if (response.data.success) {
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error("Reviews error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load reviews"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [search, status, rating]);

  const stats = useMemo(() => {
    return {
      total: reviews.length,

      approved: reviews.filter(
        (review) => review.isApproved
      ).length,

      pending: reviews.filter(
        (review) => !review.isApproved
      ).length,

      featured: reviews.filter(
        (review) => review.isFeatured
      ).length,
    };
  }, [reviews]);

  const updateStatus = async (
    id,
    isApproved
  ) => {
    try {
      setProcessingId(id);

      await api.patch(
        `/admin/reviews/${id}/status`,
        {
          isApproved,
        }
      );

      toast.success(
        isApproved
          ? "Review approved"
          : "Review rejected"
      );

      setSelectedReview(null);

      await fetchReviews();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update review"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const toggleFeatured = async (id) => {
    try {
      setProcessingId(id);

      await api.patch(
        `/admin/reviews/${id}/featured`
      );

      toast.success(
        "Featured status updated"
      );

      await fetchReviews();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update featured status"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const deleteReview = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);

      await api.delete(
        `/admin/reviews/${id}`
      );

      toast.success(
        "Review deleted successfully"
      );

      setSelectedReview(null);

      await fetchReviews();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete review"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const Stars = ({ value }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={15}
            className={
              star <= value
                ? "fill-black text-black"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.3em] text-gray-400">
                FITFORGE ADMIN
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight">
                REVIEWS
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage customer product reviews.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="TOTAL REVIEWS"
            value={stats.total}
            icon={MessageSquare}
          />

          <StatCard
            label="APPROVED"
            value={stats.approved}
            icon={Check}
          />

          <StatCard
            label="PENDING"
            value={stats.pending}
            icon={Eye}
          />

          <StatCard
            label="FEATURED"
            value={stats.featured}
            icon={Star}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_160px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search reviews, customers or products..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none transition focus:border-black focus:bg-white"
              />
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium outline-none focus:border-black"
            >
              <option value="All">
                All Status
              </option>
              <option value="approved">
                Approved
              </option>
              <option value="pending">
                Pending
              </option>
            </select>

            <select
              value={rating}
              onChange={(event) =>
                setRating(event.target.value)
              }
              className="h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium outline-none focus:border-black"
            >
              <option value="All">
                All Ratings
              </option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

                <p className="mt-4 text-sm text-gray-500">
                  Loading reviews...
                </p>
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <MessageSquare
                  size={25}
                  className="text-gray-400"
                />
              </div>

              <h2 className="mt-5 text-xl font-black">
                No reviews found
              </h2>

              <p className="mt-2 max-w-md text-sm text-gray-500">
                Reviews matching your filters will
                appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {reviews.map((review, index) => (
                <motion.div
                  key={review._id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.03,
                  }}
                  className="p-5 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {review.product?.images?.[0] ? (
                          <img
                            src={
                              review.product.images[0]
                            }
                            alt={
                              review.product.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <MessageSquare
                              size={20}
                              className="text-gray-400"
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <Stars
                            value={
                              review.rating
                            }
                          />

                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                              review.isApproved
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {review.isApproved
                              ? "APPROVED"
                              : "PENDING"}
                          </span>

                          {review.isFeatured && (
                            <span className="rounded-full bg-black px-3 py-1 text-[10px] font-bold text-white">
                              FEATURED
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 font-black">
                          {review.title ||
                            "Customer Review"}
                        </h3>

                        <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-gray-500">
                          {review.comment}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                          <span>
                            {review.user?.fullName ||
                              "Customer"}
                          </span>

                          <span>
                            {review.product?.name ||
                              "Product"}
                          </span>

                          <span>
                            {new Date(
                              review.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          setSelectedReview(
                            review
                          )
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 text-xs font-bold transition hover:border-black hover:bg-black hover:text-white"
                      >
                        <Eye size={15} />
                        VIEW
                      </button>

                      {!review.isApproved && (
                        <button
                          disabled={
                            processingId ===
                            review._id
                          }
                          onClick={() =>
                            updateStatus(
                              review._id,
                              true
                            )
                          }
                          className="inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-xs font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
                        >
                          <Check size={15} />
                          APPROVE
                        </button>
                      )}

                      {review.isApproved && (
                        <button
                          disabled={
                            processingId ===
                            review._id
                          }
                          onClick={() =>
                            toggleFeatured(
                              review._id
                            )
                          }
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 text-xs font-bold transition hover:border-black"
                        >
                          <Star size={15} />
                          {review.isFeatured
                            ? "UNFEATURE"
                            : "FEATURE"}
                        </button>
                      )}

                      <button
                        disabled={
                          processingId ===
                          review._id
                        }
                        onClick={() =>
                          deleteReview(
                            review._id
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] text-gray-400">
                  REVIEW DETAILS
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  CUSTOMER REVIEW
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedReview(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition hover:bg-black hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                  {selectedReview.product
                    ?.images?.[0] ? (
                    <img
                      src={
                        selectedReview.product
                          .images[0]
                      }
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <MessageSquare
                        size={20}
                        className="text-gray-400"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    PRODUCT
                  </p>

                  <h3 className="mt-1 font-black">
                    {selectedReview.product
                      ?.name || "Product"}
                  </h3>

                  <div className="mt-2">
                    <Stars
                      value={
                        selectedReview.rating
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-5">
                <p className="text-xs font-bold text-gray-400">
                  TITLE
                </p>

                <p className="mt-2 font-black">
                  {selectedReview.title ||
                    "Customer Review"}
                </p>

                <p className="mt-5 text-sm leading-7 text-gray-600">
                  {selectedReview.comment}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-400">
                    CUSTOMER
                  </p>

                  <p className="mt-2 font-bold">
                    {selectedReview.user
                      ?.fullName ||
                      "Customer"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedReview.user
                      ?.email || ""}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-400">
                    STATUS
                  </p>

                  <p className="mt-2 font-bold">
                    {selectedReview.isApproved
                      ? "Approved"
                      : "Pending Approval"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {!selectedReview.isApproved ? (
                  <button
                    disabled={
                      processingId ===
                      selectedReview._id
                    }
                    onClick={() =>
                      updateStatus(
                        selectedReview._id,
                        true
                      )
                    }
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    <Check size={17} />
                    APPROVE REVIEW
                  </button>
                ) : (
                  <button
                    disabled={
                      processingId ===
                      selectedReview._id
                    }
                    onClick={() =>
                      updateStatus(
                        selectedReview._id,
                        false
                      )
                    }
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 text-sm font-bold disabled:opacity-50"
                  >
                    <X size={17} />
                    REJECT REVIEW
                  </button>
                )}

                {selectedReview.isApproved && (
                  <button
                    disabled={
                      processingId ===
                      selectedReview._id
                    }
                    onClick={() =>
                      toggleFeatured(
                        selectedReview._id
                      )
                    }
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 text-sm font-bold"
                  >
                    <Star size={17} />
                    {selectedReview.isFeatured
                      ? "UNFEATURE"
                      : "FEATURE"}
                  </button>
                )}

                <button
                  disabled={
                    processingId ===
                    selectedReview._id
                  }
                  onClick={() =>
                    deleteReview(
                      selectedReview._id
                    )
                  }
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-red-200 px-5 text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={17} />
                  DELETE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;