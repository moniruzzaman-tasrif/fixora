import type { Payment } from "@/types";

export function getSuccessfulPayments(payments: Payment[]): Payment[] {
  const uniquePayments = new Map<string, Payment>();

  for (const payment of payments) {
    if (payment.paymentStatus !== "paid") continue;

    const identity = payment.transactionId
      ? `transaction:${payment.transactionId}`
      : payment.stripeSessionId
        ? `session:${payment.stripeSessionId}`
        : `booking:${payment.bookingId}`;

    if (!uniquePayments.has(identity)) {
      uniquePayments.set(identity, payment);
    }
  }

  return [...uniquePayments.values()];
}
