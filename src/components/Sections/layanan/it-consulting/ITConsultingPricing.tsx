"use client"

import { motion } from "framer-motion"
import {
    Check,
    Star,
    ArrowRight,
    Users,
    Shield,
    Zap,
    Award,
    Clock,
    Target
} from "lucide-react"

const pricingTiers = [
    {
        name: "Consultation Starter",
        price: "2.500.000",
        period: "per consultation",
        description: "Perfect for small businesses needing basic IT guidance and assessment",
        popular: false,
        features: [
            "2-hour consultation session",
            "Basic IT infrastructure assessment",
            "Technology recommendations report",
            "Email support for 1 week",
            "Action plan summary",
            "Follow-up call included"
        ],
        excluded: [
            "Implementation support",
            "Ongoing monitoring",
            "Priority support"
        ],
        color: "blue",
        icon: Users
    },
    {
        name: "Strategic Planning",
        price: "15.000.000",
        period: "per project",
        description: "Comprehensive IT strategy development for growing businesses",
        popular: true,
        features: [
            "Complete IT infrastructure audit",
            "Digital transformation roadmap",
            "3-month implementation timeline",
            "Technology stack recommendations",
            "Budget planning & ROI analysis",
            "Risk assessment & mitigation",
            "Vendor selection guidance",
            "2 weeks of implementation support",
            "Priority email & phone support"
        ],
        excluded: [
            "Full implementation management",
            "24/7 monitoring"
        ],
        color: "blue",
        icon: Target
    },
    {
        name: "Enterprise Transformation",
        price: "45.000.000",
        period: "per engagement",
        description: "Full-scale digital transformation for large enterprises",
        popular: false,
        features: [
            "Comprehensive enterprise assessment",
            "Custom digital transformation strategy",
            "6-month implementation roadmap",
            "Change management framework",
            "Security & compliance planning",
            "Technology architecture design",
            "Vendor negotiations support",
            "Full implementation management",
            "Team training & knowledge transfer",
            "3 months ongoing optimization",
            "24/7 priority support",
            "Quarterly strategic reviews"
        ],
        excluded: [],
        color: "blue",
        icon: Award
    }
]

const addOnServices = [
    {
        name: "Emergency IT Support",
        price: "5.000.000",
        description: "24/7 emergency response for critical IT issues",
        icon: Zap
    },
    {
        name: "Cybersecurity Assessment",
        price: "8.000.000",
        description: "Comprehensive security audit and recommendations",
        icon: Shield
    },
    {
        name: "Cloud Migration Planning",
        price: "12.000.000",
        description: "Detailed cloud migration strategy and execution plan",
        icon: Clock
    },
    {
        name: "Staff Training Program",
        price: "6.000.000",
        description: "Comprehensive IT training for your team members",
        icon: Users
    }
]

const enterpriseFeatures = [
    "Dedicated senior consultant",
    "Custom technology roadmap",
    "Flexible engagement models",
    "Industry-specific expertise",
    "Regulatory compliance guidance",
    "Executive-level reporting"
]

export default function ITConsultingPricing() {
    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-white sm:bg-gradient-to-br sm:from-white sm:via-blue-50/30 sm:to-indigo-50/40 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-blue-950/20 dark:sm:to-indigo-950/30 transition-colors duration-300">
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
                        IT Consulting Investment Plans
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Choose the right level of IT consulting support for your business. From initial assessments to full enterprise transformation.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid lg:grid-cols-3 gap-6 md:gap-8 mb-16 lg:mb-20">
                    {pricingTiers.map((tier, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`relative rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm ${tier.popular
                                ? 'bg-white/70 sm:bg-gradient-to-br sm:from-blue-50 sm:to-indigo-50 dark:bg-gray-900/70 dark:sm:from-gray-800 dark:sm:to-gray-700 border-2 border-blue-500 dark:border-blue-400'
                                : 'bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                                        <Star className="h-4 w-4 mr-1" />
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <tier.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {tier.name}
                                </h3>

                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {tier.description}
                                </p>

                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                        Rp {tier.price}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-300 ml-2">
                                        {tier.period}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    What&apos;s included:
                                </h4>
                                <ul className="space-y-3">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-300 text-sm">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${tier.popular
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                                    }`}
                            >
                                Choose {tier.name}
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                {/* Add-on Services */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
                        Additional Services
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {addOnServices.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300"
                            >
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <service.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>

                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    {service.name}
                                </h4>

                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    {service.description}
                                </p>

                                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                    Rp {service.price}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Enterprise Solutions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white"
                >
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">
                                Custom Enterprise Solutions
                            </h3>
                            <p className="text-blue-100 mb-6">
                                Need a tailored IT consulting approach? We create custom engagement models for large enterprises with specific requirements and complex technology landscapes.
                            </p>

                            <div className="grid md:grid-cols-2 gap-3 mb-6">
                                {enterpriseFeatures.map((feature, index) => (
                                    <div key={index} className="flex items-center">
                                        <Check className="h-4 w-4 mr-2 text-blue-200" />
                                        <span className="text-sm text-blue-100">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300"
                            >
                                Discuss Custom Solution
                            </motion.button>
                        </div>

                        <div className="text-center">
                            <div className="w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Award className="h-16 w-16 text-white" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2">Enterprise Grade</h4>
                            <p className="text-blue-100">Custom pricing based on scope and requirements</p>
                        </div>
                    </div>
                </motion.div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Questions About Our Pricing?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        We&apos;re happy to discuss your specific needs and create a custom consulting package that fits your budget and objectives.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Schedule Free Consultation
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300"
                        >
                            Download Pricing Guide
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}