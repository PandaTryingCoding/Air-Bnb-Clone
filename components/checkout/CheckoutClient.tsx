"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/utils/format";

export type CheckoutBooking = {
  propertyName: string;
  totalNights: number;
  checkIn: string;
  checkOut: string;
  orderTotal: number;
};

type PaymentOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  prefill: {
    name: string;
    email: string;
  };
};

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpaySuccessResponse) => void;
  modal: {
    ondismiss: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpayScript = () => {
  if (window.Razorpay) {
    return Promise.resolve();
  }

  const existingScript = document.querySelector(
    `script[src="${RAZORPAY_SCRIPT_URL}"]`,
  );

  if (existingScript) {
    if (window.Razorpay) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Unable to load payment gateway")),
      );
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load payment gateway"));
    document.body.appendChild(script);
  });
};

type CheckoutClientProps = {
  bookingId: string;
  booking: CheckoutBooking;
};

function CheckoutClient({ bookingId, booking }: CheckoutClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [paying, setPaying] = useState(false);

  const fetchOrder = useCallback(async () => {
    const response = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unable to start checkout");
    }

    return data as PaymentOrderResponse;
  }, [bookingId]);

  const verifyPayment = useCallback(
    async (response: RazorpaySuccessResponse) => {
      const verifyResponse = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const data = await verifyResponse.json();
      if (!verifyResponse.ok) {
        throw new Error(data.message || "Payment verification failed");
      }

      toast({ description: "Payment successful! Your booking is confirmed." });
      router.push("/bookings");
    },
    [bookingId, router, toast],
  );

  const handlePayClick = async () => {
    setPaying(true);

    try {
      await loadRazorpayScript();
      const paymentOrder = await fetchOrder();

      const options: RazorpayOptions = {
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "Air BNB",
        description: `${booking.propertyName} — ${booking.totalNights} night(s)`,
        order_id: paymentOrder.orderId,
        prefill: paymentOrder.prefill,
        theme: { color: "#F97215" },
        handler: async (response) => {
          try {
            await verifyPayment(response);
          } catch (error) {
            toast({
              description:
                error instanceof Error
                  ? error.message
                  : "Payment verification failed",
              variant: "destructive",
            });
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setPaying(false);
      toast({
        description:
          error instanceof Error ? error.message : "Unable to open payment",
        variant: "destructive",
      });
    }
  };

  return (
    <section className='max-w-lg mx-auto space-y-6'>
      <div className='text-center space-y-2'>
        <h1 className='text-3xl font-semibold'>Complete your booking</h1>
        <p className='text-muted-foreground'>
          Pay securely to confirm your reservation. You can return here anytime
          before the payment deadline to finish checkout.
        </p>
      </div>

      <div className='rounded-lg border bg-muted/40 p-6 space-y-3'>
        <div className='flex justify-between gap-4'>
          <span className='text-muted-foreground'>Property</span>
          <span className='font-medium text-right'>{booking.propertyName}</span>
        </div>
        <div className='flex justify-between gap-4'>
          <span className='text-muted-foreground'>Nights</span>
          <span className='font-medium'>{booking.totalNights}</span>
        </div>
        <div className='flex justify-between gap-4'>
          <span className='text-muted-foreground'>Check in</span>
          <span className='font-medium'>{booking.checkIn}</span>
        </div>
        <div className='flex justify-between gap-4'>
          <span className='text-muted-foreground'>Check out</span>
          <span className='font-medium'>{booking.checkOut}</span>
        </div>
        <div className='flex justify-between gap-4 border-t pt-3'>
          <span className='font-semibold'>Total</span>
          <span className='font-semibold text-primary'>
            {formatCurrency(booking.orderTotal)}
          </span>
        </div>
      </div>

      <Button className='w-full' onClick={handlePayClick} disabled={paying}>
        {paying ? "Opening payment..." : "Pay now"}
      </Button>
    </section>
  );
}

export default CheckoutClient;
