"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronLeft, ChevronRight, CheckCircle, Code, FileText, MessageSquare, Settings, Users, Webhook, Zap } from "lucide-react"

const processSteps = [
    {
        number: "01",
        title: "Business Verification",
        description: "Complete WhatsApp Business verification process with Facebook Business Manager and obtain API access approval.",
        icon: CheckCircle,
    },
    {
        number: "02",
        title: "API Integration Setup",
        description: "Configure API credentials, webhooks, and authentication tokens for secure message delivery and receiving.",
        icon: Settings,
    },
    {
        number: "03",
        title: "Development & Testing",
        description: "Implement API endpoints, develop message templates, and conduct comprehensive testing in sandbox environment.",
        icon: Code,
    },
    {
        number: "04",
        title: "Template Approval",
        description: "Submit message templates for WhatsApp review and approval before production deployment.",
        icon: FileText,
    },
    {
        number: "05",
        title: "Production Deployment",
        description: "Deploy to production environment with monitoring, analytics, and performance optimization setup.",
        icon: Zap,
    },
    {
        number: "06",
        title: "Training & Support",
        description: "Comprehensive team training and ongoing technical support to ensure successful API utilization.",
        icon: Users,
    }
]

const technicalRequirements = [
    {
        category: "API Prerequisites",
        requirements: [
            "Valid WhatsApp Business Account",
            "Facebook Business Manager Access",
            "Verified Business Profile",
            "SSL Certificate for Webhooks"
        ]
    },
    {
        category: "Technical Setup",
        requirements: [
            "HTTPS Webhook Endpoint",
            "JSON Parsing Capability",
            "HTTP Request Library",
            "Token Management System"
        ]
    },
    {
        category: "Development Environment",
        requirements: [
            "REST API Client",
            "Webhook Testing Tool",
            "Message Template Editor",
            "Analytics Dashboard"
        ]
    }
]

const integrationMethods = [
    {
        method: "REST API",
        description: "Direct HTTP requests for sending and receiving messages",
        difficulty: "Basic",
        timeToImplement: "2-4 hours",
        features: ["Send messages", "Receive webhooks", "Media handling", "Template messages"]
    },
    {
        method: "SDK Integration",
        description: "Use our comprehensive SDK for faster implementation",
        difficulty: "Easy",
        timeToImplement: "1-2 hours",
        features: ["Pre-built functions", "Error handling", "Rate limiting", "Documentation"]
    },
    {
        method: "No-Code Platform",
        description: "Visual interface for non-technical users",
        difficulty: "Beginner",
        timeToImplement: "30 minutes",
        features: ["Drag-and-drop", "Visual workflows", "Template builder", "Analytics"]
    }
]

const messagingCapabilities = [
    {
        type: "Text Messages",
        description: "Plain text with formatting, emojis, and links",
        icon: MessageSquare,
        examples: ["Customer notifications", "Order confirmations", "Support responses"]
    },
    {
        type: "Media Messages",
        description: "Images, videos, documents, and audio files",
        icon: FileText,
        examples: ["Product catalogs", "Invoice PDFs", "Voice messages"]
    },
    {
        type: "Interactive Messages",
        description: "Buttons, lists, and quick reply options",
        icon: Settings,
        examples: ["Survey forms", "Menu selections", "Quick responses"]
    },
    {
        type: "Template Messages",
        description: "Pre-approved business templates for notifications",
        icon: CheckCircle,
        examples: ["Appointment reminders", "Shipping updates", "Payment alerts"]
    }
]

export default function WhatsAppAPIProcess() {
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
        <section className="py-12 sm:py-16 md:py-20 bg-white sm:bg-gradient-to-br sm:from-white sm:via-green-50/30 sm:to-white dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-green-900/20">
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
                        WhatsApp <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">API</span> Integration
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
                                <div className="mb-3 sm:mb-4 flex items-center justify-between">
                                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
                                        <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </div>
                                    <span className="text-3xl sm:text-4xl font-bold text-gray-200 dark:text-gray-700">{step.number}</span>
                                </div>
                                <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{step.description}</p>
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