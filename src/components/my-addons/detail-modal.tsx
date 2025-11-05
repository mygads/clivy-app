"use client";

import { MyAddon } from "./types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X,
  Package,
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  Copy,
  Receipt
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Image from "next/image";

interface MyAddonDetailModalProps {
  addon: MyAddon | null;
  open: boolean;
  onClose: () => void;
}

export function MyAddonDetailModal({ addon, open, onClose }: MyAddonDetailModalProps) {
  if (!addon) return null;

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
      return format(new Date(dateString), "EEEE, MMMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, MMMM dd, yyyy 'at' HH:mm:ss");
    } catch {
      return "Invalid date";
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 text-[9px] sm:text-xs px-1 sm:px-2 py-0.5">
            <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 sm:mr-1 md:mr-2" />
            Complete
          </Badge>
        );
      case 'inprogress':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 text-[9px] sm:text-xs px-1 sm:px-2 py-0.5">
            <Truck className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 sm:mr-1 md:mr-2" />
            In Progress
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800 text-[9px] sm:text-xs px-1 sm:px-2 py-0.5">
            <Clock className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 sm:mr-1 md:mr-2" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800 text-[9px] sm:text-xs px-1 sm:px-2 py-0.5">
            <AlertCircle className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 sm:mr-1 md:mr-2" />
            Unknown
          </Badge>
        );
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-hidden p-2 sm:p-4 md:p-6">
        <DialogHeader className="border-b pb-2 sm:pb-3 md:pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="flex-shrink-0">
                {addon.addon.image ? (
                  <Image
                    src={addon.addon.image}
                    alt={addon.addon.name_en}
                    width={80}
                    height={80}
                    className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 object-cover rounded-lg border border-border"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 bg-primary/10 rounded-lg flex items-center justify-center border border-border">
                    <Package className="h-5 w-5 sm:h-7 sm:w-7 md:h-10 md:w-10 text-primary" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-sm sm:text-lg md:text-2xl font-bold truncate">{addon.addon.name_en}</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1">
                  Addon ID: {addon.addon.id}
                </DialogDescription>
                <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 flex-wrap">
                  {getStatusBadge(addon.status)}
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1 sm:px-2 py-0.5">
                    Qty: {addon.quantity}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-2 sm:pr-3 md:pr-4">
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Addon Information */}
            <Card>
              <CardHeader className="pb-2 sm:pb-3 md:pb-4">
                <CardTitle className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base md:text-lg">
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  <span>Addon Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 md:space-y-4 p-2 sm:p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Addon Name</label>
                      <p className="text-xs sm:text-sm md:text-sm font-medium">{addon.addon.name_en}</p>
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Addon ID</label>
                      <p className="text-xs sm:text-sm md:text-sm font-mono text-muted-foreground">{addon.addon.id}</p>
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Category</label>
                      <p className="text-xs sm:text-sm md:text-sm">{addon.addon.category.name_en}</p>
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Description</label>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{addon.addon.description_en}</p>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Quantity</label>
                      <p className="text-xs sm:text-sm md:text-sm font-medium">{addon.quantity}</p>
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Unit Price</label>
                      <p className="text-xs sm:text-sm md:text-sm font-medium">{formatCurrency(addon.addon.price)}</p>
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Total Amount</label>
                      <p className="text-sm sm:text-base md:text-lg font-bold text-primary">{formatCurrency(addon.totalPrice)}</p>
                    </div>
                  </div>
                </div>

                {addon.driveUrl && (
                  <>
                    <Separator className="my-2 sm:my-3 md:my-4" />
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Download Assets</label>
                      <div className="mt-1 sm:mt-2">
                        <Button
                          variant="default"
                          onClick={() => window.open(addon.driveUrl!, '_blank')}
                          className="w-full md:w-auto h-7 sm:h-8 md:h-9 text-xs sm:text-sm px-2 sm:px-3"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Download from Drive
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Transaction Information */}
            <Card>
              <CardHeader className="pb-2 sm:pb-3 md:pb-4">
                <CardTitle className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base md:text-lg">
                  <Receipt className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  <span>Transaction Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Transaction ID</label>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <p className="text-[10px] sm:text-xs md:text-sm font-mono break-all">{addon.transactionId}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(addon.transactionId, "Transaction ID")}
                          className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 p-0 flex-shrink-0"
                        >
                          <Copy className="h-2 w-2 sm:h-3 sm:w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Transaction Date</label>
                      <p className="text-[10px] sm:text-xs md:text-sm">{formatDate(addon.transaction.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Payment Method</label>
                      <p className="text-[10px] sm:text-xs md:text-sm">{formatPaymentMethod(addon.transaction.paymentMethod)}</p>
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Transaction Status</label>
                      <p className="text-[10px] sm:text-xs md:text-sm">{addon.transaction.status}</p>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Total Transaction Amount</label>
                      <p className="text-sm sm:text-base md:text-lg font-bold">{formatCurrency(addon.transaction.totalAmount)}</p>
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-[10px] sm:text-xs md:text-sm">{formatDateTime(addon.transaction.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader className="pb-2 sm:pb-3 md:pb-4">
                <CardTitle className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base md:text-lg">
                  <Truck className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  <span>Delivery Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Delivery Status</label>
                      <div className="mt-0.5 sm:mt-1">
                        {getStatusBadge(addon.status)}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Ordered At</label>
                      <p className="text-[10px] sm:text-xs md:text-sm">{formatDateTime(addon.createdAt)}</p>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {addon.deliveredAt ? (
                      <div>
                        <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Delivered At</label>
                        <p className="text-[10px] sm:text-xs md:text-sm font-medium text-green-600">
                          {formatDateTime(addon.deliveredAt)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Delivery Status</label>
                        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                          {addon.status === 'pending' ? 'Waiting for processing' : 
                           addon.status === 'inprogress' ? 'Currently being prepared' : 
                           'Processing...'}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-[10px] sm:text-xs md:text-sm">{formatDateTime(addon.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {addon.status !== 'complete' && (
                  <div className="bg-muted/50 rounded-lg p-2 sm:p-3 md:p-4 mt-2 sm:mt-3 md:mt-4">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="text-[10px] sm:text-xs md:text-sm font-medium">Delivery Timeline</h4>
                        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                          {addon.status === 'pending' 
                            ? 'Your addon is in the queue for processing. Our team will start working on it soon.'
                            : addon.status === 'inprogress' 
                            ? 'Your addon is currently being prepared by our team. You will receive notification once completed.'
                            : 'Your addon is being processed. Please wait for updates.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-between">
          <div className="flex items-center space-x-2">
            {addon.driveUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(addon.driveUrl!, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Drive
              </Button>
            )}
          </div>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
