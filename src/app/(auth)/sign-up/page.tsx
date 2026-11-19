import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { AuthRedirect } from "@/components/auth/auth-redirect";

export const metadata: Metadata = {
  title: "Create Account — Fixora",
  description:
    "Create a Fixora account to request repairs or manage technician services.",
};

export default function SignUpPage() {
  return (
    <AuthRedirect>
      <Card className="border border-slate-200/90 shadow-md">
        <CardHeader className="text-center space-y-1.5 pb-4">
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Create Your Fixora Account
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Create an account to request repairs or offer technician services
          </CardDescription>
        </CardHeader>

        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </AuthRedirect>
  );
}
