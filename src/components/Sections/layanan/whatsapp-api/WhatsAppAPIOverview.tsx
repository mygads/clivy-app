"use client"

import { motion } from "framer-motion"
import { ArrowRight, Bot, FileText, Image, MessageCircle, MessageSquare, Play, Send, Settings } from "lucide-react"

const messageTypes = [
    {
        icon: MessageSquare,
        title: "Text Messages",
        description: "Send rich text messages with formatting, emojis, and interactive elements for engaging customer communication."
    },
    {
        icon: Image,
        title: "Media Messages",
        description: "Share images, videos, documents, and audio files directly through WhatsApp to provide comprehensive customer support."
    },
    {
        icon: FileText,
        title: "Template Messages",
        description: "Use pre-approved message templates for notifications, confirmations, and marketing campaigns with high delivery rates."
    },
    {
        icon: Bot,
        title: "Interactive Messages",
        description: "Create buttons, lists, and quick replies for interactive customer experiences and automated workflows."
    }
]

const apiFeatures = [
    {
        name: "Webhook Integration",
        category: "Real-time Events"
    },
    {
        name: "Message Status Tracking",
        category: "Delivery Confirmation"
    },
    {
        name: "Contact Management",
        category: "Customer Database"
    },
    {
        name: "Group Messaging",
        category: "Broadcast Features"
    },
    {
        name: "Message Scheduling",
        category: "Automation Tools"
    },
    {
        name: "Analytics & Reporting",
        category: "Performance Insights"
    },
    {
        name: "Multi-Device Support",
        category: "Cross-Platform"
    },
    {
        name: "Rate Limiting Control",
        category: "API Management"
    }
]

const integrationCapabilities = [
    "RESTful API with comprehensive documentation",
    "Webhook support for real-time message events",
    "SDKs available for popular programming languages",
    "OAuth 2.0 authentication and security",
    "Rate limiting and quota management",
    "Message templates and rich media support",
    "Contact and group management APIs",
    "Analytics and reporting endpoints"
]

const technicalSpecs = [
    {
        spec: "API Version",
        value: "WhatsApp Business API v16.0"
    },
    {
        spec: "Message Rate",
        value: "Up to 250 messages/second"
    },
    {
        spec: "Uptime SLA",
        value: "99.9% guaranteed availability"
    },
    {
        spec: "Response Time",
        value: "< 200ms average latency"
    }
]

export default function WhatsAppAPIOverview() {
    return (
        <section className="py-12 sm:py-16 md:py-20 bg-white sm:bg-gradient-to-br sm:from-white sm:via-green-50/30 sm:to-white dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-green-900/20">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                        Complete WhatsApp API Integration Solutions
                    </h2>
                    <p className="mb-8 sm:mb-12 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
                        Integrate WhatsApp Business API into your applications with our comprehensive
                        API service. Send messages, automate conversations, and enhance customer engagement.
                    </p>
                </motion.div>

                {/* Message Types */}
                <div className="mb-12 sm:mb-16 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {messageTypes.map((type, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-4 sm:p-6 transition-all hover:shadow-lg border border-gray-100 dark:border-gray-700"
                        >
                            <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-all group-hover:bg-green-600 group-hover:text-white dark:bg-green-900/30 dark:text-green-400">
                                <type.icon className="h-5 w-5 sm:h-7 sm:w-7" />
                            </div>
                            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                {type.title}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                                {type.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* API Features & Technical Specs */}
                <div className="grid gap-8 sm:gap-12 lg:grid-cols-2">
                    {/* API Features */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="mb-4 sm:mb-6 text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                            Comprehensive API Features
                        </h3>
                        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                            Our WhatsApp API provides all the features you need to build powerful
                            messaging solutions for your business applications.
                        </p>
                        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                            {apiFeatures.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    viewport={{ once: true }}
                                    className="rounded-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-3 sm:p-4 border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                        {feature.name}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                        {feature.category}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Technical Specifications */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 dark:from-gray-800 dark:to-green-900/20"
                    >
                        <div className="mb-6 text-center">
                            <Settings className="mx-auto mb-4 h-12 w-12 text-green-600 dark:text-green-400" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Technical Specifications
                            </h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                Enterprise-grade API performance and reliability metrics
                            </p>
                        </div>

                        <div className="space-y-4">
                            {technicalSpecs.map((spec, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex justify-between rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700"
                                >
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {spec.spec}
                                    </span>
                                    <span className="font-bold text-green-600 dark:text-green-400">
                                        {spec.value}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Integration Capabilities */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-16"
                >
                    <div className="text-center">
                        <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                            Developer-Friendly Integration
                        </h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300">
                            Easy-to-use APIs with comprehensive documentation and developer tools
                        </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        {integrationCapabilities.map((capability, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className="flex items-center rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                            >
                                <div className="mr-3 h-2 w-2 rounded-full bg-green-500"></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {capability}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Use Cases Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-16 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white md:p-12"
                >
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="text-center">
                            <Send className="mx-auto mb-4 h-12 w-12 text-white" />
                            <h4 className="mb-2 text-xl font-bold">Customer Notifications</h4>
                            <p className="text-green-100">
                                Order confirmations, shipping updates, and appointment reminders
                            </p>
                        </div>
                        <div className="text-center">
                            <MessageCircle className="mx-auto mb-4 h-12 w-12 text-white" />
                            <h4 className="mb-2 text-xl font-bold">Customer Support</h4>
                            <p className="text-green-100">
                                Real-time customer service and automated support workflows
                            </p>
                        </div>
                        <div className="text-center">
                            <Play className="mx-auto mb-4 h-12 w-12 text-white" />
                            <h4 className="mb-2 text-xl font-bold">Marketing Campaigns</h4>
                            <p className="text-green-100">
                                Promotional messages and targeted marketing communications
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                        Ready to Integrate WhatsApp API?
                    </h3>
                    <p className="mb-8 text-gray-600 dark:text-gray-300">
                        Start building powerful messaging solutions with our comprehensive WhatsApp API service
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group inline-flex items-center rounded-lg bg-green-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-xl"
                    >
                        Get API Access
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                </motion.div>
            </div>
        </section>
    )
}