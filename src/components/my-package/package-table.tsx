"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, ExternalLink, Calendar, AlertTriangle, Package } from "lucide-react";
import { MyPackage } from "./types";
import { Skeleton } from "../ui/skeleton";

interface MyPackageTableProps {
  packages: MyPackage[];
  loading?: boolean;
  onViewDetails: (pkg: MyPackage) => void;
}
export function MyPackageTable({ packages, loading, onViewDetails }: MyPackageTableProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      awaiting_delivery: { label: "Awaiting", variant: "secondary" as const, className: "" },
      in_progress: { label: "In Progress", variant: "default" as const, className: "" },
      delivered: { label: "Delivered", variant: "outline" as const, className: "bg-green-50 text-green-700 border-green-200" },
      pending: { label: "Pending", variant: "outline" as const, className: "" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "outline" as const,
      className: "",
    };

    return (
      <Badge variant={config.variant} className={`capitalize ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const isDomainExpiringSoon = (domainExpiredAt?: string) => {
    if (!domainExpiredAt) return false;
    const expiryDate = new Date(domainExpiredAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const openUrl = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <>
        {/* Desktop Loading */}
        <div className="hidden md:block border border-border rounded-md bg-background">
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Loading */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-3 space-y-3 bg-background">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (packages.length === 0) {
    return (
      <>
        {/* Desktop Empty State */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Domain & Expiry</TableHead>
                <TableHead>Website URL</TableHead>
                <TableHead>Drive URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-muted-foreground">No packages found</p>
                    <p className="text-sm text-muted-foreground">Your delivered packages will appear here</p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Mobile Empty State */}
        <div className="md:hidden rounded-md border p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Package className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No packages found</p>
            <p className="text-sm text-muted-foreground">Your delivered packages will appear here</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Domain & Expiry</TableHead>
              <TableHead>Website URL</TableHead>
              <TableHead>Drive URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                {/* Date */}
                <TableCell>
                  <div className="text-sm">
                    {formatDate(pkg.deliveredAt || pkg.createdAt)}
                  </div>
                </TableCell>

                {/* Product */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{pkg.package.name_en}</div>
                    {pkg.package.category && (
                      <div className="text-xs text-muted-foreground">
                        {pkg.package.category.name_en}
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Quantity */}
                <TableCell>
                  <div className="text-sm font-medium">{pkg.quantity}</div>
                </TableCell>

                {/* Domain & Expiry */}
                <TableCell>
                  <div className="space-y-1">
                    {pkg.domainName ? (
                      <>
                        <div className="text-sm font-medium">{pkg.domainName}</div>
                        {pkg.domainExpiredAt && (
                          <div className={`text-xs flex items-center gap-1 ${
                            isDomainExpiringSoon(pkg.domainExpiredAt) 
                              ? 'text-orange-600 font-medium' 
                              : 'text-muted-foreground'
                          }`}>
                            {isDomainExpiringSoon(pkg.domainExpiredAt) && (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            <Calendar className="h-3 w-3" />
                            {formatDate(pkg.domainExpiredAt)}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">-</div>
                    )}
                  </div>
                </TableCell>

                {/* Website URL */}
                <TableCell>
                  {pkg.websiteUrl ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openUrl(pkg.websiteUrl!)}
                      className="h-8 px-2 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  ) : (
                    <div className="text-sm text-muted-foreground">-</div>
                  )}
                </TableCell>

                {/* Drive URL */}
                <TableCell>
                  {pkg.driveUrl ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openUrl(pkg.driveUrl!)}
                      className="h-8 px-2 text-green-600 hover:text-green-800"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Drive
                    </Button>
                  ) : (
                    <div className="text-sm text-muted-foreground">-</div>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell>
                  {getStatusBadge(pkg.status)}
                </TableCell>

                {/* Action */}
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(pkg)}
                    className="h-8"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="border rounded-lg p-3 space-y-3 bg-background">
            {/* Header Row */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{pkg.package.name_en}</h4>
                {pkg.package.category && (
                  <p className="text-xs text-muted-foreground">{pkg.package.category.name_en}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(pkg.deliveredAt || pkg.createdAt)} • Qty: {pkg.quantity}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(pkg.status)}
              </div>
            </div>

            {/* Domain Info */}
            {pkg.domainName && (
              <div className="border rounded-md p-2 bg-muted/30">
                <div className="flex items-center gap-1 mb-1">
                  <div className="text-sm font-medium">{pkg.domainName}</div>
                </div>
                {pkg.domainExpiredAt && (
                  <div className={`text-xs flex items-center gap-1 ${
                    isDomainExpiringSoon(pkg.domainExpiredAt) 
                      ? 'text-orange-600 font-medium' 
                      : 'text-muted-foreground'
                  }`}>
                    {isDomainExpiringSoon(pkg.domainExpiredAt) && (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    <Calendar className="h-3 w-3" />
                    Expires: {formatDate(pkg.domainExpiredAt)}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {pkg.websiteUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openUrl(pkg.websiteUrl!)}
                  className="h-8 px-3 text-blue-600 hover:text-blue-800 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Website
                </Button>
              )}
              {pkg.driveUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openUrl(pkg.driveUrl!)}
                  className="h-8 px-3 text-green-600 hover:text-green-800 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Drive
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(pkg)}
                className="h-8 px-3 text-xs ml-auto"
              >
                <Eye className="h-3 w-3 mr-1" />
                Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
