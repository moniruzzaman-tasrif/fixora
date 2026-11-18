const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const bookingPost = async (data: Record<string, unknown>) => {
  const res = await fetch(`${API_URL}/booking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

export default bookingPost;
