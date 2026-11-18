import { NextResponse } from "next/server";

// Uploads a profile photo to ImgBB and returns its public URL.
// The API key stays on the server: it is never sent to the browser.
// NOTE: this route is intentionally public because it runs during sign-up,
// before the user has an account.

const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
// Allow a little room for multipart boundaries and headers.
const MAX_REQUEST_BYTES = MAX_IMAGE_BYTES + 512 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function readImageUrl(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;

  const data = (payload as { data?: unknown }).data;
  if (typeof data !== "object" || data === null) return null;

  const url = (data as { url?: unknown }).url;
  if (typeof url !== "string" || !url.startsWith("https://")) return null;

  return url;
}

export async function POST(request: Request) {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return jsonError("Image upload is not configured on the server", 500);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_REQUEST_BYTES) {
    return jsonError("Image must be smaller than 2 MB", 413);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Expected a multipart/form-data request", 400);
  }

  const image = formData.get("image");

  if (!(image instanceof File)) {
    return jsonError('Missing "image" file field', 400);
  }

  if (image.size === 0) {
    return jsonError("The uploaded image is empty", 400);
  }

  if (
    !ACCEPTED_IMAGE_TYPES.includes(
      image.type as (typeof ACCEPTED_IMAGE_TYPES)[number]
    )
  ) {
    return jsonError("Only JPG, PNG and WebP images are allowed", 400);
  }

  if (image.size > MAX_IMAGE_BYTES) {
    return jsonError("Image must be smaller than 2 MB", 413);
  }

  const imgbbForm = new FormData();
  imgbbForm.append("image", image, image.name || "profile-photo");

  let response: Response;
  try {
    response = await fetch(
      `${IMGBB_UPLOAD_URL}?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: imgbbForm,
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      }
    );
  } catch {
    return jsonError("Could not reach the image host", 502);
  }

  if (!response.ok) {
    return jsonError("The image host rejected the upload", 502);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return jsonError("The image host returned an invalid response", 502);
  }

  const url = readImageUrl(payload);
  if (!url) {
    return jsonError("The image host did not return an image URL", 502);
  }

  return NextResponse.json({ url });
}
