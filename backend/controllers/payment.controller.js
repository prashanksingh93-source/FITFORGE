import crypto from "crypto";
import razorpay from "../services/razorpay.service.js";

export const createRazorpayOrder = async (req, res) => {
  try {
    console.log("\n========== RAZORPAY CREATE ORDER ==========");

    console.log("User:", req.user?._id);
    console.log("Request body:", req.body);

    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    console.log(
      "Amount received:",
      numericAmount
    );

    const amountInPaise = Math.round(
      numericAmount * 100
    );

    console.log(
      "Amount in paise:",
      amountInPaise
    );

    console.log(
      "Razorpay Key ID:",
      process.env.RAZORPAY_KEY_ID
    );

    console.log(
      "Razorpay secret loaded:",
      Boolean(
        process.env.RAZORPAY_KEY_SECRET
      )
    );

    if (!process.env.RAZORPAY_KEY_ID) {
      return res.status(500).json({
        success: false,
        message:
          "RAZORPAY_KEY_ID is missing from backend .env",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message:
          "RAZORPAY_KEY_SECRET is missing from backend .env",
      });
    }

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `fitforge_${Date.now()}`,
    };

    console.log(
      "Sending order to Razorpay:",
      options
    );

    const order =
      await razorpay.orders.create(options);

    console.log(
      "Razorpay order created:",
      order.id
    );

    console.log(
      "==========================================\n"
    );

    return res.status(200).json({
      success: true,
      message:
        "Razorpay order created successfully",
      order,
      keyId:
        process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(
      "\n========== RAZORPAY ERROR =========="
    );

    console.error(
      "Error name:",
      error.name
    );

    console.error(
      "Error message:",
      error.message
    );

    console.error(
      "Error status:",
      error.statusCode
    );

    console.error(
      "Error description:",
      error.description
    );

    console.error(
      "Full error:",
      error
    );

    console.error(
      "====================================\n"
    );

    return res.status(500).json({
      success: false,
      message:
        error.description ||
        error.error?.description ||
        error.message ||
        "Razorpay order creation failed",
    });
  }
};

export const verifyRazorpayPayment = async (
  req,
  res
) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing Razorpay payment details",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message:
          "Razorpay secret is not configured",
      });
    }

    const body =
      `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(body)
        .digest("hex");

    if (
      expectedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Razorpay payment signature",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Payment verified successfully",
    });
  } catch (error) {
    console.error(
      "Razorpay verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Payment verification failed",
    });
  }
};