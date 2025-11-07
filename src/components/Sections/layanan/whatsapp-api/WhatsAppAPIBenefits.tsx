"use client"

import { motion } from "framer-motion"
import { BarChart3, Clock, MessageSquare, Shield, TrendingUp, Users, Zap } from "lucide-react"

const benefits = [
    {
        icon: TrendingUp,
        title: "Increased Customer Engagement",
        description: "Reach customers on their preferred platform with 98% open rates and instant message delivery for higher engagement.",
        color: "text-green-600 dark:text-green-400"
    },
    {
        icon: Clock,
        title: "Real-Time Communication",
        description: "Enable instant two-way communication with customers for support, notifications, and interactive conversations.",
        color: "text-blue-600 dark:text-blue-400"
    },
    {
        icon: Shield,
        title: "Enterprise Security",
        description: "End-to-end encryption and secure API authentication ensure your business communications remain protected.",
        color: "text-red-600 dark:text-red-400"
    },
    {
        icon: Zap,
        title: "Automated Workflows",
        description: "Automate customer notifications, support tickets, and marketing campaigns to improve operational efficiency.",
        color: "text-yellow-600 dark:text-yellow-400"
    },
    {
        icon: BarChart3,
        title: "Advanced Analytics",
        description: "Track message delivery, read rates, and customer interactions with comprehensive reporting and analytics.",
        color: "text-purple-600 dark:text-purple-400"
    },
    {
        icon: Users,
        title: "Global Reach",
        description: "Connect with customers worldwide using WhatsApp's 2+ billion user base for international business growth.",
        color: "text-orange-600 dark:text-orange-400"
    }
]

const statistics = [
    { value: "99.9%", label: "API Uptime", description: "Guaranteed service availability" },
    { value: "98%", label: "Message Delivery", description: "Successful delivery rate" },
    { value: "<200ms", label: "Response Time", description: "Average API latency" },
    { value: "24/7", label: "Support Available", description: "Technical assistance" }
]

const businessImpact = [
    {
        metric: "Customer Response Rate",
        improvement: "+300%",
        description: "Higher response rates compared to email"
    },
    {
        metric: "Support Efficiency",
        improvement: "+60%",
        description: "Faster resolution with instant messaging"
    },
    {
        metric: "Marketing ROI",
        improvement: "+250%",
        description: "Better conversion rates with direct messaging"
    },
    {
        metric: "Customer Satisfaction",
        improvement: "+85%",
        description: "Improved satisfaction with real-time support"
    }
]

const industries = [
    {
        name: "E-commerce",
        useCases: ["Order confirmations", "Shipping updates", "Customer support", "Abandoned cart recovery"]
    },
    {
        name: "Healthcare",
        useCases: ["Appointment reminders", "Test results", "Health tips", "Emergency notifications"]
    },
    {
        name: "Finance",
        useCases: ["Transaction alerts", "Payment reminders", "Account updates", "Security notifications"]
    },
    {
        name: "Education",
        useCases: ["Class schedules", "Assignment reminders", "Results notification", "Parent communication"]
    }
]

export default function WhatsAppAPIBenefits() {
    return (
        <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-dark">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                        Transform Your Business <span className="text-primary">Communication</span>
                    </h2>
                    <p className="mb-8 sm:mb-12 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        Unlock the power of WhatsApp Business API to enhance customer relationships,
                        automate communications, and drive business growth with proven results.
                    </p>
                </motion.div>

                {/* Benefits Grid */}
                <div className="mb-12 sm:mb-16 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-6 sm:p-8 shadow-sm transition-all hover:shadow-xl border border-gray-100 dark:border-gray-700"
                        >
                            <div className={`mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gray-100 transition-all group-hover:scale-110 dark:bg-gray-800 ${benefit.color}`}>
                                <benefit.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                            </div>
                            <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                {benefit.title}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                {benefit.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Performance Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-12 sm:mb-16 rounded-2xl bg-gray-50 dark:bg-gray-800 p-6 sm:p-8 border border-gray-100 dark:border-gray-700"
                >
                    <div className="text-center">
                        <h3 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            Proven Performance Metrics
                        </h3>
                        <p className="mb-8 sm:mb-12 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                            Our WhatsApp API delivers exceptional performance and reliability for business communications
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {statistics.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="mb-2 text-4xl font-bold text-green-600 dark:text-green-400 md:text-5xl">
                                    {stat.value}
                                </div>
                                <div className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {stat.label}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {stat.description}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Business Impact */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="text-center">
                        <h3 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                            Measurable Business Impact
                        </h3>
                        <p className="mb-12 text-gray-600 dark:text-gray-300">
                            See how WhatsApp API integration delivers tangible results for businesses across industries
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {businessImpact.map((impact, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-white p-6 text-center shadow-sm dark:bg-gray-900"
                            >
                                <div className="mb-2 text-3xl font-bold text-green-600 dark:text-green-400">
                                    {impact.improvement}
                                </div>
                                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                                    {impact.metric}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {impact.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Industry Use Cases */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 dark:from-gray-800 dark:to-green-900/20 md:p-12"
                >
                    <div className="text-center">
                        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            Industry-Specific Solutions
                        </h3>
                        <p className="mb-12 text-gray-600 dark:text-gray-300">
                            WhatsApp API adapts to various industry needs with specialized use cases and implementations
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {industries.map((industry, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-700"
                            >
                                <h4 className="mb-4 text-lg font-bold text-green-600 dark:text-green-400">
                                    {industry.name}
                                </h4>
                                <ul className="space-y-2">
                                    {industry.useCases.map((useCase, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                            <div className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                                            {useCase}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </section>
    )
}