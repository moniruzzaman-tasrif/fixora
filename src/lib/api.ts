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

export function parseApiList<T>(data: unknown, path: string): T[] {
  if (!Array.isArray(data)) {
    throw new ApiError(
      `The server returned an invalid list response for ${path}.`,
      502
    );
  }

  return data as T[];
}

export async function apiListRequest<T>(path: string): Promise<T[]> {
  const data = await apiRequest<unknown>(path);
  return parseApiList<T>(data, path);
}

let pendingTokenRequest: Promise<string> | null = null;

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

function hasValidJwtLifetime(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) return false;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))
    ) as unknown;

    return (
      typeof payload === "object" &&
      payload !== null &&
      "exp" in payload &&
      typeof payload.exp === "number" &&
      Number.isFinite(payload.exp) &&
      payload.exp > Date.now() / 1000
    );
  } catch {
    return false;
  }
}

async function requestAccessToken(): Promise<string> {
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
      ? identityData.token.trim()
      : "";

  if (!token || !hasValidJwtLifetime(token)) {
    throw new ApiError("A valid session token could not be created.", 401);
  }

  return token;
}

function getAccessToken(): Promise<string> {
  if (!pendingTokenRequest) {
    pendingTokenRequest = requestAccessToken().finally(() => {
      pendingTokenRequest = null;
    });
  }
  return pendingTokenRequest;
}

/**
 * Gets a BetterAuth JWT from its `/api/auth/token` endpoint, then sends it to
 * the Express API as a bearer token.
 */
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers,
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
