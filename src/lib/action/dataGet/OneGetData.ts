import { Service } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function OneGetData(id: string): Promise<Service | null> {
  try {
    const res = await fetch(`${API_URL}/services/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`OneGetData failed for id ${id}:`, error);
    return null;
  }
}

export default OneGetData;
