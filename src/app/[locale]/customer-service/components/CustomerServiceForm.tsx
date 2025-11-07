"use client"

import type React from "react"
import { useState } from "react"
import { Send } from "lucide-react"

export default function CustomerServiceForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    priority: "",
    subject: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const categoryOptions = [
    { value: "technical", label: "Technical Support" },
    { value: "billing", label: "Billing & Payments" },
    { value: "project", label: "Project Management" },
    { value: "general", label: "General Inquiry" },
  ]

  const priorityOptions = [
    { value: "low", label: "Low - General Question" },
    { value: "medium", label: "Medium - Need Assistance" },
    { value: "high", label: "High - Urgent Issue" },
    { value: "critical", label: "Critical - System Down" },
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
      const response = await fetch('/api/public/customer-service', {
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
          category: "",
          priority: "",
          subject: "",
          message: "",
        })

        setTimeout(() => {
          setSubmitSuccess(false)
        }, 5000)
      } else {
        setSubmitError(result.error || 'Failed to submit support request')
      }
    } catch (error) {
      console.error('Customer service form error:', error)
      setSubmitError('Network error occurred. Please try again or contact us directly at clivy@gmail.com')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {submitSuccess ? (
        <div className="rounded-lg bg-green-50 p-4 sm:p-6 dark:bg-green-900/30">
          <div className="flex">
            <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300">
              <Send className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h4 className="mb-1 text-base sm:text-lg font-semibold text-green-800 dark:text-green-300">
                Request Submitted!
              </h4>
              <p className="text-sm sm:text-base text-green-700 dark:text-green-400">
                Thank you for contacting our support team. We&apos;ll get back to you soon via your preferred method.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {submitError && (
            <div className="mb-4 sm:mb-6 rounded-lg bg-red-50 p-3 sm:p-4 dark:bg-red-900/30">
              <div className="flex">
                <div className="mr-2 sm:mr-3 flex h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300">
                  <span className="text-xs sm:text-sm">!</span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-300">
                    Error
                  </h4>
                  <p className="text-xs sm:text-sm text-red-700 dark:text-red-400">
                    {submitError}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>

            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  Support Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  Priority Level
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="">Select priority</option>
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Brief summary of your issue or question"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                Detailed Description
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Please provide detailed information about your issue, including steps to reproduce the problem, error messages, and any relevant context..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-70"
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
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Submit Support Request
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </>
  )
}