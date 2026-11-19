import { apiRequest } from "@/lib/api";
import {
  Booking,
  BookingStatus,
  Service,
  ServiceCategory,
  ServiceMode,
} from "@/types";

export type ServiceInput = {
  title: string;
  category: ServiceCategory;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
};

/** The signed-in technician's services, whatever their approval state. */
export function getMyServices(): Promise<Service[]> {
  return apiRequest<Service[]>("/services/mine");
}

/**
 * Creates a service. Technician identity, `approvalStatus` and `isAvailable`
 * are decided by the server from the session, so they are not sent.
 */
export function createService(
  input: ServiceInput
): Promise<{ success: boolean; service: Service }> {
  return apiRequest("/services", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Edits an owned service; the server resets approval to `pending`. */
export function updateService(
  serviceId: string,
  input: ServiceInput
): Promise<{ success: boolean; message: string; service: Service }> {
  return apiRequest(`/services/${serviceId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** Deletes an owned service. */
export function deleteService(
  serviceId: string
): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/services/${serviceId}`, { method: "DELETE" });
}

/** Toggles availability without touching the approval state. */
export function setServiceAvailability(
  serviceId: string,
  isAvailable: boolean
): Promise<{ success: boolean; message: string; service: Service }> {
  return apiRequest(`/services/${serviceId}/availability`, {
    method: "PATCH",
    body: JSON.stringify({ isAvailable }),
  });
}

/** Bookings assigned to the signed-in technician's email. */
export function getTechnicianBookings(): Promise<Booking[]> {
  return apiRequest<Booking[]>("/booking");
}

/** Moves a job through the allowed workflow (server-enforced). */
export function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  finalAmount?: number
): Promise<{ success: boolean; message: string; booking: Booking }> {
  return apiRequest(`/booking/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify(
      finalAmount === undefined ? { status } : { status, finalAmount }
    ),
  });
}
