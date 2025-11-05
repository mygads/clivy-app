"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Search, PenTool, Code, TestTube, Rocket, HeadphonesIcon } from "lucide-react"

const processSteps = [
    {
        number: "01",
        icon: Search,
        title: "Discovery & Planning",
        description: "We analyze your business requirements, target audience, and technical needs to create a comprehensive project roadmap.",
    },
    {
        number: "02",
        icon: PenTool,
        title: "Design & Prototyping",
        description: "Creating user-centered designs, wireframes, and interactive prototypes that visualize your web application before development.",
    },
    {
        number: "03",
        icon: Code,
        title: "Development & Integration",
        description: "Building your web application using modern technologies, implementing features, and integrating with required services and APIs.",
    },
    {
        number: "04",
        icon: TestTube,
        title: "Testing & Quality Assurance",
        description: "Comprehensive testing including functionality, performance, security, and user acceptance testing to ensure quality.",
    },
    {
        number: "05",
        icon: Rocket,
        title: "Deployment & Launch",
        description: "Deploying to production environment, configuring hosting, setting up monitoring, and ensuring smooth application launch.",
    },
    {
        number: "06",
        icon: HeadphonesIcon,
        title: "Support & Maintenance",
        description: "Ongoing support, regular updates, performance monitoring, and continuous improvements to keep your application running optimally.",
    },
]

export default function WebAppProcess() {
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
        <section className="bg-white sm:bg-gray-50 py-20 dark:bg-gray-800">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Process</p>
                    <h2 className="mb-6 text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">
                        Web <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Application</span> Development
                    </h2>
                </motion.div>

                <div className="relative">
                    <div className="grid gap-6 md:grid-cols-3">
                        {visibleSteps.map((step, index) => (
                            <motion.div
                                key={`${currentIndex}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="relative rounded-2xl bg-white/80 dark:bg-gray-900/70 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg">
                                        <step.icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-4xl font-bold text-gray-200 dark:text-gray-700">{step.number}</span>
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex justify-center space-x-4">
                        <button
                            onClick={prevSlide}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                            disabled={currentIndex === 0}
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                            disabled={currentIndex + itemsPerPage >= processSteps.length}
                        >
                            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

