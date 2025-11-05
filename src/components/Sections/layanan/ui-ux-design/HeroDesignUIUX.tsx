"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight, PenTool, Palette, Users } from "lucide-react"

const stats = [
  {
    icon: PenTool,
    number: "300+",
    label: "Designs Created"
  },
  {
    icon: Users,
    number: "98%",
    label: "User Satisfaction"
  },
  {
    icon: Palette,
    number: "24/7",
    label: "Design Support"
  }
]

export default function HeroDesignUIUX() {
  return (
    <section className="relative overflow-hidden bg-white sm:bg-gradient-to-br sm:from-pink-50 sm:via-white sm:to-purple-50 py-12 md:py-16 pt-32 md:pt-40 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-pink-900/20">
      <div className="container mx-auto pt-16 pb-24 px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-6">
              <span className="inline-flex items-center rounded-full bg-pink-100/70 dark:bg-pink-900/30 backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-pink-600 dark:text-pink-400">
                <PenTool className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                UI/UX Design Expert
              </span>
            </div>

            <h1 className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
              Beautiful{" "}
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">UI/UX Design</span>{" "}
              Solutions
            </h1>

            <p className="mb-8 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Create exceptional user experiences with our expert UI/UX design services.
              We combine aesthetics with functionality to deliver designs that not only look
              stunning but also drive user engagement and business success.
            </p>

            <div className="mb-6 sm:mb-8 flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <div className="mr-1.5 sm:mr-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-pink-500"></div>
                User Research & Wireframing
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <div className="mr-1.5 sm:mr-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-pink-500"></div>
                Interactive Prototypes
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <div className="mr-1.5 sm:mr-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-pink-500"></div>
                Design System Development
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center justify-center rounded-lg bg-pink-600 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg transition-all hover:bg-pink-700 hover:shadow-xl"
              >
                Start Design Project
                <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center justify-center rounded-lg border-2 border-pink-600 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-pink-600 transition-all hover:bg-pink-600 hover:text-white"
              >
                View Design Portfolio
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
                src="/images/featured/Graphic_Design_Services.png?height=400&width=600"
                alt="UI/UX Design Services"
                fill
                className="object-cover shadow-2xl"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* Overlay with gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600/80 to-purple-600/80 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4">Creative Design</h3>
                  <p className="text-sm sm:text-base md:text-lg">Beautiful User Experiences</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-3 sm:gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="mb-2 flex justify-center">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-pink-100/70 dark:bg-pink-900/30 backdrop-blur-sm text-pink-600 dark:text-pink-400">
                      <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
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
      <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-pink-400/10 blur-3xl"></div>
    </section>
  )
}
