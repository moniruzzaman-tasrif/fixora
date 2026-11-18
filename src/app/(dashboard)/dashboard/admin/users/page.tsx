"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DUMMY_USERS } from "@/data/users";
import { User, UserRole } from "@/types";
import { formatDate } from "@/lib/format";
import { useCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  Wrench,
  User as UserIcon,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";

export default function AdminUsersPage() {
  // The signed-in admin comes from the BetterAuth session.
  const { user: currentUser } = useCurrentUser();
  const isOwnAccount = (target: User) =>
    Boolean(currentUser && target.email === currentUser.email);

  // Local state initialized with dummy users
  const [users, setUsers] = React.useState<User[]>(DUMMY_USERS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = React.useState<string>("all");

  // Modal state for changing role
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [newRole, setNewRole] = React.useState<UserRole>("customer");
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Filter users based on query and role tab
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery));

      const matchesRole =
        selectedRoleFilter === "all" || user.role === selectedRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRoleFilter]);

  // Open edit modal
  const handleOpenEdit = (user: User) => {
    // Current admin cannot change their own role to prevent lockout
    if (isOwnAccount(user)) {
      toast.error("Security Rule: You cannot change your own admin account role.");
      return;
    }
    setEditingUser(user);
    setNewRole(user.role);
  };

  // Confirm role change
  const handleSaveRole = () => {
    if (!editingUser) return;
    setIsUpdating(true);

    setTimeout(() => {
      // TODO(owner): replace with API call: PATCH /api/admin/users/:id/role { role: newRole }
      setUsers((prev) =>
        prev.map((u) => (u._id === editingUser._id ? { ...u, role: newRole } : u))
      );
      toast.success(
        `Role for "${editingUser.name}" successfully updated to ${newRole.toUpperCase()}`
      );
      setIsUpdating(false);
      setEditingUser(null);
    }, 400);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-100 font-semibold gap-1">
            <ShieldCheck className="size-3" />
            Admin
          </Badge>
        );
      case "technician":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 font-semibold gap-1">
            <Wrench className="size-3" />
            Technician
          </Badge>
        );
      case "customer":
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 font-semibold gap-1">
            <UserIcon className="size-3" />
            Customer
          </Badge>
        );
    }
  };

  const roleCounts = {
    all: users.length,
    customer: users.filter((u) => u.role === "customer").length,
    technician: users.filter((u) => u.role === "technician").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        heading="Manage Users"
        description="Search, view, and assign platform roles for customers, technicians, and administrators."
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-teal-300 text-teal-800 bg-teal-50 px-3 py-1 font-medium">
            {users.length} Registered Accounts
          </Badge>
        </div>
      </PageHeader>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Role tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
          {[
            { id: "all", label: "All Users", count: roleCounts.all },
            { id: "customer", label: "Customers", count: roleCounts.customer },
            { id: "technician", label: "Technicians", count: roleCounts.technician },
            { id: "admin", label: "Admins", count: roleCounts.admin },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRoleFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap",
                selectedRoleFilter === tab.id
                  ? "bg-white text-teal-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  selectedRoleFilter === tab.id
                    ? "bg-teal-100 text-teal-800"
                    : "bg-slate-200 text-slate-600"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, phone..."
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
      </div>

      {/* Users Table / List */}
      <Card className="border-slate-200 shadow-xs bg-white overflow-hidden">
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description={
                searchQuery
                  ? `No accounts matched your search for "${searchQuery}".`
                  : "No users exist in this category."
              }
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery("");
                setSelectedRoleFilter("all");
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">User</th>
                    <th scope="col" className="px-6 py-3.5">Role</th>
                    <th scope="col" className="px-6 py-3.5">Contact & Location</th>
                    <th scope="col" className="px-6 py-3.5">Joined Date</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center font-bold text-teal-800 text-sm">
                            {user.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.image}
                                alt={user.name}
                                className="size-full object-cover"
                              />
                            ) : (
                              user.name.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>

                      {/* Contact & Location */}
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <p className="font-medium text-slate-800">{user.phone || "No phone added"}</p>
                        <p className="text-slate-500 truncate max-w-xs">{user.area || "Area not specified"}</p>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {user.createdAt ? formatDate(user.createdAt) : "Nov 2026"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(user)}
                          disabled={isOwnAccount(user)}
                          className="h-8 text-xs font-semibold border-slate-200 hover:border-teal-500 hover:text-teal-700"
                        >
                          <UserCheck className="size-3.5 mr-1 text-teal-600" />
                          Change Role
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Change User Role</h3>
                  <p className="text-xs text-slate-500">Update access permissions for this account</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Target User Info */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs space-y-1">
              <p className="font-semibold text-slate-900">{editingUser.name}</p>
              <p className="text-slate-500">{editingUser.email}</p>
              <div className="pt-1 flex items-center gap-1.5">
                <span className="text-slate-400">Current Role:</span>
                {getRoleBadge(editingUser.role)}
              </div>
            </div>

            {/* Role Options */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Select New Role:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: "customer",
                    name: "Customer",
                    description: "Can browse services, book repairs, and make payments.",
                    icon: UserIcon,
                  },
                  {
                    id: "technician",
                    name: "Technician",
                    description: "Can publish repair services, accept requests, and perform jobs.",
                    icon: Wrench,
                  },
                  {
                    id: "admin",
                    name: "Administrator",
                    description: "Full moderation, user role management, and revenue oversight.",
                    icon: ShieldCheck,
                  },
                ].map((roleOption) => {
                  const isSelected = newRole === roleOption.id;
                  const Icon = roleOption.icon;
                  return (
                    <div
                      key={roleOption.id}
                      onClick={() => setNewRole(roleOption.id as UserRole)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all text-left",
                        isSelected
                          ? "border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-600"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg",
                          isSelected
                            ? "bg-teal-700 text-white"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-xs text-slate-900">
                            {roleOption.name}
                          </p>
                          {isSelected && <Check className="size-4 text-teal-700" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {roleOption.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {newRole === "admin" && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 border border-amber-200 text-amber-900 text-[11px]">
                <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Granting Admin privileges gives this user access to all user accounts, service approvals, and payment transactions.
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingUser(null)}
                disabled={isUpdating}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveRole}
                disabled={isUpdating || newRole === editingUser.role}
                className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs min-w-24"
              >
                {isUpdating ? "Saving..." : "Save Role"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
