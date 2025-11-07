import type React from "react"
import { Headphones, Mail, Phone, Clock, MessageSquare, HelpCircle, Wrench } from "lucide-react"
import CustomerServiceForm from "./components/CustomerServiceForm"

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'id' }
  ]
}

export default function CustomerServicePage() {


  return (
    <section className="bg-white py-12 sm:py-16 md:py-20 dark:bg-dark mt-16" id="customer-service">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div>
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Customer <span className="text-primary">Service</span>
            </h2>
            <p className="mb-8 sm:mb-12 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Get comprehensive support for your digital solutions. Our team is ready to help with technical issues, billing questions, and project inquiries.
            </p>
          </div>
        </div>

        <div className="grid gap-8 sm:gap-10 md:gap-12 md:grid-cols-2">
          <div>
            <h3 className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Support Information
            </h3>

            <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    WhatsApp Support
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-1">
                    +62 851 7431 4023
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    Email Support
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-1">
                    clivy@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Headphones className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    Emergency Support
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-1">
                    For critical system issues
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Contact immediately via WhatsApp for urgent problems
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 sm:p-6 dark:bg-gray-800">
              <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Support Categories
              </h4>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center">
                  <Wrench className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                  <div>
                    <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Technical Support</span>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Troubleshooting, API issues, performance</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  <div>
                    <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Billing & Payments</span>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Invoices, refunds, subscription management</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  <div>
                    <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Project Management</span>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Timeline updates, change requests</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <HelpCircle className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  <div>
                    <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">General Inquiries</span>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Services info, partnerships, feedback</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Submit Support Request
            </h3>

            <CustomerServiceForm />
          </div>
        </div>
      </div>
    </section>
  )
}