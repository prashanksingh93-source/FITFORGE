import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  CreditCard,
  Truck,
} from "lucide-react";

import { toast } from "sonner";

import api from "../services/api";

import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const navigate = useNavigate();

  const {
    cart,
    clearCart,
  } = useStore();

  const { user } = useAuth();

  // ==========================================
  // LOCAL CART FALLBACK
  // ==========================================

  const [storedCart, setStoredCart] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "fitforge-cart"
          );

        if (!saved) {
          return [];
        }

        const parsed =
          JSON.parse(saved);

        return Array.isArray(parsed)
          ? parsed
          : [];
      } catch (error) {
        console.error(
          "Checkout cart error:",
          error
        );

        return [];
      }
    });

  // ==========================================
  // SYNC STORAGE WHEN CHECKOUT OPENS
  // ==========================================

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "fitforge-cart"
        );

      if (!saved) {
        setStoredCart([]);
        return;
      }

      const parsed =
        JSON.parse(saved);

      setStoredCart(
        Array.isArray(parsed)
          ? parsed
          : []
      );
    } catch (error) {
      console.error(
        "Failed to read checkout cart:",
        error
      );

      setStoredCart([]);
    }
  }, []);

  // ==========================================
  // USE CONTEXT CART FIRST
  // STORAGE SECOND
  // ==========================================

  const checkoutItems = useMemo(() => {
    if (
      Array.isArray(cart) &&
      cart.length > 0
    ) {
      return cart.filter(
        (item) =>
          item?.product?._id
      );
    }

    return storedCart.filter(
      (item) =>
        item?.product?._id
    );
  }, [cart, storedCart]);

  // ==========================================
  // FORM
  // ==========================================

  const [form, setForm] = useState({
    fullName:
      user?.fullName || "",
    phone:
      user?.phone || "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("RAZORPAY");

  const [loading, setLoading] =
    useState(false);

  // ==========================================
  // UPDATE FORM
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // TOTALS
  // ==========================================

  const subtotal = useMemo(() => {
    return checkoutItems.reduce(
      (total, item) => {
        const product =
          item.product;

        const price =
          product.salePrice != null
            ? Number(
                product.salePrice
              )
            : Number(
                product.price || 0
              );

        return (
          total +
          price *
            Number(
              item.quantity || 0
            )
        );
      },
      0
    );
  }, [checkoutItems]);

  const shippingFee =
    subtotal >= 2000
      ? 0
      : subtotal > 0
        ? 99
        : 0;

  const total =
    subtotal + shippingFee;

  // ==========================================
  // EMPTY CART
  // ==========================================

  if (checkoutItems.length === 0) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-black">
          YOUR CART IS EMPTY
        </h1>

        <p className="text-gray-500 mt-4">
          Add some FITFORGE products
          before checkout.
        </p>

        <Link
          to="/shop"
          className="mt-8 bg-black text-white px-8 py-4 font-bold"
        >
          SHOP NOW
        </Link>
      </main>
    );
  }

  // ==========================================
  // CREATE ORDER
  // ==========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (
      !form.fullName ||
      !form.phone ||
      !form.addressLine ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      toast.error(
        "Please fill all address fields."
      );

      return;
    }

    try {
      setLoading(true);

      // --------------------------------------
      // IMPORTANT:
      // Backend recalculates price.
      // Frontend total is only for display.
      // --------------------------------------

      const response =
        await api.post("/orders", {
          items: checkoutItems.map(
            (item) => ({
              product:
                item.product._id,

              quantity:
                Number(
                  item.quantity || 1
                ),

              size:
                item.size || "",

              color:
                item.color || "",
            })
          ),

          shippingAddress: {
            fullName:
              form.fullName,

            phone:
              form.phone,

            addressLine:
              form.addressLine,

            city:
              form.city,

            state:
              form.state,

            pincode:
              form.pincode,
          },

          paymentMethod,
        });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to create order."
        );
      }

      const order =
        response.data.order;

      // ======================================
      // COD
      // ======================================

      if (
        paymentMethod === "COD"
      ) {
        clearCart();

        localStorage.removeItem(
          "fitforge-cart"
        );

        toast.success(
          "Order placed successfully!"
        );

        navigate(
          `/orders/${order._id}`
        );

        return;
      }

      // ======================================
      // RAZORPAY
      // ======================================

      const razorpayResponse =
        await api.post(
          "/payments/razorpay/order",
          {
            orderId:
              order._id,
          }
        );

      if (
        !razorpayResponse.data
          ?.success
      ) {
        throw new Error(
          razorpayResponse.data
            ?.message ||
            "Unable to start payment."
        );
      }

      const {
        razorpayOrder,
        keyId,
      } =
        razorpayResponse.data;

      if (
        !window.Razorpay
      ) {
        throw new Error(
          "Razorpay checkout is not loaded."
        );
      }

      const options = {
        key: keyId,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency,

        name: "FITFORGE",

        description:
          "FITFORGE Gym Wear Order",

        order_id:
          razorpayOrder.id,

        prefill: {
          name:
            form.fullName,

          contact:
            form.phone,

          email:
            user?.email || "",
        },

        theme: {
          color: "#000000",
        },

        handler:
          async function (
            paymentResponse
          ) {
            try {
              setLoading(true);

              const verifyResponse =
                await api.post(
                  "/payments/razorpay/verify",
                  {
                    orderId:
                      order._id,

                    razorpay_order_id:
                      paymentResponse.razorpay_order_id,

                    razorpay_payment_id:
                      paymentResponse.razorpay_payment_id,

                    razorpay_signature:
                      paymentResponse.razorpay_signature,
                  }
                );

              if (
                !verifyResponse
                  .data
                  ?.success
              ) {
                throw new Error(
                  verifyResponse
                    .data
                    ?.message ||
                    "Payment verification failed."
                );
              }

              clearCart();

              localStorage.removeItem(
                "fitforge-cart"
              );

              toast.success(
                "Payment successful!"
              );

              navigate(
                `/orders/${order._id}`
              );
            } catch (error) {
              console.error(
                "Payment verification error:",
                error
              );

              toast.error(
                error.message ||
                  "Payment verification failed."
              );
            } finally {
              setLoading(false);
            }
          },

        modal: {
          ondismiss:
            function () {
              toast.error(
                "Payment cancelled."
              );

              setLoading(false);
            },
        },
      };

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Razorpay payment failed:",
            response
          );

          toast.error(
            response.error
              ?.description ||
              "Payment failed."
          );

          setLoading(false);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      toast.error(
        error.response?.data
          ?.message ||
          error.message ||
          "Checkout failed."
      );

      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <p className="text-sm tracking-[0.3em] uppercase text-gray-500 mt-8">
          FITFORGE
        </p>

        <h1 className="text-5xl font-black mt-3">
          CHECKOUT
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid lg:grid-cols-3 gap-12"
      >
        {/* ================================= */}
        {/* ADDRESS */}
        {/* ================================= */}

        <div className="lg:col-span-2 space-y-8">
          <section className="border p-8">
            <div className="flex items-center gap-3 mb-8">
              <MapPin className="w-5 h-5" />

              <h2 className="text-2xl font-black">
                SHIPPING ADDRESS
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <input
                name="fullName"
                value={
                  form.fullName
                }
                onChange={
                  handleChange
                }
                placeholder="Full Name"
                className="input"
              />

              <input
                name="phone"
                value={
                  form.phone
                }
                onChange={
                  handleChange
                }
                placeholder="Phone Number"
                className="input"
              />

              <input
                name="addressLine"
                value={
                  form.addressLine
                }
                onChange={
                  handleChange
                }
                placeholder="Address"
                className="input md:col-span-2"
              />

              <input
                name="city"
                value={
                  form.city
                }
                onChange={
                  handleChange
                }
                placeholder="City"
                className="input"
              />

              <input
                name="state"
                value={
                  form.state
                }
                onChange={
                  handleChange
                }
                placeholder="State"
                className="input"
              />

              <input
                name="pincode"
                value={
                  form.pincode
                }
                onChange={
                  handleChange
                }
                placeholder="PIN Code"
                className="input"
              />
            </div>
          </section>

          {/* ================================= */}
          {/* PAYMENT */}
          {/* ================================= */}

          <section className="border p-8">
            <div className="flex items-center gap-3 mb-8">
              <CreditCard className="w-5 h-5" />

              <h2 className="text-2xl font-black">
                PAYMENT METHOD
              </h2>
            </div>

            <div className="space-y-4">
              <label className="border p-5 flex items-center gap-4 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={
                    paymentMethod ===
                    "RAZORPAY"
                  }
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                />

                <div>
                  <p className="font-bold">
                    Razorpay
                  </p>

                  <p className="text-sm text-gray-500">
                    UPI, Cards, Net Banking
                    and more
                  </p>
                </div>
              </label>

              <label className="border p-5 flex items-center gap-4 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={
                    paymentMethod ===
                    "COD"
                  }
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                />

                <div>
                  <p className="font-bold">
                    Cash on Delivery
                  </p>

                  <p className="text-sm text-gray-500">
                    Pay when your order
                    arrives
                  </p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* ================================= */}
        {/* ORDER SUMMARY */}
        {/* ================================= */}

        <aside className="border p-8 h-fit">
          <h2 className="text-2xl font-black">
            ORDER SUMMARY
          </h2>

          <div className="mt-8 space-y-5">
            {checkoutItems.map(
              (item, index) => {
                const product =
                  item.product;

                const price =
                  product.salePrice !=
                  null
                    ? Number(
                        product.salePrice
                      )
                    : Number(
                        product.price ||
                          0
                      );

                return (
                  <div
                    key={`${product._id}-${index}`}
                    className="flex gap-4"
                  >
                    <img
                      src={
                        product.images?.[0]
                      }
                      alt={
                        product.name
                      }
                      className="w-20 h-24 object-cover bg-gray-100"
                    />

                    <div className="flex-1">
                      <p className="font-bold text-sm">
                        {product.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        Qty:{" "}
                        {
                          item.quantity
                        }
                      </p>

                      {item.size && (
                        <p className="text-xs text-gray-500">
                          Size:{" "}
                          {item.size}
                        </p>
                      )}

                      {item.color && (
                        <p className="text-xs text-gray-500">
                          Color:{" "}
                          {item.color}
                        </p>
                      )}

                      <p className="font-medium mt-2">
                        ₹
                        {(
                          price *
                          Number(
                            item.quantity ||
                              1
                          )
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          <div className="border-t mt-8 pt-6 space-y-4">
            <div className="flex justify-between">
              <span>
                Subtotal
              </span>

              <span>
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span>
                Shipping
              </span>

              <span>
                {shippingFee === 0
                  ? "FREE"
                  : `₹${shippingFee}`}
              </span>
            </div>

            <div className="border-t pt-5 flex justify-between text-xl font-black">
              <span>
                Total
              </span>

              <span>
                ₹
                {total.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-black text-white py-4 font-bold flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading
              ? "PROCESSING..."
              : paymentMethod ===
                "RAZORPAY"
              ? "PAY NOW"
              : "PLACE ORDER"}

            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-5">
            <Truck className="w-4 h-4" />
            Free shipping above ₹2,000
          </div>
        </aside>
      </form>
    </main>
  );
}