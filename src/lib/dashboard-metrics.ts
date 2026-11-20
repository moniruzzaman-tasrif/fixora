import type { Booking } from "@/types";

export function getBookingStatusCounts(
  bookings: Pick<Booking, "status">[]
) {
  return {
    requested: bookings.filter((booking) => booking.status === "requested").length,
    accepted: bookings.filter((booking) => booking.status === "accepted").length,
    inProgress: bookings.filter((booking) => booking.status === "in-progress").length,
    completed: bookings.filter((booking) => booking.status === "completed").length,
    closed: bookings.filter((booking) =>
      ["rejected", "cancelled"].includes(booking.status)
    ).length,
  };
}
