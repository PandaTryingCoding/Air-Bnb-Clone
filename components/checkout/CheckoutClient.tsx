"use client";

import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/utils/format";

type PaymentOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  booking: {
    propertyName: string;
    totalNights: number;
    checkIn: string;
    checkOut: string;
    orderTotal: number;
  };
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

function CheckoutClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const bookingId = searchParams.get("bookingId");
  const [order, setOrder] = useState<PaymentOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const hasAutoOpened = useRef(false);

  const fetchOrder = useCallback(async () => {
    if (!bookingId) return null;

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

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    fetchOrder()
      .then((data) => {
        if (data) setOrder(data);
      })
      .catch((error: Error) => {
        toast({
          description: error.message,
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [bookingId, fetchOrder, toast]);

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

  const openRazorpay = useCallback(async () => {
    if (!bookingId || !order || !scriptReady || !window.Razorpay) return;

    setPaying(true);

    try {
      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Air BNB",
        description: `${order.booking.propertyName} — ${order.booking.totalNights} night(s)`,
        order_id: order.orderId,
        prefill: order.prefill,
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
  }, [bookingId, order, scriptReady, toast, verifyPayment]);

  useEffect(() => {
    if (!order || !scriptReady || hasAutoOpened.current) return;
    hasAutoOpened.current = true;
    openRazorpay();
  }, [order, scriptReady, openRazorpay]);

  if (!bookingId) {
    return (
      <section className='max-w-lg mx-auto text-center space-y-4'>
        <h1 className='text-3xl font-semibold'>Checkout</h1>
        <p className='text-muted-foreground'>No booking selected.</p>
        <Button onClick={() => router.push("/")}>Browse properties</Button>
      </section>
    );
  }

  if (loading) {
    return (
      <section className='max-w-lg mx-auto text-center space-y-4'>
        <h1 className='text-3xl font-semibold'>Checkout</h1>
        <p className='text-muted-foreground'>Preparing your payment...</p>
      </section>
    );
  }

  if (!order) {
    return (
      <section className='max-w-lg mx-auto text-center space-y-4'>
        <h1 className='text-3xl font-semibold'>Checkout</h1>
        <p className='text-muted-foreground'>
          We couldn&apos;t load this booking. It may have expired or already
          been paid.
        </p>
        <Button onClick={() => router.push("/bookings")}>View bookings</Button>
      </section>
    );
  }

  return (
    <>
      <Script
        src='https://checkout.razorpay.com/v1/checkout.js'
        strategy='lazyOnload'
        onLoad={() => setScriptReady(true)}
      />
      <section className='max-w-lg mx-auto space-y-6'>
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-semibold'>Complete your booking</h1>
          <p className='text-muted-foreground'>
            Pay securely to confirm your reservation.
          </p>
        </div>

        <div className='rounded-lg border bg-muted/40 p-6 space-y-3'>
          <div className='flex justify-between gap-4'>
            <span className='text-muted-foreground'>Property</span>
            <span className='font-medium text-right'>
              {order.booking.propertyName}
            </span>
          </div>
          <div className='flex justify-between gap-4'>
            <span className='text-muted-foreground'>Nights</span>
            <span className='font-medium'>{order.booking.totalNights}</span>
          </div>
          <div className='flex justify-between gap-4'>
            <span className='text-muted-foreground'>Check in</span>
            <span className='font-medium'>{order.booking.checkIn}</span>
          </div>
          <div className='flex justify-between gap-4'>
            <span className='text-muted-foreground'>Check out</span>
            <span className='font-medium'>{order.booking.checkOut}</span>
          </div>
          <div className='flex justify-between gap-4 border-t pt-3'>
            <span className='font-semibold'>Total</span>
            <span className='font-semibold text-primary'>
              {formatCurrency(order.booking.orderTotal)}
            </span>
          </div>
        </div>

        <Button
          className='w-full'
          onClick={openRazorpay}
          disabled={!scriptReady || paying}
        >
          {paying ? "Processing..." : "Pay now"}
        </Button>
      </section>
    </>
  );
}

export default CheckoutClient;
