import Razorpay from "razorpay";

export const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID?.trim();
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return new Razorpay({ key_id, key_secret });
};

export const toPaise = (amountInRupees: number) =>
  Math.round(amountInRupees * 100);
