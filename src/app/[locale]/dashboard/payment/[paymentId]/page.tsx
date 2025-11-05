"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import Link from "next/link"
import PaymentStatus from "@/components/payment/PaymentStatus"

export default function PaymentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const paymentId = params.paymentId as string
  
  const [paymentStatusData, setPaymentStatusData] = useState<string>('pending')

  const handleStatusChange = (newStatus: string) => {
    setPaymentStatusData(newStatus)
    
    // Redirect to success page if payment becomes successful
    if (newStatus === 'paid') {
      setTimeout(() => {
        router.push('/payment/success')
      }, 2000)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-background">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/payment">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payment Details</h1>
          <p className="text-muted-foreground">Payment ID: {paymentId}</p>
        </div>
      </div>

      {/* Payment Status Component */}
      <PaymentStatus
        paymentId={paymentId}
        onStatusChange={handleStatusChange}
        autoRefresh={paymentStatusData === 'pending'}
        refreshInterval={30000}
      />
    </div>
  )
}
