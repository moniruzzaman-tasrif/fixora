import { Booking } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getBooking = async (query = ""): Promise<Booking[]> => {
  const cleanQuery = query.replace(/^\?/, "").trim();
  const url = cleanQuery
    ? `${API_URL}/booking?${cleanQuery}`
    : `${API_URL}/booking`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch bookings (HTTP ${res.status})`);
  }

  return res.json();
};

export default getBooking;
