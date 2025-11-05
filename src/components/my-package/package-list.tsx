"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MyPackage, PackageFilters } from "./types";
import { MyPackageCard } from "./package-card";

interface MyPackageListProps {
  packages: MyPackage[];
  filters: PackageFilters;
  softLoading?: boolean;
  onViewDetails: (pkg: MyPackage) => void;
}

export function MyPackageList({ 
  packages, 
  filters, 
  softLoading, 
  onViewDetails 
}: MyPackageListProps) {
  const filteredPackages = useMemo(() => {
    return packages
      .filter(pkg => {
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            pkg.package.name_en.toLowerCase().includes(searchLower) ||
            pkg.package.name_id?.toLowerCase().includes(searchLower) ||
            pkg.domainName?.toLowerCase().includes(searchLower) ||
            pkg.textDescription?.toLowerCase().includes(searchLower) ||
            pkg.package.category?.name_en?.toLowerCase().includes(searchLower) ||
            pkg.package.subcategory?.name_en?.toLowerCase().includes(searchLower) ||
            pkg.notes?.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .filter(pkg => {
        // Status filter
        if (filters.status === "all") return true;
        return pkg.status === filters.status;
      })
      .filter(pkg => {
        // Date range filter
        if (filters.dateRange === "all") return true;
        
        const pkgDate = new Date(pkg.createdAt);
        const now = new Date();
        
        switch (filters.dateRange) {
          case "today":
            return pkgDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return pkgDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return pkgDate >= monthAgo;
          case "quarter":
            const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            return pkgDate >= quarterAgo;
          case "year":
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            return pkgDate >= yearAgo;
          default:
            return true;
        }
      })
      .sort((a, b) => {
        // Sort functionality
        switch (filters.sortBy) {
          case "newest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "oldest":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case "value":
            return (b.package.price_idr * b.quantity) - (a.package.price_idr * a.quantity);
          case "status":
            return a.status.localeCompare(b.status);
          default:
            return 0;
        }
      });
  }, [packages, filters]);

  const handleOpenWebsite = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenDrive = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Package className="h-5 w-5" />
          My Packages ({filteredPackages.length})
          {softLoading && (
            <div className="flex items-center gap-2 ml-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Refreshing...</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredPackages.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-3 text-foreground">No packages found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {filters.search || filters.status !== "all" || filters.dateRange !== "all" 
                ? "Try adjusting your search or filter criteria to find your packages"
                : "You don't have any packages yet. Purchase a package to get started!"
              }
            </p>
            {(!filters.search && filters.status === "all" && filters.dateRange === "all") && (
              <Link href="/products">
                <Button size="lg" className="gap-2">
                  <Package className="h-4 w-4" />
                  Browse Packages
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPackages.map((pkg, index) => (
              <MyPackageCard
                key={pkg.id}
                package={pkg}
                index={index}
                onViewDetails={onViewDetails}
                onOpenWebsite={handleOpenWebsite}
                onOpenDrive={handleOpenDrive}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
