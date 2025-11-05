"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle, ClipboardList, Database, FileText, MessageSquare, Rocket, Settings, TestTube, Users } from "lucide-react"

const processSteps = [
    {
        number: "01",
        icon: MessageSquare,
        title: "Business Analysis & Requirements",
        description: "Comprehensive analysis of your business processes, stakeholder interviews, and detailed requirements gathering to understand your unique needs.",
    },
    {
        number: "02",
        icon: Database,
        title: "System Design & Architecture",
        description: "Design scalable system architecture, database schema, user interface mockups, and integration strategies with existing systems.",
    },
    {
        number: "03",
        icon: Settings,
        title: "Core Development & Implementation",
        description: "Building the core system modules, implementing business logic, developing user interfaces, and creating administrative panels.",
    },
    {
        number: "04",
        icon: Users,
        title: "Integration & Configuration",
        description: "Integrating with existing systems, configuring workflows, setting up user roles and permissions, and data migration processes.",
    },
    {
        number: "05",
        icon: TestTube,
        title: "Testing & Quality Assurance",
        description: "Comprehensive testing including unit tests, integration testing, user acceptance testing, and performance optimization.",
    },
    {
        number: "06",
        icon: Rocket,
        title: "Deployment & Go-Live",
        description: "Production deployment, system monitoring setup, user training, and post-launch support to ensure smooth transition.",
    },
    {
        number: "07",
        icon: ClipboardList,
        title: "Training & Documentation",
        description: "Comprehensive user training programs, system documentation, administrator guides, and knowledge transfer sessions.",
    },
    {
        number: "08",
        icon: FileText,
        title: "Support & Maintenance",
        description: "Ongoing technical support, system updates, performance monitoring, and continuous improvement based on user feedback.",
    }
]

const methodologies = [
    {
        name: "Agile Development",
        description: "Iterative development with regular sprint reviews and stakeholder feedback to ensure alignment with business goals."
    },
    {
        name: "Enterprise Architecture",
        description: "Structured approach following enterprise architecture principles for scalable and maintainable systems."
    },
    {
        name: "DevSecOps",
        description: "Security-first development approach with automated security testing and compliance validation throughout development."
    },
    {
        name: "Change Management",
        description: "Structured change management process to ensure smooth user adoption and minimal business disruption."
    }
]

const qualityStandards = [
    "ISO 27001 Security Standards",
    "GDPR Compliance Framework",
    "SOC 2 Type II Controls",
    "Industry-Specific Regulations"
]

export default function CorporateSystemProcess() {
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
        <section className="bg-white py-16 sm:py-20 md:py-24 lg:py-32 sm:bg-gradient-to-br sm:from-indigo-50 sm:to-purple-50 dark:bg-gray-900 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-indigo-900/20">
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
                        Corporate <span className="bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">System</span> Development
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
                                className="relative rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl"
                            >
                                <div className="mb-3 sm:mb-4 flex items-center justify-between">
                                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg">
                                        <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </div>
                                    <span className="text-3xl sm:text-4xl font-bold text-gray-200 dark:text-gray-700">{step.number}</span>
                                </div>
                                <h3 className="mb-2 sm:mb-3 text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-6 sm:mt-8 flex justify-center space-x-3 sm:space-x-4">
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