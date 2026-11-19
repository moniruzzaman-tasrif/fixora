import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

function base64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function hmacSha256(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );
  return Buffer.from(signature)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function GET() {
  const secret = process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Express API JWT signing is not configured" },
      { status: 503 }
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = base64Url(
    JSON.stringify({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as { role?: unknown }).role,
      iat: now,
      exp: now + 7 * 24 * 60 * 60,
    })
  );
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const unsigned = `${header}.${payload}`;
  const signature = await hmacSha256(secret, unsigned);

  return NextResponse.json({ token: `${unsigned}.${signature}` });
}
