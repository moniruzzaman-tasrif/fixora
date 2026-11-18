import { Service } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getService = async (query = ""): Promise<Service[]> => {
  const cleanQuery = query.replace(/^\?/, "").trim();
  const url = cleanQuery ? `${API_URL}/services?${cleanQuery}` : `${API_URL}/services`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch services (HTTP ${res.status})`);
  }

  return res.json();
};

export default getService;
