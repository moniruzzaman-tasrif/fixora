// Creates a service through the Express API (../fixora-server) and returns the
// saved document.
//
// The browser can only read environment variables prefixed with NEXT_PUBLIC_,
// so `API_URL` alone is `undefined` on the client. The fallback keeps local
// development working before `.env` is picked up by a dev-server restart.

import { Service, ServiceCategory, ServiceMode } from "@/types";

export type NewServicePayload = {
  title: string;
  category: ServiceCategory;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  isAvailable: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** Shape the server responds with on success. */
type CreateServiceResponse = {
  success?: boolean;
  message?: string;
  service?: unknown;
};

export async function servicePost(
  payload: NewServicePayload
): Promise<Service> {
  const response = await fetch(`${API_URL}/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Read as text first so a non-JSON error page (404/500 HTML) is handled too.
  const text = await response.text();
  let result: CreateServiceResponse | null = null;

  try {
    result = text ? (JSON.parse(text) as CreateServiceResponse) : null;
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new Error(
      result?.message || `Could not save the service (status ${response.status})`
    );
  }

  const service = result?.service;

  if (!service || typeof service !== "object") {
    throw new Error("The server did not return the saved service");
  }

  return service as Service;
}

export default servicePost;
