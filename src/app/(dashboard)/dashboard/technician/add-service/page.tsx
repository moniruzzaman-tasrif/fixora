"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { uploadImage } from "@/lib/upload";
import { useCurrentUser } from "@/lib/session";
import { ServiceCategory, ServiceMode } from "@/types";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import servicePost from "@/lib/action/api/servicePost";

export default function AddServicePage() {
  const router = useRouter();

  // Read-only technician info taken from the BetterAuth session.
  const { user } = useCurrentUser();
  const technicianName = user?.name ?? "—";
  const technicianEmail = user?.email ?? "—";

  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<ServiceCategory>("Smartphone");
  const [description, setDescription] = React.useState("");
  const [basePrice, setBasePrice] = React.useState<string>("");
  const [estimatedDuration, setEstimatedDuration] = React.useState("");
  const [serviceMode, setServiceMode] = React.useState<ServiceMode>("Home Visit");
  const [serviceArea, setServiceArea] = React.useState("");
  const [isAvailable, setIsAvailable] = React.useState(true);
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!title.trim()) errs.title = "Service title is required";
    if (!description.trim() || description.length < 20) {
      errs.description = "Description must be at least 20 characters";
    }
    const priceNum = parseFloat(basePrice);
    if (!basePrice || isNaN(priceNum) || priceNum <= 0) {
      errs.basePrice = "Please enter a valid positive base price in USD";
    }
    if (!estimatedDuration.trim()) {
      errs.estimatedDuration = "Estimated duration is required (e.g. '2-3 hours')";
    }
    if (!serviceArea.trim()) {
      errs.serviceArea = "Covered service area is required (e.g. 'Mirpur, Dhaka')";
    }
    if (!imageFile) {
      errs.image = "Please select a service banner image";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validate()) {
      toast.error("Please fill in all required fields accurately.");
      return;
    }

    // `validate()` guarantees an image, but this also narrows the type.
    if (!imageFile) return;

    if (!user) {
      toast.error("Please sign in again before publishing a service.");
      return;
    }

    setIsSubmitting(true);

    try {
      // The services collection stores the ImgBB URL, so upload the banner first.
      const imageUrl = await uploadImage(imageFile);

      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        image: imageUrl,
        basePrice: Number(basePrice),
        estimatedDuration: estimatedDuration.trim(),
        serviceMode,
        serviceArea: serviceArea.trim(),
        technicianName: user.name,
        technicianEmail: user.email,
        isAvailable,
      };

      const savedService = await servicePost(payload);

      toast.success(
        `"${savedService.title}" submitted successfully! It is now pending admin approval before appearing publicly.`
      );

      router.push("/dashboard/technician/my-services");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to add service. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        heading="Add a New Repair Service"
        description="Create a listing for your repair expertise. Newly added services remain pending until verified by an admin."
      />

      <Card className="border border-slate-200/90 shadow-xs">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Technician Info (Read-Only) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <Label className="text-xs text-slate-500">
                  Technician Provider
                </Label>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {technicianName}
                </p>
              </div>
              <div>
                <Label className="text-xs text-slate-500">
                  Registered Account Email
                </Label>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {technicianEmail}
                </p>
              </div>
              <p className="sm:col-span-2 text-[11px] text-slate-500">
                Copied automatically from your technician account and stored on
                the service as the owner.
              </p>
            </div>

            {/* Service Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">
                Service Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. iPhone & Android Screen Replacement"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                }}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-xs text-red-600 font-medium">{errors.title}</p>
              )}
            </div>

            {/* Category and Service Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">
                  Appliance Category <span className="text-red-500">*</span>
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                  disabled={isSubmitting}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                >
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mode">
                  Service Delivery Mode <span className="text-red-500">*</span>
                </Label>
                <select
                  id="mode"
                  value={serviceMode}
                  onChange={(e) => setServiceMode(e.target.value as ServiceMode)}
                  disabled={isSubmitting}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                >
                  <option value="Home Visit">Home Visit (Doorstep repair)</option>
                  <option value="Shop Drop-off">Shop Drop-off (Client brings device)</option>
                </select>
              </div>
            </div>

            {/* Base Price and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="basePrice">
                  Starting Base Price (USD) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="e.g. 45"
                  value={basePrice}
                  onChange={(e) => {
                    setBasePrice(e.target.value);
                    if (errors.basePrice)
                      setErrors((prev) => ({ ...prev, basePrice: "" }));
                  }}
                  disabled={isSubmitting}
                />
                {errors.basePrice && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.basePrice}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="estimatedDuration">
                  Estimated Duration <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="estimatedDuration"
                  placeholder="e.g. 1-2 hours or 1 day"
                  value={estimatedDuration}
                  onChange={(e) => {
                    setEstimatedDuration(e.target.value);
                    if (errors.estimatedDuration)
                      setErrors((prev) => ({ ...prev, estimatedDuration: "" }));
                  }}
                  disabled={isSubmitting}
                />
                {errors.estimatedDuration && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.estimatedDuration}
                  </p>
                )}
              </div>
            </div>

            {/* Service Area */}
            <div className="space-y-1.5">
              <Label htmlFor="serviceArea">
                Covered Service Area <span className="text-red-500">*</span>
              </Label>
              <Input
                id="serviceArea"
                placeholder="e.g. Mirpur, Dhanmondi, Gulshan, Dhaka"
                value={serviceArea}
                onChange={(e) => {
                  setServiceArea(e.target.value);
                  if (errors.serviceArea)
                    setErrors((prev) => ({ ...prev, serviceArea: "" }));
                }}
                disabled={isSubmitting}
              />
              {errors.serviceArea && (
                <p className="text-xs text-red-600 font-medium">
                  {errors.serviceArea}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">
                Detailed Service Description <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="description"
                rows={4}
                placeholder="Describe what is included in the repair (parts, diagnostic process, warranty periods, etc.)"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description)
                    setErrors((prev) => ({ ...prev, description: "" }));
                }}
                disabled={isSubmitting}
                className="w-full p-3 rounded-lg border border-slate-300 text-sm text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
              {errors.description && (
                <p className="text-xs text-red-600 font-medium">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Service Banner Image */}
            <div className="space-y-2">
              <Label htmlFor="image">
                Service Banner Image <span className="text-red-500">*</span>
              </Label>
              <ImageUploadField
                id="image"
                shape="banner"
                value={imageFile}
                onChange={(file) => {
                  setImageFile(file);
                  if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
                }}
                onError={(message) =>
                  setErrors((prev) => ({ ...prev, image: message ?? "" }))
                }
                error={errors.image}
                disabled={isSubmitting}
                hint="Required. JPG, PNG or WebP up to 2 MB. Stored on ImgBB."
              />
            </div>

            {/* Availability */}
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
              <input
                id="isAvailable"
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                disabled={isSubmitting}
                className="mt-0.5 size-4 accent-teal-700"
              />
              <div className="space-y-0.5">
                <Label htmlFor="isAvailable">Accept booking requests</Label>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Turn this off to keep the listing hidden from customers
                  without deleting it. You can change it later from My Services.
                </p>
              </div>
            </div>

            {/* Moderation Notice */}
            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-100 flex items-start gap-2.5 text-xs text-teal-900">
              <CheckCircle2 className="size-4 text-teal-700 shrink-0 mt-0.5" />
              <p>
                Fixora quality review: Services are initially saved with{" "}
                <span className="font-bold">Pending status</span>. Once approved by
                moderators, it will be visible in the public catalog.
              </p>
            </div>

            {/* Submit CTA */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold h-11 text-base shadow-sm gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving Service...
                </>
              ) : (
                <>
                  Publish Service for Admin Approval
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
