"use client"

import { motion } from "framer-motion"
import { Check, Star, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

const packages = [
  {
    name: "Per Page Package",
    price: "100,000",
    period: "Package",
    description: "Perfect for small businesses needing basic brand identity",
    duration: "1 Day Delivery",
    features: ["Per Page Package", "Premium Design", "Contact Barcode"],
    popular: false,
    buttonText: "Order Now",
  },
  {
    name: "Value Package",
    price: "800,000",
    period: "Package",
    description: "Ideal for startups wanting to appear professional",
    duration: "2-3 Days Delivery",
    features: ["8 Page Package", "Premium Design", "Free Color Request"],
    popular: false,
    buttonText: "Order Now",
  },
  {
    name: "Professional Package",
    price: "1,200,000",
    period: "Package",
    description: "Complete solution for growing medium businesses",
    duration: "3-4 Days Delivery",
    features: ["12 Page Package", "Premium Design", "Free Color Request"],
    popular: true,
    buttonText: "Order Now",
  },
  {
    name: "Expert Package",
    price: "2,000,000",
    period: "Package",
    description: "Premium package for large companies with special needs",
    duration: "4-7 Days Delivery",
    features: ["20-25 Page Package", "Premium Design", "Custom Requirements"],
    popular: false,
    buttonText: "Order Now",
  },
]

export default function BrandingPricing() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white sm:bg-gradient-to-br sm:from-indigo-50/50 sm:via-white sm:to-purple-50/40 dark:bg-gray-800 dark:sm:from-indigo-950/20 dark:sm:via-gray-900 dark:sm:to-purple-950/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/80 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 mb-6">
            <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Pricing Packages</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
            Corporate Branding
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Pricing</span> Packages
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Why limit your brand potential with rigid packages? We design flexible strategic options that allow you to
            choose and customize services according to your business growth phase.
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`group relative h-full ${pkg.popular ? "lg:-mt-4" : ""
                }`}
            >
              <div className={`h-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 ${pkg.popular ? "ring-2 ring-indigo-400 dark:ring-indigo-600 shadow-xl" : ""
                }`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
                      <Star className="h-4 w-4" />
                      <span className="text-sm font-medium">Most Popular</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{pkg.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{pkg.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                      Rp {pkg.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">/{pkg.period}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800">
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{pkg.duration}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full font-medium transition-all duration-300 ${pkg.popular
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
                    : "bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
                    }`}
                >
                  {pkg.buttonText}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-800/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Need a custom package or have questions?
            </p>
            <Button
              variant="outline"
              size="lg"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
            >
              Free Consultation Now
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
