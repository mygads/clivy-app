"use client"

import { motion } from "framer-motion"
import { Sparkles, Award, Users, Target, Shield, Zap } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "Holistic Approach",
    description: "Viewing brands as integrated ecosystems, connecting every communication element for maximum impact and strategic alignment."
  },
  {
    icon: Award,
    title: "Expert Team",
    description: "Experienced professionals from diverse backgrounds, bringing unique perspectives and comprehensive solutions to every project."
  },
  {
    icon: Target,
    title: "Result Focus",
    description: "Every strategy measured by real impact, transforming brand investments into measurable competitive advantages."
  },
  {
    icon: Zap,
    title: "Best Innovation",
    description: "Always updated with latest trends, designing adaptive strategies that evolve with changing market dynamics."
  },
  {
    icon: Users,
    title: "Client Partnership",
    description: "Building long-term strategic partnerships through transparent communication and collaborative development processes."
  },
  {
    icon: Shield,
    title: "Brand Protection",
    description: "Implementing comprehensive governance frameworks that protect and strengthen your brand equity across all touchpoints."
  }
]

export default function BrandingWhyChoose() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white sm:bg-gradient-to-br sm:from-white sm:via-indigo-50/30 sm:to-purple-50/40 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-indigo-950/20 dark:sm:to-purple-950/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/80 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 mb-6">
            <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Why Choose Us</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
            Building Brand Identity Beyond
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Conventional Boundaries</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto mb-4 md:mb-6"></div>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            We don&apos;t just design, we translate your business essence into compelling visual narratives and communication strategies.
            Every strategic decision is built upon deep research, unlimited creativity, and commitment to delivering authentic and
            influential brand identities.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <div className="h-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg mb-4 md:mb-6 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 mx-auto">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 text-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-800/50 rounded-2xl p-8 max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Ready to transform your brand vision into market-dominating reality?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-6 py-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Strategic Excellence</span>
              </div>
              <div className="px-6 py-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Creative Innovation</span>
              </div>
              <div className="px-6 py-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Market Leadership</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
