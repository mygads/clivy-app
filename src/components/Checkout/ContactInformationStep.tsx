"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, LogIn } from "lucide-react"
import Link from "next/link"
import { CheckoutForm } from "@/types/checkout"
import { User } from "../Auth/types"
import { CheckoutLoginModal } from "./CheckoutLoginModal"

interface ContactInformationStepProps {
  formData: CheckoutForm
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleNextStep: () => void
  isAuthenticated: boolean
  user: User | null
  error: string
  onLoginSuccess?: () => void
}

export function ContactInformationStep({
  formData,
  handleInputChange,
  handleNextStep,
  isAuthenticated,
  user,
  error,
  onLoginSuccess,
}: ContactInformationStepProps) {
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    if (onLoginSuccess) {
      onLoginSuccess()
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-primary/60 dark:border-gray-600 p-4 sm:p-6 mb-4 sm:mb-6"
      >      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-bold">Informasi Kontak</h2>
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600 dark:text-green-400">
            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Sudah Login</span>
          </div>
        ) : (
          <button 
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary/10 dark:bg-gray-600/50 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-primary dark:text-white transition-all hover:bg-primary hover:text-white w-fit"
          >
            <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Login
          </button>        )}</div>

      {isAuthenticated && user && (
        <div className="mb-4 sm:mb-6 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 p-3 sm:p-4 flex gap-2 sm:gap-3">
          <div className="text-green-500 mt-0.5 flex-shrink-0">
            <Check className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-green-800 dark:text-green-300 font-medium">
              Informasi kontak telah diisi otomatis
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Data diambil dari akun yang sedang login. Anda dapat mengubahnya jika diperlukan.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 sm:mb-6 rounded-lg bg-red-50 p-3 sm:p-4 text-xs sm:text-sm text-red-500 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs sm:text-sm font-medium mb-1">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 sm:p-2.5 text-xs sm:text-sm text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="whatsapp" className="block text-xs sm:text-sm font-medium mb-1">
            Nomor WhatsApp <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            placeholder="Contoh: 08123456789"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 sm:p-2.5 text-xs sm:text-sm text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 sm:p-2.5 text-xs sm:text-sm text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-xs sm:text-sm font-medium mb-1">
            Catatan (opsional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 sm:p-2.5 text-xs sm:text-sm text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
          <Link href="/#pricing">
            <button className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors w-full sm:w-auto">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Kembali Belanja
            </button>
          </Link>          <button
            onClick={handleNextStep}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 sm:px-6 py-2 sm:py-2.5 font-medium text-sm sm:text-base text-white transition-all hover:bg-primary/90"
          >
            Lanjutkan
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
      </motion.div>

      {/* Login Modal */}
      <CheckoutLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}
