"use client"

import { motion } from "framer-motion"
import { Briefcase, Eye } from "lucide-react"

export default function BrandingOverview() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white sm:bg-gradient-to-br sm:from-purple-50/50 sm:via-white sm:to-indigo-50/40 dark:bg-gray-800 dark:sm:from-purple-950/20 dark:sm:via-gray-900 dark:sm:to-indigo-950/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/80 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800">
              <Eye className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Service Overview</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Comprehensive Brand Identity
              <span className="text-indigo-600 dark:text-indigo-400"> Architecture</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg flex-shrink-0">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                    Our methodology begins with deep research - understanding your brand DNA, identifying audience personas,
                    and mapping the complex digital ecosystem. Every campaign we design is crafted with precision,
                    combining analytical data, psychological insights, and unlimited creativity.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">360°</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Brand Strategy</div>
              </div>
              <div className="bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Creative Precision</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
