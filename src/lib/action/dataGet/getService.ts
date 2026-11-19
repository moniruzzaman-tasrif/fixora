import { Service } from "@/types";
import { getApiUrl } from "@/lib/api";

/**
 * Reads services from the Express API.
 * `query` is a raw search string (without the leading `?`), e.g.
 * `category=AC&sort=price-low`.
 */
const getService = async (query = ""): Promise<Service[]> => {
  const cleanQuery = query.replace(/^\?/, "").trim();
  const url = cleanQuery
    ? `${getApiUrl()}/services?${cleanQuery}`
    : `${getApiUrl()}/services`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch services (HTTP ${res.status})`);
  }

  return res.json();
};

export default getService;
