"use client"

import { motion } from "framer-motion"
import {
    TrendingUp,
    DollarSign,
    Shield,
    Zap,
    Users,
    Target,
    Award,
    CheckCircle
} from "lucide-react"

const benefits = [
    {
        icon: TrendingUp,
        title: "Accelerated Business Growth",
        description: "Strategic IT alignment that drives revenue growth and market expansion.",
        metrics: "Average 35% growth increase"
    },
    {
        icon: DollarSign,
        title: "Cost Optimization",
        description: "Reduce IT operational costs through efficient technology solutions and processes.",
        metrics: "Up to 40% cost reduction"
    },
    {
        icon: Shield,
        title: "Enhanced Security",
        description: "Robust cybersecurity frameworks protecting your business from threats.",
        metrics: "99.9% security compliance"
    },
    {
        icon: Zap,
        title: "Improved Efficiency",
        description: "Streamlined operations through automation and optimized workflows.",
        metrics: "60% faster processes"
    },
    {
        icon: Users,
        title: "Better User Experience",
        description: "Technology solutions that enhance both employee and customer satisfaction.",
        metrics: "95% user satisfaction"
    },
    {
        icon: Target,
        title: "Strategic Advantage",
        description: "Gain competitive edge through innovative technology implementation.",
        metrics: "Market leader positioning"
    }
]

const industryStats = [
    {
        number: "85%",
        label: "Digital Transformation Success",
        description: "Of our clients achieve their digital goals"
    },
    {
        number: "24/7",
        label: "Expert Support",
        description: "Round-the-clock consulting assistance"
    },
    {
        number: "15+",
        label: "Years Experience",
        description: "In enterprise IT consulting"
    },
    {
        number: "200+",
        label: "Successful Projects",
        description: "Delivered across various industries"
    }
]

const successStories = [
    {
        company: "Manufacturing Corp",
        challenge: "Legacy system modernization",
        solution: "Cloud migration & automation",
        result: "50% operational cost reduction",
        industry: "Manufacturing"
    },
    {
        company: "Retail Chain",
        challenge: "Digital transformation",
        solution: "E-commerce platform & analytics",
        result: "300% online sales growth",
        industry: "Retail"
    },
    {
        company: "Financial Services",
        challenge: "Security compliance",
        solution: "Cybersecurity framework",
        result: "100% regulatory compliance",
        industry: "Finance"
    }
]

export default function ITConsultingBenefits() {
    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-white sm:bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
                        Transform Your Business with Expert IT Consulting
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Unlock your organization&apos;s potential through strategic technology implementation and digital transformation initiatives.
                    </p>
                </motion.div>

                {/* Benefits Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16 lg:mb-20">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white/70 dark:bg-gray-900/70 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                        >
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
                                <benefit.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                {benefit.title}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {benefit.description}
                            </p>

                            <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {benefit.metrics}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Industry Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-20"
                >
                    <h3 className="text-2xl font-bold text-white text-center mb-8">
                        Proven Track Record
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {industryStats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-blue-100 font-semibold mb-1">
                                    {stat.label}
                                </div>
                                <div className="text-blue-200 text-sm">
                                    {stat.description}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Success Stories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
                        Client Success Stories
                    </h3>

                    <div className="grid md:grid-cols-3 gap-8">
                        {successStories.map((story, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {story.company}
                                    </h4>
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                                        {story.industry}
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
                        Ready to Achieve Similar Results?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join hundreds of successful businesses that have transformed their operations with our expert IT consulting services.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Start Your Transformation
                    </motion.button>
                </motion.div>
            </div>
        </section>
    )
}