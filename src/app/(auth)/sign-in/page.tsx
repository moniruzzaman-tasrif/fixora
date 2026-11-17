import { Suspense } from "react";
import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In — Fixora Repair Service",
  description: "Sign in to your Fixora account to manage repairs and bookings.",
};

export default function SignInPage() {
  return (
    <Card className="border border-slate-200/90 shadow-md">
      <CardHeader className="text-center space-y-1.5 pb-4">
        <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Welcome Back to Fixora
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Enter your credentials to access your repair dashboard
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="size-6 animate-spin text-teal-600" />
            </div>
          }
        >
          <SignInForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
