import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import db from "@/utils/db";
import { formatDate } from "@/utils/format";
import { getRazorpayInstance, toPaise } from "@/utils/razorpay";
import { isPendingHoldActive } from "@/utils/bookingHold";

export const POST = async (req: Request) => {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await req.json();
  if (!bookingId || typeof bookingId !== "string") {
    return NextResponse.json({ message: "Invalid booking id" }, { status: 400 });
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  if (!booking) {
    return NextResponse.json({ message: "Booking not found" }, { status: 404 });
  }

  if (booking.profileId !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (booking.paymentStatus) {
    return NextResponse.json(
      { message: "Booking is already paid" },
      { status: 400 }
    );
  }

  if (!isPendingHoldActive(booking.checkIn)) {
    await db.booking.delete({
      where: { id: bookingId },
    });
    return NextResponse.json(
      { message: "Payment window has expired for this reservation" },
      { status: 410 }
    );
  }

  const user = await currentUser();
  const {
    orderTotal,
    totalNights,
    checkIn,
    checkOut,
    property: { name },
  } = booking;

  try {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: toPaise(orderTotal),
      currency: "INR",
      receipt: booking.id,
      notes: {
        bookingId: booking.id,
        profileId: userId,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID?.trim(),
      booking: {
        propertyName: name,
        totalNights,
        checkIn: formatDate(checkIn),
        checkOut: formatDate(checkOut),
        orderTotal,
      },
      prefill: {
        name: user?.fullName || user?.firstName || "",
        email: user?.emailAddresses[0]?.emailAddress || "",
      },
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      { message: "Unable to create payment order" },
      { status: 500 }
    );
  }
};
