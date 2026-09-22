import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  Package,
  ShoppingBag,
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
    products = [],
    clearCart,
  } = useStore();

  // Prevent Object.entries(undefined/null)
  const safeCartItems = cartItems || {};

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    setShippingAddress((previous) => ({
      ...previous,
      fullName: previous.fullName || user?.fullName || "",
      phone: previous.phone || user?.phone || "",
    }));
  }, [user]);

  const checkoutItems = useMemo(() => {
    return Object.entries(safeCartItems)
      .map(([productId, item]) => {
        const product = products.find(
          (product) => product._id === productId
        );

        if (!product || !item) {
          return null;
        }

        return {
          product,
          quantity: Number(item.quantity) || 1,
          size: item.size || "",
          color: item.color || "",
        };
      })
      .filter(Boolean);
  }, [safeCartItems, products]);

  const subtotal = useMemo(() => {
    return checkoutItems.reduce((total, item) => {
      const price =
        item.product.salePrice ?? item.product.price ?? 0;

      return total + Number(price) * item.quantity;
    }, 0);
  }, [checkoutItems]);

  const shippingFee = subtotal >= 2000 ? 0 : 99;

  const total = subtotal + shippingFee;

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setShippingAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateAddress = () => {
    const requiredFields = [
      "fullName",
      "phone",
      "addressLine",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredFields) {
      if (!shippingAddress[field].trim()) {
        const fieldName = field
          .replace("addressLine", "address")
          .replace(/([A-Z])/g, " $1")
          .toLowerCase();

        toast.error(`Please enter your ${fieldName}`);

        return false;
      }
    }

    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error("Enter a valid 10-digit phone number");
      return false;
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      toast.error("Enter a valid 6-digit pincode");
      return false;
    }

    return true;
  };

  const createOrder = async () => {
    if (!checkoutItems.length) {
      toast.error("Your cart is empty");
      return null;
    }

    const items = checkoutItems.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));

    const response = await api.post("/orders", {
      items,
      shippingAddress,
      paymentMethod,
    });

    return response.data.order;
  };

  const startRazorpayPayment = async (order) => {
    try {
      setPaymentLoading(true);

      if (!window.Razorpay) {
        toast.error(
          "Razorpay checkout is not loaded. Please refresh the page."
        );

        setPaymentLoading(false);
        return;
      }

      const response = await api.post(
        "/payments/razorpay/order",
        {
          orderId: order._id,
        }
      );

      const { razorpayOrder, keyId } = response.data;

      if (!razorpayOrder?.id) {
        throw new Error("Razorpay order was not created");
      }

      if (!keyId) {
        throw new Error(
          "Razorpay Key ID was not returned by backend"
        );
      }

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",

        name: "FITFORGE",
        description: "Premium Gym Wear",
        order_id: razorpayOrder.id,

        prefill: {
          name:
            user?.fullName ||
            shippingAddress.fullName,

          email: user?.email || "",

          contact:
            user?.phone ||
            shippingAddress.phone,
        },

        notes: {
          fitforgeOrderId: order._id,
        },

        theme: {
          color: "#000000",
        },

        modal: {
          escape: true,
          backdropclose: false,

          ondismiss: () => {
            setPaymentLoading(false);
            toast.error("Payment cancelled");
          },
        },

        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await api.post(
              "/payments/razorpay/verify",
              {
                orderId: order._id,

                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature,
              }
            );

            if (verifyResponse.data.success) {
              clearCart();

              toast.success("Payment successful!");

              navigate(`/orders/${order._id}`);
            }
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            toast.error(
              error.response?.data?.message ||
                "Payment verification failed"
            );
          } finally {
            setPaymentLoading(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        (response) => {
          console.error(
            "Razorpay payment failed:",
            response
          );

          setPaymentLoading(false);

          toast.error(
            response.error?.description ||
              "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Razorpay payment error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to start payment"
      );

      setPaymentLoading(false);
    }
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!validateAddress()) {
      return;
    }

    if (!checkoutItems.length) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setLoading(true);

      const order = await createOrder();

      if (!order) {
        return;
      }

      if (paymentMethod === "RAZORPAY") {
        setLoading(false);

        await startRazorpayPayment(order);

        return;
      }

      clearCart();

      toast.success("Order placed successfully!");

      navigate(`/orders/${order._id}`);
    } catch (error) {
      console.error(
        "Place order error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!checkoutItems.length) {
    return (
      <main className="min-h-screen bg-white px-4 py-20">
        <div className="mx-auto max-w-xl text-center">
          <ShoppingBag className="mx-auto mb-5 h-14 w-14 text-neutral-300" />

          <h1 className="text-3xl font-black">
            Your cart is empty
          </h1>

          <p className="mt-3 text-neutral-500">
            Add some FITFORGE products before checkout.
          </p>

          <Link
            to="/shop"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white"
          >
            Shop Now
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            to="/cart"
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-black"
          >
            <ArrowLeft size={17} />
            Back to Cart
          </Link>

          <h1 className="text-3xl font-black tracking-tight">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Complete your order securely.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <h2 className="font-black">
                      Shipping Address
                    </h2>

                    <p className="text-xs text-neutral-500">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Full Name"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleAddressChange}
                    placeholder="Your full name"
                  />

                  <Input
                    label="Phone Number"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleAddressChange}
                    placeholder="10 digit mobile number"
                    maxLength="10"
                  />

                  <div className="sm:col-span-2">
                    <Input
                      label="Address"
                      name="addressLine"
                      value={shippingAddress.addressLine}
                      onChange={handleAddressChange}
                      placeholder="House number, street, area"
                    />
                  </div>

                  <Input
                    label="City"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                  />

                  <Input
                    label="State"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    placeholder="State"
                  />

                  <Input
                    label="Pincode"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleAddressChange}
                    placeholder="6 digit pincode"
                    maxLength="6"
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                    <CreditCard size={19} />
                  </div>

                  <div>
                    <h2 className="font-black">
                      Payment Method
                    </h2>

                    <p className="text-xs text-neutral-500">
                      Select your preferred payment method.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <PaymentOption
                    value="RAZORPAY"
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                    title="Pay Online"
                    description="UPI, Cards, Net Banking & Wallets"
                    icon={<CreditCard size={20} />}
                  />

                  <PaymentOption
                    value="COD"
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                    title="Cash on Delivery"
                    description="Pay when your order arrives"
                    icon={<Truck size={20} />}
                  />
                </div>
              </section>

              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-5">
                <Lock className="h-5 w-5 text-neutral-500" />

                <div>
                  <p className="text-sm font-bold">
                    Secure Checkout
                  </p>

                  <p className="text-xs text-neutral-500">
                    Your payment and personal information are
                    securely processed.
                  </p>
                </div>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 lg:sticky lg:top-6">
              <h2 className="mb-6 text-xl font-black">
                Order Summary
              </h2>

              <div className="mb-6 space-y-4">
                {checkoutItems.map((item) => {
                  const price =
                    item.product.salePrice ??
                    item.product.price ??
                    0;

                  return (
                    <div
                      key={`${item.product._id}-${item.size}-${item.color}`}
                      className="flex gap-4"
                    >
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                        <img
                          src={
                            item.product.images?.[0] ||
                            "/placeholder.png"
                          }
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />

                        <span className="absolute right-1 top-1 rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {item.product.name}
                        </p>

                        {item.size && (
                          <p className="mt-1 text-xs text-neutral-500">
                            Size: {item.size}
                          </p>
                        )}

                        {item.color && (
                          <p className="mt-1 text-xs text-neutral-500">
                            Color: {item.color}
                          </p>
                        )}

                        <p className="mt-1 text-sm font-black">
                          {formatPrice(
                            price * item.quantity
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-neutral-200 pt-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">
                    Subtotal
                  </span>

                  <span className="font-bold">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-500">
                    Shipping
                  </span>

                  <span className="font-bold">
                    {shippingFee === 0
                      ? "FREE"
                      : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between border-t border-neutral-200 pt-4 text-lg">
                  <span className="font-black">
                    Total
                  </span>

                  <span className="font-black">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {subtotal < 2000 && (
                <div className="mt-5 rounded-xl bg-neutral-100 p-4 text-xs font-medium text-neutral-600">
                  Add{" "}
                  <strong>
                    {formatPrice(2000 - subtotal)}
                  </strong>{" "}
                  more to get free shipping.
                </div>
              )}

              <button
                type="submit"
                disabled={loading || paymentLoading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-4 text-sm font-black text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading || paymentLoading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Processing...
                  </>
                ) : paymentMethod === "RAZORPAY" ? (
                  <>
                    <CreditCard size={18} />
                    Pay {formatPrice(total)}
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Place Order
                  </>
                )}
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-neutral-400">
                <Package size={14} />
                Premium FITFORGE delivery
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
};

const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  maxLength,
}) => (
  <div>
    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">
      {label}
    </label>

    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-black focus:bg-white"
    />
  </div>
);

const PaymentOption = ({
  value,
  selected,
  onChange,
  title,
  description,
  icon,
}) => {
  const active = selected === value;

  return (
    <label
      className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
        active
          ? "border-black bg-neutral-50"
          : "border-neutral-200 hover:border-neutral-400"
      }`}
    >
      <input
        type="radio"
        name="paymentMethod"
        value={value}
        checked={active}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-4 w-4 accent-black"
      />

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          active
            ? "bg-black text-white"
            : "bg-neutral-100 text-neutral-600"
        }`}
      >
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-sm font-bold">
          {title}
        </p>

        <p className="mt-1 text-xs text-neutral-500">
          {description}
        </p>
      </div>
    </label>
  );
};

export default Checkout;