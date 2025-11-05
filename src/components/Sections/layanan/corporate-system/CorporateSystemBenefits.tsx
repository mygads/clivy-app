"use client"

import { motion } from "framer-motion"
import { Award, BarChart3, Clock, DollarSign, Shield, TrendingUp, Users, Zap } from "lucide-react"

const benefits = [
    {
        icon: TrendingUp,
        title: "Increased Productivity",
        description: "Streamline workflows and automate repetitive tasks to boost employee productivity by up to 50% and reduce manual errors.",
        color: "text-green-600 dark:text-green-400"
    },
    {
        icon: DollarSign,
        title: "Cost Reduction",
        description: "Reduce operational costs through process automation, improved resource allocation, and elimination of redundant systems.",
        color: "text-blue-600 dark:text-blue-400"
    },
    {
        icon: BarChart3,
        title: "Data-Driven Decisions",
        description: "Real-time analytics and comprehensive reporting provide insights for strategic decision making and business optimization.",
        color: "text-purple-600 dark:text-purple-400"
    },
    {
        icon: Shield,
        title: "Enhanced Security",
        description: "Enterprise-grade security with role-based access, data encryption, and compliance with industry standards and regulations.",
        color: "text-red-600 dark:text-red-400"
    },
    {
        icon: Users,
        title: "Improved Collaboration",
        description: "Centralized systems enable seamless collaboration across departments with shared data and integrated communication tools.",
        color: "text-orange-600 dark:text-orange-400"
    },
    {
        icon: Zap,
        title: "Scalable Architecture",
        description: "Future-proof systems that scale with your business growth, supporting increased users, data volume, and business complexity.",
        color: "text-yellow-600 dark:text-yellow-400"
    }
]

const statistics = [
    { value: "60%", label: "Process Efficiency", description: "Average improvement in business processes" },
    { value: "99.9%", label: "System Uptime", description: "Guaranteed system availability" },
    { value: "40%", label: "Cost Reduction", description: "Average operational cost savings" },
    { value: "24/7", label: "Expert Support", description: "Round-the-clock technical assistance" }
]

const industryBenefits = [
    {
        industry: "Manufacturing",
        benefits: ["Production planning optimization", "Inventory management", "Quality control systems", "Supply chain integration"]
    },
    {
        industry: "Healthcare",
        benefits: ["Patient management systems", "Electronic health records", "Appointment scheduling", "Compliance tracking"]
    },
    {
        industry: "Financial Services",
        benefits: ["Risk management systems", "Regulatory compliance", "Customer onboarding", "Transaction processing"]
    },
    {
        industry: "Retail & E-commerce",
        benefits: ["Inventory optimization", "Customer analytics", "Order management", "Multi-channel integration"]
    }
]

export default function CorporateSystemBenefits() {
    return (
        <section className="bg-white py-16 sm:py-20 md:py-24 lg:py-32 sm:bg-gradient-to-br sm:from-indigo-50 sm:to-purple-50 dark:bg-gray-900 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-indigo-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-3xl text-center mb-8 sm:mb-12 md:mb-16"
                >
                    <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                        Transform Your Business with Corporate Systems
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                        Our enterprise systems deliver measurable business value through automation,
                        integration, and intelligent data management that drives operational excellence.
                    </p>
                </motion.div>

                {/* Benefits Grid */}
                <div className="mb-12 sm:mb-16 grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 md:p-8 shadow-sm transition-all hover:shadow-xl"
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

                {/* Statistics Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-700 to-indigo-600 p-8 text-white shadow-2xl md:p-12"
                >
                    <div className="text-center">
                        <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                            Proven Business Impact
                        </h3>
                        <p className="mb-12 text-purple-100">
                            Our corporate systems consistently deliver exceptional ROI and operational improvements
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
                                <div className="mb-2 text-4xl font-bold text-white md:text-5xl">
                                    {stat.value}
                                </div>
                                <div className="mb-1 text-lg font-semibold text-purple-100">
                                    {stat.label}
                                </div>
                                <div className="text-sm text-purple-200">
                                    {stat.description}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Industry-Specific Benefits */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="text-center">
                        <h3 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                            Industry-Specific Solutions
                        </h3>
                        <p className="mb-12 text-gray-600 dark:text-gray-300">
                            Tailored corporate systems designed for specific industry requirements and challenges
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {industryBenefits.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
                            >
                                <h4 className="mb-4 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                    {item.industry}
                                </h4>
                                <ul className="space-y-2">
                                    {item.benefits.map((benefit, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                            <div className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0"></div>
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ROI Calculator Teaser */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8 text-center backdrop-blur-sm dark:from-indigo-900/20 dark:to-purple-900/20 md:p-12"
                >
                    <Award className="mx-auto mb-6 h-16 w-16 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                        Calculate Your ROI
                    </h3>
                    <p className="mb-8 text-gray-600 dark:text-gray-300">
                        See how much your business can save with our corporate system solutions.
                        Most clients see ROI within 6-12 months of implementation.
                    </p>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="rounded-lg bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:bg-gray-700/80">
                            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">6-12</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Months to ROI</div>
                        </div>
                        <div className="rounded-lg bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:bg-gray-700/80">
                            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">300%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Average ROI in 3 years</div>
                        </div>
                        <div className="rounded-lg bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:bg-gray-700/80">
                            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">50%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Time savings on processes</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}