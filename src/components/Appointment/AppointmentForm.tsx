"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, Send, User, Mail, Phone, Building, MessageSquare } from "lucide-react"
import { getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'

interface AppointmentFormProps {
  locale: string
}

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  service: string
  preferredDate: string
  preferredTime: string
  message: string
}

export default function AppointmentForm({ locale }: AppointmentFormProps) {
  const t = useTranslations('appointment')
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const serviceOptions = [
    { value: "website-development", label: t('services.website') },
    { value: "mobile-app", label: t('services.mobile') },
    { value: "whatsapp-api", label: t('services.whatsapp') },
    { value: "ui-ux-design", label: t('services.design') },
    { value: "digital-marketing", label: t('services.marketing') },
    { value: "it-consulting", label: t('services.consulting') },
    { value: "other", label: t('services.other') },
  ]

  const timeOptions = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/public/appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitSuccess(true)
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          service: "",
          preferredDate: "",
          preferredTime: "",
          message: "",
        })

        // Reset success message after 8 seconds
        setTimeout(() => {
          setSubmitSuccess(false)
        }, 8000)
      } else {
        setSubmitError(result.error || 'Failed to submit appointment request')
      }
    } catch (error) {
      console.error('Appointment form error:', error)
      setSubmitError('Network error occurred. Please try again or contact us directly at genfity@gmail.com')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900"
    >
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          {t('form.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('form.subtitle')}
        </p>
      </div>

      {submitSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg bg-green-50 p-6 dark:bg-green-900/30"
        >
          <div className="flex">
            <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-green-800 dark:text-green-300">
                {t('form.success.title')}
              </h3>
              <p className="text-green-700 dark:text-green-400">
                {t('form.success.message')}
              </p>
              <div className="mt-4 rounded-lg bg-green-100 p-3 dark:bg-green-800/50">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>{t('form.success.next')}</strong>
                </p>
                <ul className="mt-2 list-disc list-inside text-sm text-green-700 dark:text-green-300">
                  <li>{t('form.success.step1')}</li>
                  <li>{t('form.success.step2')}</li>
                  <li>{t('form.success.step3')}</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30"
            >
              <div className="flex">
                <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300">
                  <span className="text-sm font-bold">!</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                    {t('form.error.title')}
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {submitError}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('form.personal.title')}
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  <User className="mr-2 inline h-4 w-4" />
                  {t('form.personal.name')} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                  placeholder={t('form.personal.namePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  <Mail className="mr-2 inline h-4 w-4" />
                  {t('form.personal.email')} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                  placeholder={t('form.personal.emailPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  <Phone className="mr-2 inline h-4 w-4" />
                  {t('form.personal.phone')} *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                  placeholder={t('form.personal.phonePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="company" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  <Building className="mr-2 inline h-4 w-4" />
                  {t('form.personal.company')}
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder={t('form.personal.companyPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('form.service.title')}
            </h3>
            
            <div>
              <label htmlFor="service" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                {t('form.service.interest')} *
              </label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              >
                <option value="">{t('form.service.select')}</option>
                {serviceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Appointment Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('form.schedule.title')}
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="preferredDate" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  <Calendar className="mr-2 inline h-4 w-4" />
                  {t('form.schedule.date')} *
                </label>
                <input
                  type="date"
                  id="preferredDate"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  min={getMinDate()}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="preferredTime" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  <Clock className="mr-2 inline h-4 w-4" />
                  {t('form.schedule.time')} *
                </label>
                <select
                  id="preferredTime"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="">{t('form.schedule.selectTime')}</option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time} WIB
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              <MessageSquare className="mr-2 inline h-4 w-4" />
              {t('form.message.label')} *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
              placeholder={t('form.message.placeholder')}
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-6 py-4 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t('form.submitting')}
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                {t('form.submit')}
              </>
            )}
          </button>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {t('form.note')}
          </p>
        </form>
      )}
    </motion.div>
  )
}