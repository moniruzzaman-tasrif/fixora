"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/password-field";
import { RoleSelector, SelectableRole } from "@/components/auth/role-selector";
import { ROLE_DASHBOARD_ROUTES } from "@/lib/constants";
import { Loader2, ArrowRight } from "lucide-react";
import { signUp } from "@/lib/auth-client";

export function SignUpForm() {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<SelectableRole>("customer");

  const [errors, setErrors] = React.useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const [isPasswordValid, setIsPasswordValid] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!isPasswordValid) {
      newErrors.password =
        "Password must be at least 6 characters and include both uppercase and lowercase letters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please resolve the validation errors before submitting.");
      return;
    }

    setIsLoading(true);

    try {



      // -----------------------------------------------------------------------
      // TODO(owner): Replace with BetterAuth signup integration:
      const res = await signUp.email({
        name,
        email,
        password,
        role, // 'customer' or 'technician'
      });
      // -----------------------------------------------------------------------

      // Simulated network request for UI development and testing
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.success(
        `Account created! Welcome to Fixora as a ${
          role === "technician" ? "Technician" : "Customer"
        }.`
      );

      // Redirect user to their respective dashboard
      const targetDashboard = ROLE_DASHBOARD_ROUTES[role];
      router.push(targetDashboard);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to register. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Role Selection */}
      <RoleSelector value={role} onChange={setRole} disabled={isLoading} />

      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Full Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g. Tanvir Hasan"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          disabled={isLoading}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-red-600 font-medium">{errors.name}</p>
        )}
      </div>

      {/* Email Address */}
      <div className="space-y-1.5">
        <Label htmlFor="email">
          Email Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="e.g. name@example.com"
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

      {/* Password with Realtime Validation Checklist */}
      <div className="space-y-1.5">
        <Label htmlFor="password">
          Password <span className="text-red-500">*</span>
        </Label>
        <PasswordField
          id="password"
          placeholder="Enter a secure password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password)
              setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          showValidationRules
          onValidationChange={setIsPasswordValid}
          disabled={isLoading}
          error={errors.password}
        />
      </div>

      {/* Terms Notice */}
      <p className="text-xs text-slate-500 leading-relaxed">
        By registering, you agree to Fixora&apos;s Terms of Service and Privacy Policy.
        Payment is processed securely via Stripe only after service completion.
      </p>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold h-11 text-base shadow-sm gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          <>
            Create Fixora Account
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>

      {/* Link to Sign In */}
      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </form>
  );
}
