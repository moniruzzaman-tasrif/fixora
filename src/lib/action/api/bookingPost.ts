import { apiRequest } from "@/lib/api";

const bookingPost = async (data: Record<string, unknown>) => {
  return apiRequest("/booking", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export default bookingPost;
