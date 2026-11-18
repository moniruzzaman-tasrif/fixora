"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Service, ServiceCategory, ServiceMode } from "@/types";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
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
import getService from "@/lib/action/dataGet/getService";
import { useCurrentUser } from "@/lib/session";

export default function MyServicesPage() {
  const { user, isPending } = useCurrentUser();

  const [services, setServices] = React.useState<Service[]>([]);
  const [loadState, setLoadState] = React.useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [reloadKey, setReloadKey] = React.useState(0);

  // Loads real services from the Express API (via getService()).
  // If the technician is logged in, only services matching their email are shown.
  // If not logged in yet (e.g. testing / demo), all services from the database are shown.
  React.useEffect(() => {
    if (isPending) return;

    let cancelled = false;

    async function loadData() {
      try {
        setLoadState("loading");
        const dataService: Service[] = await getService();
        if (cancelled) return;

        const allServices = Array.isArray(dataService) ? dataService : [];
        const email = user?.email?.toLowerCase();

        const filtered = email
          ? allServices.filter(
              (service) => service.technicianEmail?.toLowerCase() === email
            )
          : allServices;

        setServices(filtered);
        setLoadState("ready");
      } catch (err) {
        console.error("Failed to load services from API:", err);
        if (cancelled) return;
        setLoadState("error");
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user?.email, isPending, reloadKey]);

  const handleRetry = () => {
    setLoadState("loading");
    setReloadKey((key) => key + 1);
  };

  const isLoading = isPending || loadState === "loading";

  const [editingService, setEditingService] = React.useState<Service | null>(null);
  const [deleteModalService, setDeleteModalService] = React.useState<Service | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = React.useState("");
  const [editCategory, setEditCategory] = React.useState<ServiceCategory>("Smartphone");
  const [editPrice, setEditPrice] = React.useState("");
  const [editDuration, setEditDuration] = React.useState("");
  const [editMode, setEditMode] = React.useState<ServiceMode>("Home Visit");



  const startEdit = (service: Service) => {
    setEditingService(service);
    setEditTitle(service.title);
    setEditCategory(service.category);
    setEditPrice(service.basePrice.toString());
    setEditDuration(service.estimatedDuration);
    setEditMode(service.serviceMode);
  };

  // Handle Save Edit: Note that per Assignment PDF & AGENTS.md:
  // "After editing, set approvalStatus back to 'pending'"
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const parsedPrice = parseFloat(editPrice);
    if (!editTitle.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Please enter a valid title and positive price.");
      return;
    }

    setIsProcessing(true);

    try {
      // -----------------------------------------------------------------------
      // TODO(owner): call PATCH /api/services/:id
      // -----------------------------------------------------------------------
      await new Promise((resolve) => setTimeout(resolve, 600));

      setServices((prev) =>
        prev.map((s) =>
          s._id === editingService._id
            ? {
                ...s,
                title: editTitle,
                category: editCategory,
                basePrice: parsedPrice,
                estimatedDuration: editDuration,
                serviceMode: editMode,
                approvalStatus: "pending", // Resets to pending after modification!
              }
            : s
        )
      );

      toast.success(
        "Service updated! Per security policy, edited services reset to Pending status for admin re-verification."
      );
      setEditingService(null);
    } catch {
      toast.error("Failed to update service.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle Availability
  const handleToggleAvailability = async (service: Service) => {
    const updatedState = !service.isAvailable;

    try {
      // TODO(owner): call PATCH /api/services/:id/availability
      setServices((prev) =>
        prev.map((s) =>
          s._id === service._id ? { ...s, isAvailable: updatedState } : s
        )
      );

      toast.success(
        `Service is now ${updatedState ? "Available publicly" : "Hidden from public catalog"}.`
      );
    } catch {
      toast.error("Failed to toggle availability.");
    }
  };

  // Delete Service
  const handleConfirmDelete = async () => {
    if (!deleteModalService) return;
    setIsProcessing(true);

    try {
      // TODO(owner): call DELETE /api/services/:id
      await new Promise((resolve) => setTimeout(resolve, 600));

      setServices((prev) => prev.filter((s) => s._id !== deleteModalService._id));
      toast.success(`"${deleteModalService.title}" was deleted successfully.`);
      setDeleteModalService(null);
    } catch {
      toast.error("Failed to delete service.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        heading="My Repair Services"
        description="Manage, edit, or toggle availability of your listed repair services. Note that edits reset approval to pending."
      >
        <Link href="/dashboard/technician/add-service">
          <Button className="bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2 shadow-xs">
            <PlusCircle className="size-4" />
            Add Service
          </Button>
        </Link>
      </PageHeader>

      {isLoading ? (
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
          description="We could not reach the repair service server. Please check your connection and try again."
          actionLabel="Try Again"
          onAction={handleRetry}
        />
      ) : services.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No services added yet"
          description="You haven't published any repair services yet. Start offering your repairs to thousands of homeowners."
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
                    {/* Image & Title */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {service.image ? (
                            <Image
                              src={service.image}
                              alt={service.title}
                              fill
                              className="object-cover"
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

                    {/* Category */}
                    <td className="px-5 py-4 font-medium text-xs text-teal-800">
                      {service.category}
                    </td>

                    {/* Base Price */}
                    <td className="px-5 py-4 font-bold text-slate-900 text-sm">
                      {formatCurrency(service.basePrice)}
                    </td>

                    {/* Approval Status Badge */}
                    <td className="px-5 py-4">
                      <StatusBadge status={service.approvalStatus} />
                    </td>

                    {/* Availability Toggle */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(service)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
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

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => startEdit(service)}
                          className="size-8 text-slate-600 hover:text-teal-700 hover:bg-teal-50"
                          title="Edit Service"
                        >
                          <Edit2 className="size-4" />
                        </Button>

                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => setDeleteModalService(service)}
                          className="size-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Service"
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

      {/* Edit Service Modal Form */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Edit Repair Service
              </h3>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="text-slate-400 hover:text-slate-600"
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

              <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-xs">
                ⚠️ Notice: Per assignment rule, saving changes will automatically
                reset approval status to <strong>Pending</strong> for admin review.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingService(null)}
                >
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

      {/* Delete Service Confirmation Dialog */}
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
