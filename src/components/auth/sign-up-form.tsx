"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

import { FormField } from "@/components/auth/form-field";
import { PasswordField } from "@/components/auth/password-field";
import {
  RoleSelector,
  type SelectableRole,
} from "@/components/auth/role-selector";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth-client";
import { ROLE_DASHBOARD_ROUTES, SERVICE_AREAS } from "@/lib/constants";
import { uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";

const BIO_MAX_LENGTH = 300;
const PHONE_PATTERN = /^(?:\+?880|0)1[3-9]\d{8}$/;

const controlClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus-visible:border-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/20 disabled:cursor-not-allowed disabled:opacity-50";

const invalidClass =
  "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200";

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  area?: string;
  password?: string;
  image?: string;
};

function normalizePhone(value: string) {
  return value.replace(/[\s-]/g, "");
}

function getInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function SignUpForm() {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [area, setArea] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [role, setRole] = React.useState<SelectableRole>("customer");
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [isPasswordValid, setIsPasswordValid] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const clearError = (field: keyof FieldErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleRoleChange = (nextRole: SelectableRole) => {
    setRole(nextRole);
    if (nextRole === "customer") setBio("");
  };

  const validate = () => {
    const newErrors: FieldErrors = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!PHONE_PATTERN.test(normalizePhone(phone))) {
      newErrors.phone = "Use a valid Bangladeshi number, e.g. 01712345678";
    }

    if (!area) {
      newErrors.area = "Please select your area";
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isLoading) return;

    if (!validate()) {
      toast.error("Please resolve the validation errors before submitting.");
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (uploadError: unknown) {
          toast.warning(
            uploadError instanceof Error
              ? `Photo upload failed: ${uploadError.message}. Your account will be created without one.`
              : "We could not upload your photo, so your account will be created without one."
          );
        }
      }

      const { data, error } = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        phone: normalizePhone(phone),
        area,
        ...(imageUrl ? { image: imageUrl } : {}),
        ...(role === "technician" && bio.trim() ? { bio: bio.trim() } : {}),
      });

      if (error) {
        toast.error(
          error.message || "We could not create your account. Please try again."
        );
        return;
      }

      if (!data?.user) {
        toast.error("We could not create your account. Please try again.");
        return;
      }

      // `role` comes back as a plain string, so narrow it before indexing the
      // dashboard route map. Public sign-up only creates customer/technician.
      const createdRole: SelectableRole =
        data.user.role === "technician" ? "technician" : "customer";

      toast.success(
        `Account created! Welcome to Fixora as a ${createdRole}.`
      );
      router.push(ROLE_DASHBOARD_ROUTES[createdRole]);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "We could not create your account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <RoleSelector
        value={role}
        onChange={handleRoleChange}
        disabled={isLoading}
      />

      <FormField id="photo" label="Profile photo">
        <ImageUploadField
          id="photo"
          value={imageFile}
          onChange={setImageFile}
          onError={(message) =>
            setErrors((prev) => ({ ...prev, image: message }))
          }
          error={errors.image}
          disabled={isLoading}
          fallbackText={getInitials(name)}
        />
      </FormField>

      <FormField id="name" label="Full Name" required error={errors.name}>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) clearError("name");
          }}
          disabled={isLoading}
          aria-invalid={!!errors.name}
          className={cn(errors.name && invalidClass)}
        />
      </FormField>

      <FormField id="email" label="Email Address" required error={errors.email}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="e.g. name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) clearError("email");
          }}
          disabled={isLoading}
          aria-invalid={!!errors.email}
          className={cn(errors.email && invalidClass)}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField
          id="phone"
          label="Phone Number"
          required
          error={errors.phone}
        >
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) clearError("phone");
            }}
            disabled={isLoading}
            aria-invalid={!!errors.phone}
            className={cn(errors.phone && invalidClass)}
          />
        </FormField>

        <FormField id="area" label="Area" required error={errors.area}>
          <select
            id="area"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              if (errors.area) clearError("area");
            }}
            disabled={isLoading}
            aria-invalid={!!errors.area}
            className={cn(
              controlClass,
              "h-10",
              !area && "text-slate-400",
              errors.area && invalidClass
            )}
          >
            <option value="" disabled>
              Select your area
            </option>
            {SERVICE_AREAS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField id="password" label="Password" required>
        <PasswordField
          id="password"
          autoComplete="new-password"
          placeholder="Enter a secure password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) clearError("password");
          }}
          showValidationRules
          onValidationChange={setIsPasswordValid}
          disabled={isLoading}
          error={errors.password}
        />
      </FormField>

      {role === "technician" && (
        <FormField
          id="bio"
          label="Skills & experience"
          hint={
            <p className="text-right text-[11px] text-slate-400">
              {bio.length}/{BIO_MAX_LENGTH}
            </p>
          }
        >
          <textarea
            id="bio"
            rows={3}
            maxLength={BIO_MAX_LENGTH}
            placeholder="e.g. 5 years of AC and refrigerator repair experience"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={isLoading}
            className={cn(controlClass, "min-h-20 resize-y")}
          />
        </FormField>
      )}

      <p className="text-xs text-slate-500 leading-relaxed">
        By registering, you agree to Fixora&apos;s Terms of Service and Privacy
        Policy.
      </p>

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
