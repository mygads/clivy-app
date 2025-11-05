"use client"

import { motion } from "framer-motion"
import { ArrowRight, Check, Clock, Database, Star, Zap } from "lucide-react"
import { useState } from "react"

const pricingPlans = [
    {
        name: "Essential Corporate System",
        subtitle: "Perfect for small to medium enterprises",
        price: "45000000",
        originalPrice: "60000000",
        duration: "12-16 weeks",
        complexity: "Standard",
        features: [
            "Core business process automation",
            "User management & role-based access",
            "Basic reporting & analytics dashboard",
            "Database design & implementation",
            "Web-based interface",
            "Email notification system",
            "Basic third-party integrations",
            "Standard security implementation",
            "Documentation & user training",
            "3 months post-launch support"
        ],
        popular: false,
        badge: "Most Affordable"
    },
    {
        name: "Professional Enterprise System",
        subtitle: "Ideal for growing businesses",
        price: "85000000",
        originalPrice: "110000000",
        duration: "16-24 weeks",
        complexity: "Advanced",
        features: [
            "Complete business process automation",
            "Advanced user management & permissions",
            "Real-time analytics & reporting",
            "Multi-module system architecture",
            "Mobile-responsive interface",
            "Workflow automation engine",
            "Advanced API integrations",
            "Enterprise security features",
            "Document management system",
            "Audit trails & compliance tracking",
            "Performance optimization",
            "6 months premium support"
        ],
        popular: true,
        badge: "Most Popular"
    },
    {
        name: "Enterprise-Grade System",
        subtitle: "For large-scale organizations",
        price: "150000000",
        originalPrice: "200000000",
        duration: "24-36 weeks",
        complexity: "Enterprise",
        features: [
            "Full enterprise system suite (ERP/CRM/HRM)",
            "Multi-tenant architecture",
            "Advanced business intelligence",
            "Custom module development",
            "Multi-platform support (Web/Mobile)",
            "Advanced workflow automation",
            "Enterprise API gateway",
            "High-availability architecture",
            "Advanced security & compliance",
            "Integration with legacy systems",
            "Performance monitoring & optimization",
            "Load balancing & scaling",
            "12 months enterprise support"
        ],
        popular: false,
        badge: "Enterprise Grade"
    }
]

const addOns = [
    { name: "Advanced business intelligence dashboard", price: "15000000" },
    { name: "Mobile application interface", price: "25000000" },
    { name: "Advanced workflow automation", price: "20000000" },
    { name: "Third-party system integrations", price: "18000000" },
    { name: "Custom reporting module", price: "12000000" },
    { name: "Document management system", price: "16000000" },
    { name: "Advanced security audit", price: "10000000" },
    { name: "Performance optimization", price: "8000000" }
]

const deliveryFeatures = [
    { icon: Zap, text: "Agile development methodology" },
    { icon: Database, text: "Enterprise-grade infrastructure" },
    { icon: Clock, text: "24/7 monitoring and support" },
    { icon: Star, text: "Quality assurance & testing" }
]

const enterpriseFeatures = [
    "High-availability architecture with 99.9% uptime SLA",
    "Enterprise security with ISO 27001 compliance",
    "Scalable cloud infrastructure (AWS/Azure/GCP)",
    "Advanced backup & disaster recovery",
    "Performance monitoring & optimization",
    "Dedicated support team with guaranteed response time"
]

export default function CorporateSystemPricing() {
    const [mounted, setMounted] = useState(false)

    useState(() => {
        setMounted(true)
    })

    if (!mounted) return null

    const formatPrice = (price: string) => {
        const num = parseInt(price)
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num)
    }

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
                        Corporate System Development Pricing
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                        Transparent pricing for enterprise-grade corporate system development.
                        Choose the package that scales with your business requirements and growth ambitions.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="mb-12 sm:mb-16 grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`relative rounded-2xl border-2 p-4 sm:p-6 md:p-8 transition-all hover:shadow-xl ${plan.popular
                                ? "border-purple-500 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm ring-2 ring-purple-200 dark:ring-purple-800 scale-105"
                                : "border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:border-purple-200 dark:hover:border-purple-600"
                                }`}
                        >
                            {/* Badge */}
                            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-semibold ${plan.popular
                                ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg"
                                : "bg-gray-900 text-white dark:bg-gray-600"
                                }`}>
                                {plan.badge}
                            </div>

                            {/* Header */}
                            <div className="mb-8 text-center">
                                <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                                    {plan.name}
                                </h3>
                                <p className="mb-4 text-gray-600 dark:text-gray-300">
                                    {plan.subtitle}
                                </p>
                                <div className="mb-2">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                        {formatPrice(plan.price)}
                                    </span>
                                    <span className="ml-2 text-lg text-gray-500 line-through dark:text-gray-400">
                                        {formatPrice(plan.originalPrice)}
                                    </span>
                                </div>
                                <div className="flex justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                    <span>📅 {plan.duration}</span>
                                    <span>⚡ {plan.complexity}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="mb-8">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <Check className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-purple-500" />
                                            <span className="text-gray-600 dark:text-gray-300">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`group w-full rounded-lg py-4 font-semibold transition-all ${plan.popular
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg hover:from-indigo-700 hover:to-purple-800 hover:shadow-xl"
                                    : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                                    }`}
                            >
                                Start Your Project
                                <ArrowRight className="ml-2 inline h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                {/* Enterprise Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8 backdrop-blur-sm dark:from-indigo-900/20 dark:to-purple-900/20 md:p-12"
                >
                    <div className="text-center">
                        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            Enterprise Features Included
                        </h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300">
                            All our corporate systems include enterprise-grade features for security, scalability, and reliability
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {enterpriseFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className="flex items-center rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700"
                            >
                                <Check className="mr-3 h-5 w-5 text-purple-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {feature}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Add-ons Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16 rounded-2xl bg-gray-50 p-8 dark:bg-gray-800 md:p-12"
                >
                    <div className="text-center">
                        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            Optional System Enhancements
                        </h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300">
                            Extend your corporate system capabilities with additional modules and features
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {addOns.map((addon, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700"
                            >
                                <div className="font-semibold text-gray-900 dark:text-white">
                                    {addon.name}
                                </div>
                                <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                                    {formatPrice(addon.price)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Features Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-700 to-indigo-600 p-8 text-white shadow-2xl md:p-12"
                >
                    <div className="text-center">
                        <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                            What&apos;s Included in Every Package
                        </h3>
                        <p className="mb-8 text-purple-100">
                            All packages include essential enterprise features for professional corporate system development
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {deliveryFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                    <feature.icon className="h-8 w-8 text-white" />
                                </div>
                                <div className="font-semibold text-white">
                                    {feature.text}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Final CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                        Ready to Transform Your Business Operations?
                    </h3>
                    <p className="mb-8 text-gray-600 dark:text-gray-300">
                        Get a comprehensive consultation and detailed quote tailored to your specific enterprise requirements
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-800 hover:shadow-xl"
                        >
                            Get Enterprise Quote
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center justify-center rounded-lg border-2 border-indigo-600 px-8 py-4 font-semibold text-indigo-600 transition-all hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-700 hover:text-white dark:border-indigo-400 dark:text-indigo-400 dark:hover:from-indigo-400 dark:hover:to-purple-400 dark:hover:text-gray-900"
                        >
                            Schedule Demo
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}