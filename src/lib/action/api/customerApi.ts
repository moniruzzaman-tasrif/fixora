import { apiRequest } from "@/lib/api";
import { Booking, Payment } from "@/types";

export interface CreateBookingInput {
  serviceId: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
}

/** The signed-in customer's own repair requests, newest first. */
export function getMyBookings(): Promise<Booking[]> {
  return apiRequest<Booking[]>("/booking/mine");
}

/** Creates a request; the server fills price/technician/status from the DB. */
export function createBooking(
  input: CreateBookingInput
): Promise<Booking> {
  return apiRequest("/booking", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Cancels a `requested` booking owned by the signed-in customer. */
export function cancelBooking(
  bookingId: string
): Promise<Booking> {
  return apiRequest(`/booking/${bookingId}/cancel`, { method: "PATCH" });
}

/** Starts a Stripe Checkout Session and returns its hosted URL. */
export function startCheckout(
  bookingId: string
): Promise<{ url: string; sessionId: string }> {
  return apiRequest("/payments/create-checkout-session", {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  });
}

/** Confirms the Stripe session and records the payment on the server. */
export function verifyPayment(
  sessionId: string
): Promise<{ success: boolean; payment: Payment }> {
  return apiRequest(
    `/payments/verify?session_id=${encodeURIComponent(sessionId)}`
  );
}

/** The signed-in customer's payment history, newest first. */
export function getMyPayments(): Promise<Payment[]> {
  return apiRequest<Payment[]>("/payments/mine");
}
