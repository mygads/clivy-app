"use client"

import type React from "react"
import Image from "next/image"

import { useState, useEffect } from "react"
import { Loader2, Save, User, Mail, Phone, Shield, BarChart3, Send, CheckCircle, AlertCircle, Camera, Trash2, Calendar } from "lucide-react"
import { useAuth } from "@/components/Auth/AuthContext"
import { SessionManager } from "@/lib/storage"

interface ProfileData {
  id: string
  name: string
  email: string
  phone: string
  image: string | null
  emailVerified: string | null
  phoneVerified: string | null
  role: string
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Format date helper function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [lastEmailSent, setLastEmailSent] = useState<Date | null>(null)
  const [emailCooldown, setEmailCooldown] = useState(0)
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" })
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" })
  const [emailMessage, setEmailMessage] = useState({ type: "", text: "" })
  const [imageMessage, setImageMessage] = useState({ type: "", text: "" })

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = SessionManager.getToken()
        if (!token) {
          setIsLoading(false)
          return
        }

        const response = await fetch('/api/account/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const result = await response.json()
        if (result.success && result.data) {
          setProfile(result.data)
          setFormData({
            name: result.data.name,
            email: result.data.email,
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Cooldown timer effect for email resend
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (lastEmailSent && emailCooldown > 0) {
      interval = setInterval(() => {
        const now = new Date()
        const timePassed = Math.floor((now.getTime() - lastEmailSent.getTime()) / 1000)
        const remaining = 180 - timePassed // 3 minutes = 180 seconds
        
        if (remaining <= 0) {
          setEmailCooldown(0)
          setLastEmailSent(null)
        } else {
          setEmailCooldown(remaining)
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [lastEmailSent, emailCooldown])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setProfileMessage({ type: "", text: "" })

    try {
      const token = SessionManager.getToken()
      if (!token) {
        setProfileMessage({ type: "error", text: "Token tidak ditemukan" })
        setIsUpdating(false)
        return
      }

      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        })
      })
      const result = await response.json()

      if (result.success) {
        // Check if email was changed - if so, email verification status will be null
        const emailChanged = formData.email !== profile?.email
        
        if (emailChanged) {
          setProfileMessage({ type: "success", text: "Profil berhasil diperbarui. Email baru memerlukan verifikasi ulang." })
        } else {
          setProfileMessage({ type: "success", text: "Profil berhasil diperbarui" })
        }
        
        // Refresh profile data
        const profileResponse = await fetch('/api/account/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const updatedProfile = await profileResponse.json()
        if (updatedProfile.success && updatedProfile.data) {
          setProfile(updatedProfile.data)
          // Update form data to reflect the new profile
          setFormData({
            name: updatedProfile.data.name,
            email: updatedProfile.data.email,
          })
        }
      } else {
        setProfileMessage({ type: "error", text: result.error?.message || "Gagal memperbarui profil" })
      }
    } catch (error) {
      setProfileMessage({ type: "error", text: "Terjadi kesalahan saat memperbarui profil" })
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChangingPassword(true)
    setPasswordMessage({ type: "", text: "" })

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Konfirmasi password baru tidak cocok" })
      setIsChangingPassword(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password baru minimal 6 karakter" })
      setIsChangingPassword(false)
      return
    }

    try {
      const token = SessionManager.getToken()
      if (!token) {
        setPasswordMessage({ type: "error", text: "Token tidak ditemukan" })
        setIsChangingPassword(false)
        return
      }

      const response = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })
      const result = await response.json()

      if (result.success) {
        setPasswordMessage({ type: "success", text: "Password berhasil diperbarui" })
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        setPasswordMessage({ type: "error", text: result.error?.message || "Gagal memperbarui password" })
      }
    } catch (error) {
      setPasswordMessage({ type: "error", text: "Terjadi kesalahan saat memperbarui password" })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setImageMessage({ type: "error", text: "Tipe file tidak didukung. Gunakan JPEG, PNG, atau WebP" })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setImageMessage({ type: "error", text: "Ukuran file maksimal 5MB" })
      return
    }

    setIsUploadingImage(true)
    setImageMessage({ type: "", text: "" })

    try {
      const token = SessionManager.getToken()
      if (!token) {
        setImageMessage({ type: "error", text: "Token tidak ditemukan" })
        setIsUploadingImage(false)
        return
      }

      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/account/profile/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setImageMessage({ type: "success", text: "Foto profil berhasil diperbarui" })
        // Update profile data with new image
        setProfile(prev => prev ? { ...prev, image: result.data.image } : null)
        // Refresh user data in AuthContext to update navbar
        if (refreshUser) {
          await refreshUser()
        }
      } else {
        setImageMessage({ type: "error", text: result.error || "Gagal mengupload foto profil" })
      }
    } catch (error) {
      setImageMessage({ type: "error", text: "Terjadi kesalahan saat mengupload foto" })
    } finally {
      setIsUploadingImage(false)
      // Reset input value
      e.target.value = ''
    }
  }

  const handleImageDelete = async () => {
    setIsUploadingImage(true)
    setImageMessage({ type: "", text: "" })

    try {
      const token = SessionManager.getToken()
      if (!token) {
        setImageMessage({ type: "error", text: "Token tidak ditemukan" })
        setIsUploadingImage(false)
        return
      }

      const response = await fetch('/api/account/profile/image', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (result.success) {
        setImageMessage({ type: "success", text: "Foto profil berhasil dihapus" })
        // Update profile data to remove image
        setProfile(prev => prev ? { ...prev, image: null } : null)
        // Refresh user data in AuthContext to update navbar
        if (refreshUser) {
          await refreshUser()
        }
      } else {
        setImageMessage({ type: "error", text: result.error || "Gagal menghapus foto profil" })
      }
    } catch (error) {
      setImageMessage({ type: "error", text: "Terjadi kesalahan saat menghapus foto" })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleResendEmailVerification = async () => {
    // Check cooldown
    if (emailCooldown > 0) {
      const minutes = Math.floor(emailCooldown / 60)
      const seconds = emailCooldown % 60
      setEmailMessage({ 
        type: "error", 
        text: `Harap tunggu ${minutes > 0 ? `${minutes} menit ` : ''}${seconds} detik sebelum mengirim ulang email` 
      })
      return
    }

    setIsResendingEmail(true)
    setEmailMessage({ type: "", text: "" })

    try {
      const token = SessionManager.getToken()
      if (!token) {
        setEmailMessage({ type: "error", text: "Token tidak ditemukan" })
        setIsResendingEmail(false)
        return
      }

      const response = await fetch('/api/account/email/resend-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await response.json()
      
      if (result.success) {
        setEmailMessage({ type: "success", text: "Email verifikasi berhasil dikirim. Silakan cek email Anda." })
        // Set cooldown
        const now = new Date()
        setLastEmailSent(now)
        setEmailCooldown(180) // 3 minutes
      } else {
        setEmailMessage({ type: "error", text: result.error?.message || "Gagal mengirim email verifikasi" })
      }
    } catch (error) {
      setEmailMessage({ type: "error", text: "Terjadi kesalahan saat mengirim email verifikasi" })
    } finally {
      setIsResendingEmail(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-6 bg-background">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Pengaturan Profil
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Kelola informasi profil dan keamanan akun Anda
        </p>
      </div>

      {isLoading ? (
        // Skeleton Loading
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar Skeleton - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile Image Skeleton */}
                <div className="relative mb-3 sm:mb-4">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  {/* Upload buttons skeleton */}
                  <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Name skeleton */}
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24 mb-1"></div>
                {/* Email skeleton */}
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32 mb-3"></div>
                {/* Phone skeleton */}
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20 mb-4"></div>
                
                {/* Verification Status Skeleton */}
                <div className="w-full space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8"></div>
                    </div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-16"></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8"></div>
                    </div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Profile Information Skeleton */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="h-4 w-4 sm:h-5 sm:w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div>
                  <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24 sm:w-32 mb-1 sm:mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-36 sm:w-48"></div>
                </div>
              </div>

              {/* Form skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 sm:w-16 mb-1 sm:mb-2"></div>
                  <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                </div>
                <div>
                  <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 sm:w-20 mb-1 sm:mb-2"></div>
                  <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full mt-1"></div>
                </div>
                <div className="md:col-span-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mt-1"></div>
                </div>
              </div>

              <div className="pt-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-28"></div>
              </div>
            </div>

            {/* Change Password Skeleton */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-56"></div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20 mb-2"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-28 mb-2"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile Image */}
                <div className="relative mb-3 sm:mb-4">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                    {profile?.image ? (
                      <Image
                        src={profile.image}
                        alt="Profile"
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg sm:text-2xl font-semibold text-primary">
                        {profile?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  
                  {/* Upload/Delete Image Buttons */}
                  <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    <label htmlFor="image-upload" className="bg-primary text-white p-1 sm:p-1.5 rounded-full text-xs cursor-pointer hover:bg-primary/90 transition-colors">
                      {isUploadingImage ? (
                        <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
                      ) : (
                        <Camera className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      )}
                    </label>
                    {profile?.image && (
                      <button
                        onClick={handleImageDelete}
                        disabled={isUploadingImage}
                        className="bg-red-500 text-white p-1 sm:p-1.5 rounded-full text-xs hover:bg-red-600 transition-colors disabled:opacity-70"
                      >
                        <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </button>
                    )}
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </div>

                {/* Image Upload Message */}
                {imageMessage.text && (
                  <div className={`mb-2 sm:mb-3 p-2 rounded-lg text-xs ${
                    imageMessage.type === "success"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {imageMessage.text}
                  </div>
                )}

                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1">
                  {profile?.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
                  {profile?.email}
                </p>
                
                <div className="bg-gray-100 dark:bg-gray-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
                  {profile?.phone || "No phone"}
                </div>
                
                {/* Verification Status */}
                <div className="w-full space-y-1.5 sm:space-y-2 text-xs">
                  <div className="flex items-center justify-between p-1.5 sm:p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">Email</span>
                    </div>
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                      profile?.emailVerified 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {profile?.emailVerified ? "Terverifikasi" : "Belum Verifikasi"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-1.5 sm:p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">Phone</span>
                    </div>
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                      profile?.phoneVerified 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {profile?.phoneVerified ? "Terverifikasi" : "Belum Verifikasi"}
                    </span>
                  </div>

                  {/* Email Verification Button */}
                  {!profile?.emailVerified && (
                    <div className="mt-2 sm:mt-3">
                      {emailMessage.text && (
                        <div className={`p-1.5 sm:p-2 rounded-lg mb-1.5 sm:mb-2 text-xs ${
                          emailMessage.type === "success"
                            ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {emailMessage.text}
                        </div>
                      )}
                      <button
                        onClick={handleResendEmailVerification}
                        disabled={isResendingEmail || emailCooldown > 0}
                        className="w-full inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
                      >
                        {isResendingEmail ? (
                          <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
                        ) : (
                          <Send className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        )}
                        {emailCooldown > 0 
                          ? `Tunggu ${Math.floor(emailCooldown / 60)}:${(emailCooldown % 60).toString().padStart(2, '0')}`
                          : "Kirim Ulang Verifikasi"
                        }
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Profile Information */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Update your basic profile information</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-2 sm:px-3 py-1.5 sm:py-2 text-sm text-gray-900 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-2 sm:px-3 py-1.5 sm:py-2 text-sm text-gray-900 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      required
                      placeholder="Enter your email address"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      Mengganti email akan menghapus status verifikasi dan memerlukan verifikasi ulang
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profile?.phone || ""}
                      disabled
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-2 sm:px-3 py-1.5 sm:py-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60"
                      placeholder="WhatsApp number cannot be changed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      WhatsApp number cannot be changed for security reasons
                    </p>
                  </div>
                </div>

                {profileMessage.text && (
                  <div className={`mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg text-sm ${
                    profileMessage.type === "success"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                  }`}>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {profileMessage.type === "success" ? (
                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                      {profileMessage.text}
                    </div>
                  </div>
                )}

                <div className="pt-3 sm:pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Account Security</h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Change your password to keep your account secure</p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-2 sm:px-3 py-1.5 sm:py-2 text-sm text-gray-900 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      required
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label htmlFor="newPassword" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-2 sm:px-3 py-1.5 sm:py-2 text-sm text-gray-900 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        required
                        minLength={6}
                        placeholder="Minimum 6 characters"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-2 sm:px-3 py-1.5 sm:py-2 text-sm text-gray-900 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        required
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>

                  {passwordMessage.text && (
                    <div className={`p-2 sm:p-3 rounded-lg text-sm ${
                      passwordMessage.type === "success"
                        ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                        : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                    }`}>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {passwordMessage.type === "success" ? (
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        )}
                        {passwordMessage.text}
                      </div>
                    </div>
                  )}

                  <div className="pt-1.5 sm:pt-2">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-70"
                    >
                      {isChangingPassword ? (
                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      ) : (
                        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                      {isChangingPassword ? "Changing Password..." : "Change Password"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
