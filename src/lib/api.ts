export function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured. Set it to the fixora-server URL."
    );
  }
  return apiUrl.replace(/\/+$/, "");
}

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
    (("message" in data &&
      typeof (data as { message?: unknown }).message === "string") ||
      ("error" in data && typeof (data as { error?: unknown }).error === "string"))
  ) {
    return "message" in data
      ? String((data as { message: string }).message)
      : String((data as { error: string }).error);
  }
  return `Request failed (HTTP ${status}). Please try again.`;
}

/**
 * Gets a BetterAuth JWT from its `/api/auth/token` endpoint, then sends it to
 * the Express API as a bearer token.
 */
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const identityResponse = await fetch("/api/auth/token", {
    credentials: "include",
    cache: "no-store",
  });
  const identityText = await identityResponse.text();
  let identityData: unknown = null;
  if (identityText) {
    try {
      identityData = JSON.parse(identityText);
    } catch {
      identityData = null;
    }
  }
  if (!identityResponse.ok) {
    throw new ApiError(
      readMessage(identityData, identityResponse.status),
      identityResponse.status
    );
  }
  const token =
    typeof identityData === "object" &&
    identityData !== null &&
    "token" in identityData &&
    typeof identityData.token === "string"
      ? identityData.token
      : null;
  if (!token) {
    throw new ApiError("A valid session token could not be created.", 401);
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
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
