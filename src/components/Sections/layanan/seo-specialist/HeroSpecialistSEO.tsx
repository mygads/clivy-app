"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight, TrendingUp, Search, Target } from "lucide-react"

const stats = [
  {
    icon: TrendingUp,
    number: "150+",
    label: "Ranking Improvements"
  },
  {
    icon: Search,
    number: "85%",
    label: "Traffic Increase"
  },
  {
    icon: Target,
    number: "24/7",
    label: "SEO Monitoring"
  }
]

export default function HeroSpecialistSEO() {
  return (
    <section className="relative overflow-hidden bg-white sm:bg-gradient-to-br sm:from-green-50 sm:via-white sm:to-emerald-50 py-12 md:py-16 pt-32 md:pt-40 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-green-900/20">
      <div className="container mx-auto pt-16 pb-24 px-4">
        <div className="grid gap-8 md:gap-12 lg:grid-cols-2 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-6">
              <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <TrendingUp className="mr-2 h-4 w-4" />
                SEO Optimization Expert
              </span>
            </div>

            <h1 className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
              Expert{" "}
              <span className="text-green-600 dark:text-green-400">SEO Services</span>{" "}
              for Higher Rankings
            </h1>

            <p className="mb-6 md:mb-8 text-base md:text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Boost your website&apos;s visibility and drive organic traffic with our comprehensive SEO services.
              Our specialists use proven strategies and cutting-edge techniques to improve your search rankings
              and deliver measurable results that grow your business online.
            </p>

            <div className="mb-6 md:mb-8 flex flex-wrap gap-3 md:gap-4">
              <div className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-300">
                <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                Keyword Research & Analysis
              </div>
              <div className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-300">
                <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                On-Page & Technical SEO
              </div>
              <div className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-300">
                <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                Performance Tracking & Reports
              </div>
            </div>

            <div className="flex flex-col gap-3 md:gap-4 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center rounded-lg bg-green-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-xl"
              >
                Start SEO Audit
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center rounded-lg border-2 border-green-600 px-8 py-4 font-semibold text-green-600 transition-all hover:bg-green-600 hover:text-white"
              >
                View SEO Case Studies
              </motion.button>
            </div>
          </motion.div>

          {/* Right Content - Image & Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative h-[400px] w-full overflow-hidden rounded-2xl">
              <Image
                src="/images/featured/SEO_Specialist_Services.png?height=400&width=600"
                alt="SEO Specialist Services"
                fill
                className="object-cover shadow-2xl"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* Overlay with gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-emerald-600/80 rounded-2xl flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">Rank Higher</h3>
                  <p className="text-lg">Dominate Search Results</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="mb-2 flex justify-center">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <stat.icon className="h-4 w-4 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-green-400/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl"></div>
    </section>
  )
}
