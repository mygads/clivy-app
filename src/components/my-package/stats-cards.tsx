"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle, AlertCircle, DollarSign, Truck } from "lucide-react";
import { MyPackageStats } from "./types";

interface MyPackageStatsCardsProps {
  stats: MyPackageStats;
  loading?: boolean;
}

export function MyPackageStatsCards({ stats, loading }: MyPackageStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
              <div className="h-3 sm:h-4 w-16 sm:w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 sm:h-4 w-3 sm:w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="p-2 sm:p-3 md:p-4 pt-0">
              <div className="h-6 sm:h-8 w-12 sm:w-16 bg-muted rounded animate-pulse mb-1" />
              <div className="h-2 sm:h-3 w-16 sm:w-20 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border border-border hover:bg-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Packages</CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 sm:p-3 md:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.total}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              All packages owned
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border border-border hover:bg-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 sm:p-3 md:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{stats.delivered}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Ready to use
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border border-border hover:bg-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 sm:p-3 md:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Being prepared
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border border-border hover:bg-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Awaiting Delivery</CardTitle>
            <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 sm:p-3 md:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">{stats.awaiting}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Pending delivery
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border border-border hover:bg-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Domains Expiring</CardTitle>
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 sm:p-3 md:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{stats.domainsExpiringSoon}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
