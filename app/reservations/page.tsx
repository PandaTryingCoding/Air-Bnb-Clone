export const dynamic = "force-dynamic";

import { fetchReservations } from "@/utils/actions";
import Link from "next/link";
import EmptyList from "@/components/home/EmptyList";
import CountryFlagAndName from "@/components/card/CountryFlagAndName";

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
import Stats from "@/components/reservations/Stats";

async function ReservationsPage() {
  const reservations = await fetchReservations();
  if (reservations.length === 0) return <EmptyList />;

  return (
    <>
      <Stats />
      <div className='mt-8'>
        <h4 className='mb-4 capitalize'>
          total reservations : {reservations.length}
        </h4>
        <Table>
          <TableCaption>
            Confirmed and pending reservations on your properties
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Property Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Nights</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Pay by</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((item) => {
              const {
                id,
                orderTotal,
                totalNights,
                checkIn,
                checkOut,
                paymentStatus,
              } = item;
              const { id: propertyId, name, country } = item.property;
              const isPending = !paymentStatus;
              const payBy = isPending
                ? formatDate(getPaymentDeadline(checkIn))
                : "—";

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
                  <TableCell>
                    <span
                      className={
                        isPending
                          ? "text-amber-600 font-medium capitalize"
                          : "text-green-600 font-medium capitalize"
                      }
                    >
                      {isPending ? "pending payment" : "confirmed"}
                    </span>
                  </TableCell>
                  <TableCell>{totalNights}</TableCell>
                  <TableCell>{formatCurrency(orderTotal)}</TableCell>
                  <TableCell>{formatDate(checkIn)}</TableCell>
                  <TableCell>{formatDate(checkOut)}</TableCell>
                  <TableCell>{payBy}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
export default ReservationsPage;
