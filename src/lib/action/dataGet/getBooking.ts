import { Booking } from "@/types";
import { apiRequest } from "@/lib/api";

const getBooking = async (query = ""): Promise<Booking[]> => {
  const cleanQuery = query.replace(/^\?/, "").trim();
  const path = cleanQuery ? `/booking?${cleanQuery}` : "/booking";
  return apiRequest<Booking[]>(path);
};

export default getBooking;
