"use client"

import { motion } from "framer-motion"
import { FileText, BookOpen, Users, Globe, Star } from "lucide-react"

const benefits = [
  {
    icon: FileText,
    title: "Raw Files & Complete Assets",
    description: "Get all raw files and branding assets for your business future needs and long-term growth.",
    highlighted: false,
  },
  {
    icon: BookOpen,
    title: "Comprehensive Brand Guidelines",
    description: "Complete guidelines for brand identity usage to ensure consistency across all platforms and touchpoints.",
    highlighted: true,
  },
  {
    icon: Users,
    title: "Ongoing Consultation",
    description: "Continuous consultation support for brand implementation, development, and strategic evolution.",
    highlighted: false,
  },
  {
    icon: Globe,
    title: "Cross-Platform Optimization",
    description: "Brand identity optimized for various digital platforms, print media, and marketing materials.",
    highlighted: true,
  },
]

export default function BrandingBenefits() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white sm:bg-gradient-to-br sm:from-white sm:via-indigo-50/30 sm:to-purple-50/50 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-indigo-950/20 dark:sm:to-purple-950/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/80 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 mb-4">
            <Star className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Key Benefits</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
            Ready to Unlock Your
            <span className="text-indigo-600 dark:text-indigo-400"> Brand&apos;s</span> Hidden Power?
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Why do some brands become incredibly impressive while others are forgotten? The answer lies in comprehensive
            strategic benefits - something we deliver in every branding service we provide for sustainable business growth.
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
              className={`group relative rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-xl ${benefit.highlighted
                ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 hover:to-purple-700"
                : "bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-900/30 hover:border-indigo-200 dark:hover:border-indigo-800"
                }`}
            >
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl transition-all duration-300 ${benefit.highlighted
                ? "bg-white/20 text-white group-hover:bg-white/30"
                : "bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400 group-hover:from-indigo-200 group-hover:to-purple-200 dark:group-hover:from-indigo-800/40 dark:group-hover:to-purple-800/40"
                }`}>
                <benefit.icon className="h-8 w-8" />
              </div>
              <h3 className={`mb-3 text-lg font-bold transition-colors duration-300 ${benefit.highlighted
                ? "text-white"
                : "text-gray-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300"
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
