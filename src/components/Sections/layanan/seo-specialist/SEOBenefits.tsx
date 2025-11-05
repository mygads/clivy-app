"use client"

import { motion } from "framer-motion"
import { Search, TrendingUp, Globe, Send, Star } from "lucide-react"

const benefits = [
  {
    icon: Search,
    title: "Maximum Visibility",
    description:
      "Boost your website's visibility in Google search results with targeted SEO strategies that drive organic traffic.",
    highlighted: false,
  },
  {
    icon: TrendingUp,
    title: "Optimal Conversion",
    description: "Conversion-focused optimization that increases ROI and drives sustainable business growth through strategic SEO.",
    highlighted: true,
  },
  {
    icon: Globe,
    title: "Competitive Advantage",
    description: "Gain competitive edge with advanced SEO strategies that outperform competitors in your industry niche.",
    highlighted: false,
  },
  {
    icon: Send,
    title: "Future-Ready Strategy",
    description: "Adaptive and sustainable SEO strategies designed to withstand search engine algorithm changes and updates.",
    highlighted: true,
  },
]

export default function SEOBenefits() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white sm:bg-gradient-to-br sm:from-white sm:via-green-50/30 sm:to-emerald-50/50 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-green-950/20 dark:sm:to-emerald-950/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100/80 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mb-6">
            <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Key Benefits</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
            Digital Transformation Starts with
            <span className="text-green-600 dark:text-green-400"> Smart SEO</span> Strategy
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 md:mb-6"></div>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            In today&apos;s competitive digital landscape, business success is no longer determined merely by product quality,
            but by your ability to be seen and heard. Genfity&apos;s SEO Specialist serves as your digital architect,
            transforming algorithm complexity into measurable online success pathways.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group relative rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-xl ${benefit.highlighted
                ? "bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg hover:from-green-700 hover:to-emerald-700"
                : "bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-green-100/50 dark:border-green-900/30 hover:border-green-200 dark:hover:border-green-800"
                }`}
            >
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl transition-all duration-300 ${benefit.highlighted
                ? "bg-white/20 text-white group-hover:bg-white/30"
                : "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-400 group-hover:from-green-200 group-hover:to-emerald-200 dark:group-hover:from-green-800/40 dark:group-hover:to-emerald-800/40"
                }`}>
                <benefit.icon className="h-8 w-8" />
              </div>
              <h3 className={`mb-3 text-lg font-bold transition-colors duration-300 ${benefit.highlighted
                ? "text-white"
                : "text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300"
                }`}>
                {benefit.title}
              </h3>
              <p className={`text-sm leading-relaxed transition-colors duration-300 ${benefit.highlighted
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
