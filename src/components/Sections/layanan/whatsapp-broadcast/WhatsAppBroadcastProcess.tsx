"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronLeft, ChevronRight, CheckCircle, FileText, MessageSquare, Send, Settings, Target, Users, Zap } from "lucide-react"

const processSteps = [
    {
        number: "01",
        title: "Audience Setup",
        description: "Import and organize your contact database with advanced segmentation tools for targeted campaigns.",
        icon: Users,
    },
    {
        number: "02",
        title: "Message Creation",
        description: "Design compelling broadcast messages with rich media support and personalization options.",
        icon: MessageSquare,
    },
    {
        number: "03",
        title: "Campaign Configuration",
        description: "Set up campaign parameters including scheduling, frequency, and delivery optimization settings.",
        icon: Settings,
    },
    {
        number: "04",
        title: "Target Selection",
        description: "Choose specific audience segments and apply filters to ensure precise message targeting.",
        icon: Target,
    },
    {
        number: "05",
        title: "Campaign Launch",
        description: "Deploy your broadcast campaign with real-time monitoring and delivery tracking capabilities.",
        icon: Send,
    },
    {
        number: "06",
        title: "Performance Analysis",
        description: "Monitor campaign results with detailed analytics and insights for continuous optimization.",
        icon: Zap,
    }
]

const campaignTypes = [
    {
        type: "Immediate Broadcast",
        description: "Send messages instantly to your entire audience",
        timeframe: "Instant delivery",
        useCase: "Flash sales, urgent announcements, breaking news",
        features: ["Instant deployment", "Real-time delivery", "Live monitoring"]
    },
    {
        type: "Scheduled Campaign",
        description: "Plan and schedule campaigns for optimal timing",
        timeframe: "Custom scheduling",
        useCase: "Product launches, event promotions, regular updates",
        features: ["Time zone optimization", "Auto-scheduling", "Campaign queue"]
    },
    {
        type: "Drip Campaign",
        description: "Send series of messages over time",
        timeframe: "Days to weeks",
        useCase: "Customer onboarding, education series, nurture campaigns",
        features: ["Message sequences", "Automated triggers", "Behavior-based timing"]
    },
    {
        type: "Triggered Broadcast",
        description: "Automated messages based on customer actions",
        timeframe: "Event-triggered",
        useCase: "Cart abandonment, purchase follow-up, engagement recovery",
        features: ["Event triggers", "Conditional logic", "Real-time automation"]
    }
]

const deliveryOptimization = [
    {
        feature: "Smart Scheduling",
        description: "AI-powered optimal timing based on recipient behavior",
        benefit: "30% higher open rates"
    },
    {
        feature: "Rate Limiting",
        description: "Controlled message delivery to avoid spam detection",
        benefit: "99% delivery success"
    },
    {
        feature: "Retry Logic",
        description: "Automatic retry for failed messages",
        benefit: "95% message delivery"
    },
    {
        feature: "Duplicate Prevention",
        description: "Automatic duplicate message detection and prevention",
        benefit: "Improved user experience"
    }
]

const messageFormats = [
    {
        format: "Text Messages",
        description: "Plain text with emojis and formatting",
        maxLength: "4,096 characters",
        features: ["Rich formatting", "Emoji support", "URL links", "Variable insertion"]
    },
    {
        format: "Media Messages",
        description: "Images, videos, and documents",
        maxLength: "16MB file size",
        features: ["Image broadcasting", "Video sharing", "PDF documents", "Audio messages"]
    },
    {
        format: "Template Messages",
        description: "Pre-approved business templates",
        maxLength: "1,024 characters",
        features: ["WhatsApp approved", "Professional format", "Variable support", "Call-to-action buttons"]
    },
    {
        format: "Interactive Messages",
        description: "Buttons and quick reply options",
        maxLength: "20 buttons max",
        features: ["Action buttons", "Quick replies", "List selections", "URL buttons"]
    }
]

const analyticsMetrics = [
    { metric: "Delivery Rate", description: "Messages successfully delivered", icon: CheckCircle },
    { metric: "Open Rate", description: "Messages opened by recipients", icon: MessageSquare },
    { metric: "Click-Through Rate", description: "Links clicked in messages", icon: Target },
    { metric: "Response Rate", description: "Recipients who replied", icon: Send },
    { metric: "Conversion Rate", description: "Desired actions completed", icon: Zap },
    { metric: "Unsubscribe Rate", description: "Recipients who opted out", icon: Users }
]

export default function WhatsAppBroadcastProcess() {
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
        <section className="bg-white sm:bg-gradient-to-br sm:from-white sm:via-orange-50/30 sm:to-white py-12 sm:py-16 md:py-20 dark:bg-gray-900 dark:sm:from-gray-900 dark:sm:via-orange-900/10 dark:sm:to-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-8 sm:mb-12"
                >
                    <p className="mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Process</p>
                    <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                        WhatsApp <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Broadcast</span> Process
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
                                className="relative rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 shadow-sm transition-all hover:shadow-xl"
                            >
                                <div className="mb-3 sm:mb-4 flex items-center justify-between">
                                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
                                        <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </div>
                                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-200 dark:text-gray-700">{step.number}</span>
                                </div>
                                <h3 className="mb-2 sm:mb-3 text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-6 sm:mt-8 flex justify-center space-x-3 sm:space-x-4">
                        <button
                            onClick={prevSlide}
                            className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-colors hover:bg-white hover:shadow-md dark:hover:bg-gray-700"
                            disabled={currentIndex === 0}
                        >
                            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-colors hover:bg-white hover:shadow-md dark:hover:bg-gray-700"
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