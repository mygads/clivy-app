"use client"

import { motion } from "framer-motion"
import {
    Clock,
    Award,
    Shield,
    Zap,
    Users,
    TrendingUp,
    CheckCircle,
    Star,
    Phone,
    Monitor
} from "lucide-react"

const benefits = [
    {
        icon: Clock,
        title: "Fast Response Times",
        description: "Quick response and resolution times to minimize downtime and productivity loss.",
        metrics: "Average <30 minutes response"
    },
    {
        icon: Award,
        title: "Certified Technicians",
        description: "Experienced and certified technical professionals with proven expertise.",
        metrics: "Industry-certified experts"
    },
    {
        icon: Shield,
        title: "Proactive Monitoring",
        description: "24/7 system monitoring to prevent issues before they impact your business.",
        metrics: "99.9% uptime guarantee"
    },
    {
        icon: Zap,
        title: "Remote Resolution",
        description: "Most issues resolved remotely for faster service and minimal disruption.",
        metrics: "85% remote resolution rate"
    },
    {
        icon: Users,
        title: "Dedicated Support",
        description: "Personalized support with dedicated technicians who know your systems.",
        metrics: "Assigned support specialist"
    },
    {
        icon: TrendingUp,
        title: "Continuous Improvement",
        description: "Regular system optimization and performance enhancements.",
        metrics: "Monthly optimization reports"
    }
]

const responseMetrics = [
    {
        level: "Critical Issues",
        time: "15 minutes",
        description: "System down, business stopped",
        color: "red"
    },
    {
        level: "High Priority",
        time: "30 minutes",
        description: "Major functionality affected",
        color: "orange"
    },
    {
        level: "Medium Priority",
        time: "2 hours",
        description: "Some features impacted",
        color: "yellow"
    },
    {
        level: "Low Priority",
        time: "24 hours",
        description: "Minor issues or requests",
        color: "green"
    }
]

const customerStats = [
    {
        number: "99.9%",
        label: "Customer Satisfaction",
        description: "Based on support ticket ratings"
    },
    {
        number: "<30min",
        label: "Average Response",
        description: "Time to first response"
    },
    {
        number: "95%",
        label: "First Call Resolution",
        description: "Issues resolved on first contact"
    },
    {
        number: "24/7",
        label: "Availability",
        description: "Round-the-clock support"
    }
]

const industrySupport = [
    {
        industry: "Healthcare",
        challenge: "Critical system uptime",
        solution: "24/7 monitoring & emergency response",
        result: "99.98% uptime achieved"
    },
    {
        industry: "Education",
        challenge: "Student device management",
        solution: "Bulk device support & training",
        result: "500+ devices managed"
    },
    {
        industry: "Retail",
        challenge: "POS system reliability",
        solution: "Proactive maintenance & quick fixes",
        result: "Zero downtime during peak hours"
    }
]

export default function TechSupportBenefits() {
    return (
        <section className="py-12 sm:py-16 md:py-20 bg-white sm:bg-gradient-to-br sm:from-white sm:via-teal-50/30 sm:to-white dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-teal-900/20">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                        Why Choose Our Technical Support?
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Experience the difference with professional technical support that keeps your business running smoothly
                        and your team productive.
                    </p>
                </motion.div>

                {/* Benefits Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-center w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg mb-4">
                                <benefit.icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                {benefit.title}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {benefit.description}
                            </p>

                            <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 mr-2" />
                                <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                                    {benefit.metrics}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Response Time Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-16 sm:mb-20 border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-6 sm:mb-8">
                        Guaranteed Response Times
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {responseMetrics.map((metric, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center p-4 sm:p-6 rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-100 dark:border-gray-700"
                            >
                                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${metric.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                                    metric.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                                        metric.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                            'bg-green-100 dark:bg-green-900/30'
                                    }`}>
                                    <Clock className={`h-8 w-8 ${metric.color === 'red' ? 'text-red-600 dark:text-red-400' :
                                        metric.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                                            metric.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                                                'text-green-600 dark:text-green-400'
                                        }`} />
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    {metric.level}
                                </h4>
                                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                                    {metric.time}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {metric.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Customer Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-16 sm:mb-20 border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-6 sm:mb-8">
                        Support Performance Metrics
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                        {customerStats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-gray-900 dark:text-white font-semibold mb-1 text-sm sm:text-base">
                                    {stat.label}
                                </div>
                                <div className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                                    {stat.description}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Industry Success Stories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-12 sm:mb-16"
                >
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-8 sm:mb-12">
                        Industry Success Stories
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                        {industrySupport.map((story, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {story.industry}
                                    </h4>
                                    <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-2 py-1 rounded">
                                        Success Story
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Challenge:</span>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{story.challenge}</p>
                                    </div>

                                    <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Solution:</span>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{story.solution}</p>
                                    </div>

                                    <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Result:</span>
                                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">{story.result}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Experience Premium Technical Support
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join thousands of satisfied customers who trust our technical support to keep their business running smoothly.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Start Your Support Plan
                    </motion.button>
                </motion.div>
            </div>
        </section>
    )
}