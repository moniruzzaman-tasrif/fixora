"use client";

import { useSession } from "@/lib/auth-client";
import { User, UserRole } from "@/types";

/**
 * The signed-in user's role comes from the database through the BetterAuth
 * session. It is stored as a plain string, so every consumer must narrow it
 * before using it as a `UserRole` key.
 */
export function isUserRole(value: unknown): value is UserRole {
  return value === "customer" || value === "technician" || value === "admin";
}

type SessionUserShape = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: unknown;
  phone?: string | null;
  area?: string | null;
  bio?: string | null;
  createdAt?: Date | string | null;
};

function toIsoString(value: Date | string | null | undefined) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value.length > 0) return value;
  return undefined;
}

/** Maps the BetterAuth session user onto the app's `User` shape. */
export function toAppUser(sessionUser: SessionUserShape): User {
  return {
    _id: sessionUser.id,
    name: sessionUser.name?.trim() || "Fixora User",
    email: sessionUser.email ?? "",
    image: sessionUser.image ?? undefined,
    // Public sign-up can only create customer/technician; admins are created
    // manually. Anything unexpected falls back to the safest role.
    role: isUserRole(sessionUser.role) ? sessionUser.role : "customer",
    phone: sessionUser.phone ?? undefined,
    area: sessionUser.area ?? undefined,
    bio: sessionUser.bio ?? undefined,
    createdAt: toIsoString(sessionUser.createdAt),
  };
}

/**
 * Single source of truth for "who is signed in right now".
 * `user` stays `null` until the session request resolves.
 */
export function useCurrentUser() {
  const { data: session, isPending, refetch } = useSession();
  const sessionUser = session?.user;

  return {
    user: sessionUser ? toAppUser(sessionUser) : null,
    isPending,
    /** Re-reads the session from the database (used after a profile save). */
    refetch,
  };
}
