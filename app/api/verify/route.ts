import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import db from "@/utils/db";

export const POST = async (req: Request) => {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const {
    bookingId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = await req.json();

  if (
    !bookingId ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return NextResponse.json({ message: "Missing payment details" }, { status: 400 });
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return NextResponse.json({ message: "Booking not found" }, { status: 404 });
  }

  if (booking.profileId !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (booking.paymentStatus) {
    return NextResponse.json({ success: true, message: "Already paid" });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keySecret) {
    return NextResponse.json(
      { message: "Payment verification unavailable" },
      { status: 500 }
    );
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ message: "Invalid payment signature" }, { status: 400 });
  }

  try {
    await db.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: true },
    });

    revalidatePath("/bookings");
    revalidatePath("/reservations");
    revalidatePath("/admin");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update booking payment status:", error);
    return NextResponse.json(
      { message: "Unable to confirm payment" },
      { status: 500 }
    );
  }
};
