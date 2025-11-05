"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Search, Palette, FileText, Rocket, BarChart3, Users, Settings } from "lucide-react"

const processSteps = [
  {
    number: "01",
    icon: Search,
    title: "Brand Research & Discovery",
    description: "Analyze your market, competitors, and target audience to understand positioning opportunities and strategic advantages.",
  },
  {
    number: "02",
    icon: Palette,
    title: "Brand Strategy Development",
    description: "Create comprehensive brand strategy including values, personality, messaging framework, and competitive differentiation.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Visual Identity Design",
    description: "Design logo, color palette, typography, and visual elements that authentically represent your brand essence.",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Brand Implementation",
    description: "Apply brand identity across all touchpoints including digital platforms, print materials, and customer experiences.",
  },
  {
    number: "05",
    icon: BarChart3,
    title: "Performance Monitoring",
    description: "Track brand recognition, engagement metrics, market perception analysis, and competitive positioning.",
  },
  {
    number: "06",
    icon: Users,
    title: "Brand Optimization",
    description: "Refine brand elements based on performance data, customer feedback, and market evolution for maximum impact.",
  },
]

export default function BrandingProcess() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 3

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + itemsPerPage >= processSteps.length ? 0 : prev + itemsPerPage))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev - itemsPerPage < 0 ? Math.max(0, processSteps.length - itemsPerPage) : prev - itemsPerPage,
    )
  }

  const visibleSteps = processSteps.slice(currentIndex, currentIndex + itemsPerPage)

  return (
    <section className="bg-gray-50 py-12 sm:py-16 lg:py-20 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Process</p>
          <h2 className="mb-4 md:mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Corporate <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Branding</span> Development
          </h2>
        </motion.div>

        <div className="relative">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {visibleSteps.map((step, index) => (
              <motion.div
                key={`${currentIndex}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative rounded-2xl bg-white/80 p-4 sm:p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl dark:bg-gray-900/80"
              >
                <div className="mb-3 md:mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                    <step.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  </div>
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-200 dark:text-gray-700">{step.number}</span>
                </div>
                <h3 className="mb-2 md:mb-3 text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-6 md:mt-8 flex justify-center space-x-3 md:space-x-4">
            <button
              onClick={prevSlide}
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={nextSlide}
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
              disabled={currentIndex + itemsPerPage >= processSteps.length}
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
