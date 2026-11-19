import { NavItem, UserRole } from "@/types";

export const APP_NAME = "Fixora";
export const APP_TAGLINE = "Your Home, Our Responsibility.";
export const APP_DESCRIPTION =
  "Browse repair service listings for smartphones, laptops, ACs, refrigerators, TVs, washing machines, and electrical appliances.";

export const PUBLIC_NAV_ITEMS: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Services", href: "/services" },
  { title: "How It Works", href: "/about" },
];

export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  customer: "/dashboard/customer",
  technician: "/dashboard/technician",
  admin: "/dashboard/admin",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Customer",
  technician: "Technician",
  admin: "Administrator",
};

export const ROLE_BADGE_VARIANTS: Record<
  UserRole,
  { label: string; className: string }
> = {
  customer: {
    label: "Customer",
    className: "bg-teal-50 text-teal-700 border-teal-200",
  },
  technician: {
    label: "Technician",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  admin: {
    label: "Admin",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

export const STATUS_COLORS = {
  requested: {
    label: "Requested",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  accepted: {
    label: "Accepted",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  unpaid: {
    label: "Unpaid",
    className: "bg-amber-50 text-amber-700 border-amber-300",
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
} as const;

export const SERVICE_CATEGORIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
] as const;

export const SERVICE_AREAS = [
  "Dhanmondi",
  "Mirpur",
  "Uttara",
  "Banani",
  "Gulshan",
  "Mohammadpur",
  "Other",
] as const;
