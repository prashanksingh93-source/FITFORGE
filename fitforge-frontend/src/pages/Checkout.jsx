import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CreditCard, MapPin, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import api from "../services/api";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useStore();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("COD");

  const [notes, setNotes] = useState("");

  const shippingFee = cartTotal >= 2000 ? 0 : 99;

  const totalAmount = cartTotal + shippingFee;

  const changeHandler = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const submitOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const requiredFields = [
      "fullName",
      "phone",
      "addressLine",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredFields) {
      if (!form[field].trim()) {
        toast.error(
          `Please enter ${field
            .replace("addressLine", "address")
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()}`
        );
        return;
      }
    }

    if (!/^\d{10}$/.test(form.phone)) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }

    try {
      setLoading(true);

      const orderItems = cart.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const response = await api.post("/orders", {
        items: orderItems,
        shippingAddress: form,
        paymentMethod,
        notes,
      });

      if (response.data.success) {
        clearCart();

        toast.success("Order placed successfully");

        navigate(
          `/orders/${response.data.order._id}`
        );
      }
    } catch (error) {
      console.error(
        "Create order error:",
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

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-6" />

          <h1 className="text-3xl font-black">
            YOUR CART IS EMPTY
          </h1>

          <p className="text-gray-500 mt-3 mb-7">
            Add some FITFORGE products before checking
            out.
          </p>

          <Link
            to="/shop"
            className="inline-flex bg-black text-white px-8 py-3 font-bold"
          >
            SHOP NOW
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-bold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO CART
        </Link>

        <div className="mt-8">
          <p className="text-xs font-bold tracking-[0.3em] text-gray-500 uppercase">
            FITFORGE
          </p>

          <h1 className="text-4xl md:text-5xl font-black mt-2">
            CHECKOUT
          </h1>
        </div>

        <form
          onSubmit={submitOrder}
          className="grid lg:grid-cols-3 gap-8 mt-10"
        >
          <div className="lg:col-span-2 space-y-7">
            <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8">
              <div className="flex items-center gap-3 mb-7">
                <MapPin className="w-5 h-5" />

                <h2 className="text-xl font-black">
                  SHIPPING INFORMATION
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={changeHandler}
                    placeholder="Enter full name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={changeHandler}
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Pincode
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={changeHandler}
                    maxLength={6}
                    placeholder="6-digit pincode"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">
                    Address
                  </label>

                  <textarea
                    name="addressLine"
                    value={form.addressLine}
                    onChange={changeHandler}
                    rows="4"
                    placeholder="House number, street, area..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={changeHandler}
                    placeholder="City"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={changeHandler}
                    placeholder="State"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8">
              <div className="flex items-center gap-3 mb-7">
                <CreditCard className="w-5 h-5" />

                <h2 className="text-xl font-black">
                  PAYMENT METHOD
                </h2>
              </div>

              <div className="space-y-4">
                <label
                  className={`flex items-center gap-4 border rounded-xl p-5 cursor-pointer transition ${
                    paymentMethod === "COD"
                      ? "border-black bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={
                      paymentMethod === "COD"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                    className="w-4 h-4"
                  />

                  <div>
                    <p className="font-bold">
                      Cash on Delivery
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Pay when your order arrives.
                    </p>
                  </div>

                  {paymentMethod === "COD" && (
                    <CheckCircle2 className="w-5 h-5 ml-auto" />
                  )}
                </label>

                <label
                  className={`flex items-center gap-4 border rounded-xl p-5 cursor-pointer transition ${
                    paymentMethod === "RAZORPAY"
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
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                    className="w-4 h-4"
                  />

                  <div>
                    <p className="font-bold">
                      Online Payment
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Razorpay integration will
                      process your payment.
                    </p>
                  </div>

                  {paymentMethod ===
                    "RAZORPAY" && (
                    <CheckCircle2 className="w-5 h-5 ml-auto" />
                  )}
                </label>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8">
              <h2 className="text-xl font-black mb-5">
                ORDER NOTES
              </h2>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                rows="4"
                placeholder="Any special instructions? (Optional)"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black resize-none"
              />
            </section>
          </div>

          <aside>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-7 lg:sticky lg:top-24">
              <h2 className="text-xl font-black mb-6">
                YOUR ORDER
              </h2>

              <div className="space-y-5">
                {cart.map((item, index) => {
                  const image =
                    item.product.images?.[0] ||
                    "https://via.placeholder.com/100x120?text=FITFORGE";

                  const price =
                    item.product.salePrice ??
                    item.product.price;

                  return (
                    <div
                      key={`${item.product._id}-${item.size}-${item.color}-${index}`}
                      className="flex gap-3"
                    >
                      <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">
                          {item.product.name}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Qty: {item.quantity}
                        </p>

                        {item.size && (
                          <p className="text-xs text-gray-500">
                            Size: {item.size}
                          </p>
                        )}

                        <p className="font-bold text-sm mt-2">
                          ₹
                          {(
                            price *
                            item.quantity
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 mt-7 pt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    ₹
                    {cartTotal.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="font-semibold">
                    {shippingFee === 0
                      ? "FREE"
                      : `₹${shippingFee}`}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-5 flex justify-between text-xl">
                  <span className="font-black">
                    Total
                  </span>

                  <span className="font-black">
                    ₹
                    {totalAmount.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-7 bg-black text-white py-4 font-black tracking-wide hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "PLACING ORDER..."
                  : "PLACE ORDER"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to
                our terms and conditions.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default Checkout;