"use client"

import { MapPin, Clock, Phone, Mail } from 'lucide-react'

export default function LocationMap() {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20 dark:bg-dark">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12">
          <div>
            <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Our{" "}
              <span className="text-primary">Location</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Visit our office or contact us for more information.
            </p>
          </div>
        </div>

        <div className="grid gap-8 sm:gap-10 lg:gap-12 lg:grid-cols-2">
          {/* Map */}
          <div>
            {/* Responsive Google Map embed */}
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4872.827481933637!2d107.57498177587678!3d-6.992872468487276!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e969430921bd%3A0x3026598d1dc1abf4!2sGenfity%20Digital%20Solution!5e1!3m2!1sid!2sid!4v1757892951504!5m2!1sid!2sid"
                className="absolute top-0 left-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Genfity Digital Solution Location"
              ></iframe>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Contact Information</h3>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Address</h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Jl. Harvard No 9 Sulaiman, Kabupaten Bandung, Jawa Barat, Indonesia</p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Operating Hours</h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Monday - Friday: 09:00 - 17:00</p>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Saturday: 09:00 - 15:00</p>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Sunday: Closed</p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Phone</h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">+62 851 7431 4023</p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Email</h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">genfity@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
