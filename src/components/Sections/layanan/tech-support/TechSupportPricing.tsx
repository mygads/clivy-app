"use client"

import { motion } from "framer-motion"
import {
    Check,
    Star,
    ArrowRight,
    Clock,
    Shield,
    Headphones,
    Zap,
    Award,
    Phone
} from "lucide-react"

const pricingTiers = [
    {
        name: "Basic Support",
        price: "1.500.000",
        period: "per month",
        description: "Essential technical support for small businesses and startups",
        popular: false,
        features: [
            "Business hours support (9AM-6PM)",
            "Email & phone support",
            "2-hour response time",
            "Remote assistance",
            "Basic troubleshooting",
            "Monthly system check",
            "Knowledge base access"
        ],
        excluded: [
            "24/7 emergency support",
            "On-site visits",
            "Priority escalation"
        ],
        color: "teal",
        icon: Headphones
    },
    {
        name: "Professional Support",
        price: "4.500.000",
        period: "per month",
        description: "Comprehensive support for growing businesses with critical systems",
        popular: true,
        features: [
            "24/7 critical issue support",
            "Multi-channel support access",
            "30-minute response time",
            "Remote & limited on-site support",
            "Proactive monitoring",
            "Monthly optimization reports",
            "Priority ticket handling",
            "Dedicated support specialist",
            "System health monitoring",
            "Preventive maintenance"
        ],
        excluded: [
            "Unlimited on-site visits",
            "Custom integration support"
        ],
        color: "teal",
        icon: Shield
    },
    {
        name: "Enterprise Support",
        price: "12.000.000",
        period: "per month",
        description: "Premium support with dedicated resources for large enterprises",
        popular: false,
        features: [
            "24/7 dedicated support team",
            "15-minute critical response time",
            "Unlimited remote & on-site support",
            "Dedicated account manager",
            "Custom SLA agreements",
            "Proactive system monitoring",
            "Emergency response team",
            "Monthly strategic reviews",
            "Custom integration support",
            "Disaster recovery planning",
            "Priority vendor coordination",
            "Executive escalation path"
        ],
        excluded: [],
        color: "teal",
        icon: Award
    }
]

const addOnServices = [
    {
        name: "Emergency On-Site Support",
        price: "2.500.000",
        description: "Same-day on-site technician visit for critical issues",
        icon: Zap
    },
    {
        name: "Extended Hours Support",
        price: "1.200.000",
        description: "Support coverage outside standard business hours",
        icon: Clock
    },
    {
        name: "Additional Device Monitoring",
        price: "500.000",
        description: "Per device monthly monitoring and maintenance",
        icon: Shield
    },
    {
        name: "Priority Response Upgrade",
        price: "800.000",
        description: "Upgrade response time to next tier level",
        icon: Phone
    }
]

const responseTimeComparison = [
    {
        issue: "Critical System Down",
        basic: "2 hours",
        professional: "30 minutes",
        enterprise: "15 minutes"
    },
    {
        issue: "High Priority Issues",
        basic: "4 hours",
        professional: "1 hour",
        enterprise: "30 minutes"
    },
    {
        issue: "Medium Priority",
        basic: "1 business day",
        professional: "4 hours",
        enterprise: "2 hours"
    },
    {
        issue: "Low Priority",
        basic: "3 business days",
        professional: "1 business day",
        enterprise: "Same day"
    }
]

const enterpriseFeatures = [
    "Dedicated technical account manager",
    "Custom service level agreements",
    "24/7 emergency response team",
    "Quarterly business reviews",
    "Disaster recovery planning",
    "Vendor management support"
]

export default function TechSupportPricing() {
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
                        Technical Support Plans
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Choose the right level of technical support for your business. From basic assistance to enterprise-grade support with dedicated resources.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
                    {pricingTiers.map((tier, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`relative rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${tier.popular
                                ? 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-2 border-teal-500 dark:border-teal-400'
                                : 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                                        <Star className="h-4 w-4 mr-1" />
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <tier.icon className="h-8 w-8 text-teal-600 dark:text-teal-400" />
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
                                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl'
                                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                                    }`}
                            >
                                Choose {tier.name}
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                {/* Response Time Comparison */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-16 sm:mb-20 border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-6 sm:mb-8">
                        Response Time Comparison
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Issue Type</th>
                                    <th className="text-center py-3 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Basic</th>
                                    <th className="text-center py-3 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Professional</th>
                                    <th className="text-center py-3 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody>
                                {responseTimeComparison.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{item.issue}</td>
                                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-center text-gray-600 dark:text-gray-300 text-sm sm:text-base">{item.basic}</td>
                                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-center text-teal-600 dark:text-teal-400 font-semibold text-sm sm:text-base">{item.professional}</td>
                                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-center text-teal-700 dark:text-teal-300 font-bold text-sm sm:text-base">{item.enterprise}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Add-on Services */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16 sm:mb-20"
                >
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-8 sm:mb-12">
                        Additional Services
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {addOnServices.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
                            >
                                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <service.icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                                </div>

                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    {service.name}
                                </h4>

                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    {service.description}
                                </p>

                                <div className="text-xl font-bold text-teal-600 dark:text-teal-400">
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
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 text-white"
                >
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">
                                Custom Enterprise Solutions
                            </h3>
                            <p className="text-teal-100 mb-6">
                                Need specialized support for large-scale operations? We create custom support agreements tailored to your specific requirements and infrastructure.
                            </p>

                            <div className="grid md:grid-cols-2 gap-3 mb-6">
                                {enterpriseFeatures.map((feature, index) => (
                                    <div key={index} className="flex items-center">
                                        <Check className="h-4 w-4 mr-2 text-teal-200" />
                                        <span className="text-sm text-teal-100">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white text-teal-600 px-8 py-4 rounded-lg font-semibold hover:bg-teal-50 transition-all duration-300"
                            >
                                Discuss Custom Plan
                            </motion.button>
                        </div>

                        <div className="text-center">
                            <div className="w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Award className="h-16 w-16 text-white" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2">Enterprise Grade Support</h4>
                            <p className="text-teal-100">Custom pricing based on your specific needs</p>
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
                        Questions About Our Support Plans?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        We&apos;re here to help you choose the right support plan for your business needs and budget.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Start Support Plan
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300"
                        >
                            Contact Sales Team
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}