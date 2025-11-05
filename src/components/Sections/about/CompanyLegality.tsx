"use client"

import { FileText, ExternalLink, MapPin } from 'lucide-react'
// import "flag-icons/css/flag-icons.min.css";

// Indonesia Legal Documents
const indonesiaLegality = [
  {
    title: "Company Name",
    description: "PT Generation Infinity Indonesia",
    icon: FileText,
  },
  {
    title: "NIB (Business Identification Number)",
    description: "1303250009459",
    icon: FileText,
  },
  {
    title: "Deed of Establishment",
    description: "AHU-012127.AH.01.30.Tahun 2025",
    icon: FileText,
  },
  {
    title: "Business Address",
    description: "Jl. Harvard No. 9 Sulaiman, Margahayu, Kabupaten Bandung, Jawa Barat 40229",
    icon: MapPin,
  },
]

// Australia Legal Documents
const australiaLegality = [
  {
    title: "Business Name",
    description: "Genfity Digital Solutions",
    icon: FileText,
  },
  {
    title: "ABN (Australian Business Number)",
    description: "13 426 412 034",
    icon: FileText,
  },
  {
    title: "ASIC Registration",
    description: "View Certificate",
    icon: ExternalLink,
    link: "https://connectonline.asic.gov.au/RegistrySearch/faces/landing/bySearchId.jspx?searchIdType=BUSN&searchId=685530929",
  },
  {
    title: "Business Address",
    description: "157 Braidwood Dr, Australind WA 6233",
    icon: MapPin,
  },
]

export default function CompanyLegality() {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20 dark:bg-dark">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12">
          <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
            Company{" "}
            <span className="text-primary">Legality</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            We are a legally registered company in Indonesia and Australia with all required legal documentation.
          </p>
        </div>

        <div className="grid gap-8 sm:gap-10 lg:gap-12 lg:grid-cols-2">
          {/* Indonesia Legal Documents */}
          <div>
            <div className="flex items-center mb-4 sm:mb-6">
              <span className="fi fi-id mr-2"></span>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Indonesia</h3>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {indonesiaLegality.map((doc, index) => (
                <div key={index} className="flex rounded-lg bg-white p-3 sm:p-4 shadow-sm dark:bg-gray-900 hover:shadow-md transition-shadow duration-300">
                  <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                    <doc.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{doc.title}</h4>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{doc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Australia Legal Documents */}
          <div>
            <div className="flex items-center mb-4 sm:mb-6">
              <span className="fi fi-au mr-2"></span>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Australia</h3>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {australiaLegality.map((doc, index) => (
                <div key={index} className="flex rounded-lg bg-white p-3 sm:p-4 shadow-sm dark:bg-gray-900 hover:shadow-md transition-shadow duration-300">
                  <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <doc.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{doc.title}</h4>
                    {doc.link ? (
                      <a
                        href={doc.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors duration-300"
                      >
                        {doc.description}
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                      </a>
                    ) : (
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{doc.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
