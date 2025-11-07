"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  CreditCard, 
  RefreshCw, 
  Settings, 
  CheckCircle, 
  XCircle,
  Download,
  AlertTriangle,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import DuitkuSync from '@/components/admin/payment-methods/DuitkuSync'
import { SessionManager } from '@/lib/storage'

interface PaymentMethod {
  id: string
  code: string
  name: string
  description?: string
  type: string
  gatewayProvider?: string | null
  gatewayCode?: string | null
  isGatewayMethod?: boolean
  isActive: boolean
  isSystem?: boolean
  createdAt: string
  updatedAt: string
  // Service Fee Fields
  feeType?: string
  feeValue?: number
  minFee?: number
  maxFee?: number
  requiresManualApproval?: boolean
  paymentInstructions?: string
  instructionType?: string
  instructionImageUrl?: string
  bankDetailId?: string
  bankDetail?: {
    id: string
    bankName: string
    accountNumber: string
    accountName: string
    swiftCode?: string
  }
}

interface PaymentMethodStats {
  total: number
  active: number
  gateway: number
  manual: number
}

interface BankDetail {
  id: string
  bankName: string
  accountNumber: string
  accountName: string
  swiftCode?: string
}

interface ManualPaymentForm {
  name: string
  code: string
  description: string
  feeType: 'fixed' | 'percentage'
  feeValue: string
  minFee: string
  maxFee: string
  bankDetailId: string
  paymentInstructions: string
  instructionType: 'text' | 'image' | 'both'
  instructionImageUrl: string
}

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [stats, setStats] = useState<PaymentMethodStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingMethod, setUpdatingMethod] = useState<string | null>(null)
  
  // Duitku sync state
  const [syncingDuitku, setSyncingDuitku] = useState(false)
  
  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null)
  const [deletingMethod, setDeletingMethod] = useState(false)
  
  // Manual payment method dialog state
  const [showManualDialog, setShowManualDialog] = useState(false)
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([])
  const [creatingManual, setCreatingManual] = useState(false)
  const [manualForm, setManualForm] = useState<ManualPaymentForm>({
    name: '',
    code: '',
    description: '',
    feeType: 'fixed',
    feeValue: '0',
    minFee: '0',
    maxFee: '0',
    bankDetailId: 'none',
    paymentInstructions: '',
    instructionType: 'text',
    instructionImageUrl: ''
  })

  // Edit payment method dialog state
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [editForm, setEditForm] = useState<ManualPaymentForm>({
    name: '',
    code: '',
    description: '',
    feeType: 'fixed',
    feeValue: '0',
    minFee: '0',
    maxFee: '0',
    bankDetailId: '',
    paymentInstructions: '',
    instructionType: 'text',
    instructionImageUrl: ''
  })

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    setLoading(true)
    try {
      const token = SessionManager.getToken()
      
      const response = await fetch('/api/admin/payment-methods', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payment methods')
      }

      if (data.success) {
        const paymentMethods = data.data || []
        setPaymentMethods(paymentMethods)
        
        // Calculate stats safely with fallbacks
        const total = paymentMethods.length
        const active = paymentMethods.filter((pm: PaymentMethod) => pm.isActive).length
        const gateway = paymentMethods.filter((pm: PaymentMethod) => 
          pm.isGatewayMethod === true || pm.gatewayProvider !== null
        ).length
        const manual = total - gateway
        
        setStats({ total, active, gateway, manual })
      } else {
        // Set empty data if API returns unsuccessful response
        setPaymentMethods([])
        setStats({ total: 0, active: 0, gateway: 0, manual: 0 })
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load payment methods')
      
      // Set empty state on error
      setPaymentMethods([])
      setStats({ total: 0, active: 0, gateway: 0, manual: 0 })
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch bank details for manual payment method
  const fetchBankDetails = useCallback(async () => {
    try {
      const token = SessionManager.getToken()
      const response = await fetch('/api/admin/bank-details', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      if (data.success) {
        setBankDetails(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching bank details:', error)
      toast.error('Failed to load bank details')
    }
  }, [])

  // Create manual payment method
  const createManualPaymentMethod = async () => {
    if (!manualForm.name || !manualForm.code || !manualForm.feeValue) {
      toast.error('Please fill in all required fields')
      return
    }

    setCreatingManual(true)
    try {
      const token = SessionManager.getToken()
      
      const payload = {
        name: manualForm.name,
        code: manualForm.code,
        description: manualForm.description,
        type: 'bank_transfer',
        isGatewayMethod: false,
        isActive: true,
        bankDetailId: manualForm.bankDetailId === 'none' ? null : manualForm.bankDetailId || null,
        feeType: manualForm.feeType,
        feeValue: parseFloat(manualForm.feeValue),
        minFee: manualForm.minFee ? parseFloat(manualForm.minFee) : null,
        maxFee: manualForm.maxFee ? parseFloat(manualForm.maxFee) : null,
        requiresManualApproval: true,
        paymentInstructions: manualForm.paymentInstructions,
        instructionType: manualForm.instructionType,
        instructionImageUrl: manualForm.instructionImageUrl
      }

      const response = await fetch('/api/admin/payment-methods', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment method')
      }

      if (data.success) {
        toast.success('Manual payment method created successfully')
        setShowManualDialog(false)
        setManualForm({
          name: '',
          code: '',
          description: '',
          feeType: 'fixed',
          feeValue: '0',
          minFee: '0',
          maxFee: '0',
          bankDetailId: 'none',
          paymentInstructions: '',
          instructionType: 'text',
          instructionImageUrl: ''
        })
        fetchPaymentMethods()
      }
    } catch (error) {
      console.error('Error creating manual payment method:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create payment method')
    } finally {
      setCreatingManual(false)
    }
  }

  // Open edit dialog
  const openEditDialog = (method: PaymentMethod) => {
    setEditingMethod(method)
    setEditForm({
      name: method.name,
      code: method.code,
      description: method.description || '',
      feeType: method.feeType as 'fixed' | 'percentage' || 'fixed',
      feeValue: method.feeValue?.toString() || '0',
      minFee: method.minFee?.toString() || '0',
      maxFee: method.maxFee?.toString() || '0',
      bankDetailId: method.bankDetailId || 'none',
      paymentInstructions: method.paymentInstructions || '',
      instructionType: method.instructionType as 'text' | 'image' | 'both' || 'text',
      instructionImageUrl: method.instructionImageUrl || ''
    })
    setShowEditDialog(true)
    fetchBankDetails()
  }

  // Update payment method
  const updatePaymentMethod = async () => {
    if (!editingMethod || !editForm.name || !editForm.code) {
      toast.error('Please fill in all required fields')
      return
    }

    setCreatingManual(true)
    try {
      const token = SessionManager.getToken()
      
      const payload = {
        name: editForm.name,
        code: editForm.code,
        description: editForm.description,
        feeType: editForm.feeType,
        feeValue: parseFloat(editForm.feeValue),
        minFee: editForm.minFee ? parseFloat(editForm.minFee) : null,
        maxFee: editForm.maxFee ? parseFloat(editForm.maxFee) : null,
        bankDetailId: editForm.bankDetailId === 'none' ? null : editForm.bankDetailId || null,
        paymentInstructions: editForm.paymentInstructions,
        instructionType: editForm.instructionType,
        instructionImageUrl: editForm.instructionImageUrl
      }

      const response = await fetch(`/api/admin/payment-methods/${editingMethod.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update payment method')
      }

      if (data.success) {
        toast.success('Payment method updated successfully')
        setShowEditDialog(false)
        setEditingMethod(null)
        fetchPaymentMethods()
      }
    } catch (error) {
      console.error('Error updating payment method:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update payment method')
    } finally {
      setCreatingManual(false)
    }
  }

  // Delete payment method
  const deletePaymentMethod = async (methodId: string) => {
    setDeletingMethod(true)
    try {
      const token = SessionManager.getToken()
      
      const response = await fetch(`/api/admin/payment-methods/${methodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete payment method')
      }

      if (data.success) {
        const deletedMethod = paymentMethods.find(method => method.id === methodId)
        const methodType = deletedMethod?.isGatewayMethod ? 'Duitku payment method' : 'payment method'
        
        toast.success(`${methodType} deleted successfully`)
        
        // Soft reload - update state without loading
        setPaymentMethods(prev => prev.filter(method => method.id !== methodId))
        setStats(prev => prev ? {
          ...prev,
          total: prev.total - 1,
          gateway: deletedMethod?.isGatewayMethod ? prev.gateway - 1 : prev.gateway,
          manual: deletedMethod?.isGatewayMethod ? prev.manual : prev.manual - 1,
          active: deletedMethod?.isActive ? prev.active - 1 : prev.active
        } : null)
        
        setShowDeleteDialog(false)
        setMethodToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting payment method:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete payment method')
    } finally {
      setDeletingMethod(false)
    }
  }

  // Show delete confirmation dialog
  const showDeleteConfirmation = (method: PaymentMethod) => {
    // Check if payment method can be deleted - same rules for both manual and gateway methods
    if (method.isActive && method.feeType && method.feeValue !== null && method.feeValue !== undefined) {
      const methodType = method.isGatewayMethod ? 'Duitku payment method' : 'payment method'
      toast.error(
        `Cannot delete "${method.name}"`,
        { 
          description: `This ${methodType} is active with fee configuration. Please deactivate it first to prevent disruption to ongoing transactions.`,
          duration: 6000 
        }
      )
      return
    }

    // Check if method is active (regardless of fee configuration)
    if (method.isActive) {
      const methodType = method.isGatewayMethod ? 'Duitku payment method' : 'payment method'
      toast.error(
        `Cannot delete "${method.name}"`,
        { 
          description: `This ${methodType} is currently active. Please deactivate it first before deletion.`,
          duration: 6000 
        }
      )
      return
    }

    if (method.isSystem) {
      toast.error(
        `Cannot delete "${method.name}"`,
        { 
          description: "This is a system-generated payment method. Please deactivate the related bank detail instead.",
          duration: 6000 
        }
      )
      return
    }

    // Info message for gateway methods (only when they can actually be deleted - inactive)
    if (method.isGatewayMethod) {
      toast.info(
        `Deleting Duitku method "${method.name}"`,
        { 
          description: "This will remove the payment method from your available options. You can re-sync from Duitku API later if needed.",
          duration: 4000 
        }
      )
    }

    setMethodToDelete(method)
    setShowDeleteDialog(true)
  }

  // Toggle payment method active status
  const togglePaymentMethod = async (methodId: string, isActive: boolean) => {
    setUpdatingMethod(methodId)
    try {
      const token = SessionManager.getToken()
      
      const response = await fetch(`/api/admin/payment-methods/${methodId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update payment method')
      }

      if (data.success) {
        toast.success(`Payment method ${isActive ? 'enabled' : 'disabled'} successfully`)
        
        // Soft reload - update state without loading
        setPaymentMethods(prev => prev.map(method => 
          method.id === methodId ? { ...method, isActive } : method
        ))
        setStats(prev => prev ? {
          ...prev,
          active: prev.active + (isActive ? 1 : -1)
        } : null)
      }
    } catch (error) {
      console.error('Error updating payment method:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update payment method')
    } finally {
      setUpdatingMethod(null)
    }
  }

  // Method type badge
  const MethodTypeBadge = ({ type, isGateway }: { type: string, isGateway: boolean }) => {
    const typeColors = {
      virtual_account: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      e_wallet: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      credit_card: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      qr_code: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      retail: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      atm: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      bank_transfer: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }

    const color = typeColors[type as keyof typeof typeColors] || typeColors.bank_transfer

    return (
      <div className="flex flex-col gap-1">
        <Badge className={color}>
          {type.replace('_', ' ').toUpperCase()}
        </Badge>
        <Badge variant={isGateway ? "default" : "secondary"} className="text-xs">
          {isGateway ? 'Gateway' : 'Manual'}
        </Badge>
      </div>
    )
  }

  // Provider badge
  const ProviderBadge = ({ provider }: { provider?: string }) => {
    if (!provider) return <span className="text-muted-foreground">Manual</span>
    
    const providerColors = {
      duitku: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      midtrans: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      xendit: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    }
    
    const color = providerColors[provider as keyof typeof providerColors] || 'bg-gray-100 text-gray-800'
    
    return (
      <Badge className={color}>
        {provider.toUpperCase()}
      </Badge>
    )
  }

  useEffect(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading payment methods...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Methods</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage available payment methods and gateway integrations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setShowManualDialog(true)
              fetchBankDetails()
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Manual Payment
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPaymentMethods}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Methods</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Payment methods configured</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Methods</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Available for customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gateway Methods</CardTitle>
              <Settings className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.gateway}</div>
              <p className="text-xs text-muted-foreground">Automated processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manual Methods</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.manual}</div>
              <p className="text-xs text-muted-foreground">Requires approval</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Duitku Payment Methods Sync */}
      <DuitkuSync key={`duitku-sync-${paymentMethods.length}`} />

      {/* Payment Methods Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage all payment methods including manual methods and Duitku gateway methods. 
            Payment methods must be deactivated before they can be deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Service Fee</TableHead>
                  <TableHead>Gateway Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No payment methods found
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentMethods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{method.name}</div>
                            {method.isGatewayMethod && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
                                Duitku
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {method.description || method.code}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <MethodTypeBadge 
                          type={method.type} 
                          isGateway={method.isGatewayMethod || false} 
                        />
                      </TableCell>
                      
                      <TableCell>
                        <ProviderBadge provider={method.gatewayProvider || undefined} />
                      </TableCell>
                      
                      <TableCell>
                        {method.feeType && method.feeValue ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {method.feeType === 'percentage' 
                                ? `${method.feeValue}%` 
                                : `IDR ${method.feeValue}`
                              }
                            </div>
                            {method.feeType === 'percentage' && (method.minFee || method.maxFee) && (
                              <div className="text-xs text-muted-foreground">
                                {method.minFee && `Min: ${method.minFee}`}
                                {method.minFee && method.maxFee && ' | '}
                                {method.maxFee && `Max: ${method.maxFee}`}
                              </div>
                            )}
                            {method.requiresManualApproval && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                Manual Approval
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No fee configured</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {method.gatewayCode ? (
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {method.gatewayCode}
                          </code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={method.isActive}
                            onCheckedChange={(checked) => togglePaymentMethod(method.id, checked)}
                            disabled={updatingMethod === method.id}
                          />
                          {updatingMethod === method.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <div className="flex flex-col gap-1">
                              <Badge variant={method.isActive ? "default" : "secondary"}>
                                {method.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {method.isSystem && (
                                <Badge variant="outline" className="text-xs">
                                  System
                                </Badge>
                              )}
                              {method.isActive && (
                                <Badge variant="outline" className="text-xs text-amber-600">
                                  Cannot Delete
                                </Badge>
                              )}
                              {method.feeType && method.feeValue && (
                                <Badge variant="outline" className="text-xs text-blue-600">
                                  Has Fees
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(method)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          
                          {/* Delete button - allow for both manual and gateway methods, but with same validation */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => showDeleteConfirmation(method)}
                            disabled={method.isSystem}
                            className={`
                              ${method.isSystem 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : method.isActive
                                  ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                                  : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                              }
                            `}
                            title={
                              method.isSystem 
                                ? 'Cannot delete system-generated payment methods'
                                : method.isActive
                                  ? `This ${method.isGatewayMethod ? 'Duitku ' : ''}payment method is active. Deactivate first.`
                                  : method.isGatewayMethod
                                    ? 'Delete this Duitku payment method'
                                    : 'Delete this payment method'
                            }
                          >
                            {method.isSystem ? (
                              <XCircle className="h-4 w-4" />
                            ) : method.isActive ? (
                              <AlertTriangle className="h-4 w-4" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Manual Payment Method Dialog */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Manual Payment Method</DialogTitle>
            <DialogDescription>
              Create a manual bank transfer payment method that requires admin approval.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Payment Method Name</Label>
                <Input
                  id="name"
                  value={manualForm.name}
                  onChange={(e) => setManualForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Bank Transfer BCA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Payment Method Code</Label>
                <Input
                  id="code"
                  value={manualForm.code}
                  onChange={(e) => setManualForm(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') }))}
                  placeholder="e.g., BANK_TRANSFER_BCA"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={manualForm.description}
                onChange={(e) => setManualForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankDetail">Bank Detail</Label>
                <Select
                  value={manualForm.bankDetailId}
                  onValueChange={(value) => setManualForm(prev => ({ ...prev, bankDetailId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank detail" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No bank detail</SelectItem>
                    {bankDetails.map(bank => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.bankName} - {bank.accountNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feeType">Fee Type</Label>
                <Select
                  value={manualForm.feeType}
                  onValueChange={(value: 'fixed' | 'percentage') => setManualForm(prev => ({ ...prev, feeType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeValue">
                  Fee Value {manualForm.feeType === 'percentage' ? '(%)' : '(IDR)'}
                </Label>
                <Input
                  id="feeValue"
                  type="number"
                  value={manualForm.feeValue}
                  onChange={(e) => setManualForm(prev => ({ ...prev, feeValue: e.target.value }))}
                  placeholder="0"
                  min="0"
                  step={manualForm.feeType === 'percentage' ? '0.01' : '1'}
                />
              </div>
            </div>

            {manualForm.feeType === 'percentage' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minFee">Min Fee (IDR)</Label>
                  <Input
                    id="minFee"
                    type="number"
                    value={manualForm.minFee}
                    onChange={(e) => setManualForm(prev => ({ ...prev, minFee: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFee">Max Fee (IDR)</Label>
                  <Input
                    id="maxFee"
                    type="number"
                    value={manualForm.maxFee}
                    onChange={(e) => setManualForm(prev => ({ ...prev, maxFee: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instructionType">Instruction Type</Label>
                <Select
                  value={manualForm.instructionType}
                  onValueChange={(value: 'text' | 'image' | 'both') => setManualForm(prev => ({ ...prev, instructionType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Only</SelectItem>
                    <SelectItem value="image">Image Only</SelectItem>
                    <SelectItem value="both">Text + Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(manualForm.instructionType === 'text' || manualForm.instructionType === 'both') && (
                <div className="space-y-2">
                  <Label htmlFor="instructions">Payment Instructions (Text)</Label>
                  <Textarea
                    id="instructions"
                    value={manualForm.paymentInstructions}
                    onChange={(e) => setManualForm(prev => ({ ...prev, paymentInstructions: e.target.value }))}
                    placeholder="Instructions for customers on how to make payment..."
                    rows={3}
                  />
                </div>
              )}

              {(manualForm.instructionType === 'image' || manualForm.instructionType === 'both') && (
                <div className="space-y-2">
                  <Label htmlFor="instructionImage">Payment Instructions (Image)</Label>
                  <Input
                    id="instructionImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // TODO: Upload file and get URL
                        console.log('File selected:', file)
                        // For now, just store the file name as placeholder
                        setManualForm(prev => ({ ...prev, instructionImageUrl: file.name }))
                      }
                    }}
                  />
                  {manualForm.instructionImageUrl && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {manualForm.instructionImageUrl}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowManualDialog(false)}
              disabled={creatingManual}
            >
              Cancel
            </Button>
            <Button
              onClick={createManualPaymentMethod}
              disabled={creatingManual}
            >
              {creatingManual && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Method Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>
              Update payment method settings and service fee configuration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Payment Method Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Bank Transfer BCA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Payment Method Code</Label>
                <Input
                  id="edit-code"
                  value={editForm.code}
                  onChange={(e) => setEditForm(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') }))}
                  placeholder="e.g., BANK_TRANSFER_BCA"
                  disabled={editingMethod?.isGatewayMethod}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            {!editingMethod?.isGatewayMethod && (
              <div className="space-y-2">
                <Label htmlFor="edit-bankDetail">Bank Detail</Label>
                <Select
                  value={editForm.bankDetailId}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, bankDetailId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank detail" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No bank detail</SelectItem>
                    {bankDetails.map(bank => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.bankName} - {bank.accountNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-feeType">Fee Type</Label>
                <Select
                  value={editForm.feeType}
                  onValueChange={(value: 'fixed' | 'percentage') => setEditForm(prev => ({ ...prev, feeType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-feeValue">
                  Fee Value {editForm.feeType === 'percentage' ? '(%)' : '(IDR)'}
                </Label>
                <Input
                  id="edit-feeValue"
                  type="number"
                  value={editForm.feeValue}
                  onChange={(e) => setEditForm(prev => ({ ...prev, feeValue: e.target.value }))}
                  placeholder="0"
                  min="0"
                  step={editForm.feeType === 'percentage' ? '0.01' : '1'}
                />
              </div>
            </div>

            {editForm.feeType === 'percentage' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-minFee">Min Fee (IDR)</Label>
                  <Input
                    id="edit-minFee"
                    type="number"
                    value={editForm.minFee}
                    onChange={(e) => setEditForm(prev => ({ ...prev, minFee: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maxFee">Max Fee (IDR)</Label>
                  <Input
                    id="edit-maxFee"
                    type="number"
                    value={editForm.maxFee}
                    onChange={(e) => setEditForm(prev => ({ ...prev, maxFee: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-instructionType">Instruction Type</Label>
                <Select
                  value={editForm.instructionType}
                  onValueChange={(value: 'text' | 'image' | 'both') => setEditForm(prev => ({ ...prev, instructionType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Only</SelectItem>
                    <SelectItem value="image">Image Only</SelectItem>
                    <SelectItem value="both">Text + Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(editForm.instructionType === 'text' || editForm.instructionType === 'both') && (
                <div className="space-y-2">
                  <Label htmlFor="edit-instructions">Payment Instructions (Text)</Label>
                  <Textarea
                    id="edit-instructions"
                    value={editForm.paymentInstructions}
                    onChange={(e) => setEditForm(prev => ({ ...prev, paymentInstructions: e.target.value }))}
                    placeholder="Instructions for customers on how to make payment..."
                    rows={3}
                  />
                </div>
              )}

              {(editForm.instructionType === 'image' || editForm.instructionType === 'both') && (
                <div className="space-y-2">
                  <Label htmlFor="edit-instructionImage">Payment Instructions (Image)</Label>
                  <Input
                    id="edit-instructionImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // TODO: Upload file and get URL
                        console.log('File selected:', file)
                        // For now, just store the file name as placeholder
                        setEditForm(prev => ({ ...prev, instructionImageUrl: file.name }))
                      }
                    }}
                  />
                  {editForm.instructionImageUrl && (
                    <p className="text-sm text-muted-foreground">
                      Current: {editForm.instructionImageUrl}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={creatingManual}
            >
              Cancel
            </Button>
            <Button
              onClick={updatePaymentMethod}
              disabled={creatingManual}
            >
              {creatingManual && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {methodToDelete?.isGatewayMethod ? 'Duitku' : ''} Payment Method
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{methodToDelete?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {methodToDelete?.isGatewayMethod ? (
                <>This will remove this Duitku payment method from your available options. You can re-sync it from Duitku API later if needed.</>
              ) : (
                <>This action cannot be undone and will remove this payment method permanently.</>
              )}
            </div>
            
            {methodToDelete && (
              <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="text-sm space-y-1">
                  <div><strong>Code:</strong> {methodToDelete.code}</div>
                  <div><strong>Type:</strong> {methodToDelete.type}</div>
                  {methodToDelete.isGatewayMethod && (
                    <div><strong>Source:</strong> 
                      <Badge variant="outline" className="ml-2">Duitku Gateway</Badge>
                    </div>
                  )}
                  <div><strong>Status:</strong> 
                    <Badge variant={methodToDelete.isActive ? "default" : "secondary"} className="ml-2">
                      {methodToDelete.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {methodToDelete.feeType && methodToDelete.feeValue && (
                    <div><strong>Fee:</strong> {methodToDelete.feeType} - {methodToDelete.feeValue}</div>
                  )}
                </div>
              </div>
            )}
            
            {methodToDelete?.isActive && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Warning:</strong> This payment method is currently active. 
                  You must deactivate it first before deletion to ensure no disruption to ongoing transactions.
                  {methodToDelete.feeType && methodToDelete.feeValue && (
                    <div className="mt-1">It also has fee configuration that should be reviewed.</div>
                  )}
                </div>
              </div>
            )}

            {methodToDelete?.isGatewayMethod && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> This is a Duitku gateway method. After deletion, you can restore it by running a sync from the Duitku API again.
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deletingMethod}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => methodToDelete && deletePaymentMethod(methodToDelete.id)}
              disabled={deletingMethod}
            >
              {deletingMethod && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
