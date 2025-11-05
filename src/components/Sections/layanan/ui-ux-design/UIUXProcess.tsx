"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Users, Lightbulb, Palette, TestTube, Zap, Heart, Target } from "lucide-react"

const processSteps = [
  {
    number: "01",
    icon: Users,
    title: "User Research & Analysis",
    description: "Conduct comprehensive user interviews, surveys, and competitor analysis to understand user needs and market opportunities.",
  },
  {
    number: "02",
    icon: Lightbulb,
    title: "Information Architecture",
    description: "Create strategic user flows, wireframes, and information hierarchy for optimal user experience design.",
  },
  {
    number: "03",
    icon: Palette,
    title: "UI Design & Prototyping",
    description: "Design stunning visual interfaces with interactive prototypes and comprehensive design systems.",
  },
  {
    number: "04",
    icon: TestTube,
    title: "User Testing & Validation",
    description: "Conduct thorough usability testing and gather feedback to validate and refine design decisions.",
  },
  {
    number: "05",
    icon: Zap,
    title: "Design Implementation",
    description: "Collaborate with developers to ensure pixel-perfect implementation and optimal performance.",
  },
  {
    number: "06",
    icon: Heart,
    title: "Continuous Optimization",
    description: "Monitor user behavior patterns and iterate designs for improved satisfaction and engagement.",
  },
]

export default function UIUXProcess() {
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
    <section className="bg-white py-16 sm:py-20 md:py-24 lg:py-32 sm:bg-gradient-to-br sm:from-pink-50 sm:to-purple-50 dark:bg-gray-900 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-pink-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <p className="mb-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Process</p>
          <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            UI/UX <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Design</span> Process
          </h2>
        </motion.div>

        <div className="relative">
          <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
            {visibleSteps.map((step, index) => (
              <motion.div
                key={`${currentIndex}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 md:p-8 shadow-sm transition-all hover:shadow-xl"
              >
                <div className="mb-4 sm:mb-6 flex items-center justify-between">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg">
                    <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-bold text-gray-200 dark:text-gray-700">{step.number}</span>
                </div>
                <h3 className="mb-3 text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-6 sm:mt-8 flex justify-center space-x-3 sm:space-x-4">
            <button
              onClick={prevSlide}
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all hover:shadow-md dark:hover:bg-gray-700/70"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={nextSlide}
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all hover:shadow-md dark:hover:bg-gray-700/70"
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
