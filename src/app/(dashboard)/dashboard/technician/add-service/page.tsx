"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { ServiceCategory, ServiceMode } from "@/types";
import { Upload, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AddServicePage() {
  const router = useRouter();

  // Read-only technician info from session
  // TODO(owner): replace with authClient.useSession()
  const technicianName = "Tanvir Hasan";
  const technicianEmail = "tanvir.tech@fixora.com";

  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<ServiceCategory>("Smartphone");
  const [description, setDescription] = React.useState("");
  const [basePrice, setBasePrice] = React.useState<string>("");
  const [estimatedDuration, setEstimatedDuration] = React.useState("");
  const [serviceMode, setServiceMode] = React.useState<ServiceMode>("Home Visit");
  const [serviceArea, setServiceArea] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

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
    if (!selectedFile && !previewUrl) {
      errs.image = "Please select a service banner image to upload via ImgBB";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fill in all required fields accurately.");
      return;
    }

    setIsSubmitting(true);

    try {
      // -----------------------------------------------------------------------
      // TODO(owner):
      // 1. Upload selectedFile to ImgBB API:
      // const formData = new FormData();
      // formData.append("image", selectedFile);
      // const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, ...);
      // const imageUrl = uploadRes.data.url;
      //
      // 2. Save service via POST /api/services:
      // await fetch("/api/services", {
      //   method: "POST",
      //   body: JSON.stringify({ ...data, image: imageUrl, approvalStatus: "pending", isAvailable: true }),
      // });
      // -----------------------------------------------------------------------

      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.success(
        "Service submitted successfully! It is now pending admin approval before appearing publicly."
      );

      router.push("/dashboard/technician/my-services");
    } catch {
      toast.error("Failed to add service. Please try again.");
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

            {/* Service Image Upload (ImgBB File Input) */}
            <div className="space-y-2">
              <Label htmlFor="image">
                Service Banner Image (ImgBB Upload) <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />

                {previewUrl && (
                  <div className="relative size-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <img
                      src={previewUrl}
                      alt="Service preview"
                      className="size-full object-cover"
                    />
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="text-xs text-red-600 font-medium">{errors.image}</p>
              )}
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
