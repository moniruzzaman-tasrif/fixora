export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** An HTTP error carrying the backend's status code and human message. */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function readMessage(data: unknown, status: number): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }
  return `Request failed (HTTP ${status}). Please try again.`;
}

/**
 * Browser caller for the Express API. `credentials: "include"` sends the
 * BetterAuth session cookie so the server can authorize every request.
 */
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  let authorizationHeader: Record<string, string> = {};

  try {
    const identityResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    if (identityResponse.ok) {
      const identity = (await identityResponse.json()) as { token?: unknown };
      if (typeof identity.token === "string") {
        authorizationHeader = { Authorization: `Bearer ${identity.token}` };
      }
    }
  } catch {
    // The backend will return 401 if the session is no longer usable.
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...authorizationHeader,
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(readMessage(data, response.status), response.status);
  }

  return data as T;
}
