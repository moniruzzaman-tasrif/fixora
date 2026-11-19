import { Service } from "@/types";
import { getApiUrl } from "@/lib/api";

export async function OneGetData(id: string): Promise<Service | null> {
  const res = await fetch(`${getApiUrl()}/services/${id}`, {
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
