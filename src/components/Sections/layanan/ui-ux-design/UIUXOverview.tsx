"use client"

import { motion } from "framer-motion"
import { Palette, Eye } from "lucide-react"

export default function UIUXOverview() {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-20 lg:py-24 sm:bg-gradient-to-br sm:from-purple-50 sm:via-white sm:to-pink-50 dark:bg-gray-800 dark:sm:from-purple-950/20 dark:sm:via-gray-900 dark:sm:to-pink-950/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-pink-100/80 dark:bg-pink-900/30 backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-pink-600 dark:text-pink-400" />
              <span className="text-xs sm:text-sm font-medium text-pink-700 dark:text-pink-300">Service Overview</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Revolutionizing Digital Experience Through
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> Smart Design</span>
            </h2>
            <div className="w-12 sm:w-16 h-0.5 sm:h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-pink-200/50 dark:border-pink-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg flex-shrink-0">
                  <Palette className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                    Our design platform integrates technological innovation, deep understanding of user behavior,
                    and creativity to create digital interfaces that are not only visually stunning, but also
                    highly functional and intuitive for optimal user experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-pink-50/80 dark:bg-pink-950/30 backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-pink-600 dark:text-pink-400 mb-1">360°</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Design Approach</div>
              </div>
              <div className="bg-purple-50/80 dark:bg-purple-950/30 backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">100%</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">User-Focused</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
