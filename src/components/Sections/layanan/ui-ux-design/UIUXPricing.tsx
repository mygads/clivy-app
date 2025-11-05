"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check, Star, Zap } from "lucide-react"

export default function UIUXPricing() {
  const packages = [
    {
      name: "Basic Package",
      price: "IDR 1,500,000",
      subtitle: "Perfect for Management Applications",
      popular: false,
      features: ["5+ Pages", "PDF Design Files", "Figma Source", "5-Day Development"],
    },
    {
      name: "Professional Package",
      price: "IDR 4,500,000",
      subtitle: "Perfect for LMS Applications",
      popular: true,
      features: ["20+ Pages", "PDF Design Files", "Figma Source", "10-Day Development"],
    },
    {
      name: "Advanced Package",
      price: "IDR 9,500,000",
      subtitle: "Perfect for Corporate Companies",
      popular: false,
      features: ["40+ Pages", "PDF Design Files", "Figma Source", "20-Day Development"],
    },
  ]

  return (
    <section className="bg-white py-16 sm:py-20 md:py-24 lg:py-32 sm:bg-gradient-to-br sm:from-pink-50 sm:to-purple-50 dark:bg-gray-900 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-pink-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100/80 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-800 mb-4">
            <Zap className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            <span className="text-sm font-medium text-pink-700 dark:text-pink-300">Our Packages</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Choose the Digital Design Package That
            <span className="text-pink-600 dark:text-pink-400"> Fits Your Needs</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            We provide flexible design solutions that can be customized to the scale and specific needs of your project.
            Each package is designed to deliver maximum value and an exceptional design experience.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group relative rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border p-4 sm:p-6 md:p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${pkg.popular
                ? "border-pink-300 dark:border-pink-700 ring-2 ring-pink-200 dark:ring-pink-800 scale-105"
                : "border-pink-100/50 dark:border-pink-900/30 hover:border-pink-200 dark:hover:border-pink-800"
                }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
                    <Star className="mr-2 h-4 w-4 fill-white" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors duration-300">
                  {pkg.name}
                </h3>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{pkg.price}</div>
                <p className="text-pink-600 dark:text-pink-400 text-sm font-medium">{pkg.subtitle}</p>
              </div>

              <Button
                className={`w-full mb-6 sm:mb-8 py-3 rounded-full font-semibold transition-all duration-300 ${pkg.popular
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-white dark:bg-gray-700 text-pink-600 dark:text-pink-400 border border-pink-300 dark:border-pink-700 hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:border-pink-400 dark:hover:border-pink-600"
                  }`}
              >
                Order Now
              </Button>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <div className="w-2 h-2 bg-pink-600 dark:bg-pink-400 rounded-full"></div>
                  Package Features
                </div>

                {pkg.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-pink-500 dark:text-pink-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Consultation CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 text-center"
        >
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-pink-100/50 dark:border-pink-900/30 rounded-2xl p-6 sm:p-8 shadow-lg">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Need Further Consultation?
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Our expert team is ready to help you determine the package that best suits your project needs and budget.
            </p>
            <Button
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Free Consultation
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
