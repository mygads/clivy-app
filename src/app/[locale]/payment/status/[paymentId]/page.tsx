import { Suspense } from 'react'
import PaymentStatusPage from '@/components/payment/PaymentStatusPage'

interface PaymentStatusRouteProps {
  params: Promise<{
    paymentId: string
  }>
}

export default async function PaymentStatusRoute({ params }: PaymentStatusRouteProps) {
  const resolvedParams = await params
  
  return (
    <div className="container mx-auto py-24">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading payment status...</p>
          </div>
        </div>
      }>
        <PaymentStatusPage paymentId={resolvedParams.paymentId} />
      </Suspense>
    </div>
  )
}

export async function generateMetadata({ params }: PaymentStatusRouteProps) {
  const resolvedParams = await params
  
  return {
    title: `Payment Status - ${resolvedParams.paymentId}`,
    description: 'Check your payment status and progress',
    robots: 'noindex, nofollow'
  }
}
