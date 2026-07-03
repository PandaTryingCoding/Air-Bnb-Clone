export const PAYMENT_HOLD_DAYS_BEFORE_CHECKIN = 4;

/** Earliest check-in date that still allows an unpaid hold (today + 4 days). */
export const getMinCheckInForActiveHold = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + PAYMENT_HOLD_DAYS_BEFORE_CHECKIN);
  return date;
};

/** Last day (inclusive) a guest can complete payment for a given check-in. */
export const getPaymentDeadline = (checkIn: Date) => {
  const deadline = new Date(checkIn);
  deadline.setHours(0, 0, 0, 0);
  deadline.setDate(deadline.getDate() - PAYMENT_HOLD_DAYS_BEFORE_CHECKIN);
  return deadline;
};

export const isPendingHoldActive = (checkIn: Date) => {
  const minCheckIn = getMinCheckInForActiveHold();
  const checkInDate = new Date(checkIn);
  checkInDate.setHours(0, 0, 0, 0);
  return checkInDate >= minCheckIn;
};
