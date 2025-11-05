"use client"

import { motion } from "framer-motion"
import { Check, ArrowRight, Smartphone, Zap, Crown } from "lucide-react"

const packages = [
    {
        id: "basic-mobile",
        name: "Basic Mobile App",
        description: "Perfect for startups and small businesses looking to establish mobile presence",
        price: "Starting from Rp 25,000,000",
        icon: Smartphone,
        popular: false,
        features: [
            "Single platform (iOS or Android)",
            "Up to 5 core screens",
            "Basic UI/UX design",
            "API integration",
            "Admin panel",
            "App store submission",
            "3 months warranty",
            "Basic analytics"
        ],
        deliveryTime: "6-8 weeks",
        revisions: "3 revisions included"
    },
    {
        id: "professional-mobile",
        name: "Professional Mobile App",
        description: "Comprehensive solution for growing businesses with advanced features",
        price: "Starting from Rp 45,000,000",
        icon: Zap,
        popular: true,
        features: [
            "Cross-platform (iOS & Android)",
            "Up to 10 screens",
            "Custom UI/UX design",
            "Advanced API integration",
            "User authentication",
            "Push notifications",
            "Payment gateway integration",
            "Admin dashboard",
            "App store optimization",
            "6 months warranty",
            "Advanced analytics"
        ],
        deliveryTime: "8-12 weeks",
        revisions: "5 revisions included"
    },
    {
        id: "enterprise-mobile",
        name: "Enterprise Mobile Solution",
        description: "Full-scale mobile solution for large businesses with complex requirements",
        price: "Starting from Rp 85,000,000",
        icon: Crown,
        popular: false,
        features: [
            "Native iOS & Android apps",
            "Unlimited screens",
            "Premium UI/UX design",
            "Complex backend integration",
            "Multi-user roles",
            "Real-time features",
            "Advanced security",
            "Third-party integrations",
            "Custom admin portal",
            "App store optimization",
            "12 months warranty",
            "Priority support",
            "Performance monitoring"
        ],
        deliveryTime: "12-16 weeks",
        revisions: "Unlimited revisions"
    }
]

const addOns = [
    { name: "Additional Platform", price: "Rp 15,000,000" },
    { name: "Extra Screens (per screen)", price: "Rp 2,500,000" },
    { name: "Backend API Development", price: "Rp 12,000,000" },
    { name: "Real-time Chat Integration", price: "Rp 8,000,000" },
    { name: "Advanced Analytics Setup", price: "Rp 5,000,000" },
    { name: "Social Media Integration", price: "Rp 3,000,000" }
]

export default function MobilePricing() {
    return (
        <section className="bg-white py-20 dark:bg-gray-900">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                        Mobile App Development <span className="text-blue-600 dark:text-blue-400">Pricing</span>
                    </h2>
                    <p className="mb-12 text-lg text-gray-600 dark:text-gray-300">
                        Transparent pricing for mobile app development services. Choose the package that best fits
                        your business needs and budget.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="mb-16 grid gap-8 lg:grid-cols-3">
                    {packages.map((pkg, index) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`relative rounded-xl p-8 shadow-lg transition-all hover:shadow-xl ${pkg.popular
                                    ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                    : "border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                                }`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-sm font-medium text-white">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6 text-center">
                                <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-lg mx-auto ${pkg.popular
                                        ? "bg-blue-500 text-white"
                                        : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                    }`}>
                                    <pkg.icon className="h-8 w-8" />
                                </div>

                                <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                                    {pkg.name}
                                </h3>

                                <p className="mb-4 text-gray-600 dark:text-gray-300">
                                    {pkg.description}
                                </p>

                                <div className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {pkg.price}
                                </div>

                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {pkg.deliveryTime} • {pkg.revisions}
                                </div>
                            </div>

                            <div className="mb-8 space-y-3">
                                {pkg.features.map((feature, i) => (
                                    <div key={i} className="flex items-center">
                                        <Check className="mr-3 h-5 w-5 text-green-500" />
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`group w-full rounded-lg px-6 py-3 font-semibold transition-all ${pkg.popular
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                    }`}
                            >
                                Get Started
                                <ArrowRight className="ml-2 inline h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                    className="rounded-2xl bg-gray-50 p-8 dark:bg-gray-800"
                >
                    <div className="text-center">
                        <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                            Optional Add-ons
                        </h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300">
                            Enhance your mobile app with additional features and services
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {addOns.map((addon, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700"
                            >
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {addon.name}
                                </span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                    {addon.price}
                                </span>
                            </motion.div>
                        ))}
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
                        Need a Custom Quote?
                    </h3>
                    <p className="mb-8 text-gray-600 dark:text-gray-300">
                        Every mobile app project is unique. Contact us for a personalized quote
                        based on your specific requirements.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
                    >
                        Request Custom Quote
                        <ArrowRight className="ml-2 inline h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                </motion.div>
            </div>
        </section>
    )
}