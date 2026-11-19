import { apiRequest } from "@/lib/api";
import { ApprovalStatus, Booking, Payment, Service, User, UserRole } from "@/types";

export type ProfileInput = {
  name?: string;
  phone?: string;
  area?: string;
  bio?: string;
  image?: string;
};

/** All users on the platform (admin only). */
export function getAdminUsers(): Promise<User[]> {
  return apiRequest<User[]>("/admin/users");
}

/** Changes another user's role. The server refuses self-edits. */
export function updateUserRole(
  userId: string,
  role: UserRole
): Promise<{ success: boolean; message: string; user: User }> {
  return apiRequest(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

/** Every service, for moderation. */
export function getAdminServices(): Promise<Service[]> {
  return apiRequest<Service[]>("/admin/services");
}

/** Approves or rejects a service. */
export function setServiceApproval(
  serviceId: string,
  approvalStatus: ApprovalStatus
): Promise<{ success: boolean; service: Service }> {
  return apiRequest(`/admin/services/${serviceId}/approval`, {
    method: "PATCH",
    body: JSON.stringify({ approvalStatus }),
  });
}

/** Every booking on the platform (read-only page). */
export function getAdminBookings(): Promise<Booking[]> {
  return apiRequest<Booking[]>("/admin/bookings");
}

/** Every payment record, newest first. */
export function getAdminPayments(): Promise<Payment[]> {
  return apiRequest<Payment[]>("/admin/payments");
}

/** The signed-in user's own profile row. */
export function getProfile(): Promise<User> {
  return apiRequest<User>("/users/profile");
}

/** Updates editable profile fields; email and role are server-protected. */
export function updateProfile(
  input: ProfileInput
): Promise<{ success: boolean; message: string; user: User }> {
  return apiRequest("/users/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
