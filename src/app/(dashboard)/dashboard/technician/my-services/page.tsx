"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Service, ServiceCategory, ServiceMode } from "@/types";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { uploadImage } from "@/lib/upload";
import {
  getMyServices,
  updateService,
  deleteService,
  setServiceAvailability,
} from "@/lib/action/api/technicianApi";
import {
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Wrench,
  X,
  AlertCircle,
} from "lucide-react";

export default function MyServicesPage() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loadState, setLoadState] = React.useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [loadError, setLoadError] = React.useState("");
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadState("loading");
      try {
        const data = await getMyServices();
        if (cancelled) return;
        setServices(Array.isArray(data) ? data : []);
        setLoadState("ready");
      } catch (err: unknown) {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError
            ? err.message
            : "We could not load your services. Please try again."
        );
        setLoadState("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const [editingService, setEditingService] = React.useState<Service | null>(null);
  const [deleteModalService, setDeleteModalService] = React.useState<Service | null>(
    null
  );
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [busyServiceId, setBusyServiceId] = React.useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = React.useState("");
  const [editCategory, setEditCategory] =
    React.useState<ServiceCategory>("Smartphone");
  const [editPrice, setEditPrice] = React.useState("");
  const [editDuration, setEditDuration] = React.useState("");
  const [editMode, setEditMode] = React.useState<ServiceMode>("Home Visit");
  const [editArea, setEditArea] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editImageFile, setEditImageFile] = React.useState<File | null>(null);
  const [editImageError, setEditImageError] = React.useState<string | undefined>();

  const startEdit = (service: Service) => {
    setEditingService(service);
    setEditTitle(service.title);
    setEditCategory(service.category);
    setEditPrice(service.basePrice.toString());
    setEditDuration(service.estimatedDuration);
    setEditMode(service.serviceMode);
    setEditArea(service.serviceArea);
    setEditDescription(service.description);
    setEditImageFile(null);
    setEditImageError(undefined);
  };

  const closeEdit = () => setEditingService(null);

  /** Saves the edit. The server whitelists fields and resets approval. */
  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingService) return;

    const parsedPrice = Number(editPrice);
    if (!editTitle.trim() || editTitle.trim().length < 3) {
      toast.error("Please enter a service title of at least 3 characters.");
      return;
    }
    if (!editDescription.trim()) {
      toast.error("Description cannot be empty.");
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Base price must be a positive number.");
      return;
    }
    if (!editDuration.trim() || !editArea.trim()) {
      toast.error("Duration and service area are required.");
      return;
    }

    setIsProcessing(true);

    try {
      const imageUrl = editImageFile
        ? await uploadImage(editImageFile)
        : editingService.image;

      const { service: updated } = await updateService(editingService._id, {
        title: editTitle.trim(),
        category: editCategory,
        description: editDescription.trim(),
        image: imageUrl,
        basePrice: parsedPrice,
        estimatedDuration: editDuration.trim(),
        serviceMode: editMode,
        serviceArea: editArea.trim(),
      });

      setServices((prev) =>
        prev.map((service) =>
          service._id === updated._id ? { ...service, ...updated } : service
        )
      );

      toast.success(
        "Service updated. It has been re-submitted for admin approval."
      );
      closeEdit();
    } catch (err: unknown) {
      toast.error(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Failed to update the service."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleAvailability = async (service: Service) => {
    const nextState = !service.isAvailable;
    setBusyServiceId(service._id);

    try {
      const { service: updated } = await setServiceAvailability(
        service._id,
        nextState
      );
      setServices((prev) =>
        prev.map((row) =>
          row._id === service._id ? { ...row, ...updated } : row
        )
      );
      toast.success(
        nextState
          ? "Service is now available in the public catalog."
          : "Service is now hidden from the public catalog."
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Failed to update availability."
      );
    } finally {
      setBusyServiceId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalService) return;
    setIsProcessing(true);

    try {
      await deleteService(deleteModalService._id);
      setServices((prev) =>
        prev.filter((service) => service._id !== deleteModalService._id)
      );
      toast.success(`"${deleteModalService.title}" was deleted successfully.`);
      setDeleteModalService(null);
    } catch (err: unknown) {
      toast.error(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Failed to delete the service."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        heading="My Repair Services"
        description="Manage, edit, or toggle availability of your listed repair services. Every edit resets the listing to pending approval."
      >
        <Link href="/dashboard/technician/add-service">
          <Button className="bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2 shadow-xs">
            <PlusCircle className="size-4" />
            Add Service
          </Button>
        </Link>
      </PageHeader>

      {loadState === "loading" ? (
        <Card
          className="border border-slate-200/90 shadow-xs overflow-hidden"
          role="status"
          aria-busy="true"
        >
          <span className="sr-only">Loading your repair services…</span>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 px-5 py-4 animate-pulse"
              >
                <div className="size-12 shrink-0 rounded-lg bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-slate-200" />
                  <div className="h-3 w-1/5 rounded bg-slate-100" />
                </div>
                <div className="h-5 w-16 rounded-full bg-slate-100" />
                <div className="h-6 w-24 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        </Card>
      ) : loadState === "error" ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load your services"
          description={loadError}
          actionLabel="Try Again"
          onAction={reload}
        />
      ) : services.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No services added yet"
          description="You haven't published any repair services yet. Start offering your repairs to homeowners across Dhaka."
          actionLabel="Add Your First Service"
          actionHref="/dashboard/technician/add-service"
        />
      ) : (
        <Card className="border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Service Listing</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Starting Price</th>
                  <th className="px-5 py-3.5">Approval Status</th>
                  <th className="px-5 py-3.5">Public Availability</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {services.map((service) => (
                  <tr
                    key={service._id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {service.image ? (
                            <Image
                              src={service.image}
                              alt={service.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center bg-teal-50 text-teal-700">
                              <Wrench className="size-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">
                            {service.title}
                          </p>
                          <span className="text-xs text-slate-400">
                            {service.estimatedDuration} • {service.serviceMode}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-xs text-teal-800">
                      {service.category}
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-900 text-sm">
                      {formatCurrency(service.basePrice)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={service.approvalStatus} />
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(service)}
                        disabled={busyServiceId === service._id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors disabled:opacity-60 ${
                          service.isAvailable
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                        }`}
                        title="Click to toggle availability"
                      >
                        {service.isAvailable ? (
                          <>
                            <CheckCircle className="size-3.5" />
                            <span>Available</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="size-3.5" />
                            <span>Unavailable</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => startEdit(service)}
                          className="size-8 text-slate-600 hover:text-teal-700 hover:bg-teal-50"
                          title="Edit Service"
                          aria-label={`Edit ${service.title}`}
                        >
                          <Edit2 className="size-4" />
                        </Button>

                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => setDeleteModalService(service)}
                          className="size-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Service"
                          aria-label={`Delete ${service.title}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/50">
          <div className="my-8 w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Edit Repair Service
              </h3>
              <button
                type="button"
                onClick={closeEdit}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close edit dialog"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="editTitle">Title</Label>
                <Input
                  id="editTitle"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="editCat">Category</Label>
                  <select
                    id="editCat"
                    value={editCategory}
                    onChange={(e) =>
                      setEditCategory(e.target.value as ServiceCategory)
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="editPrice">Base Price (USD)</Label>
                  <Input
                    id="editPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="editDuration">Duration</Label>
                  <Input
                    id="editDuration"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="editMode">Service Mode</Label>
                  <select
                    id="editMode"
                    value={editMode}
                    onChange={(e) => setEditMode(e.target.value as ServiceMode)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  >
                    <option value="Home Visit">Home Visit</option>
                    <option value="Shop Drop-off">Shop Drop-off</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="editArea">Service Area</Label>
                <Input
                  id="editArea"
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="editDescription">Description</Label>
                <textarea
                  id="editDescription"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Service image</Label>
                <p className="text-xs text-slate-500">
                  Leave empty to keep the current image.
                </p>
                <ImageUploadField
                  id="editImage"
                  shape="banner"
                  value={editImageFile}
                  onChange={setEditImageFile}
                  onError={setEditImageError}
                  error={editImageError}
                  disabled={isProcessing}
                  hint="Optional replacement. JPG, PNG or WebP up to 2 MB."
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-xs">
                Saving changes resets the approval status to{" "}
                <strong>Pending</strong> for admin review.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={closeEdit}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                >
                  {isProcessing ? "Updating..." : "Save & Re-submit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteModalService}
        onClose={() => setDeleteModalService(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Repair Service?"
        description={`Are you sure you want to permanently delete "${deleteModalService?.title}"? Existing historical bookings will not be altered.`}
        confirmLabel="Yes, Delete Service"
        cancelLabel="Keep Listing"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}
