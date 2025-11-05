import type React from "react"
import { Calendar, Clock, User, Mail, Phone, Building, MessageSquare } from "lucide-react"
import AppointmentForm from "./components/AppointmentForm"

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'id' }
  ]
}

export default function AppointmentPage() {


  return (
    <section className="bg-white py-12 mt-16 sm:py-16 md:py-20 dark:bg-dark pt-20 sm:pt-24 md:pt-28" id="appointment">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div>
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Book <span className="text-primary">Appointment</span>
            </h2>
            <p className="mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Schedule a consultation with our experts to discuss your project needs and get personalized solutions
            </p>
          </div>
        </div>

        <div className="grid gap-8 sm:gap-10 md:gap-12 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Consultation Benefits
            </h3>

            <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Flexible Scheduling
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    Choose the date and time that works best for your schedule
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Expert Consultation
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    Get insights from our experienced team specialized in digital solutions
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Personalized Solutions
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    Receive tailored recommendations based on your specific business needs
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 sm:p-6 dark:bg-gray-800">
              <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                What to Expect
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-gray-600 dark:text-gray-300">
                    Consultation Duration
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    30-60 minutes
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-gray-600 dark:text-gray-300">
                    Meeting Format
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Online or In-person
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-gray-600 dark:text-gray-300">
                    Response Time
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Within 24 hours
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Schedule Your Consultation
            </h3>

            <AppointmentForm />
          </div>
        </div>
      </div>
    </section>
  )
}