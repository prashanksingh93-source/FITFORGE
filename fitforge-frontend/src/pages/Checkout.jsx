import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Loader2,
  MapPin,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";

const Checkout = () => {
  const navigate = useNavigate();

  const { user } = useAuth();
  const {
    cartItems,
    cartTotal,
    clearCart,
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [storeSettings, setStoreSettings] = useState({});

  const [paymentMethod, setPaymentMethod] =
    useState("Razorpay");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  /* =========================================================
     LOAD SETTINGS
  ========================================================= */

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get("/settings");

        const data =
          response?.data?.settings ||
          response?.data ||
          {};

        setStoreSettings(data || {});
      } catch (error) {
        console.error(
          "Failed to load store settings:",
          error
        );

        toast.error(
          "Failed to load store settings"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  /* =========================================================
     REDIRECT IF NOT LOGGED IN
  ========================================================= */

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login?redirect=/checkout");
    }
  }, [user, loading, navigate]);

  /* =========================================================
     REDIRECT EMPTY CART
  ========================================================= */

  useEffect(() => {
    if (
      !loading &&
      user &&
      (!cartItems || cartItems.length === 0)
    ) {
      navigate("/cart");
    }
  }, [
    loading,
    user,
    cartItems,
    navigate,
  ]);

  /* =========================================================
     PREFILL USER
  ========================================================= */

  useEffect(() => {
    if (!user) return;

    setAddress((previous) => ({
      ...previous,

      fullName:
        previous.fullName ||
        user.fullName ||
        user.name ||
        "",

      phone:
        previous.phone ||
        user.phone ||
        user.phoneNumber ||
        "",

      country:
        previous.country || "India",
    }));
  }, [user]);

  /* =========================================================
     SETTINGS
  ========================================================= */

  const shippingFeeSetting = Math.max(
    0,
    Number(storeSettings.shippingFee || 0)
  );

  const freeShippingThreshold = Math.max(
    0,
    Number(
      storeSettings.freeShippingThreshold || 0
    )
  );

  const gstRate = Math.min(
    100,
    Math.max(
      0,
      Number(storeSettings.gst || 0)
    )
  );

  const codEnabled =
    storeSettings.codEnabled !== false;

  const codAdvanceEnabled =
    storeSettings.codAdvanceEnabled === true;

  const codAdvancePercentage = Math.min(
    100,
    Math.max(
      0,
      Number(
        storeSettings.codAdvancePercentage || 0
      )
    )
  );

  const codMinimumAdvance = Math.max(
    0,
    Number(
      storeSettings.codMinimumAdvance || 0
    )
  );

  const codMaximumOrderValue =
    storeSettings.codMaximumOrderValue === null ||
    storeSettings.codMaximumOrderValue ===
      undefined ||
    storeSettings.codMaximumOrderValue === ""
      ? null
      : Number(
          storeSettings.codMaximumOrderValue
        );

  /* =========================================================
     SUBTOTAL
  ========================================================= */

  const subtotal = useMemo(() => {
    if (appliedCoupon?.subtotal !== undefined) {
      return Number(
        appliedCoupon.subtotal
      );
    }

    return Number(cartTotal || 0);
  }, [
    cartTotal,
    appliedCoupon,
  ]);

  /* =========================================================
     DISCOUNT
  ========================================================= */

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;

    return Number(
      appliedCoupon.discount || 0
    );
  }, [appliedCoupon]);

  const amountAfterDiscount = Math.max(
    0,
    subtotal - discount
  );

  /* =========================================================
     SHIPPING
  ========================================================= */

  const shippingFee =
    freeShippingThreshold > 0 &&
    amountAfterDiscount >=
      freeShippingThreshold
      ? 0
      : shippingFeeSetting;

  /* =========================================================
     GST
  ========================================================= */

  const tax = Number(
    (
      (amountAfterDiscount * gstRate) /
      100
    ).toFixed(2)
  );

  /* =========================================================
     TOTAL
  ========================================================= */

  const totalAmount = Number(
    (
      amountAfterDiscount +
      tax +
      shippingFee
    ).toFixed(2)
  );

  /* =========================================================
     COD ADVANCE PREVIEW
  ========================================================= */

  const calculatedCodAdvance =
    codAdvanceEnabled
      ? Math.min(
          totalAmount,
          Math.max(
            (totalAmount *
              codAdvancePercentage) /
              100,
            codMinimumAdvance
          )
        )
      : 0;

  const codAdvance = Number(
    calculatedCodAdvance.toFixed(2)
  );

  const codRemaining = Number(
    Math.max(
      0,
      totalAmount - codAdvance
    ).toFixed(2)
  );

  const codAllowedByOrderValue =
    codMaximumOrderValue === null ||
    totalAmount <=
      codMaximumOrderValue;

  /* =========================================================
     FORM HANDLER
  ========================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     APPLY COUPON
  ========================================================= */

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(
        "Enter a coupon code"
      );
      return;
    }

    try {
      setCouponLoading(true);

      const response = await api.post(
        "/coupons/validate",
        {
          code: couponCode.trim(),
          subtotal: Number(cartTotal || 0),
        }
      );

      const data =
        response?.data || {};

      if (!data.success) {
        throw new Error(
          data.message ||
            "Invalid coupon"
        );
      }

      setAppliedCoupon(data);

      toast.success(
        data.message ||
          "Coupon applied successfully"
      );
    } catch (error) {
      console.error(
        "Coupon error:",
        error
      );

      setAppliedCoupon(null);

      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to apply coupon"
      );
    } finally {
      setCouponLoading(false);
    }
  };

  /* =========================================================
     REMOVE COUPON
  ========================================================= */

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");

    toast.success(
      "Coupon removed"
    );
  };

  /* =========================================================
     VALIDATE ADDRESS
  ========================================================= */

  const validateAddress = () => {
    const fields = [
      ["fullName", "Full name"],
      ["phone", "Phone"],
      ["addressLine", "Address"],
      ["city", "City"],
      ["state", "State"],
      ["pincode", "Pincode"],
    ];

    for (const [
      key,
      label,
    ] of fields) {
      if (
        !address[key] ||
        !String(
          address[key]
        ).trim()
      ) {
        toast.error(
          `${label} is required`
        );
        return false;
      }
    }

    const phoneDigits =
      address.phone.replace(
        /\D/g,
        ""
      );

    if (
      phoneDigits.length !== 10
    ) {
      toast.error(
        "Enter a valid 10-digit phone number"
      );
      return false;
    }

    const pincodeDigits =
      address.pincode.replace(
        /\D/g,
        ""
      );

    if (
      pincodeDigits.length !== 6
    ) {
      toast.error(
        "Enter a valid 6-digit pincode"
      );
      return false;
    }

    return true;
  };

  /* =========================================================
     CREATE ORDER
  ========================================================= */

  const createBackendOrder = async () => {
    const items = cartItems.map(
      (item) => ({
        product:
          item.product?._id ||
          item.product ||
          item._id,

        quantity:
          Number(
            item.quantity
          ),

        size:
          item.size || "",

        color:
          item.color || "",
      })
    );

    if (items.length === 0) {
      throw new Error(
        "Your cart is empty"
      );
    }

    /*
      IMPORTANT:

      We intentionally do NOT send:

      price
      subtotal
      discount
      shippingFee
      tax
      totalAmount
      advanceAmount

      Backend calculates all financial
      values from MongoDB/Admin settings.
    */

    const response =
      await api.post(
        "/orders",
        {
          items,

          shippingAddress: {
            ...address,
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

            country:
              address.country?.trim() ||
              "India",
          },

          paymentMethod,

          couponCode:
            appliedCoupon?.coupon?.code ||
            couponCode.trim() ||
            "",

          notes: "",
        }
      );

    const data =
      response?.data || {};

    if (!data.success || !data.order) {
      throw new Error(
        data.message ||
          "Failed to create order"
      );
    }

    return data;
  };

  /* =========================================================
     LOAD RAZORPAY SCRIPT
  ========================================================= */

  const loadRazorpay = () => {
    return new Promise(
      (resolve) => {
        if (
          window.Razorpay
        ) {
          resolve(true);
          return;
        }

        const script =
          document.createElement(
            "script"
          );

        script.src =
          "https://checkout.razorpay.com/v1/checkout.js";

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

  /* =========================================================
     START RAZORPAY PAYMENT
  ========================================================= */

  const startRazorpayPayment = async (
    orderId
  ) => {
    const scriptLoaded =
      await loadRazorpay();

    if (!scriptLoaded) {
      throw new Error(
        "Razorpay could not be loaded"
      );
    }

    /*
      Backend decides whether this is:

      FULL_PAYMENT
      or
      COD_ADVANCE
    */

    const response =
      await api.post(
        "/payments/razorpay/create-order",
        {
          orderId,
        }
      );

    const data =
      response?.data || {};

    if (
      !data.success ||
      !data.razorpayOrder
    ) {
      throw new Error(
        data.message ||
          "Failed to create Razorpay order"
      );
    }

    const razorpayOrder =
      data.razorpayOrder;

    const paymentAmount =
      Number(
        data.paymentAmount ??
          data.amount ??
          0
      );

    if (
      !Number.isFinite(
        paymentAmount
      ) ||
      paymentAmount <= 0
    ) {
      throw new Error(
        "Invalid Razorpay payment amount"
      );
    }

    return new Promise(
      (resolve, reject) => {
        const options = {
          key: data.keyId,

          amount:
            razorpayOrder.amount,

          currency:
            razorpayOrder.currency ||
            "INR",

          name:
            storeSettings.storeName ||
            "FITFORGE",

          description:
            data.paymentType ===
            "COD_ADVANCE"
              ? "FITFORGE COD Advance Payment"
              : "FITFORGE Order Payment",

          order_id:
            razorpayOrder.id,

          prefill: {
            name:
              address.fullName,

            email:
              user?.email || "",

            contact:
              address.phone,
          },

          notes: {
            fitforgeOrderId:
              orderId,

            paymentType:
              data.paymentType ||
              "FULL_PAYMENT",
          },

          theme: {
            color: "#000000",
          },

          handler:
            async function (
              razorpayResponse
            ) {
              try {
                /*
                  Send Razorpay response to backend.
                  Backend verifies signature,
                  amount, order ID and payment status.
                */

                const verifyResponse =
                  await api.post(
                    "/payments/razorpay/verify",
                    {
                      orderId,

                      razorpay_order_id:
                        razorpayResponse.razorpay_order_id,

                      razorpay_payment_id:
                        razorpayResponse.razorpay_payment_id,

                      razorpay_signature:
                        razorpayResponse.razorpay_signature,
                    }
                  );

                const verifyData =
                  verifyResponse?.data ||
                  {};

                if (
                  !verifyData.success
                ) {
                  throw new Error(
                    verifyData.message ||
                      "Payment verification failed"
                  );
                }

                resolve(
                  verifyData
                );
              } catch (error) {
                reject(error);
              }
            },

          modal: {
            ondismiss:
              function () {
                reject(
                  new Error(
                    "Payment window was closed"
                  )
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
          function (
            response
          ) {
            reject(
              new Error(
                response?.error
                  ?.description ||
                  "Razorpay payment failed"
              )
            );
          }
        );

        razorpay.open();
      }
    );
  };

  /* =========================================================
     PLACE ORDER
  ========================================================= */

  const handlePlaceOrder = async () => {
    if (placingOrder) return;

    if (!validateAddress()) {
      return;
    }

    if (
      paymentMethod === "COD" &&
      !codEnabled
    ) {
      toast.error(
        "COD is currently unavailable"
      );
      return;
    }

    if (
      paymentMethod === "COD" &&
      !codAllowedByOrderValue
    ) {
      toast.error(
        `COD is available only for orders up to ₹${codMaximumOrderValue}`
      );
      return;
    }

    try {
      setPlacingOrder(true);

      /*
        STEP 1:
        Create the order on backend.

        Backend recalculates all prices.
      */

      const orderData =
        await createBackendOrder();

      const order =
        orderData.order;

      /*
        STEP 2:
        If payment is required,
        open Razorpay.

        For:
        Razorpay -> totalAmount

        COD with advance ->
        advanceAmount only
      */

      if (
        orderData.paymentRequired
      ) {
        await startRazorpayPayment(
          order._id
        );

        /*
          Payment has been verified
          by backend.
        */

        await clearCart();

        navigate(
          `/orders/${order._id}`,
          {
            replace: true,
            state: {
              paymentSuccess: true,
            },
          }
        );

        return;
      }

      /*
        COD without advance.
      */

      await clearCart();

      navigate(
        `/orders/${order._id}`,
        {
          replace: true,
          state: {
            orderSuccess: true,
          },
        }
      );
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      toast.error(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2
            size={24}
            className="animate-spin"
          />
          Loading checkout...
        </div>
      </div>
    );
  }

  if (
    !user ||
    !cartItems?.length
  ) {
    return null;
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =========================
          HEADER
      ========================= */}

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
          >
            <ArrowLeft size={18} />
            Back to Cart
          </Link>

          <h1 className="mt-4 text-2xl md:text-3xl font-bold">
            Checkout
          </h1>
        </div>
      </div>

      {/* =========================
          MAIN
      ========================= */}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* =====================
              LEFT
          ===================== */}

          <div className="lg:col-span-2 space-y-6">
            {/* ADDRESS */}

            <section className="bg-white rounded-2xl border border-gray-200 p-5 md:p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gray-100">
                  <MapPin size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Delivery Address
                  </h2>

                  <p className="text-sm text-gray-500">
                    Where should we deliver your
                    order?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Full Name"
                  name="fullName"
                  value={
                    address.fullName
                  }
                  onChange={
                    handleChange
                  }
                />

                <Input
                  label="Phone"
                  name="phone"
                  value={
                    address.phone
                  }
                  onChange={
                    handleChange
                  }
                  type="tel"
                />

                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    name="addressLine"
                    value={
                      address.addressLine
                    }
                    onChange={
                      handleChange
                    }
                  />
                </div>

                <Input
                  label="City"
                  name="city"
                  value={
                    address.city
                  }
                  onChange={
                    handleChange
                  }
                />

                <Input
                  label="State"
                  name="state"
                  value={
                    address.state
                  }
                  onChange={
                    handleChange
                  }
                />

                <Input
                  label="Pincode"
                  name="pincode"
                  value={
                    address.pincode
                  }
                  onChange={
                    handleChange
                  }
                  inputMode="numeric"
                />

                <Input
                  label="Country"
                  name="country"
                  value={
                    address.country
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>
            </section>

            {/* COUPON */}

            <section className="bg-white rounded-2xl border border-gray-200 p-5 md:p-7">
              <h2 className="text-lg font-semibold mb-5">
                Coupon
              </h2>

              {appliedCoupon ? (
                <div className="flex items-center justify-between gap-4 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle
                      size={20}
                      className="text-green-600"
                    />

                    <div>
                      <p className="font-semibold">
                        {
                          appliedCoupon
                            ?.coupon
                            ?.code
                        }
                      </p>

                      <p className="text-sm text-gray-500">
                        Discount ₹
                        {Number(
                          discount
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleRemoveCoupon
                    }
                    className="text-sm font-semibold text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    value={
                      couponCode
                    }
                    onChange={(event) =>
                      setCouponCode(
                        event.target.value
                      )
                    }
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                  />

                  <button
                    type="button"
                    disabled={
                      couponLoading
                    }
                    onClick={
                      handleApplyCoupon
                    }
                    className="px-6 py-3 rounded-xl bg-black text-white font-semibold disabled:opacity-50"
                  >
                    {couponLoading
                      ? "Applying..."
                      : "Apply"}
                  </button>
                </div>
              )}
            </section>

            {/* PAYMENT */}

            <section className="bg-white rounded-2xl border border-gray-200 p-5 md:p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gray-100">
                  <CreditCard size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Payment Method
                  </h2>

                  <p className="text-sm text-gray-500">
                    Choose how you want to pay.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* RAZORPAY */}

                <label className="flex items-start gap-4 border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-black">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Razorpay"
                    checked={
                      paymentMethod ===
                      "Razorpay"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                    className="mt-1"
                  />

                  <div>
                    <p className="font-semibold">
                      Online Payment
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Pay securely using
                      Razorpay.
                    </p>
                  </div>
                </label>

                {/* COD */}

                {codEnabled && (
                  <label
                    className={`flex items-start gap-4 border rounded-xl p-4 ${
                      codAllowedByOrderValue
                        ? "cursor-pointer hover:border-black border-gray-200"
                        : "opacity-50 cursor-not-allowed border-gray-200"
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
                      disabled={
                        !codAllowedByOrderValue
                      }
                      onChange={(event) =>
                        setPaymentMethod(
                          event.target.value
                        )
                      }
                      className="mt-1"
                    />

                    <div>
                      <p className="font-semibold">
                        Cash on Delivery
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {codAllowedByOrderValue
                          ? codAdvanceEnabled
                            ? `Pay ${codAdvancePercentage}% online and the remaining amount at delivery.`
                            : "Pay the full amount when your order is delivered."
                          : `COD is available only up to ₹${codMaximumOrderValue}.`}
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {/* COD ADVANCE NOTICE */}

              {paymentMethod ===
                "COD" &&
                codAdvanceEnabled &&
                codAllowedByOrderValue && (
                  <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        size={22}
                        className="shrink-0"
                      />

                      <div>
                        <p className="font-semibold">
                          COD Advance Payment
                        </p>

                        <p className="text-sm text-gray-600 mt-1 leading-6">
                          You will pay{" "}
                          <strong>
                            {codAdvancePercentage}%
                          </strong>{" "}
                          online before we
                          confirm your COD order.
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">
                              Pay Online
                            </p>

                            <p className="text-lg font-bold">
                              ₹
                              {codAdvance.toFixed(
                                2
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500">
                              Pay at Delivery
                            </p>

                            <p className="text-lg font-bold">
                              ₹
                              {codRemaining.toFixed(
                                2
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </section>
          </div>

          {/* =====================
              RIGHT SUMMARY
          ===================== */}

          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-7 lg:sticky lg:top-6">
              <h2 className="text-xl font-bold mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <SummaryRow
                  label="Subtotal"
                  value={`₹${subtotal.toFixed(
                    2
                  )}`}
                />

                {discount > 0 && (
                  <SummaryRow
                    label="Discount"
                    value={`-₹${discount.toFixed(
                      2
                    )}`}
                    positive
                  />
                )}

                <SummaryRow
                  label="Shipping"
                  value={
                    shippingFee === 0
                      ? "FREE"
                      : `₹${shippingFee.toFixed(
                          2
                        )}`
                  }
                />

                <SummaryRow
                  label={`GST (${gstRate}%)`}
                  value={`₹${tax.toFixed(
                    2
                  )}`}
                />

                <div className="border-t pt-4">
                  <SummaryRow
                    label="Total"
                    value={`₹${totalAmount.toFixed(
                      2
                    )}`}
                    bold
                  />
                </div>

                {/* COD TOTAL */}

                {paymentMethod ===
                  "COD" &&
                  codAdvanceEnabled &&
                  codAllowedByOrderValue && (
                    <div className="border-t pt-4 mt-4 space-y-3">
                      <p className="font-semibold text-sm">
                        COD Payment Breakdown
                      </p>

                      <SummaryRow
                        label="Pay Online Now"
                        value={`₹${codAdvance.toFixed(
                          2
                        )}`}
                        bold
                      />

                      <SummaryRow
                        label="Pay at Delivery"
                        value={`₹${codRemaining.toFixed(
                          2
                        )}`}
                      />
                    </div>
                  )}
              </div>

              {/* SHIPPING MESSAGE */}

              {shippingFee > 0 &&
                freeShippingThreshold >
                  0 &&
                amountAfterDiscount <
                  freeShippingThreshold && (
                  <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                    Add ₹
                    {(
                      freeShippingThreshold -
                      amountAfterDiscount
                    ).toFixed(
                      2
                    )}{" "}
                    more to get free shipping.
                  </div>
                )}

              {/* PLACE ORDER */}

              <button
                type="button"
                disabled={
                  placingOrder ||
                  (paymentMethod ===
                    "COD" &&
                    !codAllowedByOrderValue)
                }
                onClick={
                  handlePlaceOrder
                }
                className="w-full mt-6 bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {placingOrder ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />

                    Processing...
                  </>
                ) : paymentMethod ===
                  "COD" &&
                  codAdvanceEnabled ? (
                  <>
                    Pay ₹
                    {codAdvance.toFixed(
                      2
                    )} & Place COD Order
                  </>
                ) : paymentMethod ===
                  "COD" ? (
                  <>
                    <Truck
                      size={20}
                    />
                    Place COD Order
                  </>
                ) : (
                  <>
                    <CreditCard
                      size={20}
                    />
                    Pay ₹
                    {totalAmount.toFixed(
                      2
                    )}
                  </>
                )}
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={15} />
                Secure payment processing
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   INPUT
========================================================= */

const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  inputMode,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        inputMode={inputMode}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  );
};

/* =========================================================
   SUMMARY ROW
========================================================= */

const SummaryRow = ({
  label,
  value,
  bold = false,
  positive = false,
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        bold
          ? "text-lg font-bold"
          : "text-sm"
      }`}
    >
      <span className="text-gray-600">
        {label}
      </span>

      <span
        className={
          positive
            ? "text-green-600 font-semibold"
            : ""
        }
      >
        {value}
      </span>
    </div>
  );
};

export default Checkout;
