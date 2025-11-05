"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  Calendar, 
  Globe, 
  FolderOpen, 
  FileText, 
  DollarSign,
  ExternalLink,
  Download,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle,
  User,
  CreditCard,
  Receipt,
  List,
  Check,
  X
} from "lucide-react";
import Image from "next/image";
import { MyPackage } from "./types";

interface MyPackageDetailModalProps {
  package: MyPackage | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MyPackageDetailModal({ package: pkg, isOpen, onClose }: MyPackageDetailModalProps) {
    if (!pkg) return null;

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
        
        return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit", 
        year: "2-digit"
        }) + " " + date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
        });
    };

const formatPaymentMethod = (method: string) => {
        if (!method) return "";
        
        // Payment method mapping for better display names
        const methodMapping: { [key: string]: string } = {
            // Credit Card
            'VC': 'Visa/Mastercard',
            
            // Virtual Account
            'BC': 'BCA Virtual Account',
            'M2': 'Mandiri Virtual Account', 
            'VA': 'Maybank Virtual Account',
            'I1': 'BNI Virtual Account',
            'B1': 'CIMB Niaga Virtual Account',
            'BT': 'Permata Bank Virtual Account',
            'A1': 'ATM Bersama',
            'AG': 'Bank Artha Graha',
            'NC': 'Bank Neo Commerce',
            'BR': 'BRIVA',
            'S1': 'Bank Sahabat Sampoerna',
            'DM': 'Danamon Virtual Account',
            'BV': 'BSI Virtual Account',

            // Retail
            'FT': 'Pegadaian/ALFA/Pos Indonesia',
            'IR': 'Indomaret',
            
            // E-Wallet
            'OV': 'OVO',
            'SA': 'ShopeePay Apps',
            'LF': 'LinkAja (Fixed Fee)',
            'LA': 'LinkAja (Percentage Fee)', 
            'DA': 'DANA',
            'SL': 'ShopeePay Account Link',
            'OL': 'OVO Account Link',
            'JP': 'Jenius Pay',
            
            // QRIS
            'SP': 'ShopeePay QRIS',
            'NQ': 'Nobu QRIS',
            'GQ': 'Gudang Voucher QRIS',
            'SQ': 'Nusapay QRIS',
            
            // Paylater
            'DN': 'Indodana Paylater',
            'AT': 'ATOME'
        };
        
        // Handle duitku_ prefixed payment methods
        if (method.toLowerCase().startsWith('duitku_')) {
            const duitkuCode = method.substring(7).toUpperCase(); // Remove "duitku_" prefix
            if (methodMapping[duitkuCode]) {
                return methodMapping[duitkuCode];
            }
        }
        
        // Check if it's a mapped payment method code
        if (methodMapping[method.toUpperCase()]) {
            return methodMapping[method.toUpperCase()];
        }
        
        // Handle custom formats like "duitku_bri" -> "Duitku BRI"
        const formatted = method
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => {
                // Uppercase specific words
                if (word.toLowerCase() === 'bri' || 
                        word.toLowerCase() === 'bni' || 
                        word.toLowerCase() === 'bca' || 
                        word.toLowerCase() === 'mandiri' ||
                        word.toLowerCase() === 'atm' ||
                        word.toLowerCase() === 'va' ||
                        word.toLowerCase() === 'qris' ||
                        word.toLowerCase() === 'ovo' ||
                        word.toLowerCase() === 'dana' ||
                        word.toLowerCase() === 'bsi') {
                    return word.toUpperCase();
                }
                // Capitalize first letter for other words
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
        
        return formatted;
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
        case "awaiting_delivery":
            return {
            icon: Truck,
            label: "Awaiting Delivery",
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-900/20"
            };
        case "in_progress":
            return {
            icon: Clock,
            label: "In Progress",
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-900/20"
            };
        case "delivered":
            return {
            icon: CheckCircle,
            label: "Delivered",
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-900/20"
            };
        default:
            return {
            icon: Package,
            label: status,
            color: "text-gray-600",
            bgColor: "bg-gray-50 dark:bg-gray-900/20"
            };
        }
    };

    const getDomainExpiryInfo = (expiredAt?: string) => {
        if (!expiredAt) return null;
        
        const now = new Date();
        const expireDate = new Date(expiredAt);
        const daysUntilExpiry = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
        return {
            status: "expired",
            message: "Domain has expired",
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-900/20"
        };
        } else if (daysUntilExpiry <= 30) {
        return {
            status: "warning", 
            message: `Domain expires in ${daysUntilExpiry} days`,
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-900/20"
        };
        } else if (daysUntilExpiry <= 90) {
        return {
            status: "caution",
            message: `Domain expires in ${daysUntilExpiry} days`, 
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-900/20"
        };
        }
        return {
        status: "active",
        message: `Domain expires in ${daysUntilExpiry} days`,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20"
        };
    };

    const statusConfig = getStatusConfig(pkg.status);
    const StatusIcon = statusConfig.icon;
    const domainInfo = getDomainExpiryInfo(pkg.domainExpiredAt);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-xl p-2 sm:p-3 md:p-6">
            <DialogHeader className="border-b pb-2 sm:pb-3 md:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="flex-shrink-0">
                    {pkg.package.image ? (
                    <Image
                        src={pkg.package.image}
                        alt={pkg.package.name_en}
                        width={80}
                        height={80}
                        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover rounded-lg border border-border"
                    />
                    ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-primary/10 rounded-lg flex items-center justify-center border border-border">
                        <Package className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" />
                    </div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <DialogTitle className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold">{pkg.package.name_en}</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm md:text-base mt-1">
                    Package ID: {pkg.id}
                    </DialogDescription>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                    <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-current text-[10px] sm:text-xs`}>
                        <StatusIcon className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        {statusConfig.label}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                        Qty: {pkg.quantity}
                    </Badge>
                    </div>
                </div>
                </div>
            </div>
            </DialogHeader>

            <div className="space-y-3 sm:space-y-4 md:space-y-6 py-2 sm:py-3 md:py-4">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                <Card>
                <CardContent className="p-2 sm:p-3 md:p-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                    <div className="p-1 sm:p-1.5 md:p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-green-600" />
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Package Value</p>
                        <p className="text-xs sm:text-sm md:text-lg font-semibold">
                        {formatCurrency(pkg.package.price_idr)}
                        </p>
                    </div>
                    </div>
                </CardContent>
                </Card>
                
                <Card>
                <CardContent className="p-2 sm:p-3 md:p-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                    <div className="p-1 sm:p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Purchase Date</p>
                        <p className="text-xs sm:text-sm md:text-base font-semibold">
                        {formatDate(pkg.createdAt)}
                        </p>
                    </div>
                    </div>
                </CardContent>
                </Card>

                {pkg.deliveredAt && (
                <Card>
                    <CardContent className="p-2 sm:p-3 md:p-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                        <div className="p-1 sm:p-1.5 md:p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-green-600" />
                        </div>
                        <div>
                        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Delivered At</p>
                        <p className="text-xs sm:text-sm md:text-base font-semibold">
                            {formatDate(pkg.deliveredAt)}
                        </p>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                )}
            </div>

            {/* Package Information */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center gap-1 sm:gap-2">
                <Package className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground" />
                <h3 className="text-xs sm:text-base md:text-lg font-semibold">Package Information</h3>
                </div>
                
                <Card className="border border-border/50">
                <CardContent className="p-2 sm:p-3 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 md:gap-6">
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <div>
                        <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Package Name</label>
                        <p className="text-xs sm:text-sm md:text-base font-semibold mt-0.5 sm:mt-1">{pkg.package.name_en}</p>
                        </div>
                        
                        {pkg.package.category && (
                        <div>
                            <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Category</label>
                            <p className="text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1 capitalize">{pkg.package.category.name_en?.replace(/_/g, ' ') || 'Unknown Category'}</p>
                        </div>
                        )}

                        {pkg.package.subcategory && (
                        <div>
                            <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Subcategory</label>
                            <p className="text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1 capitalize">{pkg.package.subcategory.name_en?.replace(/_/g, ' ') || 'Unknown Subcategory'}</p>
                        </div>
                        )}
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <div>
                        <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Quantity</label>
                        <p className="text-xs sm:text-sm md:text-base font-semibold mt-0.5 sm:mt-1">{pkg.quantity} unit(s)</p>
                        </div>
                        
                        <div>
                        <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Total Value</label>
                        <p className="text-sm sm:text-base md:text-lg font-bold text-green-600 mt-0.5 sm:mt-1">
                            {formatCurrency(pkg.package.price_idr * pkg.quantity)}
                        </p>
                        </div>
                    </div>
                    </div>

                    {pkg.package.description_en && (
                    <>
                        <Separator className="my-3 sm:my-4 md:my-6" />
                        <div>
                        <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Description</label>
                        <p className="text-[10px] sm:text-xs md:text-base mt-1 sm:mt-2 leading-relaxed">{pkg.package.description_en}</p>
                        </div>
                    </>
                    )}

                    {pkg.package.features && pkg.package.features.length > 0 && (
                    <>
                        <Separator className="my-3 sm:my-4 md:my-6" />
                        <div>
                        <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Package Features</label>
                        <div className="mt-2 sm:mt-3 grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-2">
                            {pkg.package.features.map((feature, index) => (
                            <div 
                                key={feature.id || index} 
                                className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-lg bg-muted/30"
                            >
                                {feature.included ? (
                                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
                                ) : (
                                <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-red-500 flex-shrink-0" />
                                )}
                                <span className={`text-[10px] sm:text-xs md:text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                                {feature.name_en}
                                </span>
                            </div>
                            ))}
                        </div>
                        </div>
                    </>
                    )}
                </CardContent>
                </Card>
            </div>

            {/* Delivery Information */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center gap-1 sm:gap-2">
                <Truck className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground" />
                <h3 className="text-xs sm:text-base md:text-lg font-semibold">Delivery Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                {/* Website Information */}
                {pkg.websiteUrl && (
                    <Card className="border border-border/50">
                    <CardContent className="p-2 sm:p-3 md:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1 sm:p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Website URL</label>
                            <a 
                            href={pkg.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline block mt-0.5 sm:mt-1 break-all text-[10px] sm:text-xs md:text-sm"
                            >
                            {pkg.websiteUrl}
                            </a>
                            <Button
                            size="sm"
                            variant="outline"
                            className="mt-1 sm:mt-2 gap-1 sm:gap-2 h-6 sm:h-7 md:h-8 text-[9px] sm:text-xs md:text-sm px-2 sm:px-3"
                            onClick={() => window.open(pkg.websiteUrl, '_blank')}
                            >
                            <ExternalLink className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />
                            Open Website
                            </Button>
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                )}

                {/* Drive Information */}
                {pkg.driveUrl && (
                    <Card className="border border-border/50">
                    <CardContent className="p-2 sm:p-3 md:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1 sm:p-1.5 md:p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                            <FolderOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Drive Access</label>
                            <p className="text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-1 text-muted-foreground">Access your project files and resources</p>
                            <Button
                            size="sm"
                            variant="outline"
                            className="mt-1 sm:mt-2 gap-1 sm:gap-2 h-6 sm:h-7 md:h-8 text-[9px] sm:text-xs md:text-sm px-2 sm:px-3"
                            onClick={() => window.open(pkg.driveUrl, '_blank')}
                            >
                            <Download className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />
                            Open Drive
                            </Button>
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                )}
                </div>

                {/* Domain Information */}
                {pkg.domainName && (
                <Card className="border border-border/50">
                    <CardContent className="p-2 sm:p-3 md:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1 sm:p-1.5 md:p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                        <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Domain Information</label>
                        <p className="text-xs sm:text-sm md:text-lg font-semibold mt-0.5 sm:mt-1">{pkg.domainName}</p>
                        {pkg.domainExpiredAt && (
                            <div className="mt-1 sm:mt-2">
                            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                                Expires: {formatDate(pkg.domainExpiredAt)}
                            </p>
                            {domainInfo && (
                                <div className={`inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs mt-0.5 sm:mt-1 ${domainInfo.bgColor} ${domainInfo.color}`}>
                                {domainInfo.status === 'expired' && <AlertTriangle className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />}
                                {domainInfo.status === 'warning' && <AlertTriangle className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />}
                                {domainInfo.status === 'caution' && <Clock className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />}
                                {domainInfo.status === 'active' && <CheckCircle className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />}
                                {domainInfo.message}
                                </div>
                            )}
                            </div>
                        )}
                        </div>
                    </div>
                    </CardContent>
                </Card>
                )}

                {/* Text Description */}
                {pkg.textDescription && (
                <Card className="border border-border/50">
                    <CardContent className="p-2 sm:p-3 md:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1 sm:p-1.5 md:p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                        <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Project Description</label>
                        <p className="text-[10px] sm:text-xs md:text-base mt-1 sm:mt-2 leading-relaxed">{pkg.textDescription}</p>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                )}
            </div>

            {/* Transaction Information */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center gap-1 sm:gap-2">
                <Receipt className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground" />
                <h3 className="text-xs sm:text-base md:text-lg font-semibold">Transaction Details</h3>
                </div>
                
                <Card className="border border-border/50">
                <CardContent className="p-2 sm:p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <div>
                        <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Transaction ID</label>
                        <p className="text-xs sm:text-sm md:text-base font-mono mt-0.5 sm:mt-1">#{pkg.transactionId}</p>
                        </div>
                        
                        <div>
                        <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Transaction Status</label>
                        <p className="text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1 capitalize">{pkg.transaction.status.replace(/_/g, ' ')}</p>
                        </div>

                        <div>
                        <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Transaction Date</label>
                        <p className="text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1">{formatDate(pkg.transaction.transactionDate)}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <div>
                        <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Total Amount</label>
                        <p className="text-sm sm:text-base md:text-lg font-bold text-green-600 mt-0.5 sm:mt-1">
                            {formatCurrency(pkg.transaction.finalAmount || pkg.transaction.amount)}
                        </p>
                        </div>
                        
                        <div>
                        <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Currency</label>
                        <p className="text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1">{pkg.transaction.currency.toUpperCase()}</p>
                        </div>

                        {pkg.transaction.payment && (
                        <div>
                            <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Payment Method</label>
                            <p className="text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1">{formatPaymentMethod(pkg.transaction.payment.method)}</p>
                        </div>
                        )}
                    </div>
                    </div>
                </CardContent>
                </Card>
            </div>

            {/* Notes Section */}
            {pkg.notes && (
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center gap-1 sm:gap-2">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground" />
                    <h3 className="text-xs sm:text-base md:text-lg font-semibold">Additional Notes</h3>
                </div>
                
                <Card className="border border-border/50">
                    <CardContent className="p-2 sm:p-3 md:p-4">
                    <p className="text-[10px] sm:text-xs md:text-base leading-relaxed">{pkg.notes}</p>
                    </CardContent>
                </Card>
                </div>
            )}
            </div>
        </DialogContent>
        </Dialog>
    );
}
