"use client"

import { motion } from "framer-motion"
import { Rocket, Lightbulb, Zap, Globe, Star } from "lucide-react"

const benefits = [
  {
    icon: Rocket,
    title: "Business Conversion Boost",
    description: "Strategic design that significantly increases conversion rates and user engagement for measurable business growth.",
    featured: false,
  },
  {
    icon: Lightbulb,
    title: "Enhanced User Experience",
    description: "Creating intuitive and delightful user journeys for every interaction, ensuring optimal user satisfaction.",
    featured: true,
  },
  {
    icon: Zap,
    title: "Digital Market Competitive Edge",
    description: "Providing competitive advantage through memorable design and strong brand differentiation in the marketplace.",
    featured: false,
  },
  {
    icon: Globe,
    title: "Scalability & Flexibility",
    description: "Design systems that can evolve with business growth and changing user needs for long-term success.",
    featured: true,
  },
]

export default function UIUXBenefits() {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-20 lg:py-24 sm:bg-gradient-to-br sm:from-white sm:via-pink-50 sm:to-purple-50 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-pink-950/20 dark:sm:to-purple-950/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-pink-100/80 dark:bg-pink-900/30 backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50 mb-4">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-pink-600 dark:text-pink-400" />
            <span className="text-xs sm:text-sm font-medium text-pink-700 dark:text-pink-300">Key Benefits</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Digital Transformation Benefits Through
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> Quality Design</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Design isn&apos;t just about appearance, it&apos;s a powerful communication strategy. We deliver UI/UX solutions
            that not only captivate visually, but also drive conversions, increase engagement, and optimize user experience
            for sustainable business growth.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group relative rounded-xl p-4 sm:p-6 text-center transition-all duration-300 hover:shadow-xl ${benefit.featured
                ? "bg-gradient-to-br from-pink-600 to-purple-600 text-white shadow-lg hover:from-pink-700 hover:to-purple-700"
                : "bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-pink-200/50 dark:border-pink-900/30 hover:border-pink-300 dark:hover:border-pink-800"
                }`}
            >
              <div className={`mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-lg sm:rounded-xl transition-all duration-300 ${benefit.featured
                ? "bg-white/20 text-white group-hover:bg-white/30"
                : "bg-gradient-to-br from-pink-100/70 to-purple-100/70 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-600 dark:text-pink-400 group-hover:from-pink-200/80 group-hover:to-purple-200/80 dark:group-hover:from-pink-800/40 dark:group-hover:to-purple-800/40"
                }`}>
                <benefit.icon className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h3 className={`mb-2 sm:mb-3 text-base sm:text-lg font-bold transition-colors duration-300 ${benefit.featured
                ? "text-white"
                : "text-gray-900 dark:text-white group-hover:text-pink-700 dark:group-hover:text-pink-300"
                }`}>
                {benefit.title}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${benefit.featured
                ? "text-white/90"
                : "text-gray-600 dark:text-gray-300"
                }`}>
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
