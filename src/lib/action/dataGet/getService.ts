import { Service } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getService = async (): Promise<Service[]> => {
  const res = await fetch(`${API_URL}/services`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch services (HTTP ${res.status})`);
  }

  return res.json();
};

export default getService;
