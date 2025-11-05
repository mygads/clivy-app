"use client"

import type React from "react"
import { useState } from "react"
import { Mail, MapPin, Phone, Send } from "lucide-react"

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/public/contact', {
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
          message: "",
        })

        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false)
        }, 5000)
      } else {
        setSubmitError(result.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitError('Network error occurred. Please try again or contact us directly at genfity@gmail.com')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20 dark:bg-dark" id="contact">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div>
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Contact <span className="text-primary">Us</span>
            </h2>
            <p className="mb-8 sm:mb-12 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Haven&apos;t found the right service? Contact us for a free consultation
            </p>
          </div>
        </div>

        <div className="grid gap-8 sm:gap-10 md:gap-12 md:grid-cols-2">
          <div>
            <h3 className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Contact Information
            </h3>

            <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Address
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    Jalan Harvard No 9, Cimariuk Kab. Bandung, Indonesia
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Email
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    genfity@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Phone
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    +62 85174314023
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 sm:p-6 dark:bg-gray-800">
              <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Business Hours
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Monday - Friday
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    09:00 - 17:00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Saturday
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    09:00 - 15:00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Sunday
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    Closed
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Send Message
            </h3>

            {submitSuccess ? (
              <div className="rounded-lg bg-green-50 p-4 sm:p-6 dark:bg-green-900/30">
                <div className="flex">
                  <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300">
                    <Send className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-base sm:text-lg font-semibold text-green-800 dark:text-green-300">
                      Message Sent!
                    </h4>
                    <p className="text-sm sm:text-base text-green-700 dark:text-green-400">
                      Thank you for contacting us. Our team will get back to you soon via email and WhatsApp.
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

                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
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
                </div>

                <div>
                  <label htmlFor="message" className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
