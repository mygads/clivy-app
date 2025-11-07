import AdminDashboardLayoutClient from '@/components/dashboard/AdminDashboardLayoutClient';
import type { Metadata } from 'next';
import type React from "react"


export const metadata: Metadata = {
  title: 'Admin Dashboard - Clivy',
  description: 'Clivy Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <AdminDashboardLayoutClient>{children}</AdminDashboardLayoutClient>
}
