import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  Tag,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import api from "../services/api";
import { useStore } from "../context/StoreContext";

const RAZORPAY_SCRIPT =
  "https://checkout.razorpay.com/v1/checkout.js";

const initialAddress = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

const Checkout = () => {
  const navigate = useNavigate();

  const {
    cart,
    cartItems,
    clearCart,
    fetchCart,
  } = useStore();

  const [address, setAddress] =
    useState(initialAddress);

  const [paymentMethod, setPaymentMethod] =
    useState("RAZORPAY");

  const [couponCode, setCouponCode] =
    useState("");

  const [appliedCoupon, setAppliedCoupon] =
    useState(null);

  const [loadingCoupon, setLoadingCoupon] =
    useState(false);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ----------------------------------------------------------
   * CART
   * ----------------------------------------------------------
   */

  const normalizedCartItems = useMemo(() => {
    if (
      Array.isArray(cartItems) &&
      cartItems.length > 0
    ) {
      return cartItems;
    }

    if (Array.isArray(cart?.items)) {
      return cart.items;
    }

    if (Array.isArray(cart)) {
      return cart;
    }

    return [];
  }, [cartItems, cart]);

  /*
   * ----------------------------------------------------------
   * SUBTOTAL
   * ----------------------------------------------------------
   */

  const subtotal = useMemo(() => {
    return normalizedCartItems.reduce(
      (total, item) => {
        const product =
          item.product || item;

        const price =
          Number(
            item.price ??
              item.salePrice ??
              product.salePrice ??
              product.price ??
              0
          ) || 0;

        const quantity =
          Number(item.quantity ?? 1) || 1;

        return (
          total +
          price * quantity
        );
      },
      0
    );
  }, [normalizedCartItems]);

  /*
   * ----------------------------------------------------------
   * COLLECTION
   * ----------------------------------------------------------
   */

  const collection = useMemo(() => {
    const collections =
      normalizedCartItems
        .map((item) => {
          const product =
            item.product || item;

          return product.collection;
        })
        .filter(Boolean);

    if (
      collections.length > 0 &&
      collections.every(
        (item) =>
          item === "Performance"
      )
    ) {
      return "Performance";
    }

    if (
      collections.length > 0 &&
      collections.every(
        (item) =>
          item === "Luxury"
      )
    ) {
      return "Luxury";
    }

    return "All";
  }, [normalizedCartItems]);

  /*
   * ----------------------------------------------------------
   * FRONTEND DISPLAY SHIPPING
   * ----------------------------------------------------------
   *
   * Backend remains the final authority.
   */

  const FREE_SHIPPING_THRESHOLD =
    2000;

  const DEFAULT_SHIPPING_FEE = 100;

  const shipping = useMemo(() => {
    if (subtotal <= 0) {
      return 0;
    }

    if (
      subtotal >=
      FREE_SHIPPING_THRESHOLD
    ) {
      return 0;
    }

    return DEFAULT_SHIPPING_FEE;
  }, [subtotal]);

  /*
   * ----------------------------------------------------------
   * DISCOUNT
   * ----------------------------------------------------------
   */

  const discount =
    Number(
      appliedCoupon?.discount || 0
    ) || 0;

  /*
   * ----------------------------------------------------------
   * TAX DISPLAY
   * ----------------------------------------------------------
   */

  const estimatedTax = useMemo(() => {
    const taxableAmount =
      Math.max(
        0,
        subtotal - discount
      );

    return Number(
      (
        taxableAmount * 0.18
      ).toFixed(2)
    );
  }, [subtotal, discount]);

  /*
   * ----------------------------------------------------------
   * DISPLAY TOTAL
   * ----------------------------------------------------------
   */

  const estimatedTotal =
    useMemo(() => {
      return Math.max(
        0,
        subtotal +
          shipping +
          estimatedTax -
          discount
      );
    }, [
      subtotal,
      shipping,
      estimatedTax,
      discount,
    ]);

  /*
   * ----------------------------------------------------------
   * ADDRESS CHANGE
   * ----------------------------------------------------------
   */

  const handleAddressChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setAddress(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  /*
   * ----------------------------------------------------------
   * RAZORPAY SCRIPT
   * ----------------------------------------------------------
   */

  const loadRazorpay = () => {
    return new Promise(
      (resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const existingScript =
          document.querySelector(
            `script[src="${RAZORPAY_SCRIPT}"]`
          );

        if (existingScript) {
          existingScript.onload =
            () => resolve(true);

          existingScript.onerror =
            () => resolve(false);

          return;
        }

        const script =
          document.createElement(
            "script"
          );

        script.src =
          RAZORPAY_SCRIPT;

        script.async = true;

        script.onload = () =>
          resolve(true);

        script.onerror = () =>
          resolve(false);

        document.body.appendChild(
          script
        );
      }
    );
  };

  useEffect(() => {
    loadRazorpay();
  }, []);

  /*
   * ----------------------------------------------------------
   * VALIDATE CHECKOUT
   * ----------------------------------------------------------
   */

  const validateCheckout = () => {
    if (
      normalizedCartItems.length ===
      0
    ) {
      toast.error(
        "Your cart is empty."
      );

      return false;
    }

    if (
      !address.fullName.trim()
    ) {
      toast.error(
        "Please enter your full name."
      );

      return false;
    }

    if (
      !address.phone.trim()
    ) {
      toast.error(
        "Please enter your phone number."
      );

      return false;
    }

    if (
      !/^[6-9]\d{9}$/.test(
        address.phone.trim()
      )
    ) {
      toast.error(
        "Please enter a valid 10-digit Indian mobile number."
      );

      return false;
    }

    if (
      !address.addressLine.trim()
    ) {
      toast.error(
        "Please enter your complete address."
      );

      return false;
    }

    if (!address.city.trim()) {
      toast.error(
        "Please enter your city."
      );

      return false;
    }

    if (!address.state.trim()) {
      toast.error(
        "Please enter your state."
      );

      return false;
    }

    if (
      !address.pincode.trim()
    ) {
      toast.error(
        "Please enter your PIN code."
      );

      return false;
    }

    if (
      !/^\d{6}$/.test(
        address.pincode.trim()
      )
    ) {
      toast.error(
        "Please enter a valid 6-digit PIN code."
      );

      return false;
    }

    return true;
  };

  /*
   * ----------------------------------------------------------
   * APPLY COUPON
   * ----------------------------------------------------------
   */

  const applyCoupon = async () => {
    const code =
      couponCode.trim();

    if (!code) {
      toast.error(
        "Enter a coupon code."
      );

      return;
    }

    if (subtotal <= 0) {
      toast.error(
        "Your cart is empty."
      );

      return;
    }

    try {
      setLoadingCoupon(true);

      const response =
        await api.post(
          "/coupons/validate",
          {
            code,
            subtotal,
            collection,
          }
        );

      if (
        !response.data?.success
      ) {
        throw new Error(
          response.data
            ?.message ||
            "Invalid coupon."
        );
      }

      setAppliedCoupon({
        ...response.data.coupon,
        discount:
          Number(
            response.data.discount
          ) || 0,
      });

      toast.success(
        response.data.message ||
          "Coupon applied successfully."
      );
    } catch (err) {
      console.error(
        "Coupon validation error:",
        err
      );

      setAppliedCoupon(null);

      toast.error(
        err.response?.data
          ?.message ||
          err.message ||
          "Unable to apply coupon."
      );
    } finally {
      setLoadingCoupon(false);
    }
  };

  /*
   * ----------------------------------------------------------
   * REMOVE COUPON
   * ----------------------------------------------------------
   */

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");

    toast.success(
      "Coupon removed."
    );
  };

  /*
   * ----------------------------------------------------------
   * CREATE ORDER
   * ----------------------------------------------------------
   *
   * IMPORTANT:
   *
   * Your Order model/controller expects:
   *
   * shippingAddress:
   * {
   *   fullName,
   *   phone,
   *   addressLine,
   *   city,
   *   state,
   *   pincode
   * }
   */


const createOrder = async () => {
  if (!validateCheckout()) {
    return null;
  }

  try {
    setPlacingOrder(true);
    setError("");

    /*
     * Convert the current cart into the structure
     * expected by the backend.
     *
     * IMPORTANT:
     * Do not send frontend prices as the trusted price.
     * The backend should fetch the products from MongoDB
     * and calculate the final price itself.
     */

    const items = normalizedCartItems
      .map((item) => {
        const product =
          item.product || item;

        const productId =
          product?._id ||
          item?.productId ||
          item?.product?._id;

        if (!productId) {
          return null;
        }

        const quantity =
          Number(item.quantity || 1);

        return {
          product: productId,

          quantity:
            quantity > 0 ? quantity : 1,

          size:
            item.size || "",

          color:
            typeof item.color === "string"
              ? item.color
              : item.color?.name || "",
        };
      })
      .filter(Boolean);

    /*
     * Safety check.
     */

    if (items.length === 0) {
      toast.error(
        "Your cart does not contain any valid products."
      );

      console.error(
        "Invalid cart items:",
        normalizedCartItems
      );

      return null;
    }

    /*
     * This is the exact payload sent to the backend.
     */

    const orderData = {
      items,

      shippingAddress: {
        fullName:
          address.fullName.trim(),

        phone:
          address.phone.trim(),

        addressLine:
          address.addressLine.trim(),

        city:
          address.city.trim(),

        state:
          address.state.trim(),

        pincode:
          address.pincode.trim(),

        country: "India",
      },

      paymentMethod,

      couponCode:
        appliedCoupon?.code || undefined,
    };

    console.log(
      "Creating FITFORGE order:",
      orderData
    );

    const response =
      await api.post(
        "/orders",
        orderData
      );

    console.log(
      "Create order response:",
      response.data
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
          "Unable to create order."
      );
    }

    const createdOrder =
      response.data.order ||
      response.data.data;

    if (!createdOrder?._id) {
      throw new Error(
        "Order was created but order ID was not returned."
      );
    }

    return createdOrder;
  } catch (err) {
    console.error(
      "========== CREATE ORDER ERROR =========="
    );

    console.error(
      "Status:",
      err.response?.status
    );

    console.error(
      "Backend response:",
      err.response?.data
    );

    console.error(
      "Backend message:",
      err.response?.data?.message
    );

    console.error(
      "Full error:",
      err
    );

    console.error(
      "========================================"
    );

    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Unable to create order.";

    setError(message);

    toast.error(message);

    return null;
  } finally {
    setPlacingOrder(false);
  }
};



  /*
   * ----------------------------------------------------------
   * RAZORPAY PAYMENT
   * ----------------------------------------------------------
   */

  const startRazorpayPayment =
    async (createdOrder) => {
      try {
        const loaded =
          window.Razorpay ||
          (await loadRazorpay());

        if (
          !loaded ||
          !window.Razorpay
        ) {
          throw new Error(
            "Razorpay failed to load. Please refresh the page and try again."
          );
        }

        if (
          !createdOrder?._id
        ) {
          throw new Error(
            "Order ID is missing."
          );
        }

        /*
         * Backend creates Razorpay order.
         */

        const razorpayResponse =
          await api.post(
            "/payments/razorpay/order",
            {
              orderId:
                createdOrder._id,
            }
          );

        console.log(
          "Razorpay backend response:",
          razorpayResponse.data
        );

        if (
          !razorpayResponse
            .data?.success
        ) {
          throw new Error(
            razorpayResponse
              .data?.message ||
              "Unable to create Razorpay order."
          );
        }

        /*
         * IMPORTANT:
         *
         * Backend returns:
         *
         * {
         *   success: true,
         *   razorpayOrder: {
         *      id,
         *      amount,
         *      currency
         *   },
         *   keyId
         * }
         */

        const razorpayOrder =
          razorpayResponse
            .data?.razorpayOrder;

        const razorpayKey =
          razorpayResponse
            .data?.keyId;

        const razorpayOrderId =
          razorpayOrder?.id;

        if (!razorpayKey) {
          throw new Error(
            "Razorpay key was not returned by the server."
          );
        }

        if (
          !razorpayOrderId
        ) {
          throw new Error(
            "Razorpay order ID was not returned by the server."
          );
        }

        const options = {
          key: razorpayKey,

          amount:
            razorpayOrder.amount,

          currency:
            razorpayOrder.currency ||
            "INR",

          name: "FITFORGE",

          description:
            "FITFORGE Gym Wear Order",

          order_id:
            razorpayOrderId,

          prefill: {
            name:
              address.fullName,

            contact:
              address.phone,
          },

          notes: {
            fitforgeOrderId:
              String(
                createdOrder._id
              ),
          },

          theme: {
            color: "#000000",
          },

          handler:
            async (
              paymentResponse
            ) => {
              try {
                toast.loading(
                  "Verifying payment...",
                  {
                    id: "payment-verification",
                  }
                );

                /*
                 * Backend expects snake_case
                 * Razorpay fields.
                 */

                const verifyResponse =
                  await api.post(
                    "/payments/razorpay/verify",
                    {
                      orderId:
                        createdOrder._id,

                      razorpay_order_id:
                        paymentResponse.razorpay_order_id,

                      razorpay_payment_id:
                        paymentResponse.razorpay_payment_id,

                      razorpay_signature:
                        paymentResponse.razorpay_signature,
                    }
                  );

                toast.dismiss(
                  "payment-verification"
                );

                console.log(
                  "Payment verification response:",
                  verifyResponse.data
                );

                if (
                  !verifyResponse
                    .data?.success
                ) {
                  throw new Error(
                    verifyResponse
                      .data?.message ||
                      "Payment verification failed."
                  );
                }

                toast.success(
                  "Payment successful!"
                );

                try {
                  await fetchCart?.();
                } catch (
                  cartError
                ) {
                  console.warn(
                    "Cart refresh failed:",
                    cartError
                  );
                }

                try {
                  await clearCart?.();
                } catch (
                  clearError
                ) {
                  console.warn(
                    "Cart clear failed:",
                    clearError
                  );
                }

                navigate(
                  `/orders/${createdOrder._id}`,
                  {
                    replace: true,
                  }
                );
              } catch (err) {
                toast.dismiss(
                  "payment-verification"
                );

                console.error(
                  "Razorpay verification error:",
                  err
                );

                toast.error(
                  err.response
                    ?.data?.message ||
                    err.message ||
                    "Payment verification failed."
                );
              }
            },

          modal: {
            ondismiss: () => {
              toast.info(
                "Payment window closed."
              );
            },
          },
        };

        const razorpay =
          new window.Razorpay(
            options
          );

        razorpay.on(
          "payment.failed",
          (response) => {
            console.error(
              "Razorpay payment failed:",
              response
            );

            toast.error(
              response.error
                ?.description ||
                "Payment failed. Please try again."
            );
          }
        );

        razorpay.open();
      } catch (err) {
        console.error(
          "Razorpay payment error:",
          err
        );

        toast.error(
          err.response?.data
            ?.message ||
            err.message ||
            "Unable to start Razorpay payment."
        );
      }
    };

  /*
   * ----------------------------------------------------------
   * PLACE ORDER
   * ----------------------------------------------------------
   */

  const handlePlaceOrder =
    async () => {
      if (placingOrder) {
        return;
      }

      if (!validateCheckout()) {
        return;
      }

      setError("");

      const createdOrder =
        await createOrder();

      if (!createdOrder) {
        return;
      }

      /*
       * Razorpay
       */

      if (
        paymentMethod ===
        "RAZORPAY"
      ) {
        await startRazorpayPayment(
          createdOrder
        );

        return;
      }

      /*
       * COD
       */

      try {
        toast.success(
          "Order placed successfully."
        );

        try {
          await fetchCart?.();
        } catch (
          cartError
        ) {
          console.warn(
            "Cart refresh failed:",
            cartError
          );
        }

        try {
          await clearCart?.();
        } catch (
          clearError
        ) {
          console.warn(
            "Cart clear failed:",
            clearError
          );
        }

        navigate(
          `/orders/${createdOrder._id}`,
          {
            replace: true,
          }
        );
      } catch (err) {
        console.error(
          "COD checkout error:",
          err
        );

        toast.error(
          "Order was created but navigation failed."
        );
      }
    };

  /*
   * ----------------------------------------------------------
   * EMPTY CART
   * ----------------------------------------------------------
   */

  if (
    !placingOrder &&
    normalizedCartItems.length ===
      0
  ) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-6 text-center">
          <Package
            size={52}
            strokeWidth={1.5}
          />

          <h1 className="mt-6 text-3xl font-black uppercase tracking-tight">
            Your cart is empty
          </h1>

          <p className="mt-3 max-w-md text-sm text-gray-500">
            Add some FITFORGE gym wear
            to your cart before checking
            out.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 bg-black px-7 py-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  /*
   * ----------------------------------------------------------
   * UI
   * ----------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}

      <div className="border-b border-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide"
          >
            <ArrowLeft size={18} />
            Back to Cart
          </Link>

          <div className="text-xl font-black tracking-[0.2em]">
            FITFORGE
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
            <ShieldCheck size={16} />
            Secure Checkout
          </div>
        </div>
      </div>

      {/* Main */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* LEFT */}

          <div className="space-y-8">
            {/* Error */}

            {error && (
              <div className="flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <X size={18} />

                <div>
                  <p className="font-bold">
                    Checkout Error
                  </p>

                  <p className="mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* DELIVERY LOCATION */}

            <section className="border border-gray-200">
              <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <MapPin size={20} />

                  <div>
                    <h2 className="text-lg font-black uppercase">
                      Delivery Location
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Enter the complete location
                      where your FITFORGE order
                      should be delivered.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                {/* NAME */}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={
                      address.fullName
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="Full name"
                    autoComplete="name"
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide">
                    Phone *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      address.phone
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    autoComplete="tel"
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                {/* COMPLETE ADDRESS */}

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide">
                    Complete Address *
                  </label>

                  <textarea
                    name="addressLine"
                    value={
                      address.addressLine
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="House/Flat number, building, street, area, landmark"
                    rows={4}
                    autoComplete="street-address"
                    className="w-full resize-none border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                {/* CITY */}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide">
                    City *
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={
                      address.city
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="City"
                    autoComplete="address-level2"
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                {/* STATE */}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide">
                    State *
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={
                      address.state
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="State"
                    autoComplete="address-level1"
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                {/* PINCODE */}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide">
                    PIN Code *
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={
                      address.pincode
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="6-digit PIN"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                {/* COUNTRY */}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide">
                    Country
                  </label>

                  <input
                    type="text"
                    name="country"
                    value="India"
                    disabled
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none"
                  />
                </div>
              </div>
            </section>

            {/* COUPON */}

            <section className="border border-gray-200">
              <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <Tag size={20} />

                  <div>
                    <h2 className="text-lg font-black uppercase">
                      Coupon
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Apply an available FITFORGE
                      discount code.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between border border-green-200 bg-green-50 p-4">
                    <div>
                      <p className="text-sm font-black uppercase text-green-800">
                        {
                          appliedCoupon.code
                        }
                      </p>

                      <p className="mt-1 text-xs text-green-700">
                        Discount applied: ₹
                        {discount.toFixed(
                          2
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        removeCoupon
                      }
                      className="text-xs font-bold uppercase underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={
                        couponCode
                      }
                      onChange={(
                        event
                      ) =>
                        setCouponCode(
                          event.target.value.toUpperCase()
                        )
                      }
                      placeholder="ENTER COUPON CODE"
                      className="min-w-0 flex-1 border border-gray-300 px-4 py-3 text-sm font-semibold uppercase outline-none focus:border-black"
                    />

                    <button
                      type="button"
                      onClick={
                        applyCoupon
                      }
                      disabled={
                        loadingCoupon
                      }
                      className="bg-black px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loadingCoupon
                        ? "Checking..."
                        : "Apply"}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* PAYMENT */}

            <section className="border border-gray-200">
              <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} />

                  <div>
                    <h2 className="text-lg font-black uppercase">
                      Payment Method
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Choose how you want to pay.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-5 sm:p-6">
                {/* RAZORPAY */}

                <label
                  className={`flex cursor-pointer items-start gap-4 border p-4 transition ${
                    paymentMethod ===
                    "RAZORPAY"
                      ? "border-black bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={
                      paymentMethod ===
                      "RAZORPAY"
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                    className="mt-1"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard
                        size={18}
                      />

                      <p className="text-sm font-black uppercase">
                        Razorpay
                      </p>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      UPI, cards, net banking and
                      supported payment methods.
                    </p>
                  </div>

                  <ShieldCheck
                    size={18}
                    className="text-gray-500"
                  />
                </label>

                {/* COD */}

                <label
                  className={`flex cursor-pointer items-start gap-4 border p-4 transition ${
                    paymentMethod ===
                    "COD"
                      ? "border-black bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={
                      paymentMethod ===
                      "COD"
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                    className="mt-1"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Package
                        size={18}
                      />

                      <p className="text-sm font-black uppercase">
                        Cash on Delivery
                      </p>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      Pay when your order is
                      delivered.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            {/* TRUST */}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-gray-200 p-5">
                <ShieldCheck size={22} />

                <p className="mt-3 text-xs font-black uppercase">
                  Secure Payment
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Payments are securely processed.
                </p>
              </div>

              <div className="border border-gray-200 p-5">
                <Truck size={22} />

                <p className="mt-3 text-xs font-black uppercase">
                  Fast Delivery
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Reliable delivery across India.
                </p>
              </div>

              <div className="border border-gray-200 p-5">
                <CheckCircle2 size={22} />

                <p className="mt-3 text-xs font-black uppercase">
                  Quality Assured
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Authentic FITFORGE products.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="border border-gray-200">
              <div className="border-b border-gray-200 px-5 py-5">
                <h2 className="text-lg font-black uppercase">
                  Order Summary
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {normalizedCartItems.map(
                  (
                    item,
                    index
                  ) => {
                    const product =
                      item.product ||
                      item;

                    const name =
                      product.name ||
                      "FITFORGE Product";

                    const image =
                      item.thumbnail ||
                      product.thumbnail ||
                      product.images?.[0];

                    const price =
                      Number(
                        item.price ??
                          item.salePrice ??
                          product.salePrice ??
                          product.price ??
                          0
                      ) || 0;

                    const quantity =
                      Number(
                        item.quantity ??
                          1
                      ) || 1;

                    return (
                      <div
                        key={
                          item._id ||
                          product._id ||
                          `${name}-${index}`
                        }
                        className="flex gap-4 p-5"
                      >
                        <div className="h-20 w-16 shrink-0 overflow-hidden bg-gray-100">
                          {image ? (
                            <img
                              src={image}
                              alt={name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package
                                size={20}
                                className="text-gray-400"
                              />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold uppercase">
                            {name}
                          </p>

                          <div className="mt-2 space-y-1 text-xs text-gray-500">
                            {item.size && (
                              <p>
                                Size:{" "}
                                <span className="font-semibold text-gray-700">
                                  {
                                    item.size
                                  }
                                </span>
                              </p>
                            )}

                            {item.color && (
                              <p>
                                Color:{" "}
                                <span className="font-semibold text-gray-700">
                                  {typeof item.color ===
                                  "string"
                                    ? item.color
                                    : item.color
                                        ?.name ||
                                      ""}
                                </span>
                              </p>
                            )}

                            <p>
                              Qty:{" "}
                              <span className="font-semibold text-gray-700">
                                {
                                  quantity
                                }
                              </span>
                            </p>
                          </div>

                          <p className="mt-2 text-sm font-black">
                            ₹
                            {(
                              price *
                              quantity
                            ).toFixed(
                              2
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* TOTALS */}

              <div className="space-y-3 border-t border-gray-200 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    ₹
                    {subtotal.toFixed(
                      2
                    )}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Discount
                    </span>

                    <span className="font-semibold text-green-700">
                      -₹
                      {discount.toFixed(
                        2
                      )}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="font-semibold">
                    {shipping ===
                    0 ? (
                      <span className="text-green-700">
                        FREE
                      </span>
                    ) : (
                      `₹${shipping.toFixed(
                        2
                      )}`
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    GST / Tax
                  </span>

                  <span className="font-semibold">
                    ₹
                    {estimatedTax.toFixed(
                      2
                    )}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black uppercase">
                      Total
                    </span>

                    <span className="text-xl font-black">
                      ₹
                      {estimatedTotal.toFixed(
                        2
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* BUTTON */}

              <div className="border-t border-gray-200 p-5">
                <button
                  type="button"
                  onClick={
                    handlePlaceOrder
                  }
                  disabled={
                    placingOrder
                  }
                  className="flex w-full items-center justify-center gap-3 bg-black px-6 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {placingOrder ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                      Processing...
                    </>
                  ) : paymentMethod ===
                    "RAZORPAY" ? (
                    <>
                      <CreditCard
                        size={18}
                      />

                      Pay with Razorpay
                    </>
                  ) : (
                    <>
                      <Package
                        size={18}
                      />

                      Place COD Order
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-[11px] leading-relaxed text-gray-500">
                  By placing your order,
                  you agree to FITFORGE's
                  terms and conditions.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Checkout;

