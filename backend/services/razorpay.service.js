import Razorpay from "razorpay";

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID) {
    throw new Error("RAZORPAY_KEY_ID is missing in .env");
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY_KEY_SECRET is missing in .env");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export default getRazorpay;