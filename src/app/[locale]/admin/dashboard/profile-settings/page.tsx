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

export default function AdminProfileSettingsPage() {
  const { user, refreshUser } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    fetchProfile()
  }, [])

  // Update email cooldown timer
  useEffect(() => {
    if (lastEmailSent) {
      const timer = setInterval(() => {
        const now = new Date()
        const timeDiff = now.getTime() - lastEmailSent.getTime()
        const cooldownTime = 3 * 60 * 1000 // 3 minutes in milliseconds
        const remaining = Math.max(0, cooldownTime - timeDiff)
        
        if (remaining === 0) {
          setEmailCooldown(0)
          setLastEmailSent(null)
          clearInterval(timer)
        } else {
          setEmailCooldown(Math.ceil(remaining / 1000))
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [lastEmailSent])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const token = SessionManager.getToken()
      
      if (!token) {
        setProfileMessage({ type: "error", text: "No authentication token found" })
        return
      }

      const response = await fetch("/api/account/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setProfile(data.data)
        setFormData({
          name: data.data.name,
          email: data.data.email,
        })
      } else {
        setProfileMessage({ type: "error", text: data.error || "Failed to fetch profile" })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setProfileMessage({ type: "error", text: "An error occurred while fetching profile" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true)
      setProfileMessage({ type: "", text: "" })

      const token = SessionManager.getToken()
      
      if (!token) {
        setProfileMessage({ type: "error", text: "No authentication token found" })
        return
      }

      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setProfile(data.data)
        setProfileMessage({ type: "success", text: "Profile updated successfully!" })
        
        // Refresh user context to update navbar
        if (refreshUser) {
          await refreshUser()
        }
      } else {
        setProfileMessage({ type: "error", text: data.error || "Failed to update profile" })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setProfileMessage({ type: "error", text: "An error occurred while updating profile" })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      setIsChangingPassword(true)
      setPasswordMessage({ type: "", text: "" })

      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordMessage({ type: "error", text: "New password and confirmation do not match" })
        return
      }

      if (passwordData.newPassword.length < 6) {
        setPasswordMessage({ type: "error", text: "New password must be at least 6 characters long" })
        return
      }

      const token = SessionManager.getToken()
      
      if (!token) {
        setPasswordMessage({ type: "error", text: "No authentication token found" })
        return
      }

      const response = await fetch("/api/account/change-password", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPasswordMessage({ type: "success", text: "Password changed successfully!" })
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        setPasswordMessage({ type: "error", text: data.error || "Failed to change password" })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      setPasswordMessage({ type: "error", text: "An error occurred while changing password" })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleResendEmailVerification = async () => {
    try {
      setIsResendingEmail(true)
      setEmailMessage({ type: "", text: "" })

      const token = SessionManager.getToken()
      
      if (!token) {
        setEmailMessage({ type: "error", text: "No authentication token found" })
        return
      }

      const response = await fetch("/api/account/email/resend-verification-email", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setEmailMessage({ type: "success", text: "Verification email sent successfully!" })
        setLastEmailSent(new Date())
      } else {
        setEmailMessage({ type: "error", text: data.error || "Failed to send verification email" })
      }
    } catch (error) {
      console.error("Error sending verification email:", error)
      setEmailMessage({ type: "error", text: "An error occurred while sending verification email" })
    } finally {
      setIsResendingEmail(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      setImageMessage({ type: "error", text: "Invalid file type. Only JPEG, PNG, and WebP are allowed" })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setImageMessage({ type: "error", text: "File size too large. Maximum 5MB allowed" })
      return
    }

    try {
      setIsUploadingImage(true)
      setImageMessage({ type: "", text: "" })

      const token = SessionManager.getToken()
      
      if (!token) {
        setImageMessage({ type: "error", text: "No authentication token found" })
        return
      }

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/account/profile/image", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setProfile(prev => prev ? { ...prev, image: data.data.image } : null)
        setImageMessage({ type: "success", text: "Profile image updated successfully!" })
        
        // Refresh user context to update navbar
        if (refreshUser) {
          await refreshUser()
        }
      } else {
        setImageMessage({ type: "error", text: data.error || "Failed to upload image" })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setImageMessage({ type: "error", text: "An error occurred while uploading image" })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleDeleteImage = async () => {
    try {
      setIsUploadingImage(true)
      setImageMessage({ type: "", text: "" })

      const token = SessionManager.getToken()
      
      if (!token) {
        setImageMessage({ type: "error", text: "No authentication token found" })
        return
      }

      const response = await fetch("/api/account/profile/image", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setProfile(prev => prev ? { ...prev, image: null } : null)
        setImageMessage({ type: "success", text: "Profile image deleted successfully!" })
        
        // Refresh user context to update navbar
        if (refreshUser) {
          await refreshUser()
        }
      } else {
        setImageMessage({ type: "error", text: data.error || "Failed to delete image" })
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      setImageMessage({ type: "error", text: "An error occurred while deleting image" })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your admin account settings and preferences
        </p>
      </div>

      {isLoading ? (
        // Skeleton Loading
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Skeleton - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile Image Skeleton */}
                <div className="relative mb-4">
                  <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  {/* Upload buttons skeleton */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
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
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Information Skeleton */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48"></div>
                </div>
              </div>

              {/* Form skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full mt-1"></div>
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
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile Image */}
                <div className="relative mb-4">
                  {profile?.image ? (
                    <Image
                      src={profile.image}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  
                  {/* Upload/Delete buttons */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                      <div className="w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-sm transition-colors">
                        {isUploadingImage ? (
                          <Loader2 className="h-3 w-3 text-white animate-spin" />
                        ) : (
                          <Camera className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </label>
                    
                    {profile?.image && (
                      <button
                        onClick={handleDeleteImage}
                        disabled={isUploadingImage}
                        className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-sm transition-colors"
                      >
                        <Trash2 className="h-3 w-3 text-white" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white">{profile?.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{profile?.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </span>

                {/* Message display for image operations */}
                {imageMessage.text && (
                  <div className={`mt-4 p-2 rounded text-xs ${
                    imageMessage.type === "success" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300" 
                      : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                  }`}>
                    {imageMessage.text}
                  </div>
                )}

                {/* Verification Status */}
                <div className="w-full mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-gray-500" />
                      <span>Email</span>
                    </div>
                    {profile?.emailVerified ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Unverified
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <span>Phone</span>
                    </div>
                    {profile?.phoneVerified ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Information */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Update your account profile information</p>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Changing email will require re-verification
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={profile?.phone || ""}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      disabled
                      readOnly
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Phone number cannot be changed. Contact support if you need to update this.
                    </p>
                  </div>
                </div>

                {/* Message display */}
                {profileMessage.text && (
                  <div className={`p-3 rounded-md ${
                    profileMessage.type === "success" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300" 
                      : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                  }`}>
                    {profileMessage.text}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-5 w-5 text-red-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Update your password to keep your account secure</p>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {/* Message display */}
                {passwordMessage.text && (
                  <div className={`p-3 rounded-md ${
                    passwordMessage.type === "success" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300" 
                      : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                  }`}>
                    {passwordMessage.text}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Email Verification */}
            {!profile?.emailVerified && (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="h-5 w-5 text-orange-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email Verification</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verify your email address to secure your account</p>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-4 mb-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        Email not verified
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                        <p>Your email address has not been verified. Please check your inbox and click the verification link.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message display */}
                {emailMessage.text && (
                  <div className={`p-3 rounded-md mb-4 ${
                    emailMessage.type === "success" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300" 
                      : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                  }`}>
                    {emailMessage.text}
                  </div>
                )}

                <button
                  onClick={handleResendEmailVerification}
                  disabled={isResendingEmail || emailCooldown > 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : emailCooldown > 0 ? (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Resend in {formatCooldownTime(emailCooldown)}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
