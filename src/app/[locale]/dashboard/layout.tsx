import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient';
import type { Metadata } from 'next';
import type React from "react"


export const metadata: Metadata = {
  title: 'Dashboard - Clivy',
  description: 'Manage your Clivy services and account',
  robots: {
    index: false,
    follow: false,
  },
};

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
