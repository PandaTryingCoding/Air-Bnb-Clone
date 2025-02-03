"use client";

import { useProperty } from "@/utils/store";
import { useAuth, SignInButton } from "@clerk/nextjs";
import React from "react";
import { Button } from "../ui/button";
import FormContainer from "../form/FormContainer";
import SubmitButton from "../form/Buttons";
import { createBookingAction } from "@/utils/actions";

function ConfirmBooking() {
  const { userId } = useAuth();
  const { range, propertyId } = useProperty((state) => state);
  const checkIn = range?.from as Date;
  const checkOut = range?.to as Date;
  if (!userId) {
    return (
      <SignInButton mode='modal'>
        <Button type='button' className='w-full'>
          Sign In to Complete Booking
        </Button>
      </SignInButton>
    );
  }
  const createBooking = createBookingAction.bind(null, {
    propertyId,
    checkIn,
    checkOut,
  });
  return (
    <section>
      <FormContainer action={createBooking}>
        <SubmitButton text='Reserve' className='w-full'></SubmitButton>
      </FormContainer>
    </section>
  );
}

export default ConfirmBooking;
