"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_USERS } from "@/data/demo-session";
import { User, UserRole } from "@/types";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  FileText,
  Camera,
  ShieldCheck,
  Check,
  Save,
  Lock,
  Calendar,
  Wrench,
} from "lucide-react";

export default function ProfilePage() {
  // TODO(owner): replace with BetterAuth session user:
  // const { data: session } = authClient.useSession();
  const [profile, setProfile] = React.useState<User>({
    ...DEMO_USERS.technician,
    phone: "+880 1819-876543",
    area: "Mirpur & Gulshan, Dhaka",
    bio: "Certified electronics technician with 7+ years of experience in smartphone, laptop, and AC servicing.",
  });

  const [name, setName] = React.useState(profile.name);
  const [phone, setPhone] = React.useState(profile.phone || "");
  const [area, setArea] = React.useState(profile.area || "");
  const [bio, setBio] = React.useState(profile.bio || "");
  const [imagePreview, setImagePreview] = React.useState(profile.image || "");
  const [isSaving, setIsSaving] = React.useState(false);

  // File upload simulation (or ImgBB)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      toast.success("Profile photo updated preview");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Full Name cannot be empty");
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      // TODO(owner): replace with API call: PATCH /api/users/profile { name, phone, area, bio, image }
      setProfile((prev) => ({
        ...prev,
        name,
        phone,
        area,
        bio,
        image: imagePreview,
      }));
      setIsSaving(false);
      toast.success("Profile updated successfully!");
    }, 600);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-100 font-semibold gap-1 text-xs">
            <ShieldCheck className="size-3" />
            Administrator
          </Badge>
        );
      case "technician":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 font-semibold gap-1 text-xs">
            <Wrench className="size-3" />
            Technician
          </Badge>
        );
      case "customer":
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 font-semibold gap-1 text-xs">
            <UserIcon className="size-3" />
            Customer
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <PageHeader
        heading="My Profile"
        description="Manage your account profile, contact information, and public technician/customer bio."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Account Summary */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-xs bg-white text-center p-6">
            <div className="flex flex-col items-center">
              {/* Avatar with Camera Icon */}
              <div className="relative group size-28 rounded-full overflow-hidden border-2 border-teal-600 bg-slate-100 mb-4 shadow-sm">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt={name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center font-bold text-teal-800 text-3xl">
                    {name.charAt(0)}
                  </div>
                )}
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="size-5 mb-1" />
                  <span className="text-[10px] font-semibold">Change Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />
                </label>
              </div>

              <h2 className="font-bold text-lg text-slate-900">{name}</h2>
              <p className="text-xs text-slate-500 mb-2">{profile.email}</p>
              <div>{getRoleBadge(profile.role)}</div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 text-left space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-slate-400" /> Member Since
                </span>
                <span className="font-semibold text-slate-800">August 2026</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-600" /> Account Status
                </span>
                <span className="font-semibold text-emerald-700">Active & Verified</span>
              </div>
            </div>
          </Card>

          {/* Security Note Card */}
          <Card className="border-slate-200 shadow-xs bg-slate-50/70 p-4">
            <div className="flex items-start gap-3 text-xs">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                <Lock className="size-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">Security & Authentication</p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Your credentials are encrypted using industry standard protocols. Email addresses are linked to your sign-in identity and cannot be altered without email verification.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-xs bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-semibold text-slate-900">
                Personal Information
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your public profile details and how clients or technicians can contact you.
              </p>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSave} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahim Ahmed"
                      className="pl-9 h-10 text-sm bg-white border-slate-200 focus-visible:ring-teal-600"
                      required
                    />
                  </div>
                </div>

                {/* Email (Read Only) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                      Email Address (Sign-in Identity)
                    </Label>
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Lock className="size-3" /> Read Only
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="pl-9 h-10 text-sm bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    To change your primary email address, please contact platform support.
                  </p>
                </div>

                {/* Phone & Area Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+880 1700-000000"
                        className="pl-9 h-10 text-sm bg-white border-slate-200 focus-visible:ring-teal-600"
                      />
                    </div>
                  </div>

                  {/* Service Area / City */}
                  <div className="space-y-1.5">
                    <Label htmlFor="area" className="text-xs font-semibold text-slate-700">
                      Service Area / City
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        id="area"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. Mirpur & Dhanmondi, Dhaka"
                        className="pl-9 h-10 text-sm bg-white border-slate-200 focus-visible:ring-teal-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio / About */}
                <div className="space-y-1.5">
                  <Label htmlFor="bio" className="text-xs font-semibold text-slate-700">
                    Bio & Professional Summary
                  </Label>
                  <textarea
                    id="bio"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe your experience, specialties, or service preferences..."
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
                  />
                  <p className="text-[11px] text-slate-400">
                    Visible on your public technician profile or service booking tickets.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex items-center justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs h-10 px-6 gap-2 shadow-xs"
                  >
                    {isSaving ? (
                      "Saving Changes..."
                    ) : (
                      <>
                        <Save className="size-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
