"use client";

import { PackageFilters } from "./types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
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

interface MyPackageFiltersProps {
  filters: PackageFilters;
  onFiltersChange: (filters: PackageFilters) => void;
  onRefresh: () => void;
  softLoading?: boolean;
  totalResults?: number;
}

export function MyPackageFilters({ 
  filters, 
  onFiltersChange, 
  onRefresh, 
  softLoading,
  totalResults 
}: MyPackageFiltersProps) {
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "awaiting_delivery", label: "Awaiting Delivery" },
    { value: "in_progress", label: "In Progress" },
    { value: "delivered", label: "Delivered" }
  ];

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" }
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First", icon: SortDesc },
    { value: "oldest", label: "Oldest First", icon: SortAsc },
    { value: "value", label: "Highest Value", icon: SortDesc },
    { value: "status", label: "By Status", icon: SortAsc }
  ];

  const updateFilters = (updates: Partial<PackageFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.dateRange && filters.dateRange !== 'all') count++;
    return count;
  };

  const clearFilter = (key: keyof PackageFilters) => {
    if (key === 'search') {
      updateFilters({ search: '' });
    } else if (key === 'status') {
      updateFilters({ status: 'all' });
    } else if (key === 'dateRange') {
      updateFilters({ dateRange: 'all' });
    }
  };

  const handleReset = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      dateRange: 'all',
      sortBy: 'newest'
    });
    onRefresh();
  };

  return (
    <Card className="border border-border">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Filters</h3>
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="h-5">
                  {getActiveFiltersCount()} active
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {totalResults !== undefined && (
                <span className="text-sm text-muted-foreground">
                  {totalResults} result{totalResults !== 1 ? 's' : ''}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={softLoading || getActiveFiltersCount() === 0}
                className="h-8"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${softLoading ? 'animate-spin' : ''}`} />
                Reset
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search packages by name, domain, or description..."
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10 pr-10"
              disabled={softLoading}
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('search')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilters({ status: value as 'all' | 'awaiting_delivery' | 'in_progress' | 'delivered' })}
                disabled={softLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Date Range</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => updateFilters({ dateRange: value as 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year' })}
                disabled={softLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Sort By</label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => updateFilters({ sortBy: value as 'newest' | 'oldest' | 'value' | 'status' })}
                disabled={softLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-3 w-3" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Active Filters:</label>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Search: &quot;{filters.search}&quot;</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('search')}
                      className="h-3 w-3 p-0 ml-1"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
                {filters.status && filters.status !== 'all' && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Status: {statusOptions.find(o => o.value === filters.status)?.label}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('status')}
                      className="h-3 w-3 p-0 ml-1"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
                {filters.dateRange && filters.dateRange !== 'all' && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Date: {dateRangeOptions.find(o => o.value === filters.dateRange)?.label}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('dateRange')}
                      className="h-3 w-3 p-0 ml-1"
                    >
                      <X className="h-2 w-2" />
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
