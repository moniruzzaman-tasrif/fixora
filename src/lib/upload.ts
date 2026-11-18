// Client helper for the shared image upload endpoint.
// The ImgBB key lives only on the server (see src/app/api/upload/route.ts).

export const MAX_IMAGE_MB = 2;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

/** Returns a human-readable problem, or `null` when the file is acceptable. */
export function validateImageFile(file: File): string | null {
  if (
    !ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]
    )
  ) {
    return "Please choose a JPG, PNG or WebP image";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `Image must be smaller than ${MAX_IMAGE_MB} MB`;
  }
  return null;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json();
    if (typeof payload === "object" && payload !== null) {
      const error = (payload as { error?: unknown }).error;
      if (typeof error === "string" && error.length > 0) return error;
    }
  } catch {
    // Fall back to the status code below.
  }
  return `Image upload failed (status ${response.status})`;
}

/**
 * Uploads an image to `POST /api/upload` and returns its public URL.
 * Throws an `Error` with a user-readable message when the upload fails.
 */
export async function uploadImage(file: File): Promise<string> {
  const problem = validateImageFile(file);
  if (problem) throw new Error(problem);

  const body = new FormData();
  body.append("image", file);

  const response = await fetch("/api/upload", { method: "POST", body });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload: unknown = await response.json();
  const url =
    typeof payload === "object" && payload !== null && "url" in payload
      ? (payload as { url?: unknown }).url
      : undefined;

  if (typeof url !== "string" || url.length === 0) {
    throw new Error("The upload did not return an image URL");
  }

  return url;
}
