"use client";

import { AddonFilters } from "./types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  SortAsc,
  SortDesc,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MyAddonFiltersProps {
  filters: AddonFilters;
  onFiltersChange: (filters: AddonFilters) => void;
  onReset: () => void;
  loading?: boolean;
  totalResults?: number;
}

export function MyAddonFilters({ 
  filters, 
  onFiltersChange, 
  onReset, 
  loading, 
  totalResults 
}: MyAddonFiltersProps) {
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "inprogress", label: "In Progress" },
    { value: "complete", label: "Complete" }
  ];

  const sortOptions = [
    { value: "transactionDate", label: "Transaction Date" },
    { value: "status", label: "Status" },
    { value: "totalPrice", label: "Total Price" },
    { value: "deliveredAt", label: "Delivered Date" }
  ];

  const updateFilters = (updates: Partial<AddonFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.category) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  };

  const clearFilter = (key: keyof AddonFilters) => {
    updateFilters({ [key]: key === 'search' ? '' : undefined });
  };

  // Loading skeleton component
  if (loading) {
    return (
      <Card className="border border-border">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>

            {/* Search Bar Skeleton */}
            <div className="relative">
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Filter Row Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Category Filter Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Date From Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Date To Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            {/* Sort Options Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-48" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border">
      <CardContent className="p-2 sm:p-4 md:p-6">
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Filter className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold">Filters</h3>
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="h-4 sm:h-5 text-[10px] sm:text-xs px-1 sm:px-2">
                  {getActiveFiltersCount()} active
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {totalResults !== undefined && (
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {totalResults} result{totalResults !== 1 ? 's' : ''}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                disabled={loading || getActiveFiltersCount() === 0}
                className="h-6 sm:h-7 md:h-8 text-xs sm:text-sm px-2"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              placeholder="Search by addon name, transaction ID, or category..."
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-8 sm:pl-10 pr-8 sm:pr-10 h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
              disabled={loading}
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('search')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 p-0"
              >
                <X className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />
              </Button>
            )}
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {/* Status Filter */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Status</label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => updateFilters({ status: value as 'all' | 'pending' | 'inprogress' | 'complete' })}
                disabled={loading}
              >
                <SelectTrigger className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Category</label>
              <Input
                placeholder="Any category"
                value={filters.category || ''}
                onChange={(e) => updateFilters({ category: e.target.value || undefined })}
                disabled={loading}
                className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
              />
            </div>

            {/* Date From */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-8 sm:h-9 md:h-10 text-xs sm:text-sm",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">
                      {filters.dateFrom ? format(filters.dateFrom, "MMM dd, yyyy") : "Select date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => updateFilters({ dateFrom: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-8 sm:h-9 md:h-10 text-xs sm:text-sm",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">
                      {filters.dateTo ? format(filters.dateTo, "MMM dd, yyyy") : "Select date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => updateFilters({ dateTo: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Sort and Additional Options */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-between">
            {/* Sort Options */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Sort by:</label>
              <Select
                value={filters.sortBy || 'transaction_date_desc'}
                onValueChange={(value) => updateFilters({ sortBy: value as 'transactionDate' | 'status' | 'totalPrice' | 'deliveredAt' })}
                disabled={loading}
              >
                <SelectTrigger className="w-32 sm:w-40 md:w-48 h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        {option.value.includes('_desc') ? (
                          <SortDesc className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        ) : (
                          <SortAsc className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        )}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Active Filters:</label>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                  {filters.search && (
                  <Badge variant="secondary" className="flex items-center space-x-0.5 sm:space-x-1 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5">
                    <span>Search: &quot;{filters.search}&quot;</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('search')}
                      className="h-2 w-2 sm:h-2.5 sm:w-2.5 p-0 ml-0.5 sm:ml-1"
                    >
                      <X className="h-1.5 w-1.5 sm:h-2 sm:w-2" />
                    </Button>
                  </Badge>
                )}
                {filters.status && filters.status !== 'all' && (
                  <Badge variant="secondary" className="flex items-center space-x-0.5 sm:space-x-1 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5">
                    <span>Status: {statusOptions.find(o => o.value === filters.status)?.label}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('status')}
                      className="h-2 w-2 sm:h-2.5 sm:w-2.5 p-0 ml-0.5 sm:ml-1"
                    >
                      <X className="h-1.5 w-1.5 sm:h-2 sm:w-2" />
                    </Button>
                  </Badge>
                )}
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center space-x-0.5 sm:space-x-1 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5">
                    <span>Category: {filters.category}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('category')}
                      className="h-2 w-2 sm:h-2.5 sm:w-2.5 p-0 ml-0.5 sm:ml-1"
                    >
                      <X className="h-1.5 w-1.5 sm:h-2 sm:w-2" />
                    </Button>
                  </Badge>
                )}
                {filters.dateFrom && (
                  <Badge variant="secondary" className="flex items-center space-x-0.5 sm:space-x-1 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5">
                    <span>From: {format(filters.dateFrom, "MMM dd, yyyy")}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('dateFrom')}
                      className="h-2 w-2 sm:h-2.5 sm:w-2.5 p-0 ml-0.5 sm:ml-1"
                    >
                      <X className="h-1.5 w-1.5 sm:h-2 sm:w-2" />
                    </Button>
                  </Badge>
                )}
                {filters.dateTo && (
                  <Badge variant="secondary" className="flex items-center space-x-0.5 sm:space-x-1 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5">
                    <span>To: {format(filters.dateTo, "MMM dd, yyyy")}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('dateTo')}
                      className="h-2 w-2 sm:h-2.5 sm:w-2.5 p-0 ml-0.5 sm:ml-1"
                    >
                      <X className="h-1.5 w-1.5 sm:h-2 sm:w-2" />
                    </Button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
