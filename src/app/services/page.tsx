"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ServiceCard } from "@/components/services/service-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Service } from "@/types";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import getService from "@/lib/action/dataGet/getService";
import {
  Search,
  Wrench,
  X,
  Sparkles,
  ArrowUpDown,
  Home,
  Store,
  RotateCcw,
} from "lucide-react";

function ServicesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  console.log(searchParams)

  // URL search params
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialMode = searchParams.get("mode") || "all";
  const initialSort = searchParams.get("sort") || "featured";

  const [searchQuery, setSearchQuery] = React.useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = React.useState(initialCategory);
  const [selectedMode, setSelectedMode] = React.useState(initialMode);
  const [selectedSort, setSelectedSort] = React.useState(initialSort);

  const [services, setServices] = React.useState<Service[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch services from Express API filtered by category, mode, search, and sort from database
  React.useEffect(() => {
    let cancelled = false;

    async function fetchServices() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();

        if (selectedCategory && selectedCategory !== "all") {
          queryParams.set("category", selectedCategory);
        }

        if (selectedMode && selectedMode !== "all") {
          queryParams.set("mode", selectedMode);
        }

        if (searchQuery.trim()) {
          queryParams.set("search", searchQuery.trim());
        }

        if (selectedSort && selectedSort !== "featured") {
          queryParams.set("sort", selectedSort);
        }

        const queryString = queryParams.toString();
        const data = await getService(queryString);
        if (cancelled) return;

        if (Array.isArray(data)) {
          const available = data.filter((s) => s.isAvailable !== false);
          setServices(available);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.warn("Failed to fetch services from database:", err);
        if (cancelled) return;
        setServices([]);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    // Debounce search slightly (300ms) to avoid spamming the database while typing
    const timeoutId = setTimeout(
      () => {
        fetchServices();
      },
      searchQuery ? 300 : 0
    );

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [selectedCategory, selectedMode, searchQuery, selectedSort]);

  // Update URL helper
  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/services?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateUrlParam("category", category);
  };

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
    updateUrlParam("mode", mode);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    updateUrlParam("sort", sort);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    updateUrlParam("search", val);
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedMode("all");
    setSelectedSort("featured");
    setSearchQuery("");
    router.replace("/services", { scroll: false });
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedMode !== "all" ||
    selectedSort !== "featured" ||
    searchQuery.trim().length > 0;

  // Services returned directly from MongoDB (filtered by category, mode, search, and sort)
  const filteredServices = services;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Header */}
        <section className="bg-white border-b border-slate-200/80 py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                <Sparkles className="size-3.5 text-teal-600" />
                <span>Verified Home Appliance & Device Repairs</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                Browse Repair Services
              </h1>

              <p className="text-base text-slate-600 leading-relaxed">
                Explore certified repair services from verified technicians.
                Select your category, filter by Home Visit or Shop Drop-off, and
                book your repair in minutes.
              </p>

              {/* Search bar */}
              <div className="relative pt-2 max-w-2xl">
                <Search className="absolute left-3.5 top-5 size-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by appliance, device issue, technician name or area (e.g. Screen, AC, Mirpur)..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="h-12 pl-10 pr-10 text-sm bg-slate-50 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      updateUrlParam("search", "");
                    }}
                    className="absolute right-3.5 top-5 text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Filter Controls Bar */}
        <section className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-3 shadow-2xs">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Horizontal Category Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === "all"
                    ? "bg-teal-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Categories
              </button>

              {SERVICE_CATEGORIES.map((category) => {
                const isActive =
                  selectedCategory.toLowerCase() === category.toLowerCase();
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-teal-700 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Mode & Sort Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium hidden sm:inline">
                  Mode:
                </span>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  <button
                    type="button"
                    onClick={() => handleModeChange("all")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      selectedMode === "all"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All Modes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange("Home Visit")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
                      selectedMode === "Home Visit"
                        ? "bg-white text-teal-800 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Home className="size-3" />
                    <span>Home Visit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange("Shop Drop-off")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
                      selectedMode === "Shop Drop-off"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Store className="size-3" />
                    <span>Shop Drop-off</span>
                  </button>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-slate-500 hover:text-red-600 text-xs h-7 px-2 gap-1"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset</span>
                  </Button>
                )}
              </div>

              {/* Sort by dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="size-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium">Sort:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:border-teal-600 focus:outline-hidden"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Recently Added</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid Section */}
        <section className="py-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Result Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <strong className="text-slate-900">
                {isLoading ? "..." : filteredServices.length}
              </strong>{" "}
              {filteredServices.length === 1 ? "repair service" : "repair services"}
              {selectedCategory !== "all" && (
                <span> in <strong className="text-teal-800">{selectedCategory}</strong></span>
              )}
            </p>
          </div>

          {/* Loading Skeletons */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4 animate-pulse shadow-xs"
                >
                  <div className="aspect-16/10 w-full rounded-xl bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="h-5 w-16 rounded bg-slate-200" />
                    <div className="h-8 w-24 rounded-lg bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No services match your criteria"
              description="Try adjusting your category, keyword search, or service mode filter to find what you're looking for."
              actionLabel="Clear All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-pulse text-sm font-semibold text-teal-800">
            Loading Fixora services…
          </div>
        </div>
      }
    >
      <ServicesContent />
    </React.Suspense>
  );
}
