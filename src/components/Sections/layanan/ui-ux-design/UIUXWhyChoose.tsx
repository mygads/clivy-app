"use client"

import { motion } from "framer-motion"
import { Rocket, Triangle, Zap, Globe, BarChart3, Users, ThumbsUp } from "lucide-react"

const features = [
  {
    icon: Rocket,
    title: "Unlimited Innovation",
    description:
      "We&apos;re always at the forefront of design trends, delivering creative solutions that exceed conventional expectations.",
  },
  {
    icon: Triangle,
    title: "Total User Focus",
    description:
      "Every design is built based on deep research into user behavior, needs, and preferences for optimal experience.",
  },
  {
    icon: Zap,
    title: "Cutting-Edge Technology",
    description: "Utilizing the latest tools and technologies to create responsive and sophisticated interfaces.",
  },
  {
    icon: Globe,
    title: "Customized Solutions",
    description: "Creating unique designs that reflect your brand&apos;s specific identity and objectives.",
  },
  {
    icon: BarChart3,
    title: "Data-Driven Approach",
    description: "Using analytics and testing to continuously optimize user experience and design performance.",
  },
  {
    icon: Users,
    title: "Results-Focused Team",
    description: "Supported by designers, researchers, and technology experts with proven competence and expertise.",
  },
]

export default function UIUXWhyChoose() {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-20 lg:py-24 sm:bg-gradient-to-br sm:from-pink-50 sm:via-purple-50 sm:to-white dark:bg-gray-800 dark:sm:from-pink-950/30 dark:sm:via-purple-950/20 dark:sm:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-pink-100/80 dark:bg-pink-900/30 backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50 mb-4">
            <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4 text-pink-600 dark:text-pink-400" />
            <span className="text-xs sm:text-sm font-medium text-pink-700 dark:text-pink-300">Why Choose Us</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Why Choose Us to Design Your
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> Digital Experience</span>?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            In the competitive digital landscape, design isn&apos;t just about appearance, but strategy. We deliver
            a comprehensive approach that combines creativity, technology, and deep understanding of user behavior
            to create exceptional digital experiences.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group p-4 sm:p-6 md:p-8 rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-pink-200/50 dark:border-pink-900/30 hover:border-pink-300 dark:hover:border-pink-800 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative mb-4 sm:mb-6">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg group-hover:from-pink-600 group-hover:to-purple-700 group-hover:shadow-xl transition-all duration-300">
                  <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-pink-100/50 dark:bg-pink-900/20 blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
