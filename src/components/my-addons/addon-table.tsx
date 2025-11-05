"use client";

import { MyAddon } from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, 
  ExternalLink, 
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Download
} from "lucide-react";
import { format } from "date-fns";

interface MyAddonTableProps {
  addons: MyAddon[];
  loading: boolean;
  onViewDetails: (addon: MyAddon) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function MyAddonTable({ 
  addons, 
  loading, 
  onViewDetails,
  currentPage,
  totalPages,
  onPageChange
}: MyAddonTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
    } catch {
      return "Invalid date";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-700 text-[9px] sm:text-xs px-1 sm:px-2 py-0.5">
            <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            Complete
          </Badge>
        );
      case 'inprogress':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-700 text-[9px] sm:text-xs px-1 sm:px-2 py-0.5">
            <Truck className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            In Progress
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-700 text-[9px] sm:text-xs px-1 sm:px-2 py-0.5">
            <Clock className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/10 dark:text-gray-400 dark:border-gray-700 text-[9px] sm:text-xs px-1 sm:px-2 py-0.5">
            <AlertCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="border border-border rounded-md bg-background">
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 1 }).map((_, i) => (
              <div key={i} className="">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-18 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-12 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (addons.length === 0) {
    return (
      <div className="border border-border rounded-md bg-background">
        <div className="p-6">
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Addons Found</h3>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t purchased any addons yet, or they don&apos;t match your current filters.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Browse Addons
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction Date</TableHead>
              <TableHead>Addon Details</TableHead>
              <TableHead>Assets</TableHead>
              <TableHead>Drive URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Delivered At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addons.map((addon) => (
              <TableRow key={addon.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {formatDate(addon.transaction.createdAt)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      #{addon.transactionId.slice(-8)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 max-w-xs">
                    <div className="font-medium truncate">
                      {addon.addon.name_en}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {addon.addon.category.name_en}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Qty: {addon.quantity} × {formatCurrency(addon.addon.price)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {formatCurrency(addon.totalPrice)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Amount
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {addon.driveUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(addon.driveUrl!, '_blank')}
                      className="h-7"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Not Available
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(addon.status)}
                </TableCell>
                <TableCell>
                  {addon.deliveredAt ? (
                    <div className="space-y-1">
                      <div className="text-sm">
                        {formatDate(addon.deliveredAt)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(addon.deliveredAt), "HH:mm")}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Not Delivered
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(addon)}
                    className="h-7"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2 sm:space-y-3">
        {addons.map((addon) => (
          <div key={addon.id} className="border border-border rounded-md p-2 sm:p-3 bg-background">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1 mr-2">
                <h3 className="font-medium text-xs sm:text-sm truncate">
                  {addon.addon.name_en}
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {addon.addon.category.name_en}
                </p>
              </div>
              <div className="flex-shrink-0">
                {getStatusBadge(addon.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3 text-[10px] sm:text-xs">
              <div>
                <span className="text-muted-foreground">Transaction:</span>
                <div className="font-medium text-xs sm:text-sm">
                  {formatDate(addon.transaction.createdAt)}
                </div>
                <div className="text-muted-foreground">
                  #{addon.transactionId.slice(-8)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <div className="font-medium text-xs sm:text-sm">
                  {formatCurrency(addon.totalPrice)}
                </div>
                <div className="text-muted-foreground">
                  Qty: {addon.quantity}
                </div>
              </div>
            </div>

            {addon.deliveredAt && (
              <div className="mb-2 sm:mb-3 text-[10px] sm:text-xs">
                <span className="text-muted-foreground">Delivered:</span>
                <div className="font-medium">
                  {formatDateTime(addon.deliveredAt)}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              {addon.driveUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(addon.driveUrl!, '_blank')}
                  className="h-6 sm:h-7 text-[10px] sm:text-xs px-2 flex-shrink-0"
                >
                  <Download className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                  Download
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(addon)}
                className="h-6 sm:h-7 text-[10px] sm:text-xs px-2 ml-auto flex-shrink-0"
              >
                <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, addons.length)} of {addons.length} addons
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
            >
              Previous
            </Button>
            <div className="flex items-center space-x-0.5 sm:space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 p-0 text-xs sm:text-sm"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
