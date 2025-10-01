"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bookmark, BookmarkCheck, Search, Filter, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface Grant {
  id: number;
  title: string;
  description: string;
  source_grant_id: string;
  status: string;
  category: string;
  total_funding_amount: number | null;
  award_min: number | null;
  award_max: number | null;
  close_date: string | null;
  contact_name: string | null;
  contact_email: string | null;
  url: string | null;
  post_date: string | null;
  agency: string | null;
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

function GrantsSearchPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [savedGrants, setSavedGrants] = useState<number[]>([]);
  const [savingGrant, setSavingGrant] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const [user, setUser] = useState<any>(null);

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

  const fetchGrants = async (resetOffset = true) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (statusFilter) params.append("status", statusFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      if (minAmount) params.append("minAmount", minAmount);
      if (maxAmount) params.append("maxAmount", maxAmount);
      params.append("limit", pagination.limit.toString());
      params.append("offset", resetOffset ? "0" : pagination.offset.toString());

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
    }
  };

  useEffect(() => {
    fetchGrants();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, offset: 0 }));
    fetchGrants(true);
  };

  const handleLoadMore = () => {
    setPagination((prev) => ({ ...prev, offset: prev.offset + prev.limit }));
    fetchGrants(false);
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

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCategoryFilter("");
    setMinAmount("");
    setMaxAmount("");
    setPagination((prev) => ({ ...prev, offset: 0 }));
    fetchGrants(true);
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "posted":
        return "bg-green-100 text-green-800 border-green-200";
      case "forecasted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Grant Opportunities</h1>
        <p className="text-gray-600">
          Search and discover funding opportunities that match your needs.
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Grants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Search Query
                </label>
                <Input
                  placeholder="Search grants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
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
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="forecasted">Forecasted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
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
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="Discretionary">Discretionary</SelectItem>
                    <SelectItem value="Entitlement/Allocation">
                      Entitlement/Allocation
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
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
            </div>

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
          maxAmount) && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            Filters applied
          </div>
        )}
      </div>

      {/* Grants List */}
      <div className="space-y-4">
        {loading && grants.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading grants...</p>
          </div>
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
          grants.map((grant) => {
            const isSaved = savedGrants.includes(grant.id);
            const isLoading = savingGrant === grant.id;

            return (
              <Card
                key={grant.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {grant.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 mb-3">
                        {grant.source_grant_id}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(grant.status)}>
                        {grant.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveGrant(grant.id)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0"
                      >
                        {isLoading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : isSaved ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div
                      className="text-sm text-gray-700 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: grant.description }}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Funding:</span>
                        <p>{formatCurrency(grant.total_funding_amount)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Award Range:</span>
                        <p>
                          {grant.award_min && grant.award_max
                            ? `${formatCurrency(
                                grant.award_min
                              )} - ${formatCurrency(grant.award_max)}`
                            : grant.award_max
                            ? `Up to ${formatCurrency(grant.award_max)}`
                            : grant.award_min
                            ? `From ${formatCurrency(grant.award_min)}`
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Close Date:</span>
                        <p>{formatDate(grant.close_date)}</p>
                      </div>
                    </div>

                    {grant.agency && (
                      <div className="text-sm">
                        <span className="font-medium">Agency:</span>{" "}
                        {grant.agency}
                      </div>
                    )}

                    {grant.contact_name && (
                      <div className="text-sm">
                        <span className="font-medium">Contact:</span>{" "}
                        {grant.contact_name}
                        {grant.contact_email && (
                          <span> ({grant.contact_email})</span>
                        )}
                      </div>
                    )}

                    {grant.url && (
                      <div>
                        <Button asChild variant="outline" size="sm">
                          <a
                            href={grant.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Full Details
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
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
