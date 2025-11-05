"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import {
    ChevronLeft,
    ChevronRight,
    Phone,
    FileText,
    Search,
    Wrench,
    CheckCircle,
    BarChart3,
    ArrowRight,
    Clock,
    AlertTriangle,
    Monitor,
    Users,
    MessageSquare
} from "lucide-react"

const processSteps = [
    {
        number: "01",
        icon: Phone,
        title: "Issue Reporting",
        description: "Report your technical issue through our multiple support channels for immediate assistance.",
    },
    {
        number: "02",
        icon: FileText,
        title: "Ticket Creation & Priority",
        description: "Our system automatically creates a ticket and assigns priority based on issue severity.",
    },
    {
        number: "03",
        icon: Search,
        title: "Diagnosis & Analysis",
        description: "Expert technicians analyze the issue and determine the best resolution approach.",
    },
    {
        number: "04",
        icon: Wrench,
        title: "Resolution Implementation",
        description: "Apply the solution using remote tools or schedule on-site visit if needed.",
    },
    {
        number: "05",
        icon: CheckCircle,
        title: "Testing & Verification",
        description: "Verify the fix works properly and ensure the issue is completely resolved.",
    },
    {
        number: "06",
        icon: BarChart3,
        title: "Follow-up & Documentation",
        description: "Document the resolution and follow up to ensure continued stability.",
    }
]

const supportLevels = [
    {
        level: "Tier 1",
        description: "Basic Support",
        skills: ["General troubleshooting", "Password resets", "Software basics"],
        escalation: "Common issues and requests",
        icon: Users
    },
    {
        level: "Tier 2",
        description: "Advanced Support",
        skills: ["Network issues", "Hardware problems", "Advanced software"],
        escalation: "Complex technical issues",
        icon: Wrench
    },
    {
        level: "Tier 3",
        description: "Expert Support",
        skills: ["System architecture", "Complex integrations", "Custom solutions"],
        escalation: "Critical system issues",
        icon: AlertTriangle
    }
]

const communicationMethods = [
    {
        method: "Phone Support",
        description: "Direct voice communication",
        bestFor: "Urgent issues requiring immediate attention",
        availability: "24/7 for critical issues",
        icon: Phone
    },
    {
        method: "Remote Desktop",
        description: "Screen sharing and remote control",
        bestFor: "Visual problems and guided assistance",
        availability: "Business hours + emergency",
        icon: Monitor
    },
    {
        method: "Email Support",
        description: "Detailed written communication",
        bestFor: "Non-urgent issues and documentation",
        availability: "24/7 ticket system",
        icon: MessageSquare
    },
    {
        method: "Live Chat",
        description: "Real-time text communication",
        bestFor: "Quick questions and status updates",
        availability: "Business hours",
        icon: MessageSquare
    }
]

export default function TechSupportProcess() {
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
        <section className="py-12 sm:py-16 md:py-20 bg-white sm:bg-gradient-to-br sm:from-white sm:via-teal-50/30 sm:to-white dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-teal-900/20">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-8 sm:mb-12"
                >
                    <p className="mb-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Process</p>
                    <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                        Technical <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Support</span> Process
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
                                className="relative rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl border border-gray-100 dark:border-gray-700"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg">
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