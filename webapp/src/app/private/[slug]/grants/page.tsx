"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  CalendarIcon,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Loading } from "@/components/ui/spinner";
import { GrantCard, GrantCardData } from "@/components/grants/GrantCard";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tiptap-ui-primitive/popover/popover";
import { format } from "date-fns";

interface Grant extends GrantCardData {
  contact_name: string | null;
  contact_email: string | null;
  post_date: string | null;
  funding_instrument: string | null;
  eligibility_summary: string | null;
  description_summary: string | null;
}

interface SearchResponse {
  data: Grant[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  searchParams: {
    query: string;
    status: string;
    category: string;
    minAmount: string | null;
    maxAmount: string | null;
  };
  meta: {
    requestId: string;
    timestamp: string;
    processingTimeMs: number;
    source: string;
  };
}

interface ApplicationData {
  opportunityId: string;
}

function GrantsSearchPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [agency, setAgency] = useState("");
  const [fundingInstrument, setFundingInstrument] = useState("");
  const [costSharing, setCostSharing] = useState("");
  const [fiscalYear, setFiscalYear] = useState("");
  const [source, setSource] = useState("");
  const [closeDateFrom, setCloseDateFrom] = useState<Date | undefined>(
    undefined
  );
  const [closeDateTo, setCloseDateTo] = useState<Date | undefined>(undefined);
  const [savedGrants, setSavedGrants] = useState<number[]>([]);
  const [savingGrant, setSavingGrant] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Application tracking
  const [grantApplications, setGrantApplications] = useState<number[]>([]);
  const [creatingApplication, setCreatingApplication] = useState<number | null>(
    null
  );

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState<{
    states: string[];
    agencies: string[];
    sources: string[];
    fiscalYears: number[];
    categories: string[];
  }>({
    states: [],
    agencies: [],
    sources: [],
    fiscalYears: [],
    categories: [],
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  // Get user session
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch applications for this organization
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(
          `/api/applications?organizationSlug=${slug}`
        );
        if (response.ok) {
          const data = await response.json();
          const opportunityIds = data.applications.map(
            (app: ApplicationData) => app.opportunityId
          );
          setGrantApplications(opportunityIds);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };
    if (slug) {
      fetchApplications();
    }
  }, [slug]);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch("/api/grants/filters");
        if (response.ok) {
          const data = await response.json();
          setFilterOptions(data);
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };
    fetchFilterOptions();
  }, []);

  const fetchGrants = async (resetOffset = true, customOffset?: number) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (statusFilter) params.append("status", statusFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      if (minAmount) params.append("minAmount", minAmount);
      if (maxAmount) params.append("maxAmount", maxAmount);
      if (stateCode) params.append("stateCode", stateCode);
      if (agency) params.append("agency", agency);
      if (fundingInstrument)
        params.append("fundingInstrument", fundingInstrument);
      if (costSharing) params.append("costSharing", costSharing);
      if (fiscalYear) params.append("fiscalYear", fiscalYear);
      if (source) params.append("source", source);
      if (closeDateFrom)
        params.append("closeDateFrom", format(closeDateFrom, "yyyy-MM-dd"));
      if (closeDateTo)
        params.append("closeDateTo", format(closeDateTo, "yyyy-MM-dd"));
      params.append("limit", pagination.limit.toString());
      const offset = resetOffset
        ? 0
        : customOffset !== undefined
          ? customOffset
          : pagination.offset;
      params.append("offset", offset.toString());

      const response = await fetch(`/api/grants/search?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchResponse = await response.json();

      if (resetOffset) {
        setGrants(data.data);
      } else {
        setGrants((prev) => {
          // Create a map to track unique grants by ID
          const existingGrants = new Map(
            prev.map((grant) => [grant.id, grant])
          );

          // Add new grants, skipping duplicates
          data.data.forEach((newGrant) => {
            if (!existingGrants.has(newGrant.id)) {
              existingGrants.set(newGrant.id, newGrant);
            }
          });

          return Array.from(existingGrants.values());
        });
      }

      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to fetch grants");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchGrants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-search when search query changes (with debounce)
  useEffect(() => {
    if (initialLoad) return; // Don't trigger during initial load

    const delayDebounce = setTimeout(() => {
      fetchGrants(true);
    }, 500); // 500ms debounce for search query

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Auto-search when dropdown/filter fields change (instant, no debounce)
  useEffect(() => {
    if (initialLoad) return; // Don't trigger during initial load
    fetchGrants(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    statusFilter,
    categoryFilter,
    minAmount,
    maxAmount,
    stateCode,
    agency,
    fundingInstrument,
    costSharing,
    fiscalYear,
    source,
    closeDateFrom,
    closeDateTo,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, offset: 0 }));
    fetchGrants(true);
  };

  const handleLoadMore = () => {
    const newOffset = pagination.offset + pagination.limit;
    fetchGrants(false, newOffset);
  };

  const handleSaveGrant = async (grantId: number) => {
    if (!user?.email) {
      toast.error("Please sign in to save grants");
      return;
    }

    setSavingGrant(grantId);
    try {
      const isSaved = savedGrants.includes(grantId);
      // Optimistic UI
      if (isSaved) {
        setSavedGrants((prev) => prev.filter((id) => id !== grantId));
        const res = await fetch(`/api/grants/${grantId}/bookmark`, {
          method: "DELETE",
        });
        if (!res.ok && res.status !== 204) {
          // rollback
          setSavedGrants((prev) => [...prev, grantId]);
          const msg = await res.text();
          throw new Error(msg || "Failed to remove bookmark");
        }
        toast.success("Grant removed from saved grants");
      } else {
        setSavedGrants((prev) => [...prev, grantId]);
        const res = await fetch(`/api/grants/${grantId}/bookmark`, {
          method: "POST",
        });
        if (!res.ok) {
          // rollback
          setSavedGrants((prev) => prev.filter((id) => id !== grantId));
          const msg = await res.text();
          throw new Error(msg || "Failed to save bookmark");
        }
        toast.success("Grant saved to your collection");
      }
    } catch (error) {
      console.error("Error saving grant:", error);
      toast.error("Failed to save grant");
    } finally {
      setSavingGrant(null);
    }
  };

  const handleCreateApplication = async (grantId: number) => {
    if (!user?.email) {
      toast.error("Please sign in to create applications");
      return;
    }

    setCreatingApplication(grantId);
    try {
      const grant = grants.find((g) => g.id === grantId);
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: grantId,
          organizationSlug: slug,
          grantTitle: grant?.title,
          alsoBookmark: true, // Also bookmark when creating application
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        toast.info("Application already exists for this grant");
        setGrantApplications((prev) => [...prev, grantId]);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to create application");
      }

      // Update local state
      setGrantApplications((prev) => [...prev, grantId]);
      if (data.alsoBookmarked) {
        setSavedGrants((prev) => [...prev, grantId]);
      }

      toast.success("Application created successfully!");
    } catch (error) {
      console.error("Error creating application:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create application"
      );
    } finally {
      setCreatingApplication(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCategoryFilter("");
    setMinAmount("");
    setMaxAmount("");
    setStateCode("");
    setAgency("");
    setFundingInstrument("");
    setCostSharing("");
    setFiscalYear("");
    setSource("");
    setCloseDateFrom(undefined);
    setCloseDateTo(undefined);
    setPagination((prev) => ({ ...prev, offset: 0 }));
    // fetchGrants will be triggered automatically by the useEffect hooks
  };

  return (
    <div className="p-4 mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Grant Opportunities</h1>
        <p className="text-gray-600">
          Search and discover funding opportunities that match your needs.
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Grants</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar - Full Width */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search grants by title, description, or grant number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-base pl-10"
              />
            </div>

            {/* Basic Filters - Single Row */}
            <div className="flex gap-4">
              <div style={{ flex: "1 1 0" }}>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select
                  value={statusFilter || "all"}
                  onValueChange={(value) =>
                    setStatusFilter(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent side="bottom" avoidCollisions={false}>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="forecasted">Forecasted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div style={{ flex: "1 1 0" }}>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <Select
                  value={categoryFilter || "all"}
                  onValueChange={(value) =>
                    setCategoryFilter(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent
                    side="bottom"
                    avoidCollisions={false}
                    className="max-h-[300px]"
                  >
                    <SelectItem value="all">All categories</SelectItem>
                    {filterOptions.categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div style={{ flex: "1 1 0" }}>
                <label className="block text-sm font-medium mb-2">
                  Amount Range
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ flex: "1 1 0" }}>
                <label className="block text-sm font-medium mb-2">State</label>
                <Select
                  value={stateCode || "all"}
                  onValueChange={(value) =>
                    setStateCode(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All states" />
                  </SelectTrigger>
                  <SelectContent side="bottom" avoidCollisions={false}>
                    <SelectItem value="all">All states</SelectItem>
                    {filterOptions.states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2"
              >
                {showAdvanced ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Advanced Filters
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show Advanced Filters
                  </>
                )}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <>
                {/* Advanced Filters Row 1: Agency, Funding Instrument, Cost Sharing, Fiscal Year, Source */}
                <div className="flex gap-4">
                  <div style={{ flex: "1 1 0" }}>
                    <label className="block text-sm font-medium mb-2">
                      Agency
                    </label>
                    <Select
                      value={agency || "all"}
                      onValueChange={(value) =>
                        setAgency(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All agencies" />
                      </SelectTrigger>
                      <SelectContent side="bottom" avoidCollisions={false}>
                        <SelectItem value="all">All agencies</SelectItem>
                        {filterOptions.agencies.map((agencyName) => (
                          <SelectItem key={agencyName} value={agencyName}>
                            {agencyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div style={{ flex: "1 1 0" }}>
                    <label className="block text-sm font-medium mb-2">
                      Funding Instrument
                    </label>
                    <Select
                      value={fundingInstrument || "all"}
                      onValueChange={(value) =>
                        setFundingInstrument(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent side="bottom" avoidCollisions={false}>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="Grant">Grant</SelectItem>
                        <SelectItem value="Cooperative Agreement">
                          Cooperative Agreement
                        </SelectItem>
                        <SelectItem value="Procurement Contract">
                          Procurement Contract
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div style={{ flex: "1 1 0" }}>
                    <label className="block text-sm font-medium mb-2">
                      Cost Sharing
                    </label>
                    <Select
                      value={costSharing || "all"}
                      onValueChange={(value) =>
                        setCostSharing(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent side="bottom" avoidCollisions={false}>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="true">Required</SelectItem>
                        <SelectItem value="false">Not Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div style={{ flex: "1 1 0" }}>
                    <label className="block text-sm font-medium mb-2">
                      Fiscal Year
                    </label>
                    <Select
                      value={fiscalYear || "all"}
                      onValueChange={(value) =>
                        setFiscalYear(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All years" />
                      </SelectTrigger>
                      <SelectContent side="bottom" avoidCollisions={false}>
                        <SelectItem value="all">All years</SelectItem>
                        {filterOptions.fiscalYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div style={{ flex: "1 1 0" }}>
                    <label className="block text-sm font-medium mb-2">
                      Source
                    </label>
                    <Select
                      value={source || "all"}
                      onValueChange={(value) =>
                        setSource(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All sources" />
                      </SelectTrigger>
                      <SelectContent side="bottom" avoidCollisions={false}>
                        <SelectItem value="all">All sources</SelectItem>
                        {filterOptions.sources.map((sourceName) => (
                          <SelectItem key={sourceName} value={sourceName}>
                            {sourceName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Advanced Filters Row 2: Close Date From, Close Date To */}
                <div className="flex gap-4">
                  <div style={{ flex: "1 1 0" }}>
                    <label className="block text-sm font-medium mb-2">
                      Close Date From
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {closeDateFrom ? (
                            format(closeDateFrom, "PPP")
                          ) : (
                            <span className="text-muted-foreground">
                              Pick a date
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 border rounded-md"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={closeDateFrom}
                          onSelect={setCloseDateFrom}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div style={{ flex: "1 1 0" }}>
                    <label className="block text-sm font-medium mb-2">
                      Close Date To
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {closeDateTo ? (
                            format(closeDateTo, "PPP")
                          ) : (
                            <span className="text-muted-foreground">
                              Pick a date
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 border rounded-md"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={closeDateTo}
                          onSelect={setCloseDateTo}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {grants.length} of {pagination.total} grants
        </p>
        {(searchQuery ||
          statusFilter ||
          categoryFilter ||
          minAmount ||
          maxAmount ||
          stateCode ||
          agency ||
          fundingInstrument ||
          costSharing ||
          fiscalYear ||
          source ||
          closeDateFrom ||
          closeDateTo) && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            Filters applied
          </div>
        )}
      </div>

      {/* Grants List */}
      <div className="space-y-4">
        {loading && grants.length === 0 ? (
          <Loading message="Loading grants..." />
        ) : grants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              No grants found. Try adjusting your search criteria.
            </p>
            <div className="text-sm text-gray-500">
              <p>Total grants in database: {pagination.total}</p>
              {pagination.total === 0 && (
                <p className="mt-2 text-orange-600">
                  The database appears to be empty. You may need to run the data
                  collection scripts.
                </p>
              )}
            </div>
          </div>
        ) : (
          grants.map((grant) => (
            <GrantCard
              key={grant.id}
              grant={grant}
              organizationSlug={slug}
              isSaved={savedGrants.includes(grant.id)}
              hasApplication={grantApplications.includes(grant.id)}
              isLoading={savingGrant === grant.id}
              isCreatingApplication={creatingApplication === grant.id}
              onToggleBookmark={handleSaveGrant}
              onCreateApplication={handleCreateApplication}
            />
          ))
        )}
      </div>

      {/* Load More Button */}
      {pagination.hasMore && (
        <div className="text-center mt-8">
          <Button onClick={handleLoadMore} disabled={loading} variant="outline">
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default GrantsSearchPage;
