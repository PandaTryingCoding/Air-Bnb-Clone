export const dynamic = "force-dynamic";

import EmptyList from "@/components/home/EmptyList";
import CountryFlagAndName from "@/components/card/CountryFlagAndName";
import Link from "next/link";

import { formatDate, formatCurrency } from "@/utils/format";
import { getPaymentDeadline } from "@/utils/bookingHold";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import FormContainer from "@/components/form/FormContainer";
import { IconButton } from "@/components/form/Buttons";
import { Button } from "@/components/ui/button";
import {
  fetchBookings,
  fetchPendingBookings,
  deleteBookingAction,
} from "@/utils/actions";

async function BookingsPage() {
  const [pendingBookings, bookings] = await Promise.all([
    fetchPendingBookings(),
    fetchBookings(),
  ]);

  if (pendingBookings.length === 0 && bookings.length === 0) {
    return <EmptyList />;
  }

  return (
    <div className='mt-8 space-y-10'>
      {pendingBookings.length > 0 && (
        <section>
          <h4 className='mb-4 capitalize'>
            Pending reservations : {pendingBookings.length}
          </h4>
          <Table>
            <TableCaption>
              Complete payment before the deadline to confirm your stay
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Property Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Nights</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Pay by</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingBookings.map((booking) => {
                const { id, orderTotal, totalNights, checkIn, checkOut } =
                  booking;
                const { id: propertyId, name, country } = booking.property;
                const payBy = formatDate(getPaymentDeadline(checkIn));

                return (
                  <TableRow key={id}>
                    <TableCell>
                      <Link
                        href={`/properties/${propertyId}`}
                        className='underline text-muted-foreground tracking-wide'
                      >
                        {name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <CountryFlagAndName countryCode={country} />
                    </TableCell>
                    <TableCell>{totalNights}</TableCell>
                    <TableCell>{formatCurrency(orderTotal)}</TableCell>
                    <TableCell>{formatDate(checkIn)}</TableCell>
                    <TableCell>{formatDate(checkOut)}</TableCell>
                    <TableCell>{payBy}</TableCell>
                    <TableCell>
                      <Button asChild size='sm'>
                        <Link href={`/checkout?bookingId=${id}`}>
                          Complete payment
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      )}

      {bookings.length > 0 && (
        <section>
          <h4 className='mb-4 capitalize'>Confirmed bookings : {bookings.length}</h4>
          <Table>
            <TableCaption>A list of your confirmed bookings</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Property Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Nights</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const { id, orderTotal, totalNights, checkIn, checkOut } =
                  booking;
                const { id: propertyId, name, country } = booking.property;

                return (
                  <TableRow key={id}>
                    <TableCell>
                      <Link
                        href={`/properties/${propertyId}`}
                        className='underline text-muted-foreground tracking-wide'
                      >
                        {name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <CountryFlagAndName countryCode={country} />
                    </TableCell>
                    <TableCell>{totalNights}</TableCell>
                    <TableCell>{formatCurrency(orderTotal)}</TableCell>
                    <TableCell>{formatDate(checkIn)}</TableCell>
                    <TableCell>{formatDate(checkOut)}</TableCell>
                    <TableCell>
                      <DeleteBooking bookingId={id} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  );
}

function DeleteBooking({ bookingId }: { bookingId: string }) {
  const deleteBooking = deleteBookingAction.bind(null, { bookingId });
  return (
    <FormContainer action={deleteBooking}>
      <IconButton actionType='delete' />
    </FormContainer>
  );
}

export default BookingsPage;
