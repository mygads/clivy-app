"use client"

import { motion } from "framer-motion"
import { Search, Eye } from "lucide-react"

export default function SEOOverview() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white sm:bg-gradient-to-br sm:from-emerald-50/50 sm:via-white sm:to-green-50/40 dark:bg-gray-800 dark:sm:from-emerald-950/20 dark:sm:via-gray-900 dark:sm:to-green-950/30 transition-colors duration-300">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100/80 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
              <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Service Overview</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Comprehensive Expertise in
              <span className="text-green-600 dark:text-green-400"> Search Engine Optimization</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-green-100/50 dark:border-green-900/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg flex-shrink-0">
                  <Search className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                    Every optimization step we take is built on a foundation of comprehensive research, utilizing advanced
                    analytical tools to understand every nuance of your target market. We don&apos;t just focus on keywords,
                    but on context, search intent, and holistic user experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50/80 dark:bg-green-950/30 border border-green-200/50 dark:border-green-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">360°</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">SEO Analysis</div>
              </div>
              <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Data-Driven</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
