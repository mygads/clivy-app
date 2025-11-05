"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Package, 
  Calendar, 
  Globe, 
  FolderOpen, 
  FileText, 
  MoreVertical,
  Eye,
  ExternalLink,
  Download,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle
} from "lucide-react";
import Image from "next/image";
import { MyPackage } from "./types";

interface MyPackageCardProps {
  package: MyPackage;
  index: number;
  onViewDetails: (pkg: MyPackage) => void;
  onOpenWebsite: (url: string) => void;
  onOpenDrive: (url: string) => void;
}

export function MyPackageCard({ 
  package: pkg, 
  onViewDetails, 
  onOpenWebsite, 
  onOpenDrive 
}: MyPackageCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "awaiting_delivery":
        return {
          icon: Truck,
          label: "Awaiting Delivery",
          color: "text-orange-600",
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
          badgeVariant: "secondary" as const
        };
      case "in_progress":
        return {
          icon: Clock,
          label: "In Progress",
          color: "text-blue-600",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          badgeVariant: "outline" as const
        };
      case "delivered":
        return {
          icon: CheckCircle,
          label: "Delivered",
          color: "text-green-600",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          badgeVariant: "default" as const
        };
      default:
        return {
          icon: Package,
          label: status,
          color: "text-gray-600",
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          badgeVariant: "outline" as const
        };
    }
  };

  const getDomainExpiryBadge = (expiredAt?: string) => {
    if (!expiredAt) return null;
    
    const now = new Date();
    const expireDate = new Date(expiredAt);
    const daysUntilExpiry = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    } else if (daysUntilExpiry <= 30) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Expires in {daysUntilExpiry} days
        </Badge>
      );
    } else if (daysUntilExpiry <= 90) {
      return (
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Expires in {daysUntilExpiry} days
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  };

  const statusConfig = getStatusConfig(pkg.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      key={pkg.id}
    >
      <Card className="hover:bg-accent/50 transition-colors border border-border/50">
        <CardContent className="pt-6">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {pkg.package.image ? (
                  <Image
                    src={pkg.package.image}
                    alt={pkg.package.name_en}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-lg border border-border"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center border border-border">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg truncate">{pkg.package.name_en}</h3>
                  <Badge variant={statusConfig.badgeVariant} className="text-xs whitespace-nowrap">
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(pkg.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Qty: {pkg.quantity}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(pkg)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {pkg.websiteUrl && (
                  <DropdownMenuItem onClick={() => onOpenWebsite(pkg.websiteUrl!)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Website
                  </DropdownMenuItem>
                )}
                {pkg.driveUrl && (
                  <DropdownMenuItem onClick={() => onOpenDrive(pkg.driveUrl!)}>
                    <Download className="h-4 w-4 mr-2" />
                    Open Drive
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Package Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Website & Domain */}
            <div className="space-y-3">
              {pkg.websiteUrl && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Website URL</p>
                    <a 
                      href={pkg.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate block"
                    >
                      {pkg.websiteUrl}
                    </a>
                  </div>
                </div>
              )}
              
              {pkg.domainName && (
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Domain</p>
                    <p className="text-sm font-medium">{pkg.domainName}</p>
                    {getDomainExpiryBadge(pkg.domainExpiredAt)}
                  </div>
                </div>
              )}
            </div>

            {/* Drive & Documentation */}
            <div className="space-y-3">
              {pkg.driveUrl && (
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-orange-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Drive Access</p>
                    <a 
                      href={pkg.driveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-orange-600 hover:underline truncate block"
                    >
                      View Files
                    </a>
                  </div>
                </div>
              )}

              {pkg.textDescription && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm line-clamp-2">{pkg.textDescription}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Package Info & Value */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Package Value</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(pkg.package.price_idr)}
                </p>
              </div>
              
              {pkg.package.category && (
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium capitalize">
                    {pkg.package.category.name_en?.replace(/_/g, ' ') || 'Unknown Category'}
                  </p>
                </div>
              )}

              {pkg.deliveredAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Delivered At</p>
                  <p className="text-sm font-medium">
                    {formatDate(pkg.deliveredAt)}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => onViewDetails(pkg)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
