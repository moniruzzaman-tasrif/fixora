// ⚠️ DUMMY DATA for UI development only. Replace with API / BetterAuth session data.
import { User } from "@/types";

export const DEMO_USERS: Record<"customer" | "technician" | "admin", User> = {
  customer: {
    _id: "6731a5b8e91d84b2c1a01101",
    name: "Rahim Ahmed",
    email: "rahim.customer@fixora.com",
    role: "customer",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    phone: "+880 1712-345678",
    area: "Dhanmondi, Dhaka",
    bio: "Homeowner looking for reliable repair services for smart appliances.",
  },
  technician: {
    _id: "6731a5b8e91d84b2c1a01102",
    name: "Tanvir Hasan",
    email: "tanvir.tech@fixora.com",
    role: "technician",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    phone: "+880 1819-876543",
    area: "Mirpur & Gulshan, Dhaka",
    bio: "Certified electronics technician with 7+ years of experience in smartphone, laptop, and AC repairs.",
  },
  admin: {
    _id: "6731a5b8e91d84b2c1a01103",
    name: "Admin Moderator",
    email: "admin@fixora.com",
    role: "admin",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    phone: "+880 1911-000111",
    area: "Dhaka Central HQ",
    bio: "Fixora Platform Operations & Quality Assurance Lead.",
  },
};
