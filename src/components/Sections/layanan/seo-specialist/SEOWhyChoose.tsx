"use client"

import { motion } from "framer-motion"
import { Clock, Award, DollarSign, Shield, ThumbsUp } from "lucide-react"

const features = [
  {
    icon: Clock,
    title: "Long-Lasting Results",
    description:
      "We ensure every website we optimize will be efficient, durable, and can withstand every search engine algorithm update for sustained performance.",
  },
  {
    icon: Award,
    title: "Professional Expertise",
    description:
      "We have extensive experience in optimizing corporate websites with tight and challenging keyword competition across various industries.",
  },
  {
    icon: DollarSign,
    title: "Affordable Pricing",
    description:
      "We offer competitive and affordable pricing, so you can get the best quality service without worrying about your budget constraints.",
  },
  {
    icon: Shield,
    title: "Satisfaction Guarantee",
    description:
      "We provide a 30-day money-back guarantee if our optimization services do not meet the expected requirements and standards.",
  },
]

export default function SEOWhyChoose() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white sm:bg-gradient-to-br sm:from-green-50/40 sm:via-emerald-50/30 sm:to-white dark:bg-gray-800 dark:sm:from-green-950/30 dark:sm:via-emerald-950/20 dark:sm:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100/80 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mb-6">
            <ThumbsUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Why Choose Us</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
            Why Genfity is Your Primary Choice for
            <span className="text-green-600 dark:text-green-400"> SEO</span> Services?
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 md:mb-6"></div>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            In the competitive digital landscape, choosing an SEO partner isn&apos;t just a decision - it&apos;s a strategic
            investment in your business future. Genfity brings a different approach that transforms digital challenges
            into golden opportunities.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <div className="h-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-green-100/50 dark:border-green-900/30 rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-center">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg mb-4 md:mb-6 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 mx-auto">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="mb-2 md:mb-3 text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
