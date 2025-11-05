"use client"

import { motion } from "framer-motion"
import { ArrowRight, Check, Clock, Globe, Star, Zap } from "lucide-react"
import { useState } from "react"

const pricingPlans = [
    {
        name: "Starter Web App",
        subtitle: "Perfect for startups and small businesses",
        price: "15000000",
        originalPrice: "20000000",
        duration: "6-8 weeks",
        complexity: "Basic",
        features: [
            "Single Page Application (SPA)",
            "Responsive design for all devices",
            "Basic user authentication",
            "Contact forms & lead capture",
            "Content management system",
            "Basic SEO optimization",
            "Social media integration",
            "Basic analytics integration",
            "1 round of revisions",
            "30 days post-launch support"
        ],
        popular: false,
        badge: "Most Affordable"
    },
    {
        name: "Professional Web App",
        subtitle: "Ideal for growing businesses",
        price: "35000000",
        originalPrice: "45000000",
        duration: "8-12 weeks",
        complexity: "Advanced",
        features: [
            "Multi-page web application",
            "Advanced responsive design",
            "User management & authentication",
            "Database integration",
            "Payment gateway integration",
            "Advanced SEO & performance optimization",
            "Third-party API integrations",
            "Admin dashboard",
            "Email notifications system",
            "Real-time features",
            "2 rounds of revisions",
            "3 months post-launch support"
        ],
        popular: true,
        badge: "Most Popular"
    },
    {
        name: "Enterprise Web App",
        subtitle: "For large-scale business solutions",
        price: "75000000",
        originalPrice: "95000000",
        duration: "12-16 weeks",
        complexity: "Complex",
        features: [
            "Custom enterprise web application",
            "Advanced user roles & permissions",
            "Complex database architecture",
            "Multiple payment methods",
            "Advanced security features",
            "Custom API development",
            "Third-party system integrations",
            "Advanced analytics & reporting",
            "Multi-language support",
            "Cloud deployment & scaling",
            "Performance monitoring",
            "3 rounds of revisions",
            "6 months premium support"
        ],
        popular: false,
        badge: "Enterprise Grade"
    }
]

const addOns = [
    { name: "Progressive Web App (PWA) features", price: "5000000" },
    { name: "Advanced search functionality", price: "3000000" },
    { name: "Real-time chat system", price: "7000000" },
    { name: "Advanced analytics dashboard", price: "8000000" },
    { name: "Multi-language support", price: "6000000" },
    { name: "Mobile app integration", price: "12000000" },
    { name: "Advanced security audit", price: "4000000" },
    { name: "Performance optimization", price: "3500000" }
]

const deliveryFeatures = [
    { icon: Zap, text: "Fast delivery with agile development" },
    { icon: Globe, text: "Cloud deployment included" },
    { icon: Clock, text: "24/7 monitoring and support" },
    { icon: Star, text: "Quality assurance testing" }
]

export default function WebAppPricing() {
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
        <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white sm:bg-gradient-to-br sm:from-white sm:via-violet-50/30 sm:to-blue-50/40 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-violet-950/20 dark:sm:to-blue-950/30 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100/80 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 mb-6">
                        <Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        <span className="text-sm font-medium text-violet-700 dark:text-violet-300">Our Packages</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
                        Web Application Development <span className="text-violet-600 dark:text-violet-400">Pricing</span>
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full mx-auto mb-4 md:mb-6"></div>
                    <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Transparent pricing for professional web application development.
                        Choose the package that best fits your business needs and budget.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`group relative rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border p-6 md:p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${plan.popular
                                ? "border-violet-300 dark:border-violet-700 ring-2 ring-violet-200 dark:ring-violet-800 scale-105"
                                : "border-violet-100/50 dark:border-violet-900/30 hover:border-violet-200 dark:hover:border-violet-800"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <div className="flex items-center rounded-full bg-gradient-to-r from-violet-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
                                        <Star className="mr-2 h-4 w-4 fill-white" />
                                        {plan.badge}
                                    </div>
                                </div>
                            )}
                            {!plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <div className="rounded-full bg-gray-900 dark:bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
                                        {plan.badge}
                                    </div>
                                </div>
                            )}

                            {/* Header */}
                            <div className="mb-6 text-center">
                                <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors duration-300">
                                    {plan.name}
                                </h3>
                                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {plan.subtitle}
                                </p>
                                <div className="mb-2">
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {formatPrice(plan.price)}
                                    </span>
                                    <span className="ml-2 text-lg text-gray-500 line-through dark:text-gray-400">
                                        {formatPrice(plan.originalPrice)}
                                    </span>
                                </div>
                                <div className="flex justify-center gap-4 text-sm text-violet-600 dark:text-violet-400 font-medium">
                                    <span>📅 {plan.duration}</span>
                                    <span>⚡ {plan.complexity}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="mb-8">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <Check className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
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
                                className={`w-full transition-all duration-300 rounded-lg py-4 font-semibold ${plan.popular
                                    ? "bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                                    : "bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 border border-violet-300 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:border-violet-400 dark:hover:border-violet-600"
                                    }`}
                            >
                                Start Your Project
                                <ArrowRight className="ml-2 inline h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                {/* Add-ons Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-16 mb-16 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-900/30 p-6 md:p-8 shadow-lg"
                >
                    <div className="text-center">
                        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            Optional Add-ons
                        </h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300">
                            Enhance your web application with additional features and functionality
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
                                className="rounded-lg bg-white/80 dark:bg-gray-900/70 p-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
                            >
                                <div className="font-semibold text-gray-900 dark:text-white">
                                    {addon.name}
                                </div>
                                <div className="text-lg font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-blue-400">
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
                    className="rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 p-8 text-white shadow-2xl md:p-12"
                >
                    <div className="text-center">
                        <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                            What&apos;s Included in Every Package
                        </h3>
                        <p className="mb-8 text-violet-100">
                            All packages include essential features for professional web application development
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
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-900/30 rounded-2xl p-8 shadow-lg">
                        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            Ready to Build Your Web Application?
                        </h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300">
                            Get a free consultation and detailed quote for your specific requirements
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:from-violet-700 hover:to-blue-700 hover:shadow-xl"
                            >
                                Get Free Quote
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center justify-center rounded-lg border-2 border-violet-600 px-8 py-4 font-semibold text-violet-600 transition-all hover:bg-gradient-to-r hover:from-violet-600 hover:to-blue-600 hover:text-white dark:border-violet-400 dark:text-violet-400 dark:hover:from-violet-400 dark:hover:to-blue-400 dark:hover:text-gray-900"
                            >
                                Schedule Consultation
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}