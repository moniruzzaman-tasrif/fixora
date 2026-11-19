import assert from "node:assert/strict";
import { test } from "node:test";
import { getSuccessfulPayments } from "../src/lib/admin-metrics.ts";

function payment({
  id,
  bookingId,
  amount,
  paymentStatus = "paid",
  transactionId = "",
  stripeSessionId = "",
}) {
  return {
    _id: id,
    bookingId,
    amount,
    paymentStatus,
    transactionId,
    stripeSessionId,
  };
}

test("revenue inputs include only unique paid payment records", () => {
  const records = [
    payment({
      id: "payment-1",
      bookingId: "booking-1",
      amount: 25,
      transactionId: "pi_1",
    }),
    payment({
      id: "duplicate-payment",
      bookingId: "booking-1",
      amount: 25,
      transactionId: "pi_1",
    }),
    payment({
      id: "unpaid-payment",
      bookingId: "booking-2",
      amount: 80,
      paymentStatus: "unpaid",
      transactionId: "pi_2",
    }),
    payment({
      id: "session-payment",
      bookingId: "booking-3",
      amount: 12,
      stripeSessionId: "cs_3",
    }),
    payment({
      id: "duplicate-session",
      bookingId: "booking-3",
      amount: 12,
      stripeSessionId: "cs_3",
    }),
  ];

  const successfulPayments = getSuccessfulPayments(records);

  assert.equal(successfulPayments.length, 2);
  assert.equal(
    successfulPayments.reduce((total, record) => total + record.amount, 0),
    37
  );
});

test("an empty payment collection produces no revenue records", () => {
  assert.deepEqual(getSuccessfulPayments([]), []);
});
