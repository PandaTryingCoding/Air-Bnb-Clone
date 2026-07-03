import { Suspense } from "react";
import CheckoutClient from "@/components/checkout/CheckoutClient";

function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <section className='max-w-lg mx-auto text-center space-y-4'>
          <h1 className='text-3xl font-semibold'>Checkout</h1>
          <p className='text-muted-foreground'>Loading checkout...</p>
        </section>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}

export default CheckoutPage;
