import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create Account — Fixora",
  description:
    "Join Fixora as a customer to book certified repairs or as a technician to manage repair jobs.",
};

export default function SignUpPage() {
  return (
    <Card className="border border-slate-200/90 shadow-md">
      <CardHeader className="text-center space-y-1.5 pb-4">
        <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Create Your Fixora Account
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Join thousands of satisfied homeowners and verified technicians
        </CardDescription>
      </CardHeader>

      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  );
}
