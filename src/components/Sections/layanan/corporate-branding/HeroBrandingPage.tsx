"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight, Briefcase, Award, Target } from "lucide-react"

const stats = [
  {
    icon: Briefcase,
    number: "200+",
    label: "Brands Created"
  },
  {
    icon: Award,
    number: "95%",
    label: "Brand Recognition"
  },
  {
    icon: Target,
    number: "24/7",
    label: "Strategy Support"
  }
]

export default function HeroBrandingPage() {
  return (
    <section className="relative overflow-hidden bg-white sm:bg-gradient-to-br sm:from-indigo-50 sm:via-white sm:to-purple-50 py-12 md:py-16 pt-32 md:pt-40 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-indigo-900/20">
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
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Briefcase className="mr-2 h-4 w-4" />
                Corporate Branding Expert
              </span>
            </div>

            <h1 className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
              Strategic{" "}
              <span className="text-indigo-600 dark:text-indigo-400">Corporate Branding</span>{" "}
              That Drives Growth
            </h1>

            <p className="mb-6 md:mb-8 text-base md:text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Build a powerful brand identity that resonates with your audience and drives business growth.
              Our comprehensive branding services create memorable experiences that differentiate your
              company in competitive markets and establish lasting customer connections.
            </p>

            <div className="mb-6 md:mb-8 flex flex-wrap gap-3 md:gap-4">
              <div className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-300">
                <div className="mr-2 h-2 w-2 rounded-full bg-indigo-500"></div>
                Brand Strategy & Positioning
              </div>
              <div className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-300">
                <div className="mr-2 h-2 w-2 rounded-full bg-indigo-500"></div>
                Visual Identity Design
              </div>
              <div className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-300">
                <div className="mr-2 h-2 w-2 rounded-full bg-indigo-500"></div>
                Brand Guidelines & Assets
              </div>
            </div>

            <div className="flex flex-col gap-3 md:gap-4 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center rounded-lg bg-indigo-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl"
              >
                Start Branding Project
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center rounded-lg border-2 border-indigo-600 px-8 py-4 font-semibold text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white"
              >
                View Brand Portfolio
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
                src="/images/featured/Corporate_Branding_Services.png?height=400&width=600"
                alt="Corporate Branding Services"
                fill
                className="object-cover shadow-2xl"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* Overlay with gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 rounded-2xl flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">Brand Identity</h3>
                  <p className="text-lg">Create Lasting Impressions</p>
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl"></div>
    </section>
  )
}
