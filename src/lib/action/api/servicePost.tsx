import { Service, ServiceCategory, ServiceMode } from "@/types";
import { apiRequest } from "@/lib/api";

export type NewServicePayload = {
  title: string;
  category: ServiceCategory;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
};

export async function servicePost(
  payload: NewServicePayload
): Promise<Service> {
  const response = await apiRequest<{ service: Service }>("/services", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.service) {
    throw new Error("The server did not return the saved service");
  }
  return response.service;
}

export default servicePost;
