"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronLeft, ChevronRight, BarChart3, Calendar, Code, Clock, TrendingUp, FileText, Target } from "lucide-react"

const processSteps = [
  {
    number: "01",
    icon: BarChart3,
    title: "Information Gathering",
    description: "Collecting comprehensive data about your business, target audience, and competitors to create strategic foundation.",
  },
  {
    number: "02",
    icon: Calendar,
    title: "Strategy Planning",
    description: "Developing strategic SEO roadmap tailored to your business goals and market opportunities.",
  },
  {
    number: "03",
    icon: Code,
    title: "Technical Implementation",
    description: "Building and optimizing technical and content elements required for effective SEO performance.",
  },
  {
    number: "04",
    icon: Clock,
    title: "Campaign Execution",
    description: "Launching SEO campaigns and implementing optimization strategies across all digital platforms.",
  },
  {
    number: "05",
    icon: TrendingUp,
    title: "Performance Monitoring",
    description: "Tracking campaign performance metrics and gathering data for continuous evaluation and improvement.",
  },
  {
    number: "06",
    icon: FileText,
    title: "Analysis & Reporting",
    description: "Analyzing results, identifying optimization opportunities, and planning next strategic steps.",
  },
]

export default function SEOProcess() {
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
            SEO <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Specialist</span> Process
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
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
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
