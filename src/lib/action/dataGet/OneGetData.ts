import { Service } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function OneGetData(id: string): Promise<Service | null> {
  const res = await fetch(`${API_URL}/services/${id}`, {
    cache: "no-store",
  });

  if (res.status === 400 || res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch service details (HTTP ${res.status})`);
  }

  return res.json();
}

export default OneGetData;
