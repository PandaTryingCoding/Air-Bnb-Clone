import Link from "next/link";
import { Button } from "@/components/ui/button";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { fetchCheckoutBooking } from "@/utils/actions";

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  searchParams: { bookingId?: string };
};

async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const bookingId = searchParams.bookingId;

  if (!bookingId) {
    return (
      <section className='max-w-lg mx-auto text-center space-y-4'>
        <h1 className='text-3xl font-semibold'>Checkout</h1>
        <p className='text-muted-foreground'>No booking selected.</p>
        <Button asChild>
          <Link href='/'>Browse properties</Link>
        </Button>
      </section>
    );
  }

  const booking = await fetchCheckoutBooking(bookingId);

  if (!booking) {
    return (
      <section className='max-w-lg mx-auto text-center space-y-4'>
        <h1 className='text-3xl font-semibold'>Checkout</h1>
        <p className='text-muted-foreground'>
          We couldn&apos;t load this booking. It may have expired or already
          been paid.
        </p>
        <Button asChild>
          <Link href='/bookings'>View bookings</Link>
        </Button>
      </section>
    );
  }

  return <CheckoutClient bookingId={bookingId} booking={booking} />;
}

export default CheckoutPage;
