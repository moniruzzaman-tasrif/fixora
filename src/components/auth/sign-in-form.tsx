"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/password-field";
import { ROLE_DASHBOARD_ROUTES } from "@/lib/constants";
import { isUserRole } from "@/lib/session";
import { Loader2, ArrowRight } from "lucide-react";
import { signIn } from "@/lib/auth-client";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fill in your email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(
          error.message || "Invalid email or password. Please try again."
        );
        return;
      }

      // The role is read back from the database through the BetterAuth session.
      // Fall back to the customer dashboard only if the field is unexpected.
      const role =
        data?.user && isUserRole(data.user.role) ? data.user.role : "customer";

      toast.success("Signed in successfully! Welcome back.");

      // Only allow internal paths so a crafted `callbackUrl` cannot redirect
      // the browser to another site.
      const destination =
        callbackUrl && callbackUrl.startsWith("/")
          ? callbackUrl
          : ROLE_DASHBOARD_ROUTES[role];

      router.replace(destination);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Invalid email or password. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g. yourname@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            disabled={isLoading}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-red-600 font-medium">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <PasswordField
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            disabled={isLoading}
            error={errors.password}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold h-11 text-base shadow-sm gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In to Fixora
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Social Login Option (Optional requirement in PDF) */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-400 font-medium">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-10 border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 font-medium"
        onClick={() => {
          toast.info("Google Sign-In ready for BetterAuth configuration.");
        }}
      >
        <svg className="size-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Sign in with Google
      </Button>

      {/* Sign Up Link */}
      <div className="text-center pt-3 border-t border-slate-100">
        <p className="text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
