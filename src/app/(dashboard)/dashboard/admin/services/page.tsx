"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AdminServiceImage } from "@/components/dashboard/admin-service-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Service, ApprovalStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { getAdminServices, setServiceApproval } from "@/lib/action/api/adminApi";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  Check,
  X,
  Clock,
  Wrench,
  AlertCircle,
  Eye,
} from "lucide-react";

export default function AdminServicesPage() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loadState, setLoadState] = React.useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [loadError, setLoadError] = React.useState("");
  const [reloadKey, setReloadKey] = React.useState(0);
  // Pending listings are the moderation queue, so they open first.
  const [statusFilter, setStatusFilter] = React.useState<string>("pending");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [busyServiceId, setBusyServiceId] = React.useState<string | null>(null);
  const [serviceDecision, setServiceDecision] = React.useState<{
    service: Service;
    approvalStatus: "approved" | "rejected";
  } | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadState("loading");
      setLoadError("");
      try {
        const data = await getAdminServices();
        if (cancelled) return;
        setServices(Array.isArray(data) ? data : []);
        setLoadState("ready");
      } catch (err: unknown) {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError
            ? err.message
            : "Could not load services. Please try again."
        );
        setLoadState("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Details preview modal
  const [selectedService, setSelectedService] = React.useState<Service | null>(null);

  // Filtered services (pending always sorted first in the "All" view)
  const filteredServices = React.useMemo(() => {
    const order: Record<ApprovalStatus, number> = {
      pending: 0,
      approved: 1,
      rejected: 2,
    };
    return services
      .filter((service) => {
        const matchesSearch =
          service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.technicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.technicianEmail.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || service.approvalStatus === statusFilter;

        const matchesCategory =
          categoryFilter === "all" || service.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort(
        (a, b) =>
          order[a.approvalStatus] - order[b.approvalStatus] ||
          String(b.createdAt).localeCompare(String(a.createdAt))
      );
  }, [services, searchQuery, statusFilter, categoryFilter]);

  // Approval update against the protected admin API
  const handleUpdateStatus = async () => {
    if (!serviceDecision) return;
    const { service, approvalStatus } = serviceDecision;
    setBusyServiceId(service._id);
    try {
      const { service: updated } = await setServiceApproval(
        service._id,
        approvalStatus
      );
      setServices((prev) =>
        prev.map((row) => (row._id === updated._id ? { ...row, ...updated } : row))
      );
      if (selectedService && selectedService._id === service._id) {
        setSelectedService((prev) => (prev ? { ...prev, ...updated } : null));
      }

      toast.success(
        approvalStatus === "approved"
          ? `Service "${service.title}" approved. It is now visible to customers.`
          : `Service "${service.title}" rejected.`
      );
      setServiceDecision(null);
    } catch (err: unknown) {
      toast.error(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Could not update the service."
      );
    } finally {
      setBusyServiceId(null);
    }
  };

  const pendingCount = services.filter((s) => s.approvalStatus === "pending").length;
  const approvedCount = services.filter((s) => s.approvalStatus === "approved").length;
  const rejectedCount = services.filter((s) => s.approvalStatus === "rejected").length;

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-semibold gap-1">
            <Check className="size-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100 font-semibold gap-1">
            <X className="size-3" />
            Rejected
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 font-semibold gap-1 animate-pulse">
            <Clock className="size-3" />
            Pending Review
          </Badge>
        );
    }
  };

  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        heading="Service Moderation"
        description="Review and moderate technician service offerings before they appear in the public catalog."
      >
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-amber-500 text-white font-bold px-3 py-1 text-xs">
              {pendingCount} Pending Approval
            </Badge>
          )}
        </div>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
            {[
              { id: "all", label: "All Services", count: services.length },
              { id: "pending", label: "Pending", count: pendingCount, highlight: pendingCount > 0 },
              { id: "approved", label: "Approved", count: approvedCount },
              { id: "rejected", label: "Rejected", count: rejectedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap",
                  statusFilter === tab.id
                    ? "bg-white text-teal-800 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px]",
                    tab.highlight
                      ? "bg-amber-500 text-white font-bold"
                      : statusFilter === tab.id
                      ? "bg-teal-100 text-teal-800"
                      : "bg-slate-200 text-slate-600"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search + Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search service, technician..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-white border-slate-200 focus-visible:ring-teal-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 font-medium focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <Card className="border-slate-200 shadow-xs bg-white overflow-hidden">
        <CardContent className="p-0">
          {loadState === "loading" ? (
            <div className="divide-y divide-slate-100" role="status" aria-label="Loading services">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                  <div className="size-12 rounded-lg bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                  <div className="h-6 w-20 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : loadState === "error" ? (
            <EmptyState
              icon={AlertCircle}
              title="Could not load services"
              description={loadError}
              actionLabel="Try Again"
              onAction={() => setReloadKey((key) => key + 1)}
            />
          ) : filteredServices.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No services match your filter"
              description="Try selecting a different status filter or clearing your search query."
              actionLabel="Reset Filters"
              onAction={() => {
                setStatusFilter("all");
                setCategoryFilter("all");
                setSearchQuery("");
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Service Details</th>
                    <th scope="col" className="px-6 py-3.5">Category</th>
                    <th scope="col" className="px-6 py-3.5">Technician</th>
                    <th scope="col" className="px-6 py-3.5">Price & Mode</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredServices.map((service) => (
                    <tr key={service._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Service Details with Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <AdminServiceImage
                            src={service.image}
                            alt={service.title}
                            className="size-12 rounded-lg shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <p className="font-semibold text-slate-900 truncate">
                              {service.title}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {service.description}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Added {formatDate(service.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                          {service.category}
                        </span>
                      </td>

                      {/* Technician */}
                      <td className="px-6 py-4 text-xs">
                        <p className="font-semibold text-slate-900">
                          {service.technicianName}
                        </p>
                        <p className="text-slate-500 truncate max-w-xs">
                          {service.technicianEmail}
                        </p>
                      </td>

                      {/* Price & Mode */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <p className="font-bold text-teal-800 text-sm">
                          {formatCurrency(service.basePrice)}
                        </p>
                        <p className="text-slate-500">{service.serviceMode}</p>
                        <p className="text-[11px] text-slate-400">{service.estimatedDuration}</p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(service.approvalStatus)}
                      </td>

                      {/* Moderation Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedService(service)}
                            title="View Service Details"
                            className="size-8 p-0 text-slate-500 hover:text-slate-800"
                          >
                            <Eye className="size-4" />
                          </Button>

                          {service.approvalStatus === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  setServiceDecision({
                                    service,
                                    approvalStatus: "approved",
                                  })
                                }
                                disabled={busyServiceId === service._id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold gap-1"
                              >
                                <Check className="size-3.5" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setServiceDecision({
                                    service,
                                    approvalStatus: "rejected",
                                  })
                                }
                                disabled={busyServiceId === service._id}
                                className="border-rose-200 text-rose-700 hover:bg-rose-50 h-8 text-xs font-semibold gap-1"
                              >
                                <X className="size-3.5" />
                                Reject
                              </Button>
                            </>
                          )}

                          {service.approvalStatus === "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setServiceDecision({
                                  service,
                                  approvalStatus: "rejected",
                                })
                              }
                              disabled={busyServiceId === service._id}
                              className="border-slate-200 text-rose-700 hover:bg-rose-50 h-8 text-xs font-medium"
                            >
                              Revoke
                            </Button>
                          )}

                          {service.approvalStatus === "rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setServiceDecision({
                                  service,
                                  approvalStatus: "approved",
                                })
                              }
                              disabled={busyServiceId === service._id}
                              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-8 text-xs font-medium"
                            >
                              Re-approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                Service Listing Preview
              </h3>
              <button
                onClick={() => setSelectedService(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <AdminServiceImage
                src={selectedService.image}
                alt={selectedService.title}
                className="size-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200">
                  {selectedService.category}
                </span>
                {getStatusBadge(selectedService.approvalStatus)}
              </div>

              <h4 className="font-bold text-lg text-slate-900">
                {selectedService.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedService.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400">Technician:</span>
                <p className="font-semibold text-slate-800">{selectedService.technicianName}</p>
                <p className="text-slate-500 text-[11px] truncate">{selectedService.technicianEmail}</p>
              </div>
              <div>
                <span className="text-slate-400">Base Price:</span>
                <p className="font-bold text-teal-800 text-sm">{formatCurrency(selectedService.basePrice)}</p>
                <p className="text-slate-500 text-[11px]">{selectedService.estimatedDuration}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200">
                <span className="text-slate-400">Coverage & Mode:</span>
                <p className="font-medium text-slate-800">
                  {selectedService.serviceMode} • Area: {selectedService.serviceArea}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedService(null)}
                className="text-xs"
              >
                Close
              </Button>
              {selectedService.approvalStatus !== "approved" && (
                <Button
                  size="sm"
                  onClick={() =>
                    setServiceDecision({
                      service: selectedService,
                      approvalStatus: "approved",
                    })
                  }
                  disabled={busyServiceId === selectedService._id}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1"
                >
                  <Check className="size-3.5" />
                  Approve Service
                </Button>
              )}
              {selectedService.approvalStatus !== "rejected" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setServiceDecision({
                      service: selectedService,
                      approvalStatus: "rejected",
                    })
                  }
                  disabled={busyServiceId === selectedService._id}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs gap-1"
                >
                  <X className="size-3.5" />
                  Reject Service
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(serviceDecision)}
        onClose={() => setServiceDecision(null)}
        onConfirm={handleUpdateStatus}
        title={
          serviceDecision?.approvalStatus === "approved"
            ? "Approve this service?"
            : "Reject this service?"
        }
        description={
          serviceDecision
            ? `"${serviceDecision.service.title}" will be ${
                serviceDecision.approvalStatus === "approved"
                  ? "visible to customers"
                  : "marked as rejected"
              }.`
            : ""
        }
        confirmLabel={
          serviceDecision?.approvalStatus === "approved" ? "Approve" : "Reject"
        }
        variant={
          serviceDecision?.approvalStatus === "approved" ? "success" : "danger"
        }
        isLoading={Boolean(
          serviceDecision && busyServiceId === serviceDecision.service._id
        )}
      />
    </div>
  );
}
